import { useState } from 'react';
import {
  Factory,
  Settings,
  Plus,
  Pencil,
  Eye,
  Save,
  Search,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { fetchDepartments, fetchMachines } from '@/lib/supabaseData';
import type { Department, Machine } from '@/types';
import { useEffect } from 'react';

export default function DepartmentMachineManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);

  useEffect(() => {
    Promise.all([fetchDepartments(), fetchMachines()])
      .then(([deps, machs]) => {
        setDepartments(deps);
        setMachines(machs);
      })
      .catch(console.error);
  }, []);
  const [deptSearch, setDeptSearch] = useState('');
  const [machineSearch, setMachineSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // Department form
  const [deptForm, setDeptForm] = useState({ name: '' });
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  // Machine form
  const [machineForm, setMachineForm] = useState({ name: '', departmentId: '' });
  const [isMachineDialogOpen, setIsMachineDialogOpen] = useState(false);
  const [viewDept, setViewDept] = useState<Department | null>(null);
  const [viewMachine, setViewMachine] = useState<Machine | null>(null);

  const filteredDepartments = departments.filter((d) =>
    d.name.toLowerCase().includes(deptSearch.toLowerCase())
  );

  const filteredMachines = machines.filter(
    (m) =>
      m.name.toLowerCase().includes(machineSearch.toLowerCase()) &&
      (!selectedDept || m.department === selectedDept)
  );

  const handleCreateDepartment = () => {
    if (!deptForm.name.trim()) {
      toast.error('Error', { description: 'Department name is required' });
      return;
    }
    const newDept: Department = {
      id: Date.now().toString(),
      name: deptForm.name,
      machineCount: 0,
    };
    setDepartments([...departments, newDept]);
    setDeptForm({ name: '' });
    setIsDeptDialogOpen(false);
    toast.success('Department Created', { description: `${newDept.name} has been created` })
  };

  const handleEditDepartment = () => {
    if (!editingDept) return;
    setDepartments(departments.map((d) => (d.id === editingDept.id ? editingDept : d)));
    setEditingDept(null);
    toast.success('Department Updated', { description: 'Department details updated' });
  };

  const handleCreateMachine = () => {
    if (!machineForm.name.trim() || !machineForm.departmentId) {
      toast.error('Error', { description: 'Machine name and department are required' });
      return;
    }
    const dept = departments.find((d) => d.id === machineForm.departmentId);
    const newMachine: Machine = {
      id: Date.now().toString(),
      name: machineForm.name,
      department: dept?.name || '',
      departmentId: machineForm.departmentId,
      status: 'stop',
      capacity: 'TBD',
    };
    setMachines([...machines, newMachine]);
    setDepartments(
      departments.map((d) =>
        d.id === machineForm.departmentId ? { ...d, machineCount: (d.machineCount || 0) + 1 } : d
      )
    );
    setMachineForm({ name: '', departmentId: '' });
    setIsMachineDialogOpen(false);
    toast.success('Machine Created', { description: `${newMachine.name} has been created` })
  };

  const handleDeleteDepartment = (id: string) => {
    setDepartments(departments.filter((d) => d.id !== id));
    toast.success('Department Deleted', { description: 'Department has been removed' });
  };

  const handleDeleteMachine = (id: string) => {
    const machine = machines.find((m) => m.id === id);
    setMachines(machines.filter((m) => m.id !== id));
    if (machine) {
      setDepartments(
        departments.map((d) =>
          d.id === machine.departmentId ? { ...d, machineCount: Math.max(0, (d.machineCount || 0) - 1) } : d
        )
      );
    }
    toast.success('Machine Deleted', { description: 'Machine has been removed' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Running':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Stop':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Maintenance':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Department Management */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Factory className="w-5 h-5 text-[#2E8B57]" />
              Department Management
            </CardTitle>
            <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#1B4D3E] hover:bg-[#163D32]">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Department
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Factory className="w-5 h-5 text-[#2E8B57]" />
                    {editingDept ? 'Edit Department' : 'Create Department'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase text-gray-500">Department Name</Label>
                    <Input
                      value={editingDept ? editingDept.name : deptForm.name}
                      onChange={(e) =>
                        editingDept
                          ? setEditingDept({ ...editingDept, name: e.target.value })
                          : setDeptForm({ name: e.target.value })
                      }
                      placeholder="Enter department name"
                    />
                  </div>
                  <Button
                    className="w-full bg-[#1B4D3E] hover:bg-[#163D32]"
                    onClick={editingDept ? handleEditDepartment : handleCreateDepartment}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingDept ? 'Update Department' : 'Save Department'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search departments..."
                value={deptSearch}
                onChange={(e) => setDeptSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Department Name</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Machines</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDepartments.map((dept) => (
                  <tr key={dept.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-800">{dept.name}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {dept.machineCount} machines
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setViewDept(dept)}
                          className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingDept(dept);
                            setIsDeptDialogOpen(true);
                          }}
                          className="p-1.5 rounded-md hover:bg-amber-50 text-amber-600 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(dept.id)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Machine Management */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#2E8B57]" />
              Machine Management
            </CardTitle>
            <Dialog open={isMachineDialogOpen} onOpenChange={setIsMachineDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#1B4D3E] hover:bg-[#163D32]">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Machine
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#2E8B57]" />
                    Create Machine
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase text-gray-500">Machine Name</Label>
                    <Input
                      value={machineForm.name}
                      onChange={(e) => setMachineForm({ ...machineForm, name: e.target.value })}
                      placeholder="Enter machine name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase text-gray-500">Department</Label>
                    <Select
                      value={machineForm.departmentId}
                      onValueChange={(v) => setMachineForm({ ...machineForm, departmentId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full bg-[#1B4D3E] hover:bg-[#163D32]"
                    onClick={handleCreateMachine}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Machine
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search machines..."
                value={machineSearch}
                onChange={(e) => setMachineSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Machine Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Department</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Capacity</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMachines.map((machine) => (
                  <tr key={machine.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-800">{machine.name}</td>
                    <td className="px-4 py-3 text-gray-600">{machine.department}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={getStatusColor(machine.status)}>
                        {machine.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{machine.capacity}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setViewMachine(machine)}
                          className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMachine(machine.id)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Department Dialog */}
      {viewDept && (
        <Dialog open={!!viewDept} onOpenChange={() => setViewDept(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Factory className="w-5 h-5 text-[#2E8B57]" />
                Department Details
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Department Name</p>
                <p className="text-lg font-medium text-gray-800">{viewDept.name}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Total Machines</p>
                <p className="text-lg font-medium text-gray-800">{viewDept.machineCount}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs uppercase text-gray-500 font-semibold mb-3">Machines in this Department</p>
                <div className="space-y-2">
                  {machines
                    .filter((m) => m.departmentId === viewDept.id)
                    .map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="text-sm font-medium">{m.name}</span>
                        <Badge variant="outline" className={getStatusColor(m.status)}>
                          {m.status}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* View Machine Dialog */}
      {viewMachine && (
        <Dialog open={!!viewMachine} onOpenChange={() => setViewMachine(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#2E8B57]" />
                Machine Details
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Machine Name</p>
                  <p className="text-sm font-medium text-gray-800">{viewMachine.name}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Status</p>
                  <Badge variant="outline" className={getStatusColor(viewMachine.status)}>
                    {viewMachine.status}
                  </Badge>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Department</p>
                  <p className="text-sm font-medium text-gray-800">{viewMachine.department}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Capacity</p>
                  <p className="text-sm font-medium text-gray-800">{viewMachine.capacity}</p>
                </div>
              </div>
              {viewMachine.operator && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Current Operator</p>
                  <p className="text-sm font-medium text-gray-800">{viewMachine.operator}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
