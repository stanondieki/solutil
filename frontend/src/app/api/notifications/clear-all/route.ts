import { NextRequest, NextResponse } from 'next/server'

// DELETE /api/notifications/clear-all - Clear all notifications
export async function DELETE(request: NextRequest) {
  try {
    const authToken = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      )
    }

    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net'
    const response = await fetch(`${backendUrl}/api/notifications/clear-all`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error clearing all notifications:', error)
    return NextResponse.json(
      { error: 'Failed to clear all notifications' },
      { status: 500 }
    )
  }
}