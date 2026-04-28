import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Settings, 
  LogOut,
  Zap,
  BarChart3,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Lead Pipeline', href: '/', icon: Users },
    { name: 'App Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-white text-zinc-900">
      {/* Sidebar */}
      <aside className="w-72 border-r border-zinc-100 flex flex-col bg-zinc-50/30 relative z-20">
        <div className="p-10 flex items-center gap-4">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Zap className="text-white h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight block leading-none text-zinc-900">GrowthFlow</span>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1 block">Lead Growth Hub</span>
          </div>
        </div>

        <nav className="flex-1 px-6 py-8 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all group relative",
                  isActive 
                    ? "bg-white text-indigo-600 shadow-xl shadow-indigo-100/50 border border-indigo-50" 
                    : "text-zinc-400 hover:bg-zinc-100/50 hover:text-zinc-900"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-indigo-600" : "text-zinc-300 group-hover:text-zinc-500")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-8 space-y-8">
          <div className="p-6 rounded-[24px] bg-indigo-600 text-white space-y-4 shadow-2xl shadow-indigo-200 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Activity className="h-12 w-12" />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Engine Status</span>
              </div>
            </div>
            
            <div className="space-y-1 relative z-10">
              <h4 className="text-xl font-bold tracking-tight">85% Match</h4>
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Quality Average</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-zinc-100"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-zinc-50/50">
        <main className="h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
