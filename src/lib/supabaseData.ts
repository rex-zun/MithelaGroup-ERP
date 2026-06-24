import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Department, Machine, MasterDetail, DyesChemical } from '@/types';

export interface ProductionEntryPayload {
  dispo_no: string;
  colour: string;
  construction: string;
  buyer: string;
  shift: string;
  batch_no: string;
  weave_type: string;
  order_qty: number | string;
  start_width: string;
  end_width: string;
  temp: string;
  production_start_qty: number | string;
  intensity: string;
  padder_pressure: string;
  position: string;
  production_end_qty: number | string;
  machine_name: string;
  process_name: string;
  machine_speed: string;
  star_batcher: string;
  end_batcher: string;
  prod_start_datetime: string;
  prod_end_datetime: string;
  remarks: string;
  status?: string;
  created_by?: string;
}

function getClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured');
  }
  return supabase;
}

function toDepartment(row: any): Department {
  return {
    id: row.id,
    name: row.name,
    machineCount: row.machine_count ?? 0,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

function toMachine(row: any): Machine {
  return {
    id: row.id,
    name: row.name,
    department: row.department_name ?? row.department ?? '',
    departmentId: row.department_id,
    departmentName: row.department_name ?? row.department ?? '',
    status: row.status?.toLowerCase() ?? 'running',
    capacity: row.capacity ?? '',
    operator: row.operator ?? '',
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

export async function fetchDepartments(): Promise<Department[]> {
  const client = getClient();
  const { data, error } = await client.from('departments').select('id, name, machine_count, created_at').order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(toDepartment);
}

export async function createDepartment(name: string): Promise<Department> {
  const client = getClient();
  const { data, error } = await client
    .from('departments')
    .insert([{ name, machine_count: 0 }])
    .select('id, name, machine_count, created_at')
    .single();

  if (error) throw error;
  return toDepartment(data);
}

export async function updateDepartment(id: string, name: string): Promise<Department> {
  const client = getClient();
  const { data, error } = await client
    .from('departments')
    .update({ name })
    .eq('id', id)
    .select('id, name, machine_count, created_at')
    .single();

  if (error) throw error;
  return toDepartment(data);
}

export async function fetchMachines(): Promise<Machine[]> {
  const client = getClient();
  const { data, error } = await client.from('machines').select('id, name, department_id, department_name, status, capacity, operator, created_at').order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(toMachine);
}

export async function createMachine(input: { name: string; departmentId: string; departmentName: string; status?: string; capacity?: string; operator?: string }): Promise<Machine> {
  const client = getClient();
  const { data, error } = await client
    .from('machines')
    .insert([
      {
        name: input.name,
        department_id: input.departmentId,
        department_name: input.departmentName,
        status: input.status?.toLowerCase() ?? 'running',
        capacity: input.capacity ?? '',
        operator: input.operator ?? '',
      },
    ])
    .select('id, name, department_id, department_name, status, capacity, operator, created_at')
    .single();

  if (error) throw error;
  return toMachine(data);
}

export async function updateMachine(input: { id: string; name: string; departmentId: string; departmentName: string; status?: string; capacity?: string; operator?: string }): Promise<Machine> {
  const client = getClient();
  const { data, error } = await client
    .from('machines')
    .update({
      name: input.name,
      department_id: input.departmentId,
      department_name: input.departmentName,
      status: input.status?.toLowerCase() ?? 'running',
      capacity: input.capacity ?? '',
      operator: input.operator ?? '',
    })
    .eq('id', input.id)
    .select('id, name, department_id, department_name, status, capacity, operator, created_at')
    .single();

  if (error) throw error;
  return toMachine(data);
}

export async function createProductionEntry(payload: ProductionEntryPayload): Promise<boolean> {
  const client = getClient();
  
  const { error } = await client.from('production_entries').insert([
    {
      dispo_no: payload.dispo_no,
      colour: payload.colour,
      construction: payload.construction,
      buyer: payload.buyer,
      shift: payload.shift,
      batch_no: payload.batch_no,
      weave_type: payload.weave_type,
      order_qty: payload.order_qty,
      start_width: payload.start_width,
      end_width: payload.end_width,
      temp: payload.temp,
      production_start_qty: payload.production_start_qty,
      intensity: payload.intensity,
      padder_pressure: payload.padder_pressure,
      position: payload.position,
      production_end_qty: payload.production_end_qty,
      machine_name: payload.machine_name,
      process_name: payload.process_name,
      machine_speed: payload.machine_speed,
      star_batcher: payload.star_batcher,
      end_batcher: payload.end_batcher,
      prod_start_datetime: payload.prod_start_datetime,
      prod_end_datetime: payload.prod_end_datetime,
      remarks: payload.remarks,
      status: payload.status ?? 'Submitted',
      created_by: payload.created_by ?? 'admin',
    },
  ]);

  if (error) throw error;
  return true;
}

export async function fetchMasterDetails(): Promise<MasterDetail[]> {
  const client = getClient();
  const { data, error } = await client.from('master_details').select('*').order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    dispo: row.dispo,
    poNo: row.po_no,
    buyerName: row.buyer_name,
    construction: row.construction,
    composition: row.composition,
    waveType: row.wave_type,
    color: row.color,
    orderQty: row.order_qty,
    unit: row.unit,
  }));
}

export async function createMasterDetail(input: Omit<MasterDetail, 'id'>): Promise<MasterDetail> {
  const client = getClient();
  const { data, error } = await client.from('master_details').insert([
    {
      dispo: input.dispo,
      po_no: input.poNo,
      buyer_name: input.buyerName,
      construction: input.construction,
      composition: input.composition,
      wave_type: input.waveType,
      color: input.color,
      order_qty: input.orderQty,
      unit: input.unit,
    }
  ]).select('*').single();
  if (error) throw error;
  return {
    id: data.id,
    dispo: data.dispo,
    poNo: data.po_no,
    buyerName: data.buyer_name,
    construction: data.construction,
    composition: data.composition,
    waveType: data.wave_type,
    color: data.color,
    orderQty: data.order_qty,
    unit: data.unit,
  };
}

export async function fetchDyesChemicals(): Promise<DyesChemical[]> {
  const client = getClient();
  const { data, error } = await client.from('dyes_chemicals').select('*').order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    rate: row.rate,
    department: row.department,
    unit: row.unit,
    stockQty: row.stock_qty,
  }));
}

export async function createDyesChemical(input: Omit<DyesChemical, 'id'>): Promise<DyesChemical> {
  const client = getClient();
  const { data, error } = await client.from('dyes_chemicals').insert([
    {
      name: input.name,
      type: input.type,
      rate: input.rate,
      department: input.department,
      unit: input.unit,
      stock_qty: input.stockQty,
    }
  ]).select('*').single();
  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    type: data.type,
    rate: data.rate,
    department: data.department,
    unit: data.unit,
    stockQty: data.stock_qty,
  };
}
