import { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { api, type User } from '../lib/api';

const DEMO_ACCOUNTS = [
    { label: 'Student', email: 'student@portal.edu', password: 'Student123!', role: 'STUDENT' },
    { label: 'Teacher', email: 'teacher@portal.edu', password: 'Teacher123!', role: 'TEACHER' },
    { label: 'Admin', email: 'admin@portal.edu', password: 'Admin123!', role: 'ADMIN' },
];

interface LoginViewProps {
    onSuccess: (user: User) => void;
}

export function LoginView({ onSuccess }: LoginViewProps) {
    const [email, setEmail] = useState('student@portal.edu');
    const [password, setPassword] = useState('Student123!');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function submitCredentials(targetEmail: string, targetPassword: string) {
        setError('');
        setLoading(true);
        try {
            const res = await api.login(targetEmail, targetPassword);
            localStorage.setItem('token', res.token);
            onSuccess(res.user);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        submitCredentials(email, password);
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight">Adaptive Learning Portal</h1>
                        <p className="text-xs text-zinc-400">Coursework, Practice & Mastery Tracking</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-zinc-600"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-zinc-600"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900 rounded-lg px-3 py-2">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-50 rounded-lg font-medium text-sm transition cursor-pointer"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 pt-5 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-2.5">Switch demo role:</p>
                    <div className="grid grid-cols-3 gap-2">
                        {DEMO_ACCOUNTS.map((acc) => (
                            <button
                                key={acc.role}
                                type="button"
                                onClick={() => {
                                    setEmail(acc.email);
                                    setPassword(acc.password);
                                    submitCredentials(acc.email, acc.password);
                                }}
                                className="px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 transition cursor-pointer"
                            >
                                {acc.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}