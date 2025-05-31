import {
  ISuccessResult,
  IVerifyResponse,
  verifyCloudProof,
} from '@worldcoin/minikit-js';
import { NextRequest, NextResponse } from 'next/server';

interface IRequestPayload {
  payload: ISuccessResult;
  action: string;
  signal: string | undefined;
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
  const { payload, action, signal } = (request_content) as IRequestPayload;
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
