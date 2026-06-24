import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import RequireRole from '@/components/RequireRole';
import Login from '@/pages/Login';
import AdminDashboard from '@/pages/AdminDashboard';
import DirectorDashboard from '@/pages/DirectorDashboard';
import EntryModule from '@/pages/EntryModule';
import UserManagement from '@/pages/UserManagement';
import MasterDetailsUploads from '@/pages/MasterDetailsUploads';
import DyesChemicalUploads from '@/pages/DyesChemicalUploads';
import DepartmentMachineManagement from '@/pages/DepartmentMachineManagement';
import ProductionReportExport from '@/pages/ProductionReportExport';
import CostingReportExport from '@/pages/CostingReportExport';
import ReportFormatFixer from '@/pages/ReportFormatFixer';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireRole><AppLayout /></RequireRole>}>
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/director-dashboard" element={<DirectorDashboard />} />
        <Route path="/entry-module" element={<EntryModule />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/master-uploads" element={<MasterDetailsUploads />} />
        <Route path="/dyes-chemical-uploads" element={<DyesChemicalUploads />} />
        <Route path="/department-machine" element={<DepartmentMachineManagement />} />
        <Route path="/production-report" element={<ProductionReportExport />} />
        <Route path="/costing-report" element={<CostingReportExport />} />
        <Route path="/report-format-fixer" element={<ReportFormatFixer />} />
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
