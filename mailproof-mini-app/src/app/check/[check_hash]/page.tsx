import { auth } from '@/auth';
import { Page } from '@/components/PageLayout';
import { Marble, TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import { Check } from '@/components/Check';
import { PageHeader } from '@/components/PageHeader';

type Props = {
  params: Promise<{ check_hash: string }>;
};

export default async function CheckPage(props: Props) {
  const { check_hash } = await props.params;
  const session = await auth();
  
  return (
    <>
      <PageHeader title="Check mail" />
      <Page.Main className="flex flex-col items-center justify-start gap-4 mb-16">
        <Check check_hash={check_hash} />
      </Page.Main>
    </>
  );
}