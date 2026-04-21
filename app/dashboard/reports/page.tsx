import { createClient } from "@/lib/supabase/server"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MonthlyTrendChart } from "@/components/reports/monthly-trend-chart"
import { CategoryBreakdownChart } from "@/components/reports/category-breakdown-chart"

async function getReportsData(userId: string) {
  const supabase = await createClient()
  const now = new Date()

  // Get last 6 months of data
  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i)
    const monthStart = format(startOfMonth(monthDate), "yyyy-MM-dd")
    const monthEnd = format(endOfMonth(monthDate), "yyyy-MM-dd")

    const { data: transactions } = await supabase
      .from("transactions")
      .select("type, amount")
      .eq("user_id", userId)
      .gte("date", monthStart)
      .lte("date", monthEnd)

    const income = transactions
      ?.filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0

    const expenses = transactions
      ?.filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0

    monthlyData.push({
      month: format(monthDate, "MMM"),
      income,
      expenses,
    })
  }

  // Get category breakdown for current month
  const currentMonthStart = format(startOfMonth(now), "yyyy-MM-dd")
  const currentMonthEnd = format(endOfMonth(now), "yyyy-MM-dd")

  const { data: categoryData } = await supabase
    .from("transactions")
    .select("amount, categories(name, color)")
    .eq("user_id", userId)
    .eq("type", "expense")
    .gte("date", currentMonthStart)
    .lte("date", currentMonthEnd)

  const categoryBreakdown = categoryData?.reduce((acc, t) => {
    const name = t.categories?.name || "Uncategorized"
    const color = t.categories?.color || "#6b7280"
    if (!acc[name]) {
      acc[name] = { amount: 0, color }
    }
    acc[name].amount += Number(t.amount)
    return acc
  }, {} as Record<string, { amount: number; color: string }>)

  const categoryChartData = Object.entries(categoryBreakdown || {})
    .map(([name, data]) => ({
      name,
      amount: data.amount,
      fill: data.color,
    }))
    .sort((a, b) => b.amount - a.amount)

  // Calculate totals
  const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0)
  const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0)
  const avgMonthlyExpenses = totalExpenses / 6

  return {
    monthlyData,
    categoryChartData,
    totalIncome,
    totalExpenses,
    avgMonthlyExpenses,
  }
}

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const {
    monthlyData,
    categoryChartData,
    totalIncome,
    totalExpenses,
    avgMonthlyExpenses,
  } = await getReportsData(user.id)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          Analyze your spending patterns and trends
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              6-Month Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              6-Month Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Monthly Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(avgMonthlyExpenses)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
            <CardDescription>Income vs Expenses over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyTrendChart data={monthlyData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Where your money went this month</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryBreakdownChart data={categoryChartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
