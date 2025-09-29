import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentType: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
    }

    // Forward the request to backend
    const response = await fetch(
      `${API_BASE_URL}/api/admin/providers/${resolvedParams.id}/documents/${resolvedParams.documentType}/verify`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Document verification error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}