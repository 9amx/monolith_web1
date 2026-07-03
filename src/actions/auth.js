"use server";

import { db } from '@/db';
import { users, invites, otps } from '@/db/schema';
import { eq, and, gte } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { unstable_noStore as noStore } from 'next/cache';
import crypto from 'crypto';
import { sendOtpEmail } from '@/lib/mailer';

// Helper function to get current UTC time
function getCurrentUTCTime() {
  return new Date(Date.now());
}

export async function login(email, password) {
  const userList = await db.select().from(users).where(eq(users.email, email));
  const user = userList[0];

  if (!user || user.password !== password) {
    return { error: 'Invalid email or password' };
  }

  if (user.hasDashboardAccess) {
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.delete(otps).where(and(eq(otps.email, email), eq(otps.type, 'login')));

    await db.insert(otps).values({
      email,
      code,
      type: 'login',
      expiresAt
    });

    await sendOtpEmail(email, code, 'login');
    return { requires2FA: true };
  }

  // Set HTTP cookie
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';
  cookieStore.set('auth_user_id', user.id.toString(), { 
    httpOnly: true, 
    secure: isProduction, 
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 
  });
  return { success: true, user };
}

export async function signup(email, password, name, inviteToken) {
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    return { error: 'An account with this email already exists' };
  }

  const finalName = name?.trim() || email.split('@')[0];
  const emailHash = crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex');
  const avatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=identicon`;

  const allUsers = await db.select().from(users);
  let assignedRole = 'Viewer';
  let hasDashboardAccess = false;
  
  const isSuperAdminEmail = email.toLowerCase() === 'olialkonok2@gmail.com';

  if (isSuperAdminEmail) {
    assignedRole = 'Super Admin';
    hasDashboardAccess = true;
  } else if (allUsers.length === 0) {
    assignedRole = 'Super Admin';
    hasDashboardAccess = true;
  } else {
    if (!inviteToken) return { error: 'An invite link is required to sign up.' };
    
    const [invite] = await db.select().from(invites).where(eq(invites.id, inviteToken));
    if (!invite) return { error: 'Invalid invite link.' };
    if (invite.used) return { error: 'This invite link has already been used.' };
    
    assignedRole = invite.role;
    await db.update(invites).set({ used: true }).where(eq(invites.id, inviteToken));
  }

  const [newUser] = await db.insert(users).values({
    email,
    password, 
    name: finalName,
    role: assignedRole,
    avatarUrl,
    hasDashboardAccess
  }).returning();

  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';
  cookieStore.set('auth_user_id', newUser.id.toString(), { 
    httpOnly: true, 
    secure: isProduction, 
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 
  });
  return { success: true, user: newUser };
}

export async function createInvite(role) {
  const user = await getCurrentUser();
  if (!user || (!user.hasDashboardAccess && user.role !== 'Admin')) {
    throw new Error("Unauthorized to create invites");
  }

  const id = crypto.randomUUID();
  await db.insert(invites).values({
    id,
    role
  });

  return id;
}

export async function validateInvite(token) {
  if (!token) return { valid: false, error: 'No token provided' };
  const [invite] = await db.select().from(invites).where(eq(invites.id, token));
  
  if (!invite) return { valid: false, error: 'Invalid invite link' };
  if (invite.used) return { valid: false, error: 'This invite link has already been used' };
  
  return { valid: true, role: invite.role };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_user_id');
  return { success: true };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_user_id')?.value;
  if (!userId) return null;

  const userList = await db.select().from(users).where(eq(users.id, parseInt(userId)));
  let user = userList[0] || null;
  if (!user) return null;

  let needsUpdate = false;
  let updateData = {};
  if (!user.avatarUrl) {
    const emailHash = crypto.createHash('md5').update(user.email.trim().toLowerCase()).digest('hex');
    updateData.avatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=identicon`;
    needsUpdate = true;
  }

  if (user.email.toLowerCase() === 'olialkonok2@gmail.com' && !user.hasDashboardAccess) {
    updateData.hasDashboardAccess = true;
    updateData.role = 'Super Admin';
    needsUpdate = true;
  }

  if (needsUpdate) {
    await db.update(users).set(updateData).where(eq(users.id, user.id));
    user = { ...user, ...updateData };
  }

  return user;
}

