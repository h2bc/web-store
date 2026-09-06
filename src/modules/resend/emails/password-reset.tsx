import {
  Text,
  Container,
  Heading,
  Section,
  Link,
  Button,
} from "@react-email/components";
import { EmailLayout } from "./layout";

type PasswordResetEmailProps = {
  reset_url: string;
  email?: string;
  logo_url?: string;
};

function PasswordResetEmailComponent({
  reset_url,
  email,
  logo_url,
}: PasswordResetEmailProps) {
  return (
    <EmailLayout preview="Reset your password" logo_url={logo_url}>
      <Container className="p-6">
        <Heading className="text-2xl font-bold text-center text-gray-800">
          Reset Your Password
        </Heading>
        <Text className="text-gray-600 mt-4">
          Hello{email ? ` ${email}` : ""},
        </Text>
        <Text className="text-gray-600">
          We received a request to reset your password. Click the button below
          to create a new password for your account.
        </Text>

        <Section className="text-center my-8">
          <Button
            className="bg-black rounded text-white text-xs font-semibold no-underline text-center px-5 py-3"
            href={reset_url}
          >
            Reset Password
          </Button>
        </Section>

        <Text className="text-gray-600">
          Or copy and paste this URL into your browser:
        </Text>
        <Link
          href={reset_url}
          className="text-blue-600 no-underline text-sm break-all"
        >
          {reset_url}
        </Link>

        <Text className="text-gray-500 text-xs mt-8">
          This password reset link will expire soon for security reasons. Never
          share it with anyone.
        </Text>
        <Text className="text-gray-500 text-xs mt-2">
          If you didn't request a password reset, you can safely ignore this
          email. Your password will remain unchanged.
        </Text>
      </Container>
    </EmailLayout>
  );
}

export const passwordResetEmail = (props: PasswordResetEmailProps) => (
  <PasswordResetEmailComponent {...props} />
);
