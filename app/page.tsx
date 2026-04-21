import Link from "next/link"
import { Wallet, Receipt, PieChart, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">Spend Tracker</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance">
            Track Your Expenses
            <br />
            <span className="text-muted-foreground">Effortlessly</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
            A simple, intuitive expense tracker with AI-powered receipt scanning.
            Take control of your finances and understand where your money goes.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">Start Tracking Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/50 py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold">Everything you need to manage your money</h2>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Receipt className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">AI Receipt Scanning</h3>
                <p className="mt-2 text-muted-foreground">
                  Snap a photo of your receipt and let AI extract the details automatically.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <PieChart className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Smart Categories</h3>
                <p className="mt-2 text-muted-foreground">
                  Organize expenses by category and see where your money is going at a glance.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <TrendingUp className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Insightful Reports</h3>
                <p className="mt-2 text-muted-foreground">
                  Track spending trends over time with beautiful charts and reports.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Spend Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
