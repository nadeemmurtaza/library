import React from 'react'

export const SettingsTeamPage: React.FC = () => {
  const members = [
    { name: 'Sarah Jenkins', email: 'sarah@company.com', role: 'Owner', avatar: 'SJ' },
    { name: 'Alex Rivera', email: 'alex@company.com', role: 'Admin', avatar: 'AR' },
    { name: 'Elena Rostov', email: 'elena@company.com', role: 'Member', avatar: 'ER' }
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Team Members</h1>
          <p className="text-sm opacity-60">Invite collaborators and manage organization permissions.</p>
        </div>
        <button className="btn btn-sm btn-primary">Invite Member</button>
      </div>
      <div className="card bg-base-100 border border-base-300 overflow-hidden">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <tr key={i}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-primary text-primary-content rounded-full w-8">
                        <span className="text-xs">{m.avatar}</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-sm">{m.name}</div>
                      <div className="text-xs opacity-50">{m.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-sm badge-outline">{m.role}</span></td>
                <td><button className="btn btn-xs btn-ghost">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
