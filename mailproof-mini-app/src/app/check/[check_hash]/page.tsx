import { auth } from '@/auth';
import { Page } from '@/components/PageLayout';
import { Marble, TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import { Check } from '@/components/Check';

type Props = {
  params: Promise<{ check_hash: string }>;
};

export default async function CheckPage(props: Props) {
  const { check_hash } = await props.params;
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
      <Page.Main className="flex flex-col items-center justify-start gap-4 mb-16">
        <Check check_hash={check_hash} />
      </Page.Main>
    </>
  );
}