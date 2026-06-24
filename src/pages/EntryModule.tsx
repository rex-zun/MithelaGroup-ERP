import { useState } from 'react';
import {
  Save,
  Plus,
  Search,
  Beaker,
  FileText,
  CheckCircle2,
  Clock,
  Package,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { fetchMachines, fetchDyesChemicals, fetchMasterDetails, createProductionEntry } from '@/lib/supabaseData';
import { useEffect } from 'react';
import type { Machine, MasterDetail, DyesChemical } from '@/types';

const processNames = ['Weaving', 'Dyeing', 'Finishing', 'Pretreatment'];
const shifts = ['Day', 'Night'];

export default function EntryModule() {
  const [activeTab, setActiveTab] = useState('order-details');
  const [showCosting, setShowCosting] = useState(false);
  const [costingItems, setCostingItems] = useState<any[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [masterDetails, setMasterDetails] = useState<MasterDetail[]>([]);
  const [dyesChemicals, setDyesChemicals] = useState<DyesChemical[]>([]);
  const [productionEntries] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [m, md, dc] = await Promise.all([fetchMachines(), fetchMasterDetails(), fetchDyesChemicals()]);
        setMachines(m);
        setMasterDetails(md);
        setDyesChemicals(dc);
      } catch (e) { console.error(e); }
    }
    loadData();
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    dispoNo: '',
    colour: '',
    construction: '',
    shift: '',
    batchNo: '',
    buyer: '',
    weaveType: '',
    orderQty: '',
    startWidth: '',
    endWidth: '',
    temp: '',
    productionStartQty: '',
    intensity: '',
    padderPressure: '',
    position: '',
    productionEndQty: '',
    machineName: '',
    processName: '',
    machineSpeed: '',
    starBatcher: '',
    endBatcher: '',
    prodStartDateTime: '',
    prodEndDateTime: '',
    remarks: '',
  });

  // Costing form state
  const [costingForm, setCostingForm] = useState({
    category: '' as 'Dyes' | 'Chemical' | '',
    dyeChemicalName: '',
    qty: '',
    unit: 'KG' as 'KG' | 'Gram',
  });

  const handleDispoLookup = () => {
    const found = masterDetails.find((m) => m.dispo === formData.dispoNo);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        colour: found.color,
        construction: found.construction,
        buyer: found.buyerName,
        weaveType: found.waveType,
        orderQty: found.orderQty.toString(),
      }));
      toast.success('Dispo Found', { description: `Auto-filled details for ${found.dispo}` })
    } else {
      toast.error('Dispo Not Found', { description: 'Please enter details manually' });
    }
  };

  const handleSave = async () => {
    try {
      await createProductionEntry({
        dispo_no: formData.dispoNo,
        colour: formData.colour,
        construction: formData.construction,
        buyer: formData.buyer,
        shift: formData.shift,
        batch_no: formData.batchNo,
        weave_type: formData.weaveType,
        order_qty: formData.orderQty,
        start_width: formData.startWidth,
        end_width: formData.endWidth,
        temp: formData.temp,
        production_start_qty: formData.productionStartQty,
        intensity: formData.intensity,
        padder_pressure: formData.padderPressure,
        position: formData.position,
        production_end_qty: formData.productionEndQty,
        machine_name: formData.machineName,
        process_name: formData.processName,
        machine_speed: formData.machineSpeed,
        star_batcher: formData.starBatcher,
        end_batcher: formData.endBatcher,
        prod_start_datetime: formData.prodStartDateTime,
        prod_end_datetime: formData.prodEndDateTime,
        remarks: formData.remarks,
      });
      toast.success('Entry Saved', { description: 'Production entry has been saved successfully' });
    } catch (e) {
      toast.error('Error saving entry');
    }
  };

  const handleAddCosting = () => {
    if (!costingForm.dyeChemicalName || !costingForm.qty) {
      toast.error('Error', { description: 'Please fill all costing fields' });
      return;
    }
    const dyeChem = dyesChemicals.find((d) => d.name === costingForm.dyeChemicalName);
    const newItem = {
      id: Date.now().toString(),
      productionEntryId: '1',
      dyeChemicalId: dyeChem?.id || '',
      dyeChemicalName: costingForm.dyeChemicalName,
      category: costingForm.category as 'Dyes' | 'Chemical',
      qty: parseFloat(costingForm.qty),
      unit: costingForm.unit,
      openStock: dyeChem?.stockQty || 0,
      closingStock: (dyeChem?.stockQty || 0) - parseFloat(costingForm.qty),
      rate: dyeChem?.rate || 0,
      totalCost: (dyeChem?.rate || 0) * parseFloat(costingForm.qty),
    };
    setCostingItems([...costingItems, newItem]);
    setCostingForm({ category: '', dyeChemicalName: '', qty: '', unit: 'KG' });
    toast.success('Costing Added', { description: `${newItem.dyeChemicalName} added to costing` })
  };

  const filteredDyesChemicals = costingForm.category
    ? dyesChemicals.filter(
        (d) =>
          (costingForm.category === 'Dyes' && d.type === 'D') ||
          (costingForm.category === 'Chemical' && d.type === 'C')
      )
    : dyesChemicals;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="border border-slate-200 bg-white p-1">
          <TabsTrigger value="order-details" className="rounded-xl data-[state=active]:bg-emerald-700 data-[state=active]:text-white">
            <FileText className="mr-2 h-4 w-4" />
            Order Details
          </TabsTrigger>
          <TabsTrigger value="add-costing" className="rounded-xl data-[state=active]:bg-emerald-700 data-[state=active]:text-white">
            <Beaker className="mr-2 h-4 w-4" />
            Add Costing
          </TabsTrigger>
          <TabsTrigger value="entries" className="rounded-xl data-[state=active]:bg-emerald-700 data-[state=active]:text-white">
            <Package className="mr-2 h-4 w-4" />
            Entries
          </TabsTrigger>
        </TabsList>

        <TabsContent value="order-details" className="mt-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg font-semibold">Order-wise production entry</CardTitle>
                  <p className="mt-1 text-sm text-slate-500">Capture production metrics and associated costing details.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="border-slate-200 text-slate-700" onClick={() => setShowCosting(true)}>
                    <Beaker className="mr-2 h-4 w-4" />
                    Add Costing
                  </Button>
                  <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800" onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              {/* Order Details Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Row 1 */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">Dispo No</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.dispoNo}
                      onChange={(e) => setFormData({ ...formData, dispoNo: e.target.value })}
                      placeholder="Enter Dispo No"
                      className="text-sm"
                    />
                    <Button size="sm" variant="outline" onClick={handleDispoLookup}>
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">Colour</Label>
                  <Input
                    value={formData.colour}
                    onChange={(e) => setFormData({ ...formData, colour: e.target.value })}
                    placeholder="Auto/Manual"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">Construction</Label>
                  <Input
                    value={formData.construction}
                    onChange={(e) => setFormData({ ...formData, construction: e.target.value })}
                    placeholder="Auto/Manual"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">Shift</Label>
                  <Select
                    value={formData.shift}
                    onValueChange={(v) => setFormData({ ...formData, shift: v })}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select Shift" />
                    </SelectTrigger>
                    <SelectContent>
                      {shifts.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Row 2 */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">Batch No</Label>
                  <Input
                    value={formData.batchNo}
                    onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                    placeholder="Manual"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">Buyer</Label>
                  <Input
                    value={formData.buyer}
                    onChange={(e) => setFormData({ ...formData, buyer: e.target.value })}
                    placeholder="Auto/Manual"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">Weave Type</Label>
                  <Input
                    value={formData.weaveType}
                    onChange={(e) => setFormData({ ...formData, weaveType: e.target.value })}
                    placeholder="Auto/Manual"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">Order Qty</Label>
                  <Input
                    value={formData.orderQty}
                    onChange={(e) => setFormData({ ...formData, orderQty: e.target.value })}
                    placeholder="Auto/Manual"
                    className="text-sm"
                    type="number"
                  />
                </div>

                {/* Row 3 */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">Start Width</Label>
                  <Input
                    value={formData.startWidth}
                    onChange={(e) => setFormData({ ...formData, startWidth: e.target.value })}
                    placeholder="Manual"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">Intensity</Label>
                  <Input
                    value={formData.intensity}
                    onChange={(e) => setFormData({ ...formData, intensity: e.target.value })}
                    placeholder="Manual"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">Star Batcher</Label>
                  <Input
                    value={formData.starBatcher}
                    onChange={(e) => setFormData({ ...formData, starBatcher: e.target.value })}
                    placeholder="Manual"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">Prod. Start Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.prodStartDateTime}
                    onChange={(e) => setFormData({ ...formData, prodStartDateTime: e.target.value })}
                    className="text-sm"
                  />
                </div>

                {/* Row 4 */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">End Width</Label>
                  <Input
                    value={formData.endWidth}
                    onChange={(e) => setFormData({ ...formData, endWidth: e.target.value })}
                    placeholder="Manual"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">Padder Pressure</Label>
                  <Input
                    value={formData.padderPressure}
                    onChange={(e) => setFormData({ ...formData, padderPressure: e.target.value })}
                    placeholder="Manual"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">End Batcher</Label>
                  <Input
                    value={formData.endBatcher}
                    onChange={(e) => setFormData({ ...formData, endBatcher: e.target.value })}
                    placeholder="Manual"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">Prod. End Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.prodEndDateTime}
                    onChange={(e) => setFormData({ ...formData, prodEndDateTime: e.target.value })}
                    className="text-sm"
                  />
                </div>

                {/* Row 5 */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">Temp (°C)</Label>
                  <Input
                    value={formData.temp}
                    onChange={(e) => setFormData({ ...formData, temp: e.target.value })}
                    placeholder="Manual"
                    className="text-sm"
                    type="number"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">Machine Name</Label>
                  <Select
                    value={formData.machineName}
                    onValueChange={(v) => setFormData({ ...formData, machineName: v })}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select Machine" />
                    </SelectTrigger>
                    <SelectContent>
                      {machines.map((m) => (
                        <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">Process Name</Label>
                  <Select
                    value={formData.processName}
                    onValueChange={(v) => setFormData({ ...formData, processName: v })}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select Process" />
                    </SelectTrigger>
                    <SelectContent>
                      {processNames.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">Machine Speed</Label>
                  <Input
                    value={formData.machineSpeed}
                    onChange={(e) => setFormData({ ...formData, machineSpeed: e.target.value })}
                    placeholder="Manual"
                    className="text-sm"
                  />
                </div>

                {/* Row 6 */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">Production Start QTY</Label>
                  <Input
                    value={formData.productionStartQty}
                    onChange={(e) => setFormData({ ...formData, productionStartQty: e.target.value })}
                    placeholder="Manual"
                    className="text-sm"
                    type="number"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">Position</Label>
                  <Input
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Manual"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">Production End QTY</Label>
                  <Input
                    value={formData.productionEndQty}
                    onChange={(e) => setFormData({ ...formData, productionEndQty: e.target.value })}
                    placeholder="Manual"
                    className="text-sm"
                    type="number"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-gray-500">Remarks</Label>
                  <Input
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Manual"
                    className="text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Costing Section */}
          {showCosting && (
            <Card className="mt-6 border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Beaker className="h-5 w-5 text-emerald-600" />
                  Production & Costing Entry
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase text-gray-500">Dyes/Chemical Category</Label>
                    <Select
                      value={costingForm.category}
                      onValueChange={(v: 'Dyes' | 'Chemical') =>
                        setCostingForm({ ...costingForm, category: v, dyeChemicalName: '' })
                      }
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dyes">Dyes</SelectItem>
                        <SelectItem value="Chemical">Chemical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase text-gray-500">Dyes/Chemical Name</Label>
                    <Select
                      value={costingForm.dyeChemicalName}
                      onValueChange={(v) => setCostingForm({ ...costingForm, dyeChemicalName: v })}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select or Search" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredDyesChemicals.map((d) => (
                          <SelectItem key={d.id} value={d.name}>
                            {d.name} (Stock: {d.stockQty} {d.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase text-gray-500">Qty</Label>
                    <Input
                      type="number"
                      value={costingForm.qty}
                      onChange={(e) => setCostingForm({ ...costingForm, qty: e.target.value })}
                      placeholder="Enter quantity"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase text-gray-500">Unit</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={costingForm.unit === 'KG' ? 'default' : 'outline'}
                        size="sm"
                        className={costingForm.unit === 'KG' ? 'bg-[#1B4D3E]' : ''}
                        onClick={() => setCostingForm({ ...costingForm, unit: 'KG' })}
                      >
                        KG
                      </Button>
                      <Button
                        type="button"
                        variant={costingForm.unit === 'Gram' ? 'default' : 'outline'}
                        size="sm"
                        className={costingForm.unit === 'Gram' ? 'bg-[#1B4D3E]' : ''}
                        onClick={() => setCostingForm({ ...costingForm, unit: 'Gram' })}
                      >
                        Gram
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[#2E8B57] hover:bg-[#267349]"
                        onClick={handleAddCosting}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Costing Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-gray-200 rounded-lg">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase border-b">Dyes/Chemical Name</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase border-b">Category</th>
                        <th className="text-right px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase border-b">Open Stock</th>
                        <th className="text-right px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase border-b">Qty</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase border-b">Unit</th>
                        <th className="text-right px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase border-b">Closing Stock</th>
                        <th className="text-right px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase border-b">Rate</th>
                        <th className="text-right px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase border-b">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {costingItems.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <td className="px-4 py-2.5 font-medium text-gray-800">{item.dyeChemicalName}</td>
                          <td className="px-4 py-2.5">
                            <Badge variant="outline" className="text-[10px]">
                              {item.category}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono">{item.openStock}</td>
                          <td className="px-4 py-2.5 text-right font-mono font-medium">{item.qty}</td>
                          <td className="px-4 py-2.5 text-gray-600">{item.unit}</td>
                          <td className="px-4 py-2.5 text-right font-mono">{item.closingStock.toFixed(1)}</td>
                          <td className="px-4 py-2.5 text-right font-mono">{item.rate}</td>
                          <td className="px-4 py-2.5 text-right font-mono font-medium">{item.totalCost.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    className="bg-[#1B4D3E] hover:bg-[#163D32]"
                    onClick={() => {
                      toast.success('Costing Saved', { description: 'All costing entries saved successfully' });
                    }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Costing
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="add-costing" className="mt-4">
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-8 text-center">
              <Beaker className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Costing Management</h3>
              <p className="text-sm text-gray-500 mb-4">Use the Order Details tab to add costing for production entries</p>
              <Button onClick={() => setActiveTab('order-details')} className="bg-[#1B4D3E] hover:bg-[#163D32]">
                Go to Order Details
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entries" className="mt-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Recent Entries</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Dispo No</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Colour</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Construction</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Buyer</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Status</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Created By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productionEntries.map((entry) => (
                      <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-mono font-medium text-gray-800">{entry.dispoNo}</td>
                        <td className="px-4 py-3 text-gray-700">{entry.colour}</td>
                        <td className="px-4 py-3 text-gray-600">{entry.construction}</td>
                        <td className="px-4 py-3 text-gray-700 font-medium">{entry.buyer}</td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={
                              entry.status === 'Completed'
                                ? 'bg-blue-100 text-blue-700 border-blue-200'
                                : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            }
                          >
                            {entry.status === 'Completed' ? (
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                            ) : (
                              <Clock className="w-3 h-3 mr-1" />
                            )}
                            {entry.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{entry.createdBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
