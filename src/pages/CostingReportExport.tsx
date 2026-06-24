import { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Search,
  Download,
  Filter,
  Check,
  X,
  Calendar,
  Factory,
  Building2,
  FlaskConical,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { fetchMachines, fetchDepartments, fetchMasterDetails, fetchDyesChemicals } from '@/lib/supabaseData';
import type { Machine, Department, MasterDetail, DyesChemical } from '@/types';
import { useEffect } from 'react';

const buyers = ['Buyer A', 'Buyer B'];
const compositions = ['100% Cotton', 'Poly Cotton'];
const constructions = ['Twill', 'Plain'];

export default function CostingReportExport() {
  const [exportType, setExportType] = useState<'excel' | 'pdf'>('excel');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedMachine, setSelectedMachine] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDyeChemical, setSelectedDyeChemical] = useState('');

  const [machines, setMachines] = useState<Machine[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [masterDetails, setMasterDetails] = useState<MasterDetail[]>([]);
  const [dyesChemicals, setDyesChemicals] = useState<DyesChemical[]>([]);

  useEffect(() => {
    Promise.all([fetchMachines(), fetchDepartments(), fetchMasterDetails(), fetchDyesChemicals()]).then(([m, d, md, dc]) => {
      setMachines(m);
      setDepartments(d);
      setMasterDetails(md);
      setDyesChemicals(dc);
    }).catch(console.error);
  }, []);

  const [advancedSearch, setAdvancedSearch] = useState({
    dispo: '',
    poNo: '',
    buyer: '',
    construction: '',
    composition: '',
  });

  const [pickField, setPickField] = useState<string | null>(null);
  const [pickedItems, setPickedItems] = useState<Record<string, string[]>>({});

  const getPickList = (field: string): string[] => {
    switch (field) {
      case 'dispo':
        return masterDetails.map((m) => m.dispo);
      case 'poNo':
        return [...new Set(masterDetails.map((m) => m.poNo))];
      case 'buyer':
        return buyers;
      case 'construction':
        return constructions;
      case 'composition':
        return compositions;
      default:
        return [];
    }
  };

  const togglePickItem = (field: string, item: string) => {
    const current = pickedItems[field] || [];
    if (current.includes(item)) {
      setPickedItems({ ...pickedItems, [field]: current.filter((i) => i !== item) });
    } else {
      setPickedItems({ ...pickedItems, [field]: [...current, item] });
    }
  };

  const applyPickedItems = (field: string) => {
    const items = pickedItems[field] || [];
    setAdvancedSearch({ ...advancedSearch, [field]: items.join(', ') });
    setPickField(null);
  };

  const handleSearch = () => {
    toast.success('Search Applied', { description: 'Filters have been applied to the costing report' });
  };

  const handleExport = () => {
    toast.success(`${exportType === 'excel' ? 'Excel' : 'PDF'} Export`, {
      description: `Costing report is being exported as ${exportType.toUpperCase()}`,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#2E8B57]" />
            Costing Report Export
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Export Type Toggle */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={exportType === 'excel' ? 'default' : 'outline'}
              className={exportType === 'excel' ? 'bg-[#1B4D3E]' : ''}
              onClick={() => setExportType('excel')}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel Export
            </Button>
            <Button
              variant={exportType === 'pdf' ? 'default' : 'outline'}
              className={exportType === 'pdf' ? 'bg-[#1B4D3E]' : ''}
              onClick={() => setExportType('pdf')}
            >
              <FileText className="w-4 h-4 mr-2" />
              PDF Export
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Filters */}
            <div className="lg:col-span-2 space-y-5">
              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Date Range: From
                  </Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    To
                  </Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>

              {/* Machine, Department, Dyes/Chemical */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500 flex items-center gap-1.5">
                    <Factory className="w-3.5 h-3.5" />
                    Machine
                  </Label>
                  <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Machines</SelectItem>
                      {machines.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    Department
                  </Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Departments</SelectItem>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500 flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5" />
                    Dyes/Chemical
                  </Label>
                  <Select value={selectedDyeChemical} onValueChange={setSelectedDyeChemical}>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      {dyesChemicals.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Search */}
              <Card className="border-gray-200 bg-gray-50/50">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#2E8B57]" />
                    Advance Search
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {[
                    { key: 'dispo', label: 'DISPO', placeholder: 'Dispo No' },
                    { key: 'poNo', label: 'PO NO', placeholder: 'PO No' },
                    { key: 'buyer', label: 'BUYER', placeholder: 'Buyer Name' },
                    { key: 'construction', label: 'CONSTRUCTION', placeholder: 'Construction Name' },
                    { key: 'composition', label: 'COMPOSITION', placeholder: 'Composition Name' },
                  ].map((field) => (
                    <div key={field.key} className="flex items-center gap-3">
                      <Label className="text-xs font-semibold uppercase text-gray-600 w-28 shrink-0">
                        {field.label}
                      </Label>
                      <Input
                        value={advancedSearch[field.key as keyof typeof advancedSearch]}
                        onChange={(e) =>
                          setAdvancedSearch({ ...advancedSearch, [field.key]: e.target.value })
                        }
                        placeholder={field.placeholder}
                        className="flex-1 h-9 text-sm"
                      />
                      <Dialog open={pickField === field.key} onOpenChange={(open) => !open && setPickField(null)}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-3"
                            onClick={() => setPickField(field.key)}
                          >
                            Pick
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md max-h-[500px] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Select {field.label}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-2 pt-4">
                            {getPickList(field.key).map((item) => (
                              <div
                                key={item}
                                className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                                onClick={() => togglePickItem(field.key, item)}
                              >
                                <Checkbox
                                  checked={(pickedItems[field.key] || []).includes(item)}
                                />
                                <span className="text-sm">{item}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" size="sm" onClick={() => setPickField(null)}>
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="bg-[#1B4D3E] hover:bg-[#163D32]"
                              onClick={() => applyPickedItems(field.key)}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Done
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                  <Button
                    className="w-full bg-gray-700 hover:bg-gray-800"
                    onClick={handleSearch}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Export */}
            <div className="flex flex-col items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-[#1B4D3E]/10 flex items-center justify-center mx-auto">
                  {exportType === 'excel' ? (
                    <FileSpreadsheet className="w-10 h-10 text-[#1B4D3E]" />
                  ) : (
                    <FileText className="w-10 h-10 text-[#1B4D3E]" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Export as {exportType === 'excel' ? 'Excel' : 'PDF'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Costing report with all filters
                  </p>
                </div>
                <Button
                  className="bg-[#1B4D3E] hover:bg-[#163D32] px-8"
                  onClick={handleExport}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
