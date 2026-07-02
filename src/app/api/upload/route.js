import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'attachments');
    
    // Ensure directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignore if exists
    }

    const uploadedFiles = [];

    for (const file of files) {
      if (!file.name) continue;
      
      const buffer = Buffer.from(await file.arrayBuffer());
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = uniqueSuffix + '-' + file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const filepath = path.join(uploadDir, filename);
      
      await writeFile(filepath, buffer);
      
      uploadedFiles.push({
        id: `att_${uniqueSuffix}`,
        name: file.name,
        url: `/uploads/attachments/${filename}`,
        size: file.size
      });
    }

    return NextResponse.json({ success: true, files: uploadedFiles });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }
}
