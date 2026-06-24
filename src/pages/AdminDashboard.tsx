import { useNavigate } from 'react-router-dom';
import {
  PenLine,
  Users,
  Settings,
  Database,
  FlaskConical,
  BarChart3,
  FileSpreadsheet,
  FileText,
  Wrench,
  ArrowRight,
  Activity,
  CircleCheckBig,
  Clock3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
const entryStatuses: any[] = [];

const quickActions = [
  { label: 'Entry Module', icon: PenLine, path: '/entry-module', desc: 'Production & costing entry', color: 'from-emerald-500/10 to-emerald-500/5 text-emerald-700' },
  { label: 'User Settings', icon: Users, path: '/user-management', desc: 'Manage system users', color: 'from-sky-500/10 to-sky-500/5 text-sky-700' },
  { label: 'Machines', icon: Settings, path: '/department-machine', desc: 'Configure departments', color: 'from-amber-500/10 to-amber-500/5 text-amber-700' },
];

const secondaryActions = [
  { label: 'Master Details Uploads', icon: Database, path: '/master-uploads' },
  { label: 'Dyes/Chemical Uploads', icon: FlaskConical, path: '/dyes-chemical-uploads' },
  { label: 'Director Dashboard', icon: BarChart3, path: '/director-dashboard' },
  { label: 'Production Report Export', icon: FileSpreadsheet, path: '/production-report' },
  { label: 'Costing Report Export', icon: FileText, path: '/costing-report' },
  { label: 'Report Format Fixer', icon: Wrench, path: '/report-format-fixer' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {quickActions.map((action) => (
          <Card
            key={action.label}
            className={`cursor-pointer border-0 bg-gradient-to-br ${action.color} shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
            onClick={() => navigate(action.path)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{action.label}</p>
                  <p className="mt-1 text-sm text-slate-600">{action.desc}</p>
                </div>
                <div className="rounded-2xl bg-white/70 p-2.5">
                  <action.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {secondaryActions.map((action) => (
          <Button key={action.label} variant="outline" className="border-slate-200 bg-white text-sm text-slate-700 hover:border-emerald-500 hover:text-emerald-700" onClick={() => navigate(action.path)}>
            <action.icon className="mr-2 h-4 w-4" />
            {action.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-semibold">Live Entry Status</CardTitle>
                <p className="mt-1 text-sm text-slate-500">Factory activity across departments</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Running</div>
                <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> Done</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                    <th className="px-3 py-3">MP No</th>
                    <th className="px-3 py-3">Start</th>
                    <th className="px-3 py-3">End</th>
                    <th className="px-3 py-3">Machine</th>
                    <th className="px-3 py-3">By</th>
                    <th className="px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {entryStatuses.map((entry) => (
                    <tr key={entry.id} className="border-b border-slate-100 text-slate-600">
                      <td className="px-3 py-3 font-medium text-slate-800">{entry.mpNo}</td>
                      <td className="px-3 py-3"><div className="flex items-center gap-2"><Clock3 className="h-3.5 w-3.5 text-slate-400" />{entry.startTime}</div></td>
                      <td className="px-3 py-3">{entry.endTime ? <div className="flex items-center gap-2"><Clock3 className="h-3.5 w-3.5 text-slate-400" />{entry.endTime}</div> : <span className="text-slate-400">--</span>}</td>
                      <td className="px-3 py-3">{entry.machine}</td>
                      <td className="px-3 py-3">{entry.startBy}</td>
                      <td className="px-3 py-3"><Badge className={entry.status === 'Done' ? 'border-sky-200 bg-sky-50 text-sky-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'} variant="outline">{entry.status === 'Done' ? <CircleCheckBig className="mr-1 h-3 w-3" /> : <Activity className="mr-1 h-3 w-3" />}{entry.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Operations Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Production progress</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">87%</p>
              <p className="mt-1 text-sm text-emerald-600">+6% from yesterday</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">Pending approvals</p>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">4</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                <span>Reports waiting review</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
