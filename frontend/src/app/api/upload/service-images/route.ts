import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import jwt from 'jsonwebtoken';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Debug logging
console.log('Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? '***hidden***' : 'missing'
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json(
        { status: 'error', message: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authorization.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_make_it_very_long_and_secure_production_key_123456789';
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    if (!decoded.userId) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid token' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const images = formData.getAll('images') as File[];

    if (!images || images.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'No images provided' },
        { status: 400 }
      );
    }

    const uploadPromises = images.map(async (image) => {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'solutil/services',
            resource_type: 'image'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve({
              url: result?.secure_url,
              publicId: result?.public_id,
              variants: {
                original: result?.secure_url,
                thumbnail: result?.secure_url?.replace('/upload/', '/upload/w_150,h_150,c_fill/'),
                medium: result?.secure_url?.replace('/upload/', '/upload/w_400,h_300,c_fill/'),
                large: result?.secure_url?.replace('/upload/', '/upload/w_800,h_600,c_fill/')
              }
            });
          }
        ).end(buffer);
      });
    });

    const uploadedImages = await Promise.all(uploadPromises);

    return NextResponse.json({
      status: 'success',
      message: 'Images uploaded successfully',
      data: {
        images: uploadedImages
      }
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}