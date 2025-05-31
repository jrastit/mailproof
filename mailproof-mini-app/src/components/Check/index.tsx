'use client';
import { LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import React, { useState } from 'react';

/**
 * This component is used to pay a user
 * The payment command simply does an ERC20 transfer
 * But, it also includes a reference field that you can search for on-chain
 */
export const Check = (props: { check_hash: string }) => {
    const { check_hash } = props;
    const [checkState, setCheckState] = useState<
        'pending' | 'success' | 'failed' | undefined
    >(undefined);

    const check = async () => {
        setCheckState('pending');
        try {
            const response = await fetch('/api/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ check_hash }),
            });
            if (!response.ok) {
                throw new Error('API call failed');
            }
            const data = await response.json();
            console.log('Check response:', data);
            // Adjust the property path below according to your API response structure
            const status = data?.proof?.payload?.status;
            if (status === 'success') {
                setCheckState('success');
            } else {
                setCheckState('failed');
            }
        } catch (error) {
            setCheckState('failed');
            console.error('Error during check:', error);
        }
    };

    React.useEffect(() => {
        check();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [check_hash]);

    return (
        <div className="grid w-full gap-4">
            <p className="text-lg font-semibold">Check Result</p>
            <LiveFeedback
            label={{
                failed: 'Check failed',
                pending: 'Checking...',
                success: 'Check successful',
            }}
            state={checkState}
            className="w-full"
            >
            {/* You can customize the children here if needed */}
            {checkState === 'success' && (
                <span className="text-green-600">The check was successful!</span>
            )}
            {checkState === 'failed' && (
                <span className="text-red-600">There was an error validating the check.</span>
            )}
            {checkState === 'pending' && (
                <span className="text-gray-600">Please wait while we validate the check...</span>
            )}
            </LiveFeedback>
        </div>
    );
};
