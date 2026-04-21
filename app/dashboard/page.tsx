import { createClient } from "@/lib/supabase/server"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { SpendingChart } from "@/components/dashboard/spending-chart"

async function getDashboardData(userId: string) {
  const supabase = await createClient()
  const now = new Date()
  const monthStart = format(startOfMonth(now), "yyyy-MM-dd")
  const monthEnd = format(endOfMonth(now), "yyyy-MM-dd")

  // Get this month's transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, categories(name, color, icon)")
    .eq("user_id", userId)
    .gte("date", monthStart)
    .lte("date", monthEnd)
    .order("date", { ascending: false })

  const income = transactions
    ?.filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0

  const expenses = transactions
    ?.filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0

  const balance = income - expenses

  // Get recent transactions
  const { data: recentTransactions } = await supabase
    .from("transactions")
    .select("*, categories(name, color, icon)")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(5)

  // Get spending by category this month
  const { data: categorySpending } = await supabase
    .from("transactions")
    .select("amount, categories(name, color)")
    .eq("user_id", userId)
    .eq("type", "expense")
    .gte("date", monthStart)
    .lte("date", monthEnd)

  const spendingByCategory = categorySpending?.reduce((acc, t) => {
    const categoryName = t.categories?.name || "Uncategorized"
    const color = t.categories?.color || "#6b7280"
    if (!acc[categoryName]) {
      acc[categoryName] = { amount: 0, color }
    }
    acc[categoryName].amount += Number(t.amount)
    return acc
  }, {} as Record<string, { amount: number; color: string }>)

  const chartData = Object.entries(spendingByCategory || {}).map(([name, data]) => ({
    name,
    amount: data.amount,
    fill: data.color,
  }))

  return {
    income,
    expenses,
    balance,
    recentTransactions: recentTransactions || [],
    chartData,
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { income, expenses, balance, recentTransactions, chartData } = await getDashboardData(user.id)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your finances for {format(new Date(), "MMMM yyyy")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(income)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(expenses)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${balance >= 0 ? "bg-emerald-100" : "bg-red-100"}`}>
              <Wallet className={`h-4 w-4 ${balance >= 0 ? "text-emerald-600" : "text-red-600"}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-muted-foreground">Income - Expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Transactions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Where your money is going this month</CardDescription>
          </CardHeader>
          <CardContent>
            <SpendingChart data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest activity</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTransactions transactions={recentTransactions} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
