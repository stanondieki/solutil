import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Get services from backend
    const response = await fetch('http://localhost:5000/api/services')
    
    if (!response.ok) {
      // If services API fails, create some services first
      return NextResponse.json({ 
        services: [],
        error: 'Backend services API not working',
        needsSetup: true
      })
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to fetch services',
      services: []
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Create basic services by calling backend directly
    const services = [
      {
        name: 'Plumbing Services',
        category: 'plumbing',
        description: 'Professional plumbing services for your home',
        basePrice: 2500,
        priceType: 'fixed',
        isActive: true
      },
      {
        name: 'Electrical Services', 
        category: 'electrical',
        description: 'Licensed electrical work and repairs',
        basePrice: 3000,
        priceType: 'fixed',
        isActive: true
      }
    ]

    const results = []
    for (const service of services) {
      const response = await fetch('http://localhost:5000/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token' // You might need proper auth
        },
        body: JSON.stringify(service)
      })
      
      if (response.ok) {
        const data = await response.json()
        results.push(data)
      }
    }

    return NextResponse.json({ 
      message: 'Services created',
      services: results
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to create services'
    }, { status: 500 })
  }
}
