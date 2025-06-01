import { NextRequest, NextResponse } from 'next/server'
import { MiniAppPaymentSuccessPayload } from '@worldcoin/minikit-js'

type IRequestPayload = {
  payload: {
    tx_id: string
    email: string
    amount: number
  }
}


export async function POST(req: NextRequest) {
  console.log('POST /api/confirm-payment called')
  
  // Extract the payload from the request body
	const { payload } = (await req.json()) as IRequestPayload
  console.log('Request content:', payload)

    // Call the Worldcoin API to get transaction details
    const transactionId = payload.tx_id
    console.log('Transaction ID:', transactionId)
    let transaction_hash = transactionId
    const appId = process.env.NEXT_PUBLIC_APP_ID
    const worldcoinUrl = `https://developer.worldcoin.org/api/v2/minikit/transaction/${transactionId}?app_id=${appId}&type=transaction`

    const worldcoinResponse = await fetch(worldcoinUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!worldcoinResponse.ok) {
      console.error('Failed to fetch transaction from Worldcoin:', worldcoinResponse.status, await worldcoinResponse.text())
      
    }else {

      const transactionData = await worldcoinResponse.json()
      console.log('Worldcoin transaction data:', transactionData)

      transaction_hash = transactionData.transaction_hash
    }
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
    return NextResponse.json({ status: 200, transaction_hash: transaction_hash})
}
