"use client"

import { useState, useRef } from "react"
import { Upload, Camera, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

interface ReceiptUploadProps {
  onProcessed: (data: {
    amount?: number
    merchant?: string
    date?: string
    category?: string
  }) => void
}

export function ReceiptUpload({ onProcessed }: ReceiptUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<{
    success: boolean
    message: string
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload and process
    setUploading(true)
    setResult(null)

    try {
      // First upload to blob storage
      const formData = new FormData()
      formData.append("file", file)

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadRes.ok) {
        throw new Error("Failed to upload image")
      }

      const { url } = await uploadRes.json()
      setUploading(false)
      setProcessing(true)

      // Now process with AI
      const processRes = await fetch("/api/process-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url }),
      })

      if (!processRes.ok) {
        throw new Error("Failed to process receipt")
      }

      const data = await processRes.json()
      setProcessing(false)

      if (data.amount || data.merchant || data.date) {
        setResult({ success: true, message: "Receipt processed successfully!" })
        onProcessed({
          amount: data.amount,
          merchant: data.merchant,
          date: data.date,
          category: data.category,
        })
      } else {
        setResult({
          success: false,
          message: "Could not extract details. Please enter manually.",
        })
      }
    } catch (error) {
      setUploading(false)
      setProcessing(false)
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An error occurred",
      })
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!preview ? (
        <div
          onClick={handleClick}
          className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 cursor-pointer hover:border-muted-foreground/50 transition-colors"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Camera className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-medium">Tap to scan receipt</p>
            <p className="text-sm text-muted-foreground">
              Take a photo or upload an image
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="relative rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Receipt preview"
              className="w-full h-48 object-cover"
            />
            {(uploading || processing) && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Spinner className="h-8 w-8" />
                  <p className="text-sm font-medium">
                    {uploading ? "Uploading..." : "Processing with AI..."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {result && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                result.success
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <p className="text-sm">{result.message}</p>
            </div>
          )}

          <Button variant="outline" onClick={handleClick} disabled={uploading || processing}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Different Image
          </Button>
        </div>
      )}
    </div>
  )
}
