import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('authorization')

    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const response = await fetch(`${backendUrl}/api/admin/services/${id}/toggle-active`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader })
      }
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data, { status: 200 })
    } else {
      return NextResponse.json(
        { message: data.message || 'Failed to toggle service status' },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('Admin toggle service status API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
