import { Container, Heading, Text } from "@react-email/components";
import { EmailLayout } from "./layout";

type ContactMessageEmailProps = {
  name: string;
  email: string;
  topic: string;
  message: string;
  logo_url?: string;
  contact_email?: string;
};

function ContactMessageEmailComponent({
  name,
  email,
  topic,
  message,
  logo_url,
  contact_email,
}: ContactMessageEmailProps) {
  return (
    <EmailLayout
      preview={`${topic} from ${name}`}
      logo_url={logo_url}
      contact_email={contact_email}
      footer={`Sent from the contact form. Reply to this email to answer ${name} at ${email}.`}
    >
      <Container className="p-6">
        <Heading className="text-2xl font-bold text-center text-gray-800">
          {topic}
        </Heading>
        <Text className="text-gray-600 mt-4">From {name}</Text>
        <Text className="text-gray-800 whitespace-pre-wrap">{message}</Text>
      </Container>
    </EmailLayout>
  );
}

export const contactMessageEmail = (props: ContactMessageEmailProps) => (
  <ContactMessageEmailComponent {...props} />
);
