import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookies or headers
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'No auth token provided' }, { status: 401 })
    }

    // Get search params
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured') === 'true'
    const service = searchParams.get('service')
    const limit = searchParams.get('limit') || '10'

    // Forward request to backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://solutilconnect-backend-api.azurewebsites.net'
    
    let apiUrl = `${backendUrl}/api/providers?limit=${limit}`
    if (featured) apiUrl += '&featured=true'
    if (service) apiUrl += `&service=${service}`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch providers' }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Providers API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}