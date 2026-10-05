import React, { useState } from 'react';
import { Search, Shield, User, PenTool, Check } from 'lucide-react';
import { Profile, UserRole } from '../../types/database';
import { ConfirmModal } from '../ui/ConfirmModal';

interface AdminUsersTableProps {
  users: Profile[];
  currentUserId?: string;
  onUpdateRole: (userId: string, newRole: UserRole) => Promise<void>;
}

export const AdminUsersTable: React.FC<AdminUsersTableProps> = ({
  users,
  currentUserId,
  onUpdateRole,
}) => {
  const [search, setSearch] = useState('');
  const [pendingChange, setPendingChange] = useState<{ userId: string; role: UserRole; name: string } | null>(null);

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.display_name.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const handleRoleSelect = (user: Profile, newRole: UserRole) => {
    if (user.role === newRole) return;
    setPendingChange({
      userId: user.id,
      role: newRole,
      name: user.display_name,
    });
  };

  const confirmRoleChange = async () => {
    if (!pendingChange) return;
    await onUpdateRole(pendingChange.userId, pendingChange.role);
    setPendingChange(null);
  };

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by name, email, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400"
          />
        </div>
        <span className="text-xs text-neutral-500 font-mono tabular-nums">
          {filteredUsers.length} total members
        </span>
      </div>

      {/* Table */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900/60 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/90 text-neutral-500 font-mono">
                <th className="py-3 px-4 font-medium uppercase tracking-wider">User Identity</th>
                <th className="py-3 px-4 font-medium uppercase tracking-wider">Email Address</th>
                <th className="py-3 px-4 font-medium uppercase tracking-wider">Current Role</th>
                <th className="py-3 px-4 font-medium uppercase tracking-wider">Registered</th>
                <th className="py-3 px-4 font-medium uppercase tracking-wider text-right">Assign Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {filteredUsers.map((u) => {
                const isCurrent = u.id === currentUserId;
                const formattedDate = new Date(u.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <tr key={u.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {u.avatar_url ? (
                          <img
                            src={u.avatar_url}
                            alt={u.display_name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-800 text-xs font-semibold flex items-center justify-center">
                            {u.display_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {u.display_name}
                            {isCurrent && (
                              <span className="ml-1.5 text-[10px] text-neutral-400 font-normal font-mono">
                                (you)
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-neutral-400 font-mono truncate max-w-[140px]">
                            {u.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-neutral-600 dark:text-neutral-400">
                      {u.email || '—'}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono capitalize ${
                          u.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                            : u.role === 'writer'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono tabular-nums text-neutral-500 whitespace-nowrap">
                      {formattedDate}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleSelect(u, e.target.value as UserRole)}
                        className="text-xs px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-hidden cursor-pointer"
                      >
                        <option value="reader">Reader</option>
                        <option value="writer">Writer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(pendingChange)}
        title="Change User Role"
        message={`Are you sure you want to change the authorization role for ${pendingChange?.name} to "${pendingChange?.role}"? This alters their permissions for publishing articles and accessing administrative consoles.`}
        confirmLabel="Confirm Role Change"
        onConfirm={confirmRoleChange}
        onCancel={() => setPendingChange(null)}
      />
    </div>
  );
};
