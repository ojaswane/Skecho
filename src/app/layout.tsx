import "./globals.css"
import { Bricolage_Grotesque, Elsie, Instrument_Serif, Parisienne } from "next/font/google"
import { ThemeProvider } from "next-themes"

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bricolage",
})

const parisienne = Parisienne({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-parisienne",
})

const instrument = Instrument_Serif({
  subsets: ["latin" , "latin-ext"],
  weight: ['400'],
  variable: "--font-instrument",
})

const elsie  = Elsie({
  subsets: ["latin"],
  weight: ["400", "900"],
  variable: "--font-elsie",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolage.variable} ${elsie.variable} ${instrument.variable}`}
    >
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
