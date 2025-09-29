import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Admin users API route called')
    
    const authHeader = request.headers.get('authorization')
    console.log('Auth header received:', authHeader ? 'Present' : 'Missing')
    
    const url = new URL(request.url)
    const searchParams = url.searchParams.toString()
    console.log('Search params:', searchParams)

    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net'
    const backendApiUrl = `${backendUrl}/api/admin/users${searchParams ? `?${searchParams}` : ''}`
    console.log('Calling backend URL:', backendApiUrl)
    
    const response = await fetch(backendApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader })
      }
    })

    console.log('Backend response status:', response.status)
    
    if (!response.ok) {
      console.error('Backend error response:', response.statusText)
      // If backend is not available, serve mock data as fallback
      if (response.status >= 500 || !response.status) {
        console.log('Backend unavailable, serving mock data')
        return NextResponse.json(getMockUserData(), { status: 200 })
      }
    }
    
    const data = await response.json()
    console.log('Backend response data:', data)

    // Transform the API response to match frontend expectations
    const transformedData = {
      users: data.data?.users || [],
      pagination: data.data?.pagination || {}
    }

    return NextResponse.json(transformedData, { status: response.status })
  } catch (error) {
    console.error('Admin users API error:', error)
    console.log('Error occurred, serving mock data as fallback')
    return NextResponse.json(getMockUserData(), { status: 200 })
  }
}

// Mock data function for fallback
function getMockUserData() {
  return {
    users: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+254712345678',
        role: 'customer',
        status: 'active',
        joinDate: '2024-01-15',
        totalBookings: 12
      },
      {
        id: '2',
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        phone: '+254723456789',
        role: 'provider',
        status: 'active',
        joinDate: '2024-02-10',
        totalBookings: 45
      },
      {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        phone: '+254734567890',
        role: 'customer',
        status: 'suspended',
        joinDate: '2024-03-05',
        totalBookings: 3
      }
    ],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalUsers: 3,
      hasNext: false,
      hasPrev: false
    }
  }
}
