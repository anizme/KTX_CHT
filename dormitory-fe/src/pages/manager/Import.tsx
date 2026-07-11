import { useState } from 'react';
import * as XLSX from 'xlsx';
import { importApi } from '../../services/api';

const REQUIRED_HINT = "Bắt buộc map một cột tới 'full_name'. Mỗi trường chỉ được map 1 lần.";

const FIELD_LABELS: Record<string, string> = {
  room_label: 'Phòng',
  full_name: 'Họ và tên',
  gender: 'Giới tính',
  class_name: 'Lớp',
  hometown: 'Quê quán',
  phone: 'SĐT học sinh',
  parent_phone: 'SĐT phụ huynh',
  violation_count: 'Số vi phạm',
  note: 'Ghi chú',
};

// Dữ liệu mẫu để sinh file template
const SAMPLE_DATA: Record<string, string> = {
  room_label: 'A101',
  full_name: 'Nguyễn Văn A',
  gender: 'Nam',
  class_name: '12 Toán 1',
  hometown: 'Nghệ An',
  phone: '0900000001',
  parent_phone: '0900000002',
  violation_count: '0',
  note: '',
};

// Các cách đặt tên cột phổ biến mà trường hay dùng -> tự map không cần hỏi user.
// So khớp không phân biệt hoa/thường, dấu tiếng Việt, khoảng trắng.
const FIELD_ALIASES: Record<string, string[]> = {
  room_label: ['phòng', 'phong', 'room', 'số phòng', 'so phong'],
  full_name: ['họ và tên', 'họ tên', 'ho va ten', 'ho ten', 'tên', 'ten', 'tên học sinh', 'ten hoc sinh', 'full_name', 'fullname', 'hoten'],
  gender: ['giới tính', 'gioi tinh', 'gender'],
  class_name: ['lớp', 'lop', 'tên lớp', 'ten lop', 'class', 'class_name'],
  hometown: ['quê quán', 'que quan', 'quê', 'que', 'hometown', 'nơi sinh', 'noi sinh'],
  phone: ['sđt', 'sdt', 'số điện thoại', 'so dien thoai', 'phone', 'sđt học sinh', 'sdt hoc sinh', 'điện thoại', 'dien thoai'],
  parent_phone: ['sđt phụ huynh', 'sdt phu huynh', 'số điện thoại phụ huynh', 'so dien thoai phu huynh', 'parent_phone', 'điện thoại phụ huynh', 'dien thoai phu huynh'],
  violation_count: ['số vi phạm', 'so vi pham', 'vi phạm', 'vi pham', 'violation_count', 'số lần vi phạm', 'so lan vi pham'],
  note: ['ghi chú', 'ghi chu', 'note', 'notes'],
};

function normalizeHeader(s: string): string {
  return s
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function autoMapColumns(columns: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const usedFields = new Set<string>();

  for (const col of columns) {
    const norm = normalizeHeader(col);
    for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
      if (usedFields.has(field)) continue; // field đã được cột khác nhận rồi -> bỏ qua, để user tự chọn nếu trùng
      if (aliases.some(a => normalizeHeader(a) === norm)) {
        mapping[col] = field;
        usedFields.add(field);
        break;
      }
    }
  }
  return mapping;
}

interface PreviewResult { total_rows: number; columns: string[]; preview: Record<string, string>[]; }
interface CommitResult { created_count: number; created_ids: number[]; errors: { row: number; error: string }[]; }

