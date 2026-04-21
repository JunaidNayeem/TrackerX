import { createClient } from "@/lib/supabase/server"
import { CategoriesList } from "@/components/categories/categories-list"
import { AddCategoryDialog } from "@/components/categories/add-category-dialog"

async function getCategoriesData(userId: string) {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId)
    .order("name")

  // Get spending per category this month
  const { data: spending } = await supabase
    .from("transactions")
    .select("category_id, amount")
    .eq("user_id", userId)
    .eq("type", "expense")

  const spendingByCategory: Record<string, number> = {}
  spending?.forEach((t) => {
    if (t.category_id) {
      spendingByCategory[t.category_id] = (spendingByCategory[t.category_id] || 0) + Number(t.amount)
    }
  })

  return {
    categories: categories?.map((c) => ({
      ...c,
      totalSpent: spendingByCategory[c.id] || 0,
    })) || [],
  }
}

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { categories } = await getCategoriesData(user.id)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            Manage your expense categories
          </p>
        </div>
        <AddCategoryDialog />
      </div>

      <CategoriesList categories={categories} />
    </div>
  )
}
