/* eslint-disable @typescript-eslint/no-explicit-any */
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Configurações do Cloudinary (assegure que suas variáveis de ambiente estejam corretas)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

type UploadResult = {
  asset_id: string;
  public_id: string;
  version: number;
  version_id?: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  // Outros campos podem ser adicionados conforme a resposta do Cloudinary
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Converte o arquivo para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Faz o upload usando upload_stream para suportar streaming
    const uploadResult = await new Promise<UploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" }, // Detecta tipo automaticamente (imagem ou vídeo)
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result as unknown as UploadResult);
          }
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json(uploadResult, { status: 200 });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { publicId } = await request.json();

    if (!publicId || typeof publicId !== 'string') {
      return NextResponse.json({ error: 'Public ID is required and must be a string' }, { status: 400 });
    }

    // Remove o arquivo pelo public_id
    const deleteResult = await cloudinary.uploader.destroy(publicId);

    // deleteResult tem estrutura como { result: 'ok' } ou { result: 'not found' }
    return NextResponse.json(deleteResult, { status: 200 });
  } catch (error: any) {
    console.error('Cloudinary delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
