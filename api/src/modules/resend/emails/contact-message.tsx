import { Container, Heading, Text } from "@react-email/components";
import { EmailLayout } from "./layout";

type ContactMessageEmailProps = {
  name: string;
  email: string;
  topic: string;
  message: string;
  logo_url?: string;
};

function ContactMessageEmailComponent({
  name,
  email,
  topic,
  message,
  logo_url,
}: ContactMessageEmailProps) {
  return (
    <EmailLayout preview={`${topic} from ${name}`} logo_url={logo_url}>
      <Container className="p-6">
        <Heading className="text-2xl font-bold text-center text-gray-800">
          {topic}
        </Heading>
        <Text className="text-gray-600 mt-4">
          From {name} ({email})
        </Text>
        <Text className="text-gray-800 whitespace-pre-wrap">{message}</Text>
      </Container>
    </EmailLayout>
  );
}

export const contactMessageEmail = (props: ContactMessageEmailProps) => (
  <ContactMessageEmailComponent {...props} />
);