export default function Import() {
  const [file, setFile] = useState<File | null>(null);
  const [excelColumns, setExcelColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [result, setResult] = useState<CommitResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (f: File) => {
    setFile(f);
    setPreview(null);
    setResult(null);
    setError(null);
    setMapping({});
    setExcelColumns([]);

    try {
      const buffer = await f.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: unknown[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1, blankrows: false });
      const headerRow = (rows[0] || []).map(c => String(c ?? '').trim()).filter(Boolean);
      if (headerRow.length === 0) {
        setError('Không đọc được dòng tiêu đề của file Excel.');
        return;
      }
      setExcelColumns(headerRow);
      setMapping(autoMapColumns(headerRow)); // tự map trước, user chỉ cần sửa chỗ chưa khớp
    } catch {
      setError('File Excel không hợp lệ.');
    }
  };

  const usedFields = new Set(Object.values(mapping));

  const setFieldMapping = (excelCol: string, field: string) => {
    setMapping(prev => {
      const next = { ...prev };
      if (!field) delete next[excelCol];
      else next[excelCol] = field;
      return next;
    });
  };

  const downloadTemplate = () => {
    const fieldKeys = Object.keys(FIELD_LABELS);
    const headers = fieldKeys.map(k => FIELD_LABELS[k]);
    const sample = fieldKeys.map(k => SAMPLE_DATA[k] ?? '');
    const ws = XLSX.utils.aoa_to_sheet([headers, sample]);
    ws['!cols'] = headers.map(() => ({ wch: 20 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Học sinh');
    XLSX.writeFile(wb, 'mau_import_hoc_sinh.xlsx');
  };

  const doPreview = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await importApi.preview(file, mapping);
      setPreview(data);
    } catch (e: any) {
      const detail = e?.response?.data?.detail;

      if (typeof detail === 'string')
          setError(detail);
      else
          setError(JSON.stringify(detail, null, 2));
      
    } finally {
      setLoading(false);
    }
  };

  const doCommit = async () => {
    if (!file) return;
    if (!confirm(`Xác nhận import ${preview?.total_rows ?? ''} dòng vào hệ thống?`)) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await importApi.commit(file, mapping);
      setResult(data);
      setPreview(null);
    } catch (e: any) {
      setError(e?.response?.data?.detail ? JSON.stringify(e.response.data.detail) : 'Lỗi khi import');
    } finally {
      setLoading(false);
    }
  };

  const doExport = async () => {
    setExporting(true);
    setError(null);
    try {
      const res = await importApi.exportStudents();
      const url = window.URL.createObjectURL(new Blob(
          [res.data],
          {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
      ));
      const a = document.createElement('a');
      a.href = url;
      a.download = `danh_sach_hoc_sinh_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Lỗi khi export dữ liệu học sinh');
    } finally {
      setExporting(false);
    }
  };

  const inputCls = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none';
  const hasFullName = Object.values(mapping).includes('full_name');
  const unmappedCount = excelColumns.filter(c => !mapping[c]).length;

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between mb-2 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Import dữ liệu học sinh từ file Excel</h1>
          <p className="text-slate-500 mt-1 text-sm">{REQUIRED_HINT}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={downloadTemplate}
            className="px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 text-sm font-medium transition-colors"          >
            Tải file mẫu
          </button>
          <button
            onClick={doExport}
            disabled={exporting}
            className="px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 text-sm font-medium transition-colors"          >
            {exporting ? 'Đang export...' : 'Export danh sách'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-5 mb-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            1. Chọn file Excel
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-4 transition hover:border-blue-500 hover:bg-blue-50">
            <div>
              <p className="font-medium text-slate-700">
                {file ? file.name : "Chọn hoặc kéo thả file Excel"}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Hỗ trợ .xlsx, .xls — chưa có file mẫu? Bấm "Tải file mẫu" ở trên.
              </p>
            </div>

            <input
              hidden
              type="file"
              accept=".xlsx,.xls"
              onChange={e =>
                e.target.files?.[0] && handleFile(e.target.files[0])
              }
            />
          </label>
        </div>

        {excelColumns.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-600">
                2. Map từng cột đọc được từ file tới trường dữ liệu
              </label>
              <button
                type="button"
                onClick={() => setMapping(autoMapColumns(excelColumns))}
                className="text-xs text-blue-600 hover:underline"
              >
                Map lại tự động
              </button>
            </div>
            {unmappedCount > 0 && (
              <p className="text-xs text-amber-600 mb-2">
                {unmappedCount} cột chưa được map tự động, vui lòng kiểm tra và chọn thủ công.
              </p>
            )}
            <div className="space-y-2">
              {excelColumns.map(col => (
                <div key={col} className="flex items-center gap-3">
                  <span className="w-48 text-sm text-slate-700 truncate" title={col}>{col}</span>
                  <span className="text-slate-300">→</span>
                  <select
                    value={mapping[col] ?? ''}
                    onChange={e => setFieldMapping(col, e.target.value)}
                    className={`${inputCls} flex-1 ${mapping[col] ? 'border-emerald-300' : ''}`}
                  >
                    <option value="">-- Bỏ qua cột này --</option>
                    {Object.entries(FIELD_LABELS).map(([k, v]) => {
                      const disabled = usedFields.has(k) && mapping[col] !== k;
                      return (
                        <option key={k} value={k} disabled={disabled}>
                          {v}{disabled ? ' (đã dùng)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {excelColumns.length > 0 && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={doPreview}
              disabled={loading || !hasFullName}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium disabled:bg-slate-300"
            >
              Xem trước
            </button>
            {preview && (
              <button
                onClick={doCommit}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium disabled:bg-slate-300"
              >
                Xác nhận import
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm whitespace-pre-wrap">
          {error}
        </div>
      )}

      {preview && (
        <div className="bg-white rounded-xl shadow-sm border p-5 mb-6">
          <h2 className="font-semibold text-slate-800 mb-3">
            Xem trước ({preview.total_rows} dòng, hiển thị {preview.preview.length} dòng đầu)
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>{preview.columns.map(c => <th key={c} className="px-3 py-2 text-left font-medium text-slate-600">{FIELD_LABELS[c] ?? c}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {preview.preview.map((row, i) => (
                  <tr key={i}>{preview.columns.map(c => <td key={c} className="px-3 py-2">{row[c]}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="font-semibold text-slate-800 mb-3">
            Kết quả: đã tạo <span className="text-emerald-600">{result.created_count}</span> học sinh
          </h2>
          {result.errors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-red-600 mb-2">{result.errors.length} dòng lỗi:</p>
              <ul className="text-sm text-red-500 space-y-1 max-h-60 overflow-y-auto">
                {result.errors.map((e, i) => <li key={i}>Dòng {e.row}: {e.error}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}