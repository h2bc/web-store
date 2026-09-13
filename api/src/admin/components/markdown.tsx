import { Text } from "@medusajs/ui";
import ReactMarkdown, { Components } from "react-markdown";

const components: Components = {
  h1: ({ children }) => (
    <Text size="small" weight="plus" className="mt-4 first:mt-0">
      {children}
    </Text>
  ),
  h2: ({ children }) => (
    <Text size="small" weight="plus" className="mt-4 first:mt-0">
      {children}
    </Text>
  ),
  h3: ({ children }) => (
    <Text size="small" weight="plus" className="mt-4 first:mt-0">
      {children}
    </Text>
  ),
  p: ({ children }) => <Text size="small">{children}</Text>,
  ul: ({ children }) => (
    <ul className="list-disc space-y-1 pl-5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal space-y-1 pl-5">{children}</ol>
  ),
  li: ({ children }) => <li className="txt-small">{children}</li>,
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-ui-fg-interactive hover:underline"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  ),
};

export function Markdown({ children }: { children: string }) {
  return (
    <div className="flex flex-col gap-y-2">
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  );
}
