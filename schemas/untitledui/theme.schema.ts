import { z } from 'zod'

export const ColorScaleSchema = z.record(z.string(), z.string())

export const ThemeColorsSchema = z.object({
  brand: ColorScaleSchema,
  gray: ColorScaleSchema,
  error: ColorScaleSchema.optional(),
  warning: ColorScaleSchema.optional(),
  success: ColorScaleSchema.optional(),
  blue: ColorScaleSchema.optional(),
  indigo: ColorScaleSchema.optional(),
  pink: ColorScaleSchema.optional(),
  orange: ColorScaleSchema.optional(),
})

export const UntitledUiThemeSchema = z.object({
  name: z.string().default('Untitled UI'),
  version: z.string().default('8.0.0'),
  colors: ThemeColorsSchema,
  typography: z.record(z.string(), z.any()).optional(),
  radius: z.record(z.string(), z.string()).optional(),
  shadows: z.record(z.string(), z.string()).optional(),
})

export type UntitledUiTheme = z.infer<typeof UntitledUiThemeSchema>
