import { NextRequest, NextResponse } from 'next/server'
import { MiniAppPaymentSuccessPayload } from '@worldcoin/minikit-js'

interface IRequestPayload {
	payload: MiniAppPaymentSuccessPayload
}

export async function POST(req: NextRequest) {
  const payload = (await req.json()) as { email: string }
  console.log('POST /api/confirm-payment called with payload:', payload)
  // Extract the payload from the request body
	const { email } = payload; 
  console.log('POST /api/confirm-payment called with email:', email)
  

    const response = await fetch(
      `${process.env.MAILPROOF_SERVER}/api/payment/balance?email=${encodeURIComponent(email)}`,
      {
        method: 'GET',
      }
    );
    if (!response.ok) {
        console.error('Failed to get balance:', response.status, await response.text())
        return NextResponse.json({ status: 500 })
    }
    const balance = await response.json();
    console.log('Balance response:', balance)
    return NextResponse.json({ status: 200, balance })
}
