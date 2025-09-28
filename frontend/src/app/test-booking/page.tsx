// 'use client'

// import { useState } from 'react'

// export default function TestBooking() {
//   const [result, setResult] = useState<any>(null)
//   const [loading, setLoading] = useState(false)

//   const testBooking = async () => {
//     setLoading(true)
//     setResult(null)

//     try {
//       // Get auth data
//       const userData = JSON.parse(localStorage.getItem('user') || '{}')
//       const authToken = localStorage.getItem('authToken')
      
//       console.log('User data:', userData)
//       console.log('Auth token:', authToken)
//       console.log('Token type:', authToken?.includes('auth_') ? 'MOCK/SOCIAL LOGIN TOKEN' : 'REAL JWT TOKEN')
      
//       // Check if it's a JWT token
//       const isJWT = authToken && authToken.includes('.')
//       console.log('Is JWT format:', isJWT)

//       if (!authToken) {
//         setResult({ error: 'No auth token found. Please log in.' })
//         setLoading(false)
//         return
//       }

//       // Test booking data
//       const bookingData = {
//         provider: '507f1f77bcf86cd799439012', // Test provider ID
//         service: '507f1f77bcf86cd799439011', // Test service ID
//         scheduledDate: new Date().toISOString(),
//         scheduledTime: {
//           start: '10:00',
//           end: '11:00'
//         },
//         location: {
//           address: 'Test Address, Nairobi',
//           coordinates: {
//             lat: -1.2921,
//             lng: 36.8219
//           },
//           instructions: 'Test booking from debug page'
//         },
//         pricing: {
//           basePrice: 2500,
//           totalAmount: 2500,
//           currency: 'KES'
//         },
//         payment: {
//           method: 'mpesa',
//           status: 'pending'
//         },
//         notes: 'Test booking for debugging'
//       }

//       console.log('Sending booking data:', bookingData)

//       // Test the Next.js API route
//       const response = await fetch('/api/bookings', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           bookingData,
//           authToken
//         }),
//       })

//       console.log('Response status:', response.status)
//       console.log('Response headers:', response.headers)

//       const data = await response.json()
//       console.log('Response data:', data)

//       setResult({
//         success: response.ok,
//         status: response.status,
//         data: data
//       })

//     } catch (error) {
//       console.error('Test booking error:', error)
//       setResult({ error: error.message })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const getRealToken = async () => {
//     setLoading(true)
//     setResult(null)

//     try {
//       // Test login to get a real JWT token
//       const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           email: 'test@example.com', // Change this to a real email in your database
//           password: 'password123'    // Change this to the real password
//         }),
//       })

//       const loginData = await loginResponse.json()
//       console.log('Login response:', loginData)

//       if (loginResponse.ok && loginData.token) {
//         // Store the real JWT token
//         localStorage.setItem('authToken', loginData.token)
//         localStorage.setItem('user', JSON.stringify(loginData.data.user))
        
//         setResult({
//           success: true,
//           message: 'Real JWT token obtained and stored!',
//           token: loginData.token,
//           user: loginData.data.user
//         })
//       } else {
//         setResult({
//           success: false,
//           message: 'Failed to get real token',
//           error: loginData.message
//         })
//       }

//     } catch (error) {
//       console.error('Get real token error:', error)
//       setResult({ error: (error as Error).message })
//     } finally {
//       setLoading(false)
//     }
//   }
//     setLoading(true)
//     setResult(null)

//     try {
//       const authToken = localStorage.getItem('authToken')
      
//       if (!authToken) {
//         setResult({ error: 'No auth token found. Please log in.' })
//         setLoading(false)
//         return
//       }

//       // Test direct backend call
//       const bookingData = {
//         provider: '507f1f77bcf86cd799439012',
//         service: '507f1f77bcf86cd799439011',
//         scheduledDate: new Date().toISOString(),
//         scheduledTime: {
//           start: '10:00',
//           end: '11:00'
//         },
//         location: {
//           address: 'Test Address, Nairobi',
//           coordinates: { lat: -1.2921, lng: 36.8219 },
//           instructions: 'Direct backend test'
//         },
//         pricing: {
//           basePrice: 2500,
//           totalAmount: 2500,
//           currency: 'KES'
//         },
//         payment: {
//           method: 'mpesa',
//           status: 'pending'
//         },
//         notes: 'Direct backend test'
//       }

//       const response = await fetch('http://localhost:5000/api/bookings', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${authToken}`
//         },
//         body: JSON.stringify(bookingData),
//       })

//       const data = await response.json()
      
//       setResult({
//         success: response.ok,
//         status: response.status,
//         data: data,
//         type: 'direct-backend'
//       })

//     } catch (error) {
//       console.error('Direct backend test error:', error)
//       setResult({ error: error.message, type: 'direct-backend' })
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="p-8 max-w-4xl mx-auto">
//       <h1 className="text-2xl font-bold mb-6">Booking API Test</h1>
      
//       <div className="space-y-4 mb-8">
//         <button 
//           onClick={testBooking}
//           disabled={loading}
//           className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
//         >
//           {loading ? 'Testing...' : 'Test Next.js API Route'}
//         </button>
        
//         <button 
//           onClick={testDirectBackend}
//           disabled={loading}
//           className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 ml-4"
//         >
//           {loading ? 'Testing...' : 'Test Direct Backend'}
//         </button>
//       </div>

//       {result && (
//         <div className="mt-8 p-4 border rounded">
//           <h2 className="text-lg font-semibold mb-4">Test Result:</h2>
//           <pre className="bg-gray-100 p-4 rounded overflow-auto">
//             {JSON.stringify(result, null, 2)}
//           </pre>
//         </div>
//       )}

//       <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
//         <h3 className="font-semibold mb-2">Instructions:</h3>
//         <ol className="list-decimal list-inside space-y-1 text-sm">
//           <li>Make sure you're logged in first</li>
//           <li>Open browser console (F12) to see detailed logs</li>
//           <li>Test the Next.js API route first</li>
//           <li>If that fails, test the direct backend call</li>
//           <li>Watch the backend logs terminal for requests</li>
//         </ol>
//       </div>
//     </div>
//   )
// }
