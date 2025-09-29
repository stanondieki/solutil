import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('document') as File
    const documentType = formData.get('documentType') as string
    const userId = formData.get('userId') as string

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Invalid file type. Only JPEG, PNG, and PDF files are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `${documentType}_${userId}_${timestamp}.${extension}`
    
    // Save to public/uploads/documents directory
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'documents')
    const filePath = join(uploadsDir, filename)

    // Create directory if it doesn't exist
    try {
      await writeFile(filePath, buffer)
    } catch (error) {
      // Try to create directory and retry
      await mkdir(uploadsDir, { recursive: true })
      await writeFile(filePath, buffer)
    }

    // Return the file URL
    const fileUrl = `/uploads/documents/${filename}`

    // Update user document in database
    const updateResponse = await fetch('http://localhost:5000/api/users/update-documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        documentType,
        documentUrl: fileUrl,
        filename
      }),
    })

    if (!updateResponse.ok) {
      return NextResponse.json(
        { message: 'Failed to update user documents' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      url: fileUrl,
      filename
    })

  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json(
      { message: 'Failed to upload document' },
      { status: 500 }
    )
  }
}
