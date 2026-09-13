import {
  Text,
  Container,
  Html,
  Img,
  Section,
  Tailwind,
  Head,
  Preview,
  Body,
} from "@react-email/components";

type EmailLayoutProps = {
  preview: string;
  logo_url?: string;
  contact_email?: string;
  footer?: string;
  children: React.ReactNode;
};

const getFooter = (footer?: string, contact_email?: string) =>
  footer ??
  (contact_email &&
    `If you have any questions, contact us at ${contact_email}.`);

export function EmailLayout({
  preview,
  logo_url,
  contact_email,
  footer,
  children,
}: EmailLayoutProps) {
  const footerText = getFooter(footer, contact_email);

  return (
    <Tailwind>
      <Html className="font-sans bg-gray-100">
        <Head />
        <Preview>{preview}</Preview>
        <Body className="bg-white my-10 mx-auto w-full max-w-2xl">
          {logo_url && (
            <Container className="pt-8 text-center">
              <Img src={logo_url} alt="h2bc" height="120" className="mx-auto" />
            </Container>
          )}

          {children}

          {footerText && (
            <Section className="bg-gray-50 p-6 mt-10">
              <Text className="text-center text-gray-500 text-sm">
                {footerText}
              </Text>
            </Section>
          )}
        </Body>
      </Html>
    </Tailwind>
  );
}
