import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email_address } = (await req.json()) as { email_address: string };
  
  const uuid = crypto.randomUUID().replace(/-/g, '');
  
  const response = await fetch(`${process.env.MAILPROOF_SERVER}/init_payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uuid, email_address }),
  });

  if (!response.ok) {
    console.error('Failed to notify backend:', response.status, await response.text());
    return NextResponse.json({ id: uuid, status: 500 });
  }
  // This is where you should perform backend actions if the verification succeeds
  // Such as, setting a user as "verified" in a database
  console.log('Backend notified successfully');

  return NextResponse.json({ id: uuid });
}
