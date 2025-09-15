import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check for admin token
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Access denied. No token provided.' },
        { status: 401 }
      )
    }

    // Mock users data for demo
    const users = [
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
    ]

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    )
  }
}
