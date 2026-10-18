// Delete with a confirmation, a toast and an audit-log entry.
const ok = await confirm({ title: `Delete ${row.name}?`, body: 'This cannot be undone.', action: 'Delete', tone: 'error' })
if (ok) { collection.remove(row.id); activity.log(auth.session().email, 'deleted', row.name); toast.show(`${row.name} deleted`) }
