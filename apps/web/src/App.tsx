import { useEffect, useState } from 'react';
import { LoginView } from './components/LoginView';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './dashboards/Admin';
import { StudentDashboard } from './dashboards/Student';
import { TeacherDashboard } from './dashboards/Teacher';
import { api, type User } from './lib/api';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    api
        .me()
        .then((res) => setUser(res.user))
        .catch(() => localStorage.removeItem('token'));
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  if (!user) {
    return <LoginView onSuccess={setUser} />;
  }

  return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="max-w-5xl mx-auto px-6 py-8">
          {user.role === 'STUDENT' && <StudentDashboard />}
          {user.role === 'TEACHER' && <TeacherDashboard />}
          {user.role === 'ADMIN' && <AdminDashboard />}
        </main>
      </div>
  );
}