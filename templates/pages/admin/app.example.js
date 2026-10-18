// Minimal wiring of the admin kit. Copy next to index.html and adjust the imports to where you vendor the library.
import { brand } from './brand.js'                       // plain-JS mirror of config/brand.ts
import { createStorage } from './library/utils/storage.js'
import { createDb } from './library/lib/collection-store.js'
import { createAuth } from './library/providers/auth-provider.js'
import { createTheme } from './library/providers/theme-provider.js'
import { createToaster } from './library/providers/toast-provider.js'
import { mountShell } from './library/components/layout/admin-shell.js'
import { ADMIN_ROUTES } from './library/constants/admin-routes.js'

const storage = createStorage('app')
const db = createDb({ storage })
const auth = createAuth({ storage, users: [{ email: 'admin@example.com', name: 'Admin', role: 'owner', secret: 'change-me' }] })
const theme = createTheme({ storage, light: brand.theme.light, dark: brand.theme.dark })
const toast = createToaster()

const views = Object.fromEntries(ADMIN_ROUTES.map((r) => [r.id, () => `<h1>${r.label}</h1>`]))
const root = document.getElementById('app')
const boot = () => (auth.session() ? mountShell(root, { brand, routes: ADMIN_ROUTES, auth, theme, views, onLogout: boot }) : (root.innerHTML = '<p>Sign in view goes here</p>'))
boot()
