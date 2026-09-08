import { z } from 'zod'

export const checkoutAddressSchema = z.object({
  email: z
    .string()
    .email('Enter a valid email.')
    .max(254, 'Email is too long.'),
  first_name: z
    .string()
    .min(1, 'Enter a first name.')
    .max(100, 'First name is too long.'),
  last_name: z
    .string()
    .min(1, 'Enter a last name.')
    .max(100, 'Last name is too long.'),
  address_1: z
    .string()
    .min(1, 'Enter an address.')
    .max(200, 'Address is too long.'),
  address_2: z.string().max(200, 'Address is too long.').optional(),
  city: z.string().min(1, 'Enter a city.').max(100, 'City is too long.'),
  postal_code: z
    .string()
    .min(1, 'Enter a postal code.')
    .max(20, 'Postal code is too long.'),
  country_code: z.string().min(2, 'Select a country.').max(2),
  province: z.string().max(100, 'Province is too long.').optional(),
  phone: z.string().max(30, 'Phone number is too long.').optional(),
})

export type CheckoutAddressData = z.infer<typeof checkoutAddressSchema>

export const CHECKOUT_STEPS = [
  'address',
  'delivery',
  'payment',
  'review',
] as const

export type CheckoutStep = (typeof CHECKOUT_STEPS)[number]
