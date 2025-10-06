import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  console.log('🧪 Test route hit');
  return NextResponse.json({ message: 'Test route working', timestamp: new Date().toISOString() });
}

export async function PUT() {
  console.log('🧪 Test PUT route hit');
  return NextResponse.json({ message: 'Test PUT working', timestamp: new Date().toISOString() });
}