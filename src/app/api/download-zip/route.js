import { NextResponse } from 'next/server';
import { db } from '@/db';
import { cards } from '@/db/schema';
import { eq } from 'drizzle-orm';
import path from 'path';
import archiver from 'archiver';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cardId = searchParams.get('cardId');

  if (!cardId) {
    return new NextResponse('Missing cardId', { status: 400 });
  }

  try {
    const [card] = await db.select().from(cards).where(eq(cards.id, cardId));
    if (!card) {
      return new NextResponse('Card not found', { status: 404 });
    }

    const attachments = typeof card.attachments === 'string' ? JSON.parse(card.attachments) : (card.attachments || []);
    
    if (attachments.length === 0) {
      return new NextResponse('No attachments found', { status: 404 });
    }
    
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    archive.on('data', (chunk) => {
      writer.write(chunk);
    });

    archive.on('end', () => {
      writer.close();
    });

    archive.on('error', (err) => {
      console.error('Archive error:', err);
      writer.abort(err);
    });

    // Add files to archive
    const publicDir = path.join(process.cwd(), 'public');
    for (const att of attachments) {
      const filePath = path.join(publicDir, att.url);
      // It's crucial to pass the original user-facing name for the zip
      archive.file(filePath, { name: att.name });
    }

    archive.finalize();

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="project_files_${card.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip"`,
      },
    });

  } catch (error) {
    console.error('ZIP generation error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
