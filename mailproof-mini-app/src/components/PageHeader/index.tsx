import { auth } from '@/auth';
import { Page } from '@/components/PageLayout';
import { Marble, TopBar } from '@worldcoin/mini-apps-ui-kit-react';

export const PageHeader = async (props: { title: string }) => {
    const session = await auth();
    const { title } = props;

  return (
    <Page.Header className="p-0">
      <TopBar
        title={title}
        endAdornment={
          session?.user && (
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold capitalize">
                {session.user.username}
              </p>
              <Marble src={session.user.profilePictureUrl} className="w-12" />
            </div>
          )
        }
      />
    </Page.Header>
  );
};