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
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { status: 'error', message: 'No image provided' },
        { status: 400 }
      );
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert buffer to base64 data URL
    const base64String = `data:${image.type};base64,${buffer.toString('base64')}`;
    
    const result = await cloudinary.uploader.upload(base64String, {
      folder: 'solutil/profiles',
      resource_type: 'image'
    });

    const imageData = {
      url: result.secure_url,
      publicId: result.public_id,
      variants: {
        original: result.secure_url,
        thumbnail: result.secure_url.replace('/upload/', '/upload/c_fill,w_100,h_100/'),
        medium: result.secure_url.replace('/upload/', '/upload/c_fill,w_200,h_200/'),
        large: result.secure_url.replace('/upload/', '/upload/c_fill,w_300,h_300/')
      }
    };

    return NextResponse.json({
      status: 'success',
      message: 'Profile picture uploaded successfully',
      data: {
        image: imageData
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