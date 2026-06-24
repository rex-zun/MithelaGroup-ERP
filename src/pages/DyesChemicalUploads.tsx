import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FlaskConical,
  AlertCircle,
  CheckCircle2,
  History,
  Eye,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchDyesChemicals, fetchDepartments } from '@/lib/supabaseData';
import type { DyesChemical, Department } from '@/types';
import { useEffect } from 'react';

export default function DyesChemicalUploads() {
  const [dyesChemicals, setDyesChemicals] = useState<DyesChemical[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  useEffect(() => {
    Promise.all([fetchDyesChemicals(), fetchDepartments()]).then(([dyes, deps]) => {
      setDyesChemicals(dyes);
      setDepartments(deps);
    }).catch(console.error);
  }, []);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const excelFiles = acceptedFiles.filter(
      (f) => f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.name.endsWith('.csv')
    );
    if (excelFiles.length === 0) {
      setUploadStatus('error');
      setStatusMessage('Please upload only Excel files (.xlsx, .xls, .csv)');
      return;
    }
    setUploadedFiles((prev) => [...prev, ...excelFiles]);
    setUploadStatus('success');
    setStatusMessage(`${excelFiles.length} file(s) ready for upload`);
    setShowPreview(true);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
  });

  const handleUpload = () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please select a file first');
      return;
    }
    if (!selectedDepartment) {
      toast.warning('No department selected. Uploading to all departments.');
    }
    toast.success('Upload Successful', {
      description: `${uploadedFiles.length} file(s) uploaded`,
    });
    setUploadedFiles([]);
    setShowPreview(false);
    setUploadStatus('idle');
    setSelectedDepartment('');
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    if (uploadedFiles.length === 1) {
      setShowPreview(false);
      setUploadStatus('idle');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-[#2E8B57]" />
            Dyes/Chemical Details Uploads
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? 'border-[#2E8B57] bg-emerald-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#1B4D3E]/10 flex items-center justify-center">
                <FlaskConical className="w-7 h-7 text-[#1B4D3E]" />
              </div>
              {isDragActive ? (
                <p className="text-lg font-medium text-[#2E8B57]">Drop the files here...</p>
              ) : (
                <>
                  <p className="text-lg font-medium text-gray-700">Drag & Drop File To Upload</p>
                  <p className="text-sm text-gray-500">or click to browse files</p>
                  <p className="text-xs text-gray-400 mt-1">Supports .xlsx, .xls, .csv</p>
                </>
              )}
            </div>
          </div>

          {uploadStatus === 'error' && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{statusMessage}</AlertDescription>
            </Alert>
          )}
          {uploadStatus === 'success' && (
            <Alert className="mt-4 bg-emerald-50 border-emerald-200 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <AlertDescription>{statusMessage}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap items-center justify-between mt-6 gap-4">
            <Button
              variant="outline"
              className="border-gray-300"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="w-4 h-4 mr-2" />
              Upload History
            </Button>
            <div className="flex items-center gap-3">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {uploadedFiles.length > 0 && (
                <span className="text-sm text-gray-500">{uploadedFiles.length} file(s)</span>
              )}
              <Button
                className="bg-[#1B4D3E] hover:bg-[#163D32]"
                onClick={handleUpload}
                disabled={uploadedFiles.length === 0}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <FlaskConical className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showPreview && (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#2E8B57]" />
                Preview / Data Validation
              </CardTitle>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Valid Format
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-600 mb-4">
              Preview of Dyes/Chemical Upload Format:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-600 text-xs uppercase border-b">Name</th>
                    <th className="text-center px-3 py-2.5 font-semibold text-gray-600 text-xs uppercase border-b">Dyes/Chemical</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-gray-600 text-xs uppercase border-b">Rate (BDT/TK)</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-600 text-xs uppercase border-b">Department</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-gray-600 text-xs uppercase border-b">Stock Qty</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-600 text-xs uppercase border-b">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {dyesChemicals.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="px-3 py-2.5 font-medium text-gray-800">{row.name}</td>
                      <td className="px-3 py-2.5 text-center">
                        <Badge variant="outline" className={row.type === 'D' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                          {row.type === 'D' ? 'Dyes' : 'Chemical'}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono">{row.rate}</td>
                      <td className="px-3 py-2.5 text-gray-700">{row.department}</td>
                      <td className="px-3 py-2.5 text-right font-mono">{row.stockQty}</td>
                      <td className="px-3 py-2.5 text-gray-600">{row.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {showHistory && (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-[#2E8B57]" />
              Upload History
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">File Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Department</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Upload Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Records</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-800">dyes_chemical_jan2026.xlsx</td>
                    <td className="px-4 py-3 text-gray-600">Finishing</td>
                    <td className="px-4 py-3 text-gray-600">2026-01-13 11:00 AM</td>
                    <td className="px-4 py-3 text-gray-700">45 records</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">Success</Badge>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-800">chemical_inventory.xlsx</td>
                    <td className="px-4 py-3 text-gray-600">Dyeing</td>
                    <td className="px-4 py-3 text-gray-600">2026-01-10 03:45 PM</td>
                    <td className="px-4 py-3 text-gray-700">78 records</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">Success</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
