import { auth } from '@/auth';
import { Page } from '@/components/PageLayout';
import { UserInfo } from '@/components/UserInfo';
import { Validate } from '@/components/Validate';
import { Marble, TopBar } from '@worldcoin/mini-apps-ui-kit-react';

type Props = {
  params: Promise<{ validate_hash: string, validate_code: string }>;
};

export default async function ValidatePage(props: Props) {
  const { validate_hash, validate_code } = await props.params;
  const session = await auth();
  
  return (
    <>
      <Page.Header className="p-0">
        <TopBar
          title="Validate"
          endAdornment={
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold capitalize">
                {session?.user.username}
              </p>
              <Marble src={session?.user.profilePictureUrl} className="w-12" />
            </div>
          }
        />
      </Page.Header>
      {/* Ajout du logo centré */}
      <div className="flex justify-center my-6">
        <img src="wwww/images/Logo_BL_MailProof.png" alt="Logo" className="h-16" />
      </div>
      <Page.Main className="flex flex-col items-center justify-start gap-4 mb-16">
        <p className="text-gray-500 text-sm">Validate hash: {validate_hash}</p>
        <UserInfo />
        <div className="max-w-xl text-center mb-2">
          <h2 className="font-semibold text-base mb-1">Verify your identity to build trust.</h2>
          <p className="text-gray-600 text-sm">
            This step allows you, as the original sender, to confirm your identity via World ID. Once validated, your message is certified as coming from a verified human — reducing the risk of spoofing and building confidence with your recipient.
          </p>
        </div>
        <Validate validate_hash={validate_hash}  validate_code={validate_code}  />
      </Page.Main>
    </>
  );
}
