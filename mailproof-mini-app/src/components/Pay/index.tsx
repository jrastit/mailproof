'use client';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit, Tokens, tokenToDecimals } from '@worldcoin/minikit-js';
import { useState } from 'react';

/**
 * This component is used to pay a user
 * The payment command simply does an ERC20 transfer
 * But, it also includes a reference field that you can search for on-chain
 */
export const Pay = (props : {email_address : string}) => {
  console.log('Pay component props:', props);
  const { email_address } = props;
  const [buttonState, setButtonState] = useState<
    'pending' | 'success' | 'failed' | undefined
  >(undefined);
  const [txId, setTxId] = useState<string | undefined>(undefined);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);

  const onClickPay = async () => {
    // Lets use Alex's username to pay!
    const address = (await MiniKit.getUserByUsername('jrastit')).walletAddress;
    setButtonState('pending');

    const res = await fetch('/api/initiate-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address
      }),
    });
    const { id } = await res.json();

    console.log('Payment reference ID:', id);
    console.log('Payment address:', address);

    const result = await MiniKit.commandsAsync.pay({
      reference: id,
      // to: address ?? '0xaa875023f631d4686a23312b7b711a04d17e7ffa',
      to: '0xB724531aD056340bbf611Ac2E68502B26D394179',
      tokens: [
        {
          symbol: Tokens.WLD,
          token_amount: tokenToDecimals(0.1, Tokens.WLD).toString(),
        },
        // {
        //   symbol: Tokens.USDCE,
        //   token_amount: tokenToDecimals(0.1, Tokens.USDCE).toString(),
        // },
      ],
      description: 'Test example payment for minikit',
    });

    console.log(result.finalPayload);

    const tx_id = result.commandPayload?.reference;
    setTxId(tx_id);

    if (result.finalPayload.status === 'success') {

      const res = await fetch('/api/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({payload:{
          tx_id: tx_id,
          email: email_address,
          amount: result.commandPayload?.tokens[0].token_amount,
        }}),
      });

      if (!res.ok) {
        console.error('Failed to notify backend:', res.status, await res.text());
        setButtonState('failed');
        setTimeout(() => {
          setButtonState(undefined);
          setTxId(undefined);
        }, 5000);
        return;
      }
      console.log('Payment confirmed successfully:', res.status);
      const { transaction_hash } = await res.json();
      console.log('Transaction hash:', transaction_hash);
      setTxHash(transaction_hash);
      setButtonState('success');
      // It's important to actually check the transaction result on-chain
      // You should confirm the reference id matches for security
      // Read more here: https://docs.world.org/mini-apps/commands/pay#verifying-the-payment
    } else {
      setButtonState('failed');
      setTimeout(() => {
        setButtonState(undefined);
        setTxId(undefined);
      }, 3000);
    }
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
      {txHash && (
        <div className="text-sm text-gray-500">
          Transaction Hash: {txHash}
          &nbsp;|&nbsp;
          <a
            href={`https://worldchain-mainnet.explorer.alchemy.com/tx/${txHash}`}
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
