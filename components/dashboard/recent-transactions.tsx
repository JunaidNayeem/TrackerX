import Link from "next/link"
import { format } from "date-fns"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CategoryIcon } from "@/components/category-icon"

interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  description: string | null
  merchant: string | null
  date: string
  categories: {
    name: string
    color: string
    icon: string
  } | null
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">No transactions yet</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/transactions">Add your first transaction</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: `${transaction.categories?.color}20` }}
            >
              <CategoryIcon
                icon={transaction.categories?.icon || "circle"}
                className="h-5 w-5"
                style={{ color: transaction.categories?.color }}
              />
            </div>
            <div>
              <p className="font-medium">
                {transaction.merchant || transaction.description || "Transaction"}
              </p>
              <p className="text-sm text-muted-foreground">
                {transaction.categories?.name || "Uncategorized"} &middot; {format(new Date(transaction.date), "MMM d")}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-1 font-medium ${transaction.type === "income" ? "text-emerald-600" : "text-red-600"}`}>
            {transaction.type === "income" ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            {formatCurrency(Number(transaction.amount))}
          </div>
        </div>
      ))}
      <Button asChild variant="outline" className="mt-2">
        <Link href="/dashboard/transactions">View all transactions</Link>
      </Button>
    </div>
  )
}
