import { SessionService } from "@/services/session.service"
import { AddressService } from "@/services/address.service"
import { Stack } from "@/components/shared/stack"
import { AddressesList } from "./AddressesList"

export const metadata = {
  title: "My Saved Addresses | XINVORA",
  description: "Manage your default shipping and billing addresses.",
}

export default async function AddressesPage() {
  const session = await SessionService.requireAuth()
  const addresses = await AddressService.getUserAddresses(session.id)

  return (
    <div className="space-y-6">
      <div className="border-b border-border-primary/20 pb-4">
        <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">My Account</span>
        <h1 className="text-display-sm font-display text-text-primary uppercase tracking-wide mt-1">Saved Addresses</h1>
      </div>

      <AddressesList initialAddresses={addresses} />
    </div>
  )
}
