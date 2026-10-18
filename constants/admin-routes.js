/** Admin navigation. `perm` is the permission that shows the item; `icon` is a key into components/ui/icons.js */
export const ADMIN_ROUTES = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home', perm: 'dashboard:view', group: 'Overview' },
  { id: 'orders', label: 'Orders', icon: 'bag', perm: 'orders:view', group: 'Sales' },
  { id: 'enquiries', label: 'Enquiries', icon: 'chat', perm: 'enquiries:view', group: 'Sales' },
  { id: 'customers', label: 'Customers', icon: 'users', perm: 'customers:view', group: 'Sales' },
  { id: 'products', label: 'Bouquets', icon: 'flower', perm: 'products:view', group: 'Catalogue' },
  { id: 'items', label: 'Made to order', icon: 'yarn', perm: 'items:view', group: 'Catalogue' },
  { id: 'inventory', label: 'Inventory', icon: 'box', perm: 'inventory:view', group: 'Catalogue' },
  { id: 'promos', label: 'Promotions', icon: 'tag', perm: 'promos:view', group: 'Marketing' },
  { id: 'activity', label: 'Activity', icon: 'clock', perm: 'activity:view', group: 'System' },
  { id: 'settings', label: 'Settings', icon: 'cog', perm: 'settings:view', group: 'System' },
]
