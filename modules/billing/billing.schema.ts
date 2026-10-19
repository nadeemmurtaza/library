import { z } from 'zod'

export const PlanTierSchema = z.object({
  id: z.string(),
  name: z.string(),
  monthlyPrice: z.number(),
  annualPrice: z.number(),
  features: z.array(z.string()),
  isPopular: z.boolean().optional(),
})

export const PaymentMethodSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/),
  cvc: z.string().regex(/^\d{3,4}$/),
  name: z.string(),
})

export type PlanTier = z.infer<typeof PlanTierSchema>
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>
