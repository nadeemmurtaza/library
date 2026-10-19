import { z } from 'zod'

export const ComponentVariantSchema = z.object({
  name: z.string(),
  props: z.record(z.string(), z.any()).optional(),
  description: z.string().optional(),
})

export const UntitledUiComponentMetaSchema = z.object({
  name: z.string(),
  category: z.enum(['ui', 'layout', 'patterns', 'common', 'marketing']),
  description: z.string(),
  source: z.string().default('untitledui'),
  license: z.string().default('MIT'),
  dependencies: z.array(z.string()).default([]),
  variants: z.array(ComponentVariantSchema).optional(),
  path: z.string(),
})

export type UntitledUiComponentMeta = z.infer<typeof UntitledUiComponentMetaSchema>
