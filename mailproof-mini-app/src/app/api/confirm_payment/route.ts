import { NextRequest, NextResponse } from 'next/server'
import { MiniAppPaymentSuccessPayload } from '@worldcoin/minikit-js'

interface IRequestPayload {
	payload: MiniAppPaymentSuccessPayload
}

export async function POST(req: NextRequest) {
	const { payload } = (await req.json()) as IRequestPayload

    const response = await fetch(`${process.env.MAILPROOF_SERVER}/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
    if (!response.ok) {
        console.error('Failed to notify backend:', response.status, await response.text())
        return NextResponse.json({ status: 500 })
    }
    console.log('Payment confirmed successfully:', payload)
    return NextResponse.json({ status: 200 })
}
