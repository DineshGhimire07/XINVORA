import { redirect } from "next/navigation"
import { verifyPaymentAction } from "@/actions/payment.actions"

interface VerifyPageProps {
  searchParams: Promise<{ paymentId?: string; status?: string }>
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const { paymentId, status } = await searchParams
  
  if (!paymentId || !status) {
    redirect("/cart")
  }

  // Call the server action to settle payment state and order
  const result = await verifyPaymentAction(paymentId, { status, paymentId })

  if (result.success && result.data) {
    const orderNumber = result.data.orderNumber
    if (result.data.status === "PAID") {
      redirect(`/payment/success?orderNumber=${orderNumber}`)
    } else if (result.data.status === "CANCELLED") {
      redirect(`/payment/cancelled?orderNumber=${orderNumber}`)
    } else {
      redirect(`/payment/failed?orderNumber=${orderNumber}&paymentId=${paymentId}`)
    }
  } else {
    // If the validation/update throws an error, redirect to failed
    redirect(`/payment/failed?paymentId=${paymentId}`)
  }
}
