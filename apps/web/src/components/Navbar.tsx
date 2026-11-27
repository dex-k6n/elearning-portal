import { GraduationCap, LogOut } from 'lucide-react';
import type { User } from '../lib/api';

interface NavbarProps {
    user: User;
    onLogout: () => void;
}

export function Navbar({ user, onLogout }: NavbarProps) {
    return (
        <header className="border-b border-zinc-800 bg-zinc-900/70 backdrop-blur sticky top-0 z-10">
            <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-zinc-200" />
                    <span className="font-semibold text-sm tracking-tight">Adaptive Learning Portal</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-medium">
            {user.role}
          </span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-xs font-medium text-zinc-100">{user.fullName}</div>
                        <div className="text-[11px] text-zinc-400">{user.email}</div>
                    </div>
                    <button
                        type="button"
                        onClick={onLogout}
                        className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                        title="Sign out"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </header>
    );
}