export async function getAllUsers() {
  noStore();
  return await db.select().from(users);
}

export async function deleteUser(id) {
  await db.delete(users).where(eq(users.id, id));
  return { success: true };
}

export async function changePassword(newPassword) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Unauthorized' };

  await db.update(users).set({ password: newPassword }).where(eq(users.id, user.id));
  return { success: true };
}

export async function toggleDashboardAccess(userId, hasAccess) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'Super Admin') {
    return { error: 'Unauthorized' };
  }

  await db.update(users).set({ hasDashboardAccess: hasAccess }).where(eq(users.id, userId));
  return { success: true };
}

export async function updateUserProfile({ name, username, avatarUrl }) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Unauthorized' };

  const updateData = {};
  if (name !== undefined) updateData.name = name.trim();
  if (username !== undefined) updateData.username = username.trim();
  if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl.trim() || null;

  if (Object.keys(updateData).length === 0) return { error: 'No changes provided' };

  await db.update(users).set(updateData).where(eq(users.id, user.id));
  return { success: true };
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function requestSignupOtp(email) {
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    return { error: 'An account with this email already exists' };
  }

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.delete(otps).where(and(eq(otps.email, email), eq(otps.type, 'signup')));

  await db.insert(otps).values({
    email,
    code,
    type: 'signup',
    expiresAt
  });

  await sendOtpEmail(email, code, 'signup');
  return { success: true };
}

export async function verifySignupOtpAndCreateUser(email, otp, password, name, inviteToken) {
  const currentTime = getCurrentUTCTime();
  const otpRecords = await db.select().from(otps).where(
    and(
      eq(otps.email, email), 
      eq(otps.type, 'signup'),
      eq(otps.code, otp),
      gte(otps.expiresAt, currentTime)
    )
  );

  if (otpRecords.length === 0) {
    return { error: 'Invalid or expired OTP' };
  }

  const res = await signup(email, password, name, inviteToken);
  if (res.error) return res;

  await db.delete(otps).where(and(eq(otps.email, email), eq(otps.type, 'signup')));
  
  return res;
}

export async function requestResetOtp(email) {
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length === 0) {
    // Return success to avoid leaking emails
    return { success: true };
  }

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.delete(otps).where(and(eq(otps.email, email), eq(otps.type, 'reset')));

  await db.insert(otps).values({
    email,
    code,
    type: 'reset',
    expiresAt
  });

  await sendOtpEmail(email, code, 'reset');
  return { success: true };
}

export async function resetPasswordWithOtp(email, otp, newPassword) {
  const currentTime = getCurrentUTCTime();
  const otpRecords = await db.select().from(otps).where(
    and(
      eq(otps.email, email), 
      eq(otps.type, 'reset'),
      eq(otps.code, otp),
      gte(otps.expiresAt, currentTime)
    )
  );

  if (otpRecords.length === 0) {
    return { error: 'Invalid or expired OTP' };
  }

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length === 0) {
    return { error: 'User not found' };
  }

  const user = existing[0];
  await db.update(users).set({ password: newPassword }).where(eq(users.id, user.id));

  await db.delete(otps).where(and(eq(otps.email, email), eq(otps.type, 'reset')));

  return { success: true };
}

export async function verifyLoginOtpAndLogin(email, otp) {
  const currentTime = getCurrentUTCTime();
  const otpRecords = await db.select().from(otps).where(
    and(
      eq(otps.email, email), 
      eq(otps.type, 'login'),
      eq(otps.code, otp),
      gte(otps.expiresAt, currentTime)
    )
  );

  if (otpRecords.length === 0) {
    return { error: 'Invalid or expired OTP' };
  }

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length === 0) {
    return { error: 'User not found' };
  }
  const user = existing[0];

  await db.delete(otps).where(and(eq(otps.email, email), eq(otps.type, 'login')));

  // Set HTTP cookie
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';
  cookieStore.set('auth_user_id', user.id.toString(), { 
    httpOnly: true, 
    secure: isProduction, 
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 
  });

  return { success: true, user };
}

export async function updateUserRole(userId, newRole) { const currentUser = await getCurrentUser(); if (!currentUser || currentUser.role !== 'Super Admin') throw new Error('Unauthorized'); await db.update(users).set({ role: newRole }).where(eq(users.id, userId)); return { success: true }; }
