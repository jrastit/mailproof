import { NextRequest, NextResponse } from 'next/server'
import { MiniAppPaymentSuccessPayload } from '@worldcoin/minikit-js'

interface IRequestPayload {
	payload: MiniAppPaymentSuccessPayload
}

export async function POST(req: NextRequest) {
  console.log('POST /api/confirm-payment called')
  
  // Extract the payload from the request body
	const { payload } = (await req.json()) as IRequestPayload
  console.log('Request content:', payload)

    const response = await fetch(`${process.env.MAILPROOF_SERVER}/api/payment/stack`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
    if (!response.ok) {
        console.error('Failed to notify backend:', response.status, await response.text())
        return NextResponse.json({ status: 500 })
    }
    console.log('Payment confirmed successfully:', response.status)
    return NextResponse.json({ status: 200 })
}
