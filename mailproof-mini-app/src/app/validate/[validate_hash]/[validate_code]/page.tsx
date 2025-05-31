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
      <Page.Main className="flex flex-col items-center justify-start gap-4 mb-16">
        <Validate validate_hash={validate_hash}  validate_code={validate_code}  />
      </Page.Main>
    </>
  );
}
