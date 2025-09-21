import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('document') as File
    const documentType = formData.get('documentType') as string
    
    // Get auth token from header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization token' }, { status: 401 })
    }

    // Verify token (simplified - in production use proper JWT verification)
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPG, PNG, and PDF files are allowed.' 
      }, { status: 400 })
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const fileExtension = path.extname(file.name)
    const filename = `${documentType}_${timestamp}_${randomId}${fileExtension}`

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)

    // File URL for frontend access
    const fileUrl = `/uploads/documents/${filename}`

    // Here you would typically save to database
    // For now, just return success with file info
    console.log(`Document uploaded: ${documentType} - ${filename}`)

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      url: fileUrl,
      filename: filename,
      documentType: documentType
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Document upload API' })
}
