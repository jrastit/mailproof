import { NextRequest, NextResponse } from 'next/server'
import { MiniAppPaymentSuccessPayload } from '@worldcoin/minikit-js'

interface IRequestPayload {
	payload: MiniAppPaymentSuccessPayload
}

export async function POST(req: NextRequest) {
  console.log('POST /api/balance called')
  
  // Extract the payload from the request body
	const { email } = (await req.json()) as { email: string }
  

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
