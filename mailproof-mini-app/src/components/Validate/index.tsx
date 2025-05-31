'use client';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js';
import { useState } from 'react';

/**
 * This component is an example of how to use World ID in Mini Apps
 * Minikit commands must be used on client components
 * It's critical you verify the proof on the server side
 * Read More: https://docs.world.org/mini-apps/commands/verify#verifying-the-proof
 */
export const Validate = (params:{validate_hash : string, validate_code : string}) => {
  const { validate_hash, validate_code } = params;
  const [buttonState, setButtonState] = useState<
    'pending' | 'success' | 'failed' | undefined
  >(undefined);

  const [whichVerification, setWhichVerification] = useState<VerificationLevel>(
    VerificationLevel.Device,
  );

  const onClickValidate = async (verificationLevel: VerificationLevel) => {
    setButtonState('pending');
    setWhichVerification(verificationLevel);
    const result = await MiniKit.commandsAsync.verify({
      action: 'validate-action', // Make sure to create this in the developer portal -> incognito actions
      verification_level: verificationLevel,
      signal: validate_hash, // This is the signal you want to use for verification
    });
    console.log(result.finalPayload);
    // Verify the proof
    const response = await fetch('/api/validate-proof', {
      method: 'POST',
      body: JSON.stringify({
        payload: result.finalPayload,
        action: 'validate-action',
        validate_hash,
        validate_code,
      }),
    });

    const data = await response.json();
    if (data.verifyRes.success) {
      setButtonState('success');
      // Normally you'd do something here since the user is verified
      // Here we'll just do nothing
    } else {
      setButtonState('failed');

      // Reset the button state after 3 seconds
      setTimeout(() => {
        setButtonState(undefined);
      }, 2000);
    }
  };

  return (
    <div className="grid w-full gap-4">
      <p className="text-lg font-semibold">Validate</p>
      <LiveFeedback
        label={{
          failed: 'Failed to validate',
          pending: 'Validating',
          success: 'Validated',
        }}
        state={
          whichVerification === VerificationLevel.Device
            ? buttonState
            : undefined
        }
        className="w-full"
      >
        <Button
          onClick={() => onClickValidate(VerificationLevel.Device)}
          disabled={buttonState === 'pending'}
          size="lg"
          variant="tertiary"
          className="w-full"
        >
          Validate (Device)
        </Button>
      </LiveFeedback>
      <LiveFeedback
        label={{
          failed: 'Failed to validate',
          pending: 'Validating',
          success: 'Validated',
        }}
        state={
          whichVerification === VerificationLevel.Orb ? buttonState : undefined
        }
        className="w-full"
      >
        <Button
          onClick={() => onClickValidate(VerificationLevel.Orb)}
          disabled={buttonState === 'pending'}
          size="lg"
          variant="primary"
          className="w-full"
        >
          Validate (Orb)
        </Button>
      </LiveFeedback>
    </div>
  );
};
