"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ArrowUpRight, ArrowDownRight, Search, Filter, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CategoryIcon } from "@/components/category-icon"
import { EditTransactionDialog } from "./edit-transaction-dialog"

interface Category {
  id: string
  name: string
  color: string
  icon: string
}

interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  description: string | null
  merchant: string | null
  date: string
  receipt_url: string | null
  categories: Category | null
}

interface TransactionsListProps {
  transactions: Transaction[]
  categories: Category[]
}

export function TransactionsList({ transactions, categories }: TransactionsListProps) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const router = useRouter()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      !search ||
      t.merchant?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === "all" || t.type === typeFilter
    const matchesCategory =
      categoryFilter === "all" || t.categories?.id === categoryFilter
    return matchesSearch && matchesType && matchesCategory
  })

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return

    const supabase = createClient()
    await supabase.from("transactions").delete().eq("id", id)
    router.refresh()
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No transactions yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add your first transaction to get started
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transactions List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-4">
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
                      {transaction.categories?.name || "Uncategorized"} &middot;{" "}
                      {format(new Date(transaction.date), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className={`flex items-center gap-1 font-medium ${
                      transaction.type === "income" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {formatCurrency(Number(transaction.amount))}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingTransaction(transaction)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(transaction.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredTransactions.length === 0 && transactions.length > 0 && (
        <p className="text-center text-muted-foreground py-8">
          No transactions match your filters
        </p>
      )}

      {editingTransaction && (
        <EditTransactionDialog
          transaction={editingTransaction}
          categories={categories}
          open={!!editingTransaction}
          onOpenChange={(open) => !open && setEditingTransaction(null)}
        />
      )}
    </div>
  )
}
