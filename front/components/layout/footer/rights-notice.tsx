export default function RightsNotice() {
  const year = new Date().getFullYear()

  return <span className="text-muted-foreground">© {year} h2bc</span>
}
