"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Camera } from "lucide-react"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import { ReceiptUpload } from "./receipt-upload"

interface Category {
  id: string
  name: string
  color: string
  icon: string
}

interface AddTransactionDialogProps {
  categories: Category[]
}

export function AddTransactionDialog({ categories }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<"expense" | "income">("expense")
  const [amount, setAmount] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [merchant, setMerchant] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const router = useRouter()

  const resetForm = () => {
    setType("expense")
    setAmount("")
    setCategoryId("")
    setMerchant("")
    setDescription("")
    setDate(format(new Date(), "yyyy-MM-dd"))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !categoryId) return

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    await supabase.from("transactions").insert({
      user_id: user.id,
      type,
      amount: parseFloat(amount),
      category_id: categoryId,
      merchant: merchant || null,
      description: description || null,
      date,
    })

    setLoading(false)
    setOpen(false)
    resetForm()
    router.refresh()
  }

  const handleReceiptProcessed = (data: {
    amount?: number
    merchant?: string
    date?: string
    category?: string
  }) => {
    if (data.amount) setAmount(data.amount.toString())
    if (data.merchant) setMerchant(data.merchant)
    if (data.date) setDate(data.date)
    if (data.category) {
      const matchedCategory = categories.find(
        (c) => c.name.toLowerCase().includes(data.category!.toLowerCase())
      )
      if (matchedCategory) setCategoryId(matchedCategory.id)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Enter the details manually or scan a receipt
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manual" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="receipt">Scan Receipt</TabsTrigger>
          </TabsList>

          <TabsContent value="receipt" className="mt-4">
            <ReceiptUpload onProcessed={handleReceiptProcessed} />
          </TabsContent>

          <TabsContent value="manual" className="mt-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as "expense" | "income")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="merchant">Merchant (optional)</Label>
                <Input
                  id="merchant"
                  placeholder="e.g., Starbucks"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="mt-2">
                {loading ? <Spinner className="h-4 w-4" /> : "Add Transaction"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
