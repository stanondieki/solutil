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
    // Verify authentication - use same secret as backend
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json(
        { status: 'error', message: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authorization.substring(7);
    
    // Use the same JWT_SECRET as backend for consistency
    const jwtSecret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_make_it_very_long_and_secure_production_key_123456789';
    
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret) as any;
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json(
        { status: 'error', message: 'Invalid token signature' },
        { status: 401 }
      );
    }
    
    if (!decoded.userId) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid token structure' },
        { status: 401 }
      );
    }

    // Get image from form data
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { status: 'error', message: 'No image provided' },
        { status: 400 }
      );
    }

    // Convert image to buffer and upload to YOUR Cloudinary
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert buffer to base64 data URL for Cloudinary
    const base64String = `data:${image.type};base64,${buffer.toString('base64')}`;
    
    console.log('Uploading to Cloudinary...');
    const result = await cloudinary.uploader.upload(base64String, {
      folder: 'solutil/profiles',
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'fill' },
        { quality: 'auto' }
      ]
    });

    const imageData = {
      url: result.secure_url,
      publicId: result.public_id,
      variants: {
        original: result.secure_url,
        thumbnail: result.secure_url.replace('/upload/', '/upload/c_fill,w_100,h_100/'),
        medium: result.secure_url.replace('/upload/', '/upload/c_fill,w_200,h_200/'),
        large: result.secure_url.replace('/upload/', '/upload/c_fill,w_400,h_400/')
      }
    };

    console.log('Cloudinary upload successful:', result.public_id);

    return NextResponse.json({
      status: 'success',
      message: 'Profile picture uploaded successfully to your Cloudinary',
      data: {
        image: imageData,
        userId: decoded.userId
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