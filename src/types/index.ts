export interface User {
  id: string;
  name: string;
  department: string;
  username: string;
  email?: string;
  role: 'admin' | 'director' | 'operator';
  createdBy: string;
}

export interface Department {
  id: string;
  name: string;
  machineCount?: number;
  createdAt?: string;
}

export interface Machine {
  id: string;
  name: string;
  department: string;
  departmentId: string;
  departmentName?: string;
  status: 'running' | 'stop' | 'maintenance';
  capacity?: string;
  operator?: string;
  createdAt?: string;
}

export interface EntryRecord {
  id: string;
  mpCode: string;
  startTime: string;
  endTime: string;
  machine: string;
  machineId: string;
  startBy: string;
  status: 'done' | 'running' | 'pending';
  department: string;
  createdAt: string;
}

export interface MasterDetail {
  id: string;
  dispo: string;
  poNo: string;
  buyerName: string;
  construction: string;
  composition: string;
  waveType: string;
  color: string;
  orderQty: number;
  unit: string;
}

export interface DyesChemical {
  id: string;
  name: string;
  type: 'D' | 'C';
  rate: number;
  department: string;
  departmentId?: string;
  unit?: string;
  stockQty?: number;
}

export interface OrderEntry {
  id: string;
  dispoNo: string;
  colour: string;
  construction: string;
  shift: string;
  batchNo: string;
  buyer: string;
  weaveType: string;
  orderQty: number;
  startWidth: string;
  intensity: string;
  starBatcher: string;
  endWidth: string;
  padderPressure: string;
  endBatcher: string;
  temp: string;
  machineName: string;
  processName: string;
  machineSpeed: string;
  productionStartQty: string;
  position: string;
  productionEndQty: string;
  remarks: string;
  prodStartDateTime: string;
  prodEndDateTime: string;
  status: 'draft' | 'submitted' | 'approved';
  createdBy: string;
  costingItems: CostingItem[];
}

export interface CostingItem {
  id: string;
  category: 'dyes' | 'chemical';
  name: string;
  openStock: number;
  qty: number;
  unit: 'kg' | 'gram';
  closingStock: number;
}

export interface MachineData {
  id: string;
  name: string;
  status: 'running' | 'stop';
  todayProductionQty: number;
  runningOrder?: {
    dispo: string;
    poNo: string;
    buyerName: string;
    composition: string;
    color: string;
    construction: string;
    waveType: string;
    orderQty: number;
    startQty: number;
    endQty: number;
  };
  dailyProduction: { day: string; target: number; done: number; pending: number }[];
  weeklyProduction: { week: string; target: number; done: number; pending: number }[];
}

export interface SearchFilters {
  dateFrom: string;
  dateTo: string;
  machine: string;
  department: string;
  dyesChemical: string;
  dispo: string;
  poNo: string;
  buyer: string;
  construction: string;
  composition: string;
}
