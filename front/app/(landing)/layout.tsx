export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="flex-1 flex flex-col max-w-7xl w-full px-6 sm:px-8 md:px-10">
      {children}
    </main>
  )
}
