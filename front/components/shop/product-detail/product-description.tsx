import ReactMarkdown from 'react-markdown'

interface ProductDescriptionProps {
  subtitle?: string
  description?: string
}

export default function ProductDescription({
  subtitle,
  description,
}: ProductDescriptionProps) {
  if (!subtitle && !description) return null

  return (
    <div className="mt-6">
      {subtitle && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {subtitle}
        </p>
      )}
      {description && (
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{description}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}
