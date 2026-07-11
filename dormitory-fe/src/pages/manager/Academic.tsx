import { useEffect, useState } from 'react';
import { academicApi, studentApi, studentAwardApi } from '../../services/api';
import type { SchoolYearStatisticOut, PromotionResult } from '../../types';

interface PromotionPreview {
  totalStudents: number;
  graduatingCount: number;
  promotedCount: number;
  awardCounts: { name: string; count: number }[];
}

export default function Academic() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [stats, setStats] = useState<SchoolYearStatisticOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [preview, setPreview] = useState<PromotionPreview | null>(null);
  const [promoting, setPromoting] = useState(false);
  const [result, setResult] = useState<PromotionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [y, s] = await Promise.all([academicApi.currentYear(), academicApi.yearStatistics()]);
      setCurrentYear(y.data.school_year);
      setStats(s.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const loadPreview = async () => {
    if (currentYear == null) return;
    setPreviewLoading(true);
    setError(null);
    try {
      const [all, grade12, yearAwards] = await Promise.all([
        studentApi.list(),
        studentApi.list({ grade: 12 }),
        studentAwardApi.list({ award_year: currentYear }),
      ]);
      const counts: Record<string, number> = {};
      for (const a of yearAwards.data) {
        counts[a.award_type.name] = (counts[a.award_type.name] || 0) + 1;
      }
      setPreview({
        totalStudents: all.data.length,
        graduatingCount: grade12.data.length,
        promotedCount: all.data.length - grade12.data.length,
        awardCounts: Object.entries(counts).map(([name, count]) => ({ name, count })),
      });
    } catch {
      setError('Không tải được dữ liệu xem trước.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!confirm(
      `Xác nhận LÊN LỚP cho năm học ${currentYear}?\n\n${preview?.graduatingCount ?? 0} học sinh khối 12 sẽ bị xoá khỏi hệ thống (ra trường). Hành động này KHÔNG THỂ hoàn tác.`
    )) return;
    setPromoting(true);
    setError(null);
    try {
      const { data } = await academicApi.promote();
      setResult(data);
      setPreview(null);
      load();
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Lỗi khi lên lớp');
    } finally {
      setPromoting(false);
    }
  };

  if (loading) return <p className="text-slate-400">Đang tải...</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Quản lý năm học</h1>

      <div className="bg-white rounded-xl shadow-sm border p-5 mb-6">
        <p className="text-slate-600 mb-1">Năm học hiện tại</p>
        <p className="text-3xl font-bold text-blue-700 mb-4">{currentYear} - {currentYear + 1}</p>

        {!preview ? (
          <button
            onClick={loadPreview}
            disabled={previewLoading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium disabled:bg-slate-300"
          >
            {previewLoading ? 'Đang tải...' : 'Xem trước trước khi lên lớp'}
          </button>
        ) : (
          <div className="border rounded-lg p-4 bg-slate-50 mb-4">
            <h3 className="font-semibold text-slate-800 mb-2">Xem trước kết quả lên lớp</h3>
            <ul className="text-sm text-slate-600 space-y-1 mb-3">
              <li>Tổng số học sinh hiện tại: <strong>{preview.totalStudents}</strong></li>
              <li>Học sinh khối 12 sẽ <span className="text-red-600 font-medium">ra trường (bị xoá)</span>: <strong>{preview.graduatingCount}</strong></li>
              <li>Học sinh sẽ được lên lớp: <strong>{preview.promotedCount}</strong></li>
            </ul>
            {preview.awardCounts.length > 0 && (
              <div className="text-sm text-slate-600 mb-3">
                <p className="font-medium mb-1">Giải thưởng sẽ được chốt vào năm học {currentYear} - {currentYear + 1}:</p>
                <ul className="list-disc pl-5 space-y-0.5">
                  {preview.awardCounts.map(a => <li key={a.name}>{a.name}: {a.count}</li>)}
                </ul>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handlePromote}
                disabled={promoting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium disabled:bg-slate-300"
              >
                {promoting ? 'Đang xử lý...' : 'Xác nhận lên lớp'}
              </button>
              <button
                onClick={() => setPreview(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Huỷ
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">{error}</div>}

      {result && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6 text-sm text-emerald-700">
          Đã chốt năm học {result.school_year}: {result.promoted_count} học sinh lên lớp,
          {' '}{result.graduated_student_ids.length} học sinh ra trường. Năm học mới: {result.new_school_year}.
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h2 className="font-semibold text-slate-800 mb-3">Lịch sử các năm học đã chốt</h2>
        {stats.length === 0 ? (
          <p className="text-slate-400 text-sm">Chưa có năm học nào được chốt.</p>
        ) : (
          <div className="space-y-3">
            {stats.map(s => (
              <div key={s.id} className="border rounded-lg p-3">
                <div className="font-medium text-slate-800">Năm học {s.school_year_display}</div>
                <div className="text-sm text-slate-500">Tổng số học sinh: {s.total_students}</div>
                {s.awards.length > 0 && (
                  <div className="text-sm text-slate-500 mt-1">
                    Giải thưởng: {s.awards.map(a => `${a.award_type?.name ?? a.award_type_id} (${a.quantity})`).join(', ')}
                  </div>
                )}
                {s.special_note && <div className="text-sm text-slate-500 mt-1 italic">{s.special_note}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}