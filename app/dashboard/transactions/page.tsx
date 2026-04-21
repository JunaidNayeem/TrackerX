import { createClient } from "@/lib/supabase/server"
import { TransactionsList } from "@/components/transactions/transactions-list"
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog"

async function getTransactionsData(userId: string) {
  const supabase = await createClient()

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, categories(id, name, color, icon)")
    .eq("user_id", userId)
    .order("date", { ascending: false })

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId)
    .order("name")

  return {
    transactions: transactions || [],
    categories: categories || [],
  }
}

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { transactions, categories } = await getTransactionsData(user.id)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            Manage your income and expenses
          </p>
        </div>
        <AddTransactionDialog categories={categories} />
      </div>

      <TransactionsList transactions={transactions} categories={categories} />
    </div>
  )
}
