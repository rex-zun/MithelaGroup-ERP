import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Eye,
  PlayCircle,
  StopCircle,
  Wrench,
  Factory,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchMachines, fetchMasterDetails } from '@/lib/supabaseData';
import { useEffect } from 'react';
import type { Machine, MasterDetail } from '@/types';

const dailyProductionData = [
  { machineName: 'Weaving Loom A1', targetQty: 5000, doneQty: 4850, pendingQty: 150, date: '2026-01-15' },
  { machineName: 'Weaving Loom A2', targetQty: 5000, doneQty: 3200, pendingQty: 1800, date: '2026-01-15' },
  { machineName: 'Dyeing Machine D1', targetQty: 3000, doneQty: 3000, pendingQty: 0, date: '2026-01-15' },
];

const weeklyProductionData = [
  { day: 'Monday', targetQty: 45000, doneQty: 42000, pendingQty: 3000 },
  { day: 'Tuesday', targetQty: 48000, doneQty: 46000, pendingQty: 2000 },
];

export default function DirectorDashboard() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [masterDetails, setMasterDetails] = useState<MasterDetail[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [m, md] = await Promise.all([fetchMachines(), fetchMasterDetails()]);
        setMachines(m);
        setMasterDetails(md);
        if (m.length > 0) setSelectedMachine(m[0]);
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, []);

  const runningOrder = masterDetails.find((m) => m.dispo === 'MS260779');

  if (!selectedMachine) return <div className="p-8">Loading dashboard...</div>;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <PlayCircle className="w-4 h-4" />;
      case 'stop':
        return <StopCircle className="w-4 h-4" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'stop':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'maintenance':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel - Machine List */}
        <div className="lg:col-span-4">
          <Card className="border-gray-200 shadow-sm h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Factory className="w-5 h-5 text-[#2E8B57]" />
                  Machine Status
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {machines.filter((m) => m.status === 'running').length}/{machines.length} Running
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {machines.map((machine) => (
                  <div
                    key={machine.id}
                    onClick={() => setSelectedMachine(machine)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedMachine.id === machine.id
                        ? 'border-[#2E8B57] bg-emerald-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          machine.status === 'running'
                            ? 'bg-emerald-500'
                            : machine.status === 'stop'
                            ? 'bg-red-500'
                            : 'bg-amber-500'
                        }`}
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{machine.name}</p>
                        <p className="text-xs text-gray-500">{machine.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0.5 ${getStatusColor(machine.status)}`}
                      >
                        {getStatusIcon(machine.status)}
                        <span className="ml-1">{machine.status}</span>
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMachine(machine);
                        }}
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Machine Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Machine Header Card */}
          <Card className="border-gray-200 shadow-sm bg-gradient-to-r from-[#1B4D3E] to-[#2E8B57] text-white">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-emerald-200 mb-1">Machine Name</p>
                  <h3 className="text-xl font-bold">{selectedMachine.name}</h3>
                  <p className="text-sm text-emerald-100 mt-1">{selectedMachine.department}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-emerald-200 mb-1">Status</p>
                    <Badge
                      className={`${
                        selectedMachine.status === 'running'
                          ? 'bg-emerald-400 text-emerald-900'
                          : selectedMachine.status === 'stop'
                          ? 'bg-red-400 text-red-900'
                          : 'bg-amber-400 text-amber-900'
                      } border-none font-semibold`}
                    >
                      {selectedMachine.status}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-emerald-200 mb-1">Today Production Qty</p>
                    <p className="text-lg font-bold">
                      {selectedMachine.status === 'running' ? '105,000' : '0'} <span className="text-sm font-normal">M</span>
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-emerald-200 mb-1">Capacity</p>
                    <p className="text-sm font-semibold">{selectedMachine.capacity}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Running Order Details */}
          {selectedMachine.status === 'running' && runningOrder && (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#2E8B57]" />
                  Running Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] uppercase text-gray-500 font-semibold mb-1">Dispo</p>
                    <p className="text-sm font-mono font-medium text-gray-800">{runningOrder.dispo}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] uppercase text-gray-500 font-semibold mb-1">Buyer Name</p>
                    <p className="text-sm font-medium text-gray-800">{runningOrder.buyerName}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] uppercase text-gray-500 font-semibold mb-1">Composition</p>
                    <p className="text-sm text-gray-800">{runningOrder.composition}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] uppercase text-gray-500 font-semibold mb-1">Color</p>
                    <p className="text-sm font-medium text-gray-800">{runningOrder.color}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] uppercase text-gray-500 font-semibold mb-1">PO No</p>
                    <p className="text-sm font-mono text-gray-800">{runningOrder.poNo}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] uppercase text-gray-500 font-semibold mb-1">Construction</p>
                    <p className="text-sm text-gray-800">{runningOrder.construction}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] uppercase text-gray-500 font-semibold mb-1">Wave Type</p>
                    <p className="text-sm text-gray-800">{runningOrder.waveType}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] uppercase text-gray-500 font-semibold mb-1">Order Qty</p>
                    <p className="text-sm font-medium text-gray-800">
                      {runningOrder.orderQty.toLocaleString()} {runningOrder.unit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Start Qty</p>
                    <p className="text-lg font-bold text-gray-800">0</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">End Qty</p>
                    <p className="text-lg font-bold text-gray-800">48,500</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto border-[#2E8B57] text-[#2E8B57] hover:bg-emerald-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Order Wise Machine Production Qty Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daily Production Chart */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#2E8B57]" />
                  Daily Production Qty Bar Chart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dailyProductionData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="machineName"
                      tick={{ fontSize: 10, fill: '#6B7280' }}
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="targetQty" fill="#94A3B8" radius={[4, 4, 0, 0]} name="Target Qty" />
                    <Bar dataKey="doneQty" fill="#2E8B57" radius={[4, 4, 0, 0]} name="Done Qty" />
                    <Bar dataKey="pendingQty" fill="#EF4444" radius={[4, 4, 0, 0]} name="Pending Qty" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly Production Chart */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#2E8B57]" />
                  Weekly Production Qty Bar Chart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyProductionData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="targetQty" fill="#94A3B8" radius={[4, 4, 0, 0]} name="Target Qty" />
                    <Bar dataKey="doneQty" fill="#2E8B57" radius={[4, 4, 0, 0]} name="Done Qty" />
                    <Bar dataKey="pendingQty" fill="#EF4444" radius={[4, 4, 0, 0]} name="Pending Qty" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
