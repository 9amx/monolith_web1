"use client";

import React, { useState, useEffect, Suspense, useTransition } from 'react';
import { Mail, Lock, User, ArrowRight, AlertTriangle } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from './AuthContext';
import { login, requestSignupOtp, verifySignupOtpAndCreateUser, requestResetOtp, resetPasswordWithOtp, validateInvite, verifyLoginOtpAndLogin } from '@/actions/auth';
import CustomSelect from './CustomSelect';

function AuthContent({ children, title, subtitle, isDashboard }) {
  const { currentUser, isAuthLoaded } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);
  
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isVerifyingSignupOtp, setIsVerifyingSignupOtp] = useState(false);
  const [isVerifyingResetOtp, setIsVerifyingResetOtp] = useState(false);
  const [isVerifyingLoginOtp, setIsVerifyingLoginOtp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankHolderName, setBankHolderName] = useState('');
  
  const [rocketNumber, setRocketNumber] = useState('');
  const [rocketName, setRocketName] = useState('');
  
  const [binancePayId, setBinancePayId] = useState('');
  const [binanceName, setBinanceName] = useState('');
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const inviteToken = searchParams.get('inviteToken');
  const [inviteRole, setInviteRole] = useState(null);
  const [isValidatingToken, setIsValidatingToken] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    async function checkToken() {
      if (inviteToken) {
        setIsValidatingToken(true);
        try {
          const res = await validateInvite(inviteToken);
          if (res.valid) {
            setInviteRole(res.role);
            setIsLogin(false);
          } else {
            setError(res.error || 'Invalid or expired invite link.');
            setIsLogin(true);
          }
        } catch (e) {
          setError('Failed to validate invite link.');
          setIsLogin(true);
        } finally {
          setIsValidatingToken(false);
        }
      } else {
        setIsLogin(true);
      }
    }
    
    checkToken();
  }, [inviteToken]);

  if (!isMounted || !isAuthLoaded) return <div className="kb-loading" suppressHydrationWarning><div className="kb-loading-pulse" suppressHydrationWarning /></div>;

  if (currentUser) {
    return <>{children}</>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    startTransition(async () => {
      if (isVerifyingSignupOtp) {
        let finalBankDetails = '';
        if (selectedPaymentMethod === 'bank') finalBankDetails = JSON.stringify({ bankName, accountNumber: bankAccountNumber, holderName: bankHolderName });
        let finalRocketAccount = '';
        if (selectedPaymentMethod === 'rocket') finalRocketAccount = JSON.stringify({ rocketNumber, rocketName });
        let finalBinancePayId = '';
        if (selectedPaymentMethod === 'binance') finalBinancePayId = JSON.stringify({ binancePayId, binanceName });

        const paymentDetails = inviteRole === 'Editor' ? { bankDetails: finalBankDetails, rocketAccount: finalRocketAccount, binancePayId: finalBinancePayId } : {};
        const res = await verifySignupOtpAndCreateUser(email, otp, password, name, inviteToken, paymentDetails);
        if (res.error) {
          setError(res.error);
        } else {
          window.dispatchEvent(new Event('auth-change'));
          if (inviteToken) router.replace('/projects');
        }
        return;
      }

      if (isVerifyingResetOtp) {
        const res = await resetPasswordWithOtp(email, otp, password);
        if (res.error) {
          setError(res.error);
        } else {
          setIsVerifyingResetOtp(false);
          setIsForgotPassword(false);
          setIsLogin(true);
          setPassword('');
          setOtp('');
          setSuccessMsg('Password has been successfully reset. Please sign in.');
        }
        return;
      }

      if (isForgotPassword) {
        const res = await requestResetOtp(email);
        if (res.error) {
          setError(res.error);
        } else {
          setIsVerifyingResetOtp(true);
          setPassword('');
        }
        return;
      }

      if (isVerifyingLoginOtp) {
        const res = await verifyLoginOtpAndLogin(email, otp, inviteToken);
        if (res.error) {
          setError(res.error);
        } else {
          window.dispatchEvent(new Event('auth-change'));
          if (inviteRole) router.replace('/projects');
        }
        return;
      }

      if (isLogin) {
        const res = await login(email, password, inviteToken);
        if (res.error) {
          setError(res.error);
        } else if (res.requires2FA) {
          setIsVerifyingLoginOtp(true);
        } else {
          window.dispatchEvent(new Event('auth-change'));
          if (inviteRole) router.replace('/projects');
        }
      } else {
        if (!inviteToken || !inviteRole) {
          setError("Sign up is restricted to invited members only.");
          return;
        }
        const res = await requestSignupOtp(email);
        if (res.error) {
          setError(res.error);
        } else {
          setIsVerifyingSignupOtp(true);
        }
      }
    });
  };

  return (
    <div className={`auth-gate-wrapper ${isDashboard ? 'dashboard-mode' : ''}`}>
      <div className="auth-gate-box">
        <div className="auth-gate-header">
          <img src="/logo.svg" alt="Monolith" className="auth-gate-logo" onError={(e) => e.target.style.display = 'none'} />
          <h2>
            {isVerifyingSignupOtp || isVerifyingResetOtp || isVerifyingLoginOtp
              ? 'Enter Verification Code' 
              : isForgotPassword ? 'Reset password' : (isLogin ? (title || 'Welcome back') : 'Create an account')}
          </h2>
          <p>
            {isVerifyingSignupOtp || isVerifyingResetOtp || isVerifyingLoginOtp
              ? 'Check your email for the 6-digit code'
              : isForgotPassword 
                ? 'Enter your email to receive a reset code'
                : (inviteRole && !isLogin 
                  ? `You have been invited to join as an ${inviteRole}` 
                  : (isLogin ? (subtitle || 'Sign in to access your workflow') : 'Join to collaborate on projects'))}
            {isValidatingToken && ' (Validating invite...)'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-gate-form">
          {error && <div className="auth-error" style={{ color: '#ef4444', fontSize: '14px', textAlign: 'center', marginBottom: '16px' }}>{error}</div>}
          {successMsg && <div className="auth-success" style={{ color: 'var(--emerald)', fontSize: '14px', textAlign: 'center', marginBottom: '16px' }}>{successMsg}</div>}
          
          {(isVerifyingSignupOtp || isVerifyingResetOtp || isVerifyingLoginOtp) ? (
            <>
              <div className="auth-input-group">
                <Mail size={16} />
                <input type="email" value={email} disabled style={{opacity: 0.5}} />
              </div>
              <div className="auth-input-group">
                <Lock size={16} />
                <input
                  type="text"
                  placeholder="6-digit OTP code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              {isVerifyingResetOtp && (
                <div className="auth-input-group">
                  <Lock size={16} />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              )}
            </>
          ) : (
            <>
              {!isForgotPassword && !isLogin && (
                <div className="auth-input-group">
                  <User size={16} />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              {!isForgotPassword && !isLogin && inviteRole === 'Editor' && (
                <>
                  <div className="auth-input-group" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '12px' }}>
                    <label style={{ fontSize: '13px', color: 'var(--text-grey)', marginBottom: '8px' }}>Payment Method Required</label>
                    <CustomSelect 
                      value={selectedPaymentMethod} 
                      onChange={(val) => {
                        setSelectedPaymentMethod(val);
                        setBankName(''); setBankAccountNumber(''); setBankHolderName('');
                        setRocketNumber(''); setRocketName('');
                        setBinancePayId(''); setBinanceName('');
                      }}
                      options={[
                        { value: '', label: 'Choose a payment method...' },
                        { value: 'bank', label: 'Bank Account' },
                        { value: 'rocket', label: 'Rocket Account' },
                        { value: 'binance', label: 'Binance Pay' }
                      ]}
                      style={{ width: '100%' }}
                    />
                  </div>
                  {selectedPaymentMethod === 'bank' && (
                    <>
                      <div className="auth-input-group">
                        <input type="text" placeholder="Bank Name *" value={bankName} onChange={(e) => setBankName(e.target.value)} style={{ paddingLeft: '12px' }} required />
                      </div>
                      <div className="auth-input-group">
                        <input type="text" placeholder="Account Number *" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} style={{ paddingLeft: '12px' }} required />
                      </div>
                      <div className="auth-input-group">
                        <input type="text" placeholder="Account Holder Name *" value={bankHolderName} onChange={(e) => setBankHolderName(e.target.value)} style={{ paddingLeft: '12px' }} required />
                      </div>
                    </>
                  )}
                  {selectedPaymentMethod === 'rocket' && (
                    <>
                      <div className="auth-input-group">
                        <input type="text" placeholder="Rocket Number (12 digit) *" value={rocketNumber} onChange={(e) => setRocketNumber(e.target.value)} style={{ paddingLeft: '12px' }} required />
                      </div>
                      <div className="auth-input-group">
                        <input type="text" placeholder="Rocket Account Name *" value={rocketName} onChange={(e) => setRocketName(e.target.value)} style={{ paddingLeft: '12px' }} required />
                      </div>
                    </>
                  )}
                  {selectedPaymentMethod === 'binance' && (
                    <>
                      <div className="auth-input-group">
                        <input type="text" placeholder="Binance Pay ID *" value={binancePayId} onChange={(e) => setBinancePayId(e.target.value)} style={{ paddingLeft: '12px' }} required />
                      </div>
                      <div className="auth-input-group">
                        <input type="text" placeholder="Name on Binance *" value={binanceName} onChange={(e) => setBinanceName(e.target.value)} style={{ paddingLeft: '12px' }} required />
                      </div>
                    </>
                  )}
                  {selectedPaymentMethod && (
                    <div style={{ padding: '10px 12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '6px', display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '4px' }}>
                      <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.4' }}>
                        <strong style={{ color: '#f59e0b' }}>Important:</strong> Please double-check your payment details. Providing incorrect information will result in payout delays or permanent loss of funds.
                      </div>
                    </div>
                  )}
                </>
              )}
              <div className="auth-input-group">
                <Mail size={16} />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {!isForgotPassword && (
                <div className="auth-input-group" style={{ position: 'relative' }}>
                  <Lock size={16} />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {isLogin && (
                    <span 
                      onClick={() => { setIsForgotPassword(true); setError(''); setSuccessMsg(''); }}
                      style={{ position: 'absolute', right: '12px', top: '16px', fontSize: '12px', color: 'var(--emerald)', cursor: 'pointer', fontWeight: '500', zIndex: 10 }}
                    >
                      Forgot?
                    </span>
                  )}
                </div>
              )}
            </>
          )}

          <button type="submit" className="auth-submit-btn" disabled={isPending}>
            {isPending ? 'Loading...' : 
              (isVerifyingSignupOtp ? 'Verify & Create Account' :
              isVerifyingResetOtp ? 'Verify & Reset Password' :
              isVerifyingLoginOtp ? 'Verify Login' :
              isForgotPassword ? 'Send Reset OTP' : 
              (isLogin ? 'Sign In' : 'Sign Up'))} <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-gate-footer">
          {isVerifyingSignupOtp || isVerifyingResetOtp || isVerifyingLoginOtp ? (
             <p>Need to go back? <span onClick={() => { setIsVerifyingSignupOtp(false); setIsVerifyingResetOtp(false); setIsVerifyingLoginOtp(false); setError(''); setSuccessMsg(''); }}>Cancel</span></p>
          ) : isForgotPassword ? (
            <p>Remember your password? <span onClick={() => { setIsForgotPassword(false); setError(''); setSuccessMsg(''); }}>Sign in</span></p>
          ) : inviteToken && inviteRole && isLogin ? (
            <p>Don't have an account? <span onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); }}>Sign up</span></p>
          ) : (
            !isLogin ? <p>Already have an account? <span onClick={() => { setIsLogin(true); setError(''); setSuccessMsg(''); }}>Sign in</span></p> : null
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthGate({ children, title, subtitle, isDashboard }) {
  return (
    <AuthProvider>
      <Suspense fallback={<div className="kb-loading" suppressHydrationWarning><div className="kb-loading-pulse" suppressHydrationWarning /></div>}>
        <AuthContent title={title} subtitle={subtitle} isDashboard={isDashboard}>{children}</AuthContent>
      </Suspense>
    </AuthProvider>
  );
}
