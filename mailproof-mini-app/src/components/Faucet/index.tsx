'use client';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit, Tokens, tokenToDecimals } from '@worldcoin/minikit-js';
import { useState } from 'react';

/**
 * This component is used to pay a user
 * The payment command simply does an ERC20 transfer
 * But, it also includes a reference field that you can search for on-chain
 */
export const Faucet = (props : {email_address : string}) => {
  console.log('Pay component props:', props);
  const { email_address } = props;
  const [buttonState, setButtonState] = useState<
    'pending' | 'success' | 'failed' | undefined
  >(undefined);
  const [txId, setTxId] = useState<string | undefined>(undefined);

  const onClickPay = async () => {
    // Lets use Alex's username to pay!
    
      const res = await fetch('/api/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({payload:{
          email: email_address,
          amount: '1000000000000000000', // 0.1 WLD in wei
        }}),
      });
      

      setButtonState('success');
      // It's important to actually check the transaction result on-chain
      // You should confirm the reference id matches for security
      // Read more here: https://docs.world.org/mini-apps/commands/pay#verifying-the-payment
    
  };

  return (
    <div className="grid w-full gap-4">
      <p className="text-lg font-semibold">Pay</p>
      <LiveFeedback
        label={{
          failed: 'Payment failed',
          pending: 'Payment pending',
          success: 'Payment successful',
        }}
        state={buttonState}
        className="w-full"
      >
        <Button
          onClick={onClickPay}
          disabled={buttonState === 'pending'}
          size="lg"
          variant="primary"
          className="w-full"
        >
          Pay
        </Button>
      </LiveFeedback>
      {txId && (
        <div className="text-sm text-gray-500">
          Transaction ID: {txId}
          &nbsp;|&nbsp;
          <a
            href={`https://worldchain-mainnet.explorer.alchemy.com/tx/${txId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            See on Explorer
          </a>
        </div>
      )}
    </div>
  );
};
