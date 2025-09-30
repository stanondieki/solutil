import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; documentType: string } }
) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('token')

    if (!token) {
      return NextResponse.json(
        { status: 'fail', message: 'Access denied. Please login.' },
        { status: 401 }
      )
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net'
    
    const response = await fetch(`${backendUrl}/api/admin/providers/${params.id}/documents/${params.documentType}/view`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const data = await response.json()
      return NextResponse.json(
        { status: 'fail', message: data.message || 'Failed to fetch document' },
        { status: response.status }
      )
    }

    // For document viewing, we might get a redirect URL or the file directly
    const contentType = response.headers.get('content-type')
    
    if (contentType && contentType.includes('application/json')) {
      // JSON response with URL
      const data = await response.json()
      return NextResponse.json(data)
    } else {
      // Direct file response
      const buffer = await response.arrayBuffer()
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType || 'application/octet-stream',
          'Content-Disposition': response.headers.get('Content-Disposition') || '',
        }
      })
    }

  } catch (error) {
    console.error('Document view error:', error)
    return NextResponse.json(
      { status: 'error', message: 'Server error occurred' },
      { status: 500 }
    )
  }
}