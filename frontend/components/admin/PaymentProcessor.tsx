"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { CreditCard } from "lucide-react"
import { toast } from "sonner"

interface PaymentProcessorProps {
  orderId: number
  orderStatus: string
  email: string
  password: string
  onPaymentProcessed: () => void
}

export default function PaymentProcessor({
  orderId,
  orderStatus,
  email,
  password,
  onPaymentProcessed,
}: PaymentProcessorProps) {
  const [processing, setProcessing] = useState(false)

  const handleProcessPayment = async () => {
    setProcessing(true)
    try {
      const response = await fetch(
        `http://localhost:5074/api/Payment/admin/process/${orderId}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        { method: "POST" },
      )

      if (response.ok) {
        const result = await response.json()
        toast.success("Payment processed successfully!", {
          description: `Invoice ${result.invoiceNumber} generated. Shipment created.`,
        })
        onPaymentProcessed()
      } else {
        const errorText = await response.text()
        toast.error("Payment failed", { description: errorText })
      }
    } catch (error) {
      toast.error("Network error", { description: "Unable to process payment." })
    } finally {
      setProcessing(false)
    }
  }

  if (orderStatus !== "PendingPayment") {
    return null
  }

  return (
    <Button
      onClick={handleProcessPayment}
      disabled={processing}
      className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600"
      size="sm"
    >
      {processing ? (
        <>
          <Spinner className="h-4 w-4 mr-2" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          Process Payment
        </>
      )}
    </Button>
  )
}
