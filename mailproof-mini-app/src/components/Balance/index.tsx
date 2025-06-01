'use client';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { useEffect, useState } from 'react';

/**
 * This component is used to pay a user
 * The payment command simply does an ERC20 transfer
 * But, it also includes a reference field that you can search for on-chain
 */
export const Balance = (props : {email_address : string}) => {
  console.log('Pay component props:', props);
  const { email_address } = props;
  const [buttonState, setButtonState] = useState<
    'pending' | 'success' | 'failed' | undefined
  >(undefined);

  const [balance, setBalance] = useState<{stacked:number, spent:number} | null>(null);

  

  // Fetch balance every second
  useEffect(() => {
    let isMounted = true;
    const fetchBalance = async () => {
      console.log('Balance component email_address:', email_address);
      try {
        const res = await fetch('/api/balance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email_address }),
        });
        const data = await res.json();
        if (isMounted) setBalance(data.balance);
      } catch (e) {
        if (isMounted) setBalance(null);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [email_address]);

  return (
    <div className="grid w-full gap-4">
      <p className="text-lg font-semibold">Balance</p>
      <div className="text-base">
        {balance !== null ? `Balance: ${(balance.stacked) - (balance.spent)} (${(balance.stacked)} / ${(balance.spent)})` : 'Loading...'}
      </div>
    </div>
  );
};
