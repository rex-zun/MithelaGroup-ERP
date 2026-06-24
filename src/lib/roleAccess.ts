export type AppRole = 'admin' | 'director' | 'operator';

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrator',
  director: 'Director',
  operator: 'Operator',
};

export const ROLE_HOME: Record<AppRole, string> = {
  admin: '/dashboard',
  director: '/director-dashboard',
  operator: '/entry-module',
};

export const ROUTE_ACCESS: Record<string, AppRole[]> = {
  '/dashboard': ['admin'],
  '/director-dashboard': ['director', 'admin'],
  '/entry-module': ['operator', 'admin'],
  '/user-management': ['admin'],
  '/master-uploads': ['admin'],
  '/dyes-chemical-uploads': ['admin'],
  '/department-machine': ['admin'],
  '/production-report': ['admin', 'director', 'operator'],
  '/costing-report': ['admin', 'director', 'operator'],
  '/report-format-fixer': ['admin', 'director', 'operator'],
};

export function canAccessRoute(role: AppRole | null, pathname: string) {
  if (!role) return false;
  const allowed = ROUTE_ACCESS[pathname];
  return !allowed || allowed.includes(role);
}
