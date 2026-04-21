import { generateText, Output } from "ai"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const receiptSchema = z.object({
  amount: z.number().nullable().describe("The total amount on the receipt"),
  merchant: z.string().nullable().describe("The merchant or store name"),
  date: z.string().nullable().describe("The date of purchase in YYYY-MM-DD format"),
  category: z.string().nullable().describe("Suggested category: Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, or Other"),
  items: z.array(z.object({
    name: z.string(),
    price: z.number().nullable(),
  })).nullable().describe("List of items on the receipt"),
})

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 })
    }

    const result = await generateText({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract the following information from this receipt image: total amount, merchant/store name, date of purchase, and suggest a category. Return the data in the specified format. If you cannot read a field clearly, return null for that field.",
            },
            {
              type: "image",
              image: imageUrl,
            },
          ],
        },
      ],
      output: Output.object({ schema: receiptSchema }),
    })

    const data = result.output

    return NextResponse.json({
      amount: data?.amount ?? null,
      merchant: data?.merchant ?? null,
      date: data?.date ?? null,
      category: data?.category ?? null,
      items: data?.items ?? null,
    })
  } catch (error) {
    console.error("Receipt processing error:", error)
    return NextResponse.json(
      { error: "Failed to process receipt" },
      { status: 500 }
    )
  }
}
