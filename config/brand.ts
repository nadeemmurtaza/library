/**
 * Single source for identity, contact, locale and theme.
 * Every surface (web, API, mobile) imports this; nothing else defines these values.
 * Stays out of here: the @newax/* package scope (static import specifier),
 * artwork pixels (only paths live here), customer-facing copy (translation files).
 * Values below are placeholders: replace per client.
 */
import type { ThemeName } from '../tokens/themes'

export const brand = {
  identity: {
    name: 'Your Company',
    shortName: 'Company',
    tagline: 'Your tagline',
    domain: 'example.com',
    adminTitle: 'Your Company Admin',
  },
  contact: {
    email: 'hello@example.com',
    supportEmail: 'support@example.com',
    phone: '+000 000 0000',
    address: 'Street, Building',
    city: 'City',
    country: 'Country',
    hours: 'Mon–Fri 09:00–17:00',
  },
  socials: {
    facebook: '',
    instagram: '',
    x: '',
    linkedin: '',
    youtube: '',
  },
  legal: {
    // label is a locale fact (NTN, TRN, VAT, GSTIN...), so it lives with the number
    taxId: { label: 'Tax ID', value: '' },
    registration: { label: 'Registration No.', value: '' },
    bank: { name: '', accountTitle: '', accountNumber: '', iban: '' },
  },
  locale: {
    currency: 'USD',
    minorUnits: 2,
    dialCode: '+1',
    nationalNumberLength: 10,
    timezone: 'UTC',
    defaultLocale: 'en',
    locales: ['en'],
    intlTag: 'en-US',
    rtlLocales: [] as string[],
  },
  theme: {
    light: 'brand' as ThemeName,
    dark: 'brand-dark' as ThemeName,
    // colours, radii, fonts, breakpoints: tokens/brand-theme.css + tokens/tokens.css (CSS cannot import TS)
  },
  artwork: {
    logo: '/assets/logos/logo.svg',
    logoMark: '/assets/logos/mark.svg',
    favicon: '/assets/logos/favicon.svg',
    ogImage: '/assets/images/og.png',
  },
} as const

export type Brand = typeof brand
