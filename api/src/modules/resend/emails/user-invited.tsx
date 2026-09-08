import {
  Text,
  Container,
  Heading,
  Section,
  Link,
  Button,
} from "@react-email/components";
import { EmailLayout } from "./layout";

type UserInvitedEmailProps = {
  invite_url: string;
  email?: string;
  logo_url?: string;
};

function UserInvitedEmailComponent({
  invite_url,
  email,
  logo_url,
}: UserInvitedEmailProps) {
  return (
    <EmailLayout
      preview="You've been invited to join the h2bc dashboard"
      logo_url={logo_url}
    >
      <Container className="p-6">
        <Heading className="text-2xl font-bold text-center text-gray-800">
          You're Invited!
        </Heading>
        <Text className="text-gray-600 mt-4">
          Hello{email ? ` ${email}` : ""},
        </Text>
        <Text className="text-gray-600">
          You've been invited to join the h2bc dashboard. Click the button below
          to accept your invitation and set up your account.
        </Text>

        <Section className="text-center my-8">
          <Button
            className="bg-black rounded text-white text-xs font-semibold no-underline text-center px-5 py-3"
            href={invite_url}
          >
            Accept Invitation
          </Button>
        </Section>

        <Text className="text-gray-600">
          Or copy and paste this URL into your browser:
        </Text>
        <Link
          href={invite_url}
          className="text-blue-600 no-underline text-sm break-all"
        >
          {invite_url}
        </Link>

        <Text className="text-gray-500 text-xs mt-8">
          If you weren't expecting this invitation, you can ignore this email.
        </Text>
      </Container>
    </EmailLayout>
  );
}

export const userInvitedEmail = (props: UserInvitedEmailProps) => (
  <UserInvitedEmailComponent {...props} />
);
