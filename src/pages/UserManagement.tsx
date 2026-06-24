import { useState } from 'react';
import {
  Plus,
  Trash2,
  Pencil,
  Save,
  Users,
  Search,
  Shield,
  UserCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import type { User, Department } from '@/types';
import { fetchDepartments } from '@/lib/supabaseData';
import { useEffect } from 'react';

const roles = ['admin', 'director', 'operator'];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    fetchDepartments().then(setDepartments).catch(console.error);
  }, []);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    department: '',
    username: '',
    password: '',
    role: 'operator' as User['role'],
  });

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    }
  };

  const handleAddUser = () => {
    if (!formData.name || !formData.username || !formData.password || !formData.role) {
      toast.error('Error', { description: 'Please fill all required fields' });
      return;
    }
    const newUser: User = {
      id: Date.now().toString(),
      name: formData.name,
      department: formData.department || 'General',
      username: formData.username,
      email: `${formData.username}@mithela.local`,
      role: formData.role,
      createdBy: 'MD Sakib Hossain',
    };
    setUsers([...users, newUser]);
    setFormData({ name: '', department: '', username: '', password: '', role: 'operator' });
    setIsAddOpen(false);
    toast.success('User Added', { description: `${newUser.name} has been added successfully` })
  };

  const handleEditUser = () => {
    if (!editingUser) return;
    setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)));
    setIsEditOpen(false);
    setEditingUser(null);
    toast.success('User Updated', { description: 'User details have been updated' });
  };

  const handleDeleteUsers = () => {
    if (selectedUsers.length === 0) {
      toast.error('Error', { description: 'Please select users to delete' });
      return;
    }
    setUsers(users.filter((u) => !selectedUsers.includes(u.id)));
    setSelectedUsers([]);
    toast.success('Users Deleted', { description: `${selectedUsers.length} user(s) have been deleted` })
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Director':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Supervisor':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Operator':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          {selectedUsers.length > 0 && (
            <Badge variant="outline" className="bg-blue-50">
              {selectedUsers.length} selected
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1B4D3E] hover:bg-[#163D32]">
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-[#2E8B57]" />
                  Add New User
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(v) => setFormData({ ...formData, department: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">User Name</Label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter username"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">Password</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(v) => setFormData({ ...formData, role: v as User['role'] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full bg-[#1B4D3E] hover:bg-[#163D32]"
                  onClick={handleAddUser}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save User
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
            onClick={handleDeleteUsers}
            disabled={selectedUsers.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete User
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-[#2E8B57]" />
            System Users
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 w-10">
                    <Checkbox
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Department</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">User Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Created By</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1B4D3E] flex items-center justify-center text-white text-xs font-bold">
                          {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="font-medium text-gray-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.department}</td>
                    <td className="px-4 py-3 font-mono text-gray-700">{user.username}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-[10px] ${getRoleBadgeColor(user.role)}`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.createdBy}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <Dialog open={isEditOpen && editingUser?.id === user.id} onOpenChange={(open) => {
                          setIsEditOpen(open);
                          if (!open) setEditingUser(null);
                        }}>
                          <DialogTrigger asChild>
                            <button
                              className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 transition-colors"
                              onClick={() => {
                                setEditingUser(user);
                                setIsEditOpen(true);
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Pencil className="w-5 h-5 text-[#2E8B57]" />
                                Edit User
                              </DialogTitle>
                            </DialogHeader>
                            {editingUser && (
                              <div className="space-y-4 pt-4">
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold uppercase text-gray-500">Name</Label>
                                  <Input
                                    value={editingUser.name}
                                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold uppercase text-gray-500">Department</Label>
                                  <Select
                                    value={editingUser.department}
                                    onValueChange={(v) => setEditingUser({ ...editingUser, department: v })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {departments.map((d) => (
                                        <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold uppercase text-gray-500">User Name</Label>
                                  <Input
                                    value={editingUser.username}
                                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold uppercase text-gray-500">Role</Label>
                                  <Select
                                    value={editingUser.role}
                                    onValueChange={(v) => setEditingUser({ ...editingUser, role: v as User['role'] })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {roles.map((r) => (
                                        <SelectItem key={r} value={r}>{r}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button
                                  className="w-full bg-[#1B4D3E] hover:bg-[#163D32]"
                                  onClick={handleEditUser}
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  Update User
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
