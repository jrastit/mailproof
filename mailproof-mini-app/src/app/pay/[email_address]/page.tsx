import { auth } from '@/auth';
import { Page } from '@/components/PageLayout';
import { Pay } from '@/components/Pay';
import { UserInfo } from '@/components/UserInfo';
import { Marble, TopBar } from '@worldcoin/mini-apps-ui-kit-react';

type Props = {
  params: Promise<{ email_address: string}>;
};

export default async function PayPage(props: Props) {
  const { email_address } = await props.params;
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
        
        <UserInfo />
        <Pay  email_address={email_address}/>
      </Page.Main>
    </>
  );
}