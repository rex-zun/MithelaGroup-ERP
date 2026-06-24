import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  FileUp,
  Beaker,
  UserCog,
  Factory,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
  UserCheck,
  FileSpreadsheet,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const adminNavItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Entry Module', path: '/admin/entry', icon: ClipboardList },
  { label: 'Master Uploads', path: '/admin/master-uploads', icon: FileUp },
  { label: 'Dyes/Chemical Uploads', path: '/admin/dyes-uploads', icon: Beaker },
  { label: 'User Management', path: '/admin/users', icon: UserCog },
  { label: 'Department & Machine', path: '/admin/departments', icon: Factory },
];

const directorNavItems = [
  { label: 'Director Dashboard', path: '/director', icon: BarChart3 },
  { label: 'Production Report', path: '/director/production-report', icon: FileSpreadsheet },
  { label: 'Costing Report', path: '/director/costing-report', icon: FileSpreadsheet },
  { label: 'Format Fixer', path: '/director/format-fixer', icon: Settings },
];

const operatorNavItems = [
  { label: 'Entry Module', path: '/operator/entry', icon: ClipboardList },
];

function getNavItems(role: string) {
  switch (role) {
    case 'admin':
      return adminNavItems;
    case 'director':
      return directorNavItems;
    default:
      return operatorNavItems;
  }
}

function Sidebar({ role, mobileOpen, onClose }: { role: string; mobileOpen: boolean; onClose: () => void }) {
  const location = useLocation();
  const navItems = getNavItems(role);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Factory className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 leading-tight">MithelaGroup</h1>
              <p className="text-[10px] text-slate-500 leading-tight">Production Management</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden ml-auto text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`w-4.5 h-4.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-emerald-500" />}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          <p className="text-[10px] text-center text-slate-400">Powered by MithelaGroup</p>
        </div>
      </aside>
    </>
  );
}

function TopBar({ onMenuClick, title }: { onMenuClick: () => void; title: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-6 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="lg:hidden mr-3 p-2 rounded-lg hover:bg-slate-100 text-slate-600"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-slate-800 hidden sm:block">{title}</h2>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
          {user?.role === 'admin' && <Shield className="w-3.5 h-3.5 text-emerald-600" />}
          {user?.role === 'director' && <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
          {user?.role === 'operator' && <Wrench className="w-3.5 h-3.5 text-orange-600" />}
          <span className="text-xs font-medium text-slate-600 capitalize">{user?.role}</span>
        </div>

        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-xs">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-800 leading-tight">{user?.name}</p>
            <p className="text-[11px] text-slate-500 leading-tight">{user?.department}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-slate-500 hover:text-red-600 hover:bg-red-50 ml-1"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}

function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    '/admin': 'Admin Dashboard',
    '/admin/entry': 'Entry Module',
    '/admin/master-uploads': 'Master Details Uploads',
    '/admin/dyes-uploads': 'Dyes/Chemical Uploads',
    '/admin/users': 'User Management',
    '/admin/departments': 'Department & Machine Management',
    '/director': 'Director Dashboard',
    '/director/production-report': 'Production Report Export',
    '/director/costing-report': 'Costing Report Export',
    '/director/format-fixer': 'Production & Costing Format Fixer',
    '/operator/entry': 'Entry Module',
  };
  return titles[pathname] || 'Dashboard';
}

export default function Layout() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        role={user?.role || 'operator'}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="lg:ml-64 min-h-screen flex flex-col">
        <TopBar
          onMenuClick={() => setMobileOpen(true)}
          title={getPageTitle(location.pathname)}
        />

        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
