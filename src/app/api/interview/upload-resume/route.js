import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file'); // File object
    
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const filename = file.name.toLowerCase();
    let extractedText = '';

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (filename.endsWith('.pdf')) {
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } else if (filename.endsWith('.txt')) {
      extractedText = buffer.toString('utf8');
    } else {
      return NextResponse.json({ error: "Unsupported file format. Please upload PDF or TXT." }, { status: 400 });
    }

    return NextResponse.json({ resume_text: extractedText.slice(0, 5000) }, { status: 200 });
  } catch (error) {
    console.error("[Next.js API] Resume upload error:", error);
    return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
  }
}
