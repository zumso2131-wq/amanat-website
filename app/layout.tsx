import "./globals.css"
import { Inter } from "next/font/google"
import Providers from "./providers"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata = {
  title: "AMANAT - Исламская рассрочка",
  description: "Оформите рассрочку на электронику и бытовую технику",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
