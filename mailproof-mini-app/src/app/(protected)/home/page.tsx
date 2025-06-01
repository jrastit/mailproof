import { auth } from '@/auth';
import { PageHeader } from '@/components/PageHeader';
import { Page } from '@/components/PageLayout';
import { UserInfo } from '@/components/UserInfo';
import { Verify } from '@/components/Verify';
import { Marble, TopBar } from '@worldcoin/mini-apps-ui-kit-react';

export default async function Home() {
  const session = await auth();

  return (
    <>
      <PageHeader title="Main" />
      <Page.Main className="flex flex-col items-center justify-start gap-4 mb-16">
        <UserInfo />
        <Verify />
        
        {/* <Pay /><Transaction />
        <ViewPermissions /> */}
      </Page.Main>
    </>
  );
}
