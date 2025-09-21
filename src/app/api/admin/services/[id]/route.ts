import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')

    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const response = await fetch(`${backendUrl}/api/admin/services/${params.id}`, {
      method: 'GET',
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
        { message: data.message || 'Service not found' },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('Admin get service API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    const body = await request.json()

    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const response = await fetch(`${backendUrl}/api/admin/services/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader })
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data, { status: 200 })
    } else {
      return NextResponse.json(
        { message: data.message || 'Failed to update service' },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('Admin update service API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')

    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const response = await fetch(`${backendUrl}/api/admin/services/${params.id}`, {
      method: 'DELETE',
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
        { message: data.message || 'Failed to delete service' },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('Admin delete service API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
