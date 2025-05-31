import {
  ISuccessResult,
  IVerifyResponse,
  verifyCloudProof,
} from '@worldcoin/minikit-js';
import { NextRequest, NextResponse } from 'next/server';


interface IRequestPayload2 {
  payload: ISuccessResult;
  action: string;
  validate_hash: string;
  validate_code: string;
}

/**
 * This route is used to verify the proof of the user
 * It is critical proofs are verified from the server side
 * Read More: https://docs.world.org/mini-apps/commands/verify#verifying-the-proof
 */
export async function POST(req: NextRequest) {
  console.log('POST /api/verify-proof called');
  let request_content = await req.json();
  console.log('Request content:', request_content);
  const { payload, action, validate_hash, validate_code } = (request_content) as IRequestPayload2;
  // const signal = JSON.stringify(validate_hash)
  const signal = validate_hash; // Assuming validate_hash is the signal you want to use
  console.log('Request payload:', payload);
  console.log('Action:', action);
  console.log('Signal:', signal);
  
  const app_id = process.env.NEXT_PUBLIC_APP_ID as `app_${string}`;
  const verifyRes = (await verifyCloudProof(
    payload,
    app_id,
    action,
    signal,
  )) as IVerifyResponse; // Wrapper on this

  if (verifyRes.success) {
    const response = await fetch('https://capital-pipefish-close.ngrok-free.app/api/worldcoin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verifyRes, validate_hash, validate_code }),
    });

    if (!response.ok) {
      console.error('Failed to notify backend:', response.status, await response.text());
      return NextResponse.json({ verifyRes, status: 500 });
    }
    // This is where you should perform backend actions if the verification succeeds
    // Such as, setting a user as "verified" in a database
    console.log('Verification successful:', verifyRes);
    return NextResponse.json({ verifyRes, status: 200 });
  } else {
    // This is where you should handle errors from the World ID /verify endpoint.
    // Usually these errors are due to a user having already verified.
    console.error('Verification failed:', verifyRes);
    return NextResponse.json({ verifyRes, status: 400 });
  }
}
