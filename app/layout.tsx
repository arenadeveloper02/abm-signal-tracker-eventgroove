import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { ArenaEmailProvider } from '@/components/arena-email-provider'
import { getArenaEmailId } from '@/lib/arena-email'

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'ABM Signal Tracker',
  description: 'Track ABM buying signals, trends and company intelligence in one dashboard.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const emailId = await getArenaEmailId()
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={poppins.className} suppressHydrationWarning>
        <ArenaEmailProvider emailId={emailId}>{children}</ArenaEmailProvider>
      </body>
    </html>
  )
}
