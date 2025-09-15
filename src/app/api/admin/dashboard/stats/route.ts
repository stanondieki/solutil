import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check for admin token (basic validation)
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Access denied. No token provided.' },
        { status: 401 }
      )
    }

    // Mock dashboard stats for demo
    const stats = {
      totalUsers: 1248,
      totalProviders: 156,
      totalBookings: 523,
      totalRevenue: 125430,
      pendingApprovals: 12,
      activeServices: 8
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    )
  }
}
