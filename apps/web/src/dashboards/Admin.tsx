import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { api, type User } from '../lib/api';

export function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [roleFilter, setRoleFilter] = useState<'ALL' | 'STUDENT' | 'TEACHER' | 'ADMIN'>('ALL');

    useEffect(() => {
        api.getUsers().then((res) => setUsers(res.users)).catch(() => {});
    }, []);

    async function toggleStatus(user: User) {
        const nextActive = !(user.isActive ?? true);
        const res = await api.updateUserStatus(user.id, nextActive);
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: res.user.isActive } : u)));
    }

    const filtered = roleFilter === 'ALL' ? users : users.filter((u) => u.role === roleFilter);

    return (
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-base font-semibold flex items-center gap-2">
                        <Users className="w-4 h-4 text-zinc-400" />
                        User Directory & Account Access
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                        Manage platform accounts, roles, and active status.
                    </p>
                </div>

                <div className="flex gap-1.5">
                    {(['ALL', 'STUDENT', 'TEACHER', 'ADMIN'] as const).map((r) => (
                        <button
                            key={r}
                            type="button"
                            onClick={() => setRoleFilter(r)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                                roleFilter === r
                                    ? 'bg-zinc-100 text-zinc-950'
                                    : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                            }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="border-b border-zinc-800 text-[11px] uppercase text-zinc-400">
                        <th className="py-2.5 pr-4 font-medium">Full Name</th>
                        <th className="py-2.5 px-4 font-medium">Email</th>
                        <th className="py-2.5 px-4 font-medium">Role</th>
                        <th className="py-2.5 px-4 font-medium">Status</th>
                        <th className="py-2.5 pl-4 font-medium text-right">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/80 text-sm">
                    {filtered.map((u) => {
                        const active = u.isActive ?? true;
                        return (
                            <tr key={u.id}>
                                <td className="py-3 pr-4 font-medium text-zinc-100">{u.fullName}</td>
                                <td className="py-3 px-4 text-zinc-400 text-xs">{u.email}</td>
                                <td className="py-3 px-4">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {u.role}
                    </span>
                                </td>
                                <td className="py-3 px-4">
                    <span
                        className={`text-xs font-medium ${
                            active ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                    >
                      {active ? 'Active' : 'Suspended'}
                    </span>
                                </td>
                                <td className="py-3 pl-4 text-right">
                                    <button
                                        type="button"
                                        onClick={() => toggleStatus(u)}
                                        className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded text-xs text-zinc-300 cursor-pointer"
                                    >
                                        {active ? 'Deactivate' : 'Activate'}
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}