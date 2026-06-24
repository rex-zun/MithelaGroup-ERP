import { Bell, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Admin Dashboard',
  '/director-dashboard': 'Director Dashboard',
  '/entry-module': 'Production & Costing Entry',
  '/user-management': 'User Management',
  '/master-uploads': 'Master Details Uploads',
  '/dyes-chemical-uploads': 'Dyes/Chemical Details Uploads',
  '/department-machine': 'Department & Machine Management',
  '/production-report': 'Production Report Export',
  '/costing-report': 'Costing Report Export',
  '/report-format-fixer': 'Production & Costing Report Format Fixer',
};

export default function TopHeader() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur-lg sm:px-6 lg:left-72 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-emerald-600">Mithela Textile Industries</p>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          <label className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 sm:flex">
            <Search className="h-4 w-4" />
            <input className="w-40 bg-transparent outline-none placeholder:text-slate-400" placeholder="Search" />
          </label>
          <button className="relative rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:shadow-md">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
          </button>
        </div>
      </div>
    </header>
  );
}
