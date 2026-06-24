import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  X,
  CheckCircle2,
  Building2,
  FileCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { fetchDepartments } from '@/lib/supabaseData';
import type { Department } from '@/types';
import { useEffect } from 'react';

interface UploadZoneProps {
  label: string;
  acceptType: 'excel' | 'pdf';
  files: File[];
  onDrop: (files: File[]) => void;
  onRemove: (index: number) => void;
  sameAsExcel: boolean;
  onSameAsExcelChange: (checked: boolean) => void;
}

function UploadZone({ label, acceptType, files, onDrop, onRemove, sameAsExcel, onSameAsExcelChange }: UploadZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptType === 'excel'
      ? {
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
          'application/vnd.ms-excel': ['.xls'],
        }
      : { 'application/pdf': ['.pdf'] },
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-[#2E8B57] bg-emerald-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          {acceptType === 'excel' ? (
            <FileSpreadsheet className="w-8 h-8 text-[#1B4D3E]" />
          ) : (
            <FileText className="w-8 h-8 text-red-600" />
          )}
          <p className="text-sm font-medium text-gray-700">{label}</p>
          <p className="text-xs text-gray-400">
            {acceptType === 'excel' ? '.xlsx, .xls' : '.pdf'}
          </p>
        </div>
      </div>

      {acceptType === 'pdf' && (
        <div className="flex items-center gap-2">
          <Checkbox
            id={`same-as-excel-${label}`}
            checked={sameAsExcel}
            onCheckedChange={(checked) => onSameAsExcelChange(checked as boolean)}
          />
          <Label htmlFor={`same-as-excel-${label}`} className="text-xs text-gray-600 cursor-pointer">
            Same as Excel
          </Label>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
            >
              <div className="flex items-center gap-2">
                {acceptType === 'excel' ? (
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                ) : (
                  <FileText className="w-4 h-4 text-red-500" />
                )}
                <span className="text-xs font-medium text-gray-700 truncate max-w-[180px]">{file.name}</span>
              </div>
              <button
                onClick={() => onRemove(index)}
                className="p-1 rounded hover:bg-red-50 text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReportFormatFixer() {
  const [activeTab, setActiveTab] = useState('production');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    fetchDepartments().then(setDepartments).catch(console.error);
  }, []);

  // Production uploads
  const [prodExcelFiles, setProdExcelFiles] = useState<File[]>([]);
  const [prodPdfFiles, setProdPdfFiles] = useState<File[]>([]);
  const [prodSameAsExcel, setProdSameAsExcel] = useState(false);

  // Costing uploads
  const [costExcelFiles, setCostExcelFiles] = useState<File[]>([]);
  const [costPdfFiles, setCostPdfFiles] = useState<File[]>([]);
  const [costSameAsExcel, setCostSameAsExcel] = useState(false);

  const onDropProdExcel = useCallback((files: File[]) => {
    setProdExcelFiles((prev) => [...prev, ...files]);
  }, []);

  const onDropProdPdf = useCallback((files: File[]) => {
    setProdPdfFiles((prev) => [...prev, ...files]);
  }, []);

  const onDropCostExcel = useCallback((files: File[]) => {
    setCostExcelFiles((prev) => [...prev, ...files]);
  }, []);

  const onDropCostPdf = useCallback((files: File[]) => {
    setCostPdfFiles((prev) => [...prev, ...files]);
  }, []);

  const handleUpload = (type: 'production' | 'costing') => {
    if (!selectedDepartment) {
      toast.error('Error', { description: 'Please select a department first' });
      return;
    }
    const isProduction = type === 'production';
    const hasFiles = isProduction
      ? prodExcelFiles.length > 0 || prodPdfFiles.length > 0
      : costExcelFiles.length > 0 || costPdfFiles.length > 0;

    if (!hasFiles) {
      toast.error('Error', { description: 'Please upload at least one file' });
      return;
    }

    toast.success('Upload Successful', { description: `${isProduction ? 'Production' : 'Costing'} format uploaded for ${selectedDepartment}` })

    if (isProduction) {
      setProdExcelFiles([]);
      setProdPdfFiles([]);
      setProdSameAsExcel(false);
    } else {
      setCostExcelFiles([]);
      setCostPdfFiles([]);
      setCostSameAsExcel(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#2E8B57]" />
            Production & Costing Report Format Fixer
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Format Type Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-white border border-gray-200">
              <TabsTrigger
                value="production"
                className="data-[state=active]:bg-[#1B4D3E] data-[state=active]:text-white"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Production Format
              </TabsTrigger>
              <TabsTrigger
                value="costing"
                className="data-[state=active]:bg-[#1B4D3E] data-[state=active]:text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Costing Format
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Department Selector */}
          <div className="mb-6 flex items-center gap-3">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#2E8B57]" />
              Department:
            </Label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedDepartment && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {departments.find((d) => d.id === selectedDepartment)?.name}
              </Badge>
            )}
          </div>

          {/* Upload Zones */}
          {activeTab === 'production' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Production Excel Upload */}
              <Card className="border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700">Production Format (Excel)</CardTitle>
                </CardHeader>
                <CardContent>
                  <UploadZone
                    label="Drag & Drop Production Format Upload (Excel)"
                    acceptType="excel"
                    files={prodExcelFiles}
                    onDrop={onDropProdExcel}
                    onRemove={(i) => setProdExcelFiles(prodExcelFiles.filter((_, idx) => idx !== i))}
                    sameAsExcel={false}
                    onSameAsExcelChange={() => {}}
                  />
                  <Button
                    className="w-full mt-4 bg-[#1B4D3E] hover:bg-[#163D32]"
                    onClick={() => handleUpload('production')}
                    disabled={prodExcelFiles.length === 0 && prodPdfFiles.length === 0}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Production Format
                  </Button>
                </CardContent>
              </Card>

              {/* Production PDF Upload */}
              <Card className="border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700">Production Format (PDF)</CardTitle>
                </CardHeader>
                <CardContent>
                  <UploadZone
                    label="Drag & Drop Production Format Upload (PDF)"
                    acceptType="pdf"
                    files={prodPdfFiles}
                    onDrop={onDropProdPdf}
                    onRemove={(i) => setProdPdfFiles(prodPdfFiles.filter((_, idx) => idx !== i))}
                    sameAsExcel={prodSameAsExcel}
                    onSameAsExcelChange={setProdSameAsExcel}
                  />
                  {prodSameAsExcel && (
                    <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      PDF will be auto-formatted to match Excel layout
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Costing Excel Upload */}
              <Card className="border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700">Costing Format (Excel)</CardTitle>
                </CardHeader>
                <CardContent>
                  <UploadZone
                    label="Drag & Drop Costing Format Upload (Excel)"
                    acceptType="excel"
                    files={costExcelFiles}
                    onDrop={onDropCostExcel}
                    onRemove={(i) => setCostExcelFiles(costExcelFiles.filter((_, idx) => idx !== i))}
                    sameAsExcel={false}
                    onSameAsExcelChange={() => {}}
                  />
                  <Button
                    className="w-full mt-4 bg-[#1B4D3E] hover:bg-[#163D32]"
                    onClick={() => handleUpload('costing')}
                    disabled={costExcelFiles.length === 0 && costPdfFiles.length === 0}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Costing Format
                  </Button>
                </CardContent>
              </Card>

              {/* Costing PDF Upload */}
              <Card className="border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700">Costing Format (PDF)</CardTitle>
                </CardHeader>
                <CardContent>
                  <UploadZone
                    label="Drag & Drop Costing Format Upload (PDF)"
                    acceptType="pdf"
                    files={costPdfFiles}
                    onDrop={onDropCostPdf}
                    onRemove={(i) => setCostPdfFiles(costPdfFiles.filter((_, idx) => idx !== i))}
                    sameAsExcel={costSameAsExcel}
                    onSameAsExcelChange={setCostSameAsExcel}
                  />
                  {costSameAsExcel && (
                    <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      PDF will be auto-formatted to match Excel layout
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Note */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> First pick the department and the format gets set against the department. 
              Then drag and drop a file or click into the drag and drop area to browse files from your PC. 
              When you mark "Same as Excel", the PDF will be auto-formatted to match the Excel format layout.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
