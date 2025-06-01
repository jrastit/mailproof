import { auth } from '@/auth';
import { Balance } from '@/components/Balance';
import { Faucet } from '@/components/Faucet';
import { PageHeader } from '@/components/PageHeader';
import { Page } from '@/components/PageLayout';
import { Pay } from '@/components/Pay';
import { UserInfo } from '@/components/UserInfo';
import { Marble, TopBar } from '@worldcoin/mini-apps-ui-kit-react';

type Props = {
  params: Promise<{ email_address: string}>;
};

export default async function PayPage(props: Props) {
  const { email_address } = await props.params;
  console.log('Email address encoded:', email_address);
  const email_address_decoded = decodeURIComponent(email_address);
  console.log('Email address decoded:', email_address_decoded);
  const session = await auth();
  
  return (
    <>
      <PageHeader title="Add credit" />
      <Page.Main className="flex flex-col items-center justify-start gap-4 mb-16">
        <Balance email_address={email_address_decoded} />
        <Faucet email_address={email_address_decoded} />
        <Pay  email_address={email_address_decoded}/>
      </Page.Main>
    </>
  );
}