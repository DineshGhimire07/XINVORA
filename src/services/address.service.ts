import { AddressRepository } from "../db/repositories/address.repository"

export class AddressService {
  static async getUserAddresses(userId: string) {
    return await AddressRepository.findByUserId(null, userId)
  }

  static async createAddress(
    userId: string,
    data: {
      label?: string
      firstName: string
      lastName: string
      line1: string
      line2?: string
      city: string
      state?: string
      country: string
      postalCode: string
      phone?: string
      isDefaultShipping?: boolean
      isDefaultBilling?: boolean
    }
  ) {
    const list = await AddressRepository.findByUserId(null, userId)
    const isFirst = list.length === 0

    return await AddressRepository.createAddress(null, {
      ...data,
      userId,
      isDefaultShipping: isFirst ? true : !!data.isDefaultShipping,
      isDefaultBilling: isFirst ? true : !!data.isDefaultBilling,
      isDefault: isFirst ? true : (data.isDefaultShipping || data.isDefaultBilling || false),
    })
  }

  static async updateAddress(
    userId: string,
    id: string,
    data: {
      label?: string
      firstName?: string
      lastName?: string
      line1?: string
      line2?: string
      city?: string
      state?: string
      country?: string
      postalCode?: string
      phone?: string
      isDefaultShipping?: boolean
      isDefaultBilling?: boolean
    }
  ) {
    const address = await AddressRepository.findById(null, id)
    if (!address || address.userId !== userId) {
      throw new Error("Address not found or unauthorized")
    }

    return await AddressRepository.updateAddress(null, id, userId, data)
  }

  static async deleteAddress(userId: string, id: string) {
    const address = await AddressRepository.findById(null, id)
    if (!address || address.userId !== userId) {
      throw new Error("Address not found or unauthorized")
    }

    const list = await AddressRepository.findByUserId(null, userId)
    if (list.length > 1) {
      // Prevent deleting the only default shipping address if multiple exist
      if (address.isDefaultShipping) {
        const otherShippingDefault = list.some((a: any) => a.id !== id && a.isDefaultShipping)
        if (!otherShippingDefault) {
          throw new Error("Cannot delete your only default shipping address. Set another default first.")
        }
      }
      // Prevent deleting the only default billing address if multiple exist
      if (address.isDefaultBilling) {
        const otherBillingDefault = list.some((a: any) => a.id !== id && a.isDefaultBilling)
        if (!otherBillingDefault) {
          throw new Error("Cannot delete your only default billing address. Set another default first.")
        }
      }
    }

    await AddressRepository.deleteAddress(null, id, userId)
  }
}
