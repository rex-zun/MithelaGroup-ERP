import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileInput,
  Database,
  BarChart3,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ROLE_LABELS, type AppRole } from '@/lib/roleAccess';

interface MenuItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  roles?: AppRole[];
  children?: { label: string; path: string; roles?: AppRole[] }[];
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['admin'] },
  { label: 'Director Dashboard', icon: BarChart3, path: '/director-dashboard', roles: ['director', 'admin'] },
  { label: 'Entry Module', icon: FileInput, path: '/entry-module', roles: ['operator', 'admin'] },
  {
    label: 'Master Data',
    icon: Database,
    roles: ['admin'],
    children: [
      { label: 'Master Details Uploads', path: '/master-uploads', roles: ['admin'] },
      { label: 'Dyes/Chemical Uploads', path: '/dyes-chemical-uploads', roles: ['admin'] },
    ],
  },
  {
    label: 'Reports',
    icon: BarChart3,
    roles: ['admin', 'director', 'operator'],
    children: [
      { label: 'Production Report Export', path: '/production-report', roles: ['admin', 'director', 'operator'] },
      { label: 'Costing Report Export', path: '/costing-report', roles: ['admin', 'director', 'operator'] },
      { label: 'Report Format Fixer', path: '/report-format-fixer', roles: ['admin', 'director', 'operator'] },
    ],
  },
  { label: 'User Management', icon: Users, path: '/user-management', roles: ['admin'] },
  { label: 'Department & Machine', icon: Settings, path: '/department-machine', roles: ['admin'] },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Reports']);

  const visibleItems = useMemo(() => {
    return menuItems.filter((item) => {
      const roleMatches = !item.roles || item.roles.includes(user?.role as AppRole);
      if (!roleMatches) return false;
      if (!item.children) return true;
      return item.children.some((child) => !child.roles || child.roles.includes(user?.role as AppRole));
    });
  }, [user?.role]);

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-72 flex-col border-r border-slate-200 bg-slate-950 text-slate-100 shadow-2xl lg:flex">
      <div className="border-b border-white/10 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-400/30">
            <img src="/mithela-logo.svg" alt="Mithela Group logo" className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Mithela ERP</h1>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Production Suite</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {visibleItems.map((item) => (
          <div key={item.label}>
            {item.children ? (
              <div>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`mb-1 flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition ${
                    item.children.some((child) => isActive(child.path))
                      ? 'bg-white/10 text-white'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4.5 w-4.5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {expandedMenus.includes(item.label) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                {expandedMenus.includes(item.label) ? (
                  <div className="mb-2 ml-6 space-y-1">
                    {item.children
                      .filter((child) => !child.roles || child.roles.includes(user?.role as AppRole))
                      .map((child) => (
                        <button
                          key={child.path}
                          onClick={() => navigate(child.path)}
                          className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                            isActive(child.path)
                              ? 'bg-emerald-500/20 text-emerald-200'
                              : 'text-slate-400 hover:bg-white/10 hover:text-slate-100'
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                          {child.label}
                        </button>
                      ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <button
                onClick={() => item.path && navigate(item.path)}
                className={`mb-1 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${
                  isActive(item.path || '')
                    ? 'bg-emerald-500/20 text-emerald-200'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </button>
            )}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-semibold text-emerald-200">
              {user?.name?.charAt(0) ?? 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user?.name ?? 'User'}</p>
              <p className="text-xs text-emerald-100/80">{user?.role ? ROLE_LABELS[user.role] : 'Signed in'}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-200">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            RBAC enabled
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-900"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
