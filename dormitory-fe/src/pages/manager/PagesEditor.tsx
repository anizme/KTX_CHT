import { useEffect, useState } from 'react';
import { pageApi } from '../../services/api';
import { PAGE_TYPES } from '../../types';
import type { Page, PageType } from '../../types';
import RichContent from '../../components/RichContent';
import RichEditor from '../../components/RichEditor';

const inputCls = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none w-full';

function PageEditor({ pageType, label }: { pageType: PageType; label: string }) {
  const [page, setPage] = useState<Page | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = () => {
    setLoading(true);
    pageApi.get(pageType).then(r => {
      setPage(r.data);
      setTitle(r.data.title);
      setContent(r.data.content);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [pageType]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await pageApi.update(pageType, { title, content });
      setSaved(true);
      load();
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-slate-400">Đang tải...</p>;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-slate-800 text-lg">{label}</h2>
        <div className="flex items-center gap-3">
          {page && (
            <span className="text-xs text-slate-400">
              Cập nhật: {new Date(page.updated_at).toLocaleString('vi-VN')} 
            </span>
          )}
          <button onClick={() => setPreview(v => !v)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-50">
            {preview ? 'Sửa nội dung' : 'Xem trước'}
          </button>
        </div>
      </div>

      <div className="mb-3">
        <label className="text-sm font-medium text-slate-600">Tiêu đề</label>
        <input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} />
      </div>

      {preview ? (
        <div className="border rounded-lg p-4 min-h-[350px] bg-slate-50">
          <RichContent content={content} />
        </div>
      ) : (
        <div>
          <label className="text-sm font-medium text-slate-600 block mb-1">Nội dung</label>
          <RichEditor value={content} onChange={setContent} />
        </div>
      )}

      <div className="flex items-center gap-3 mt-4">
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium disabled:bg-slate-300">
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
        {saved && <span className="text-emerald-600 text-sm font-medium">Đã lưu ✓</span>}
      </div>
    </div>
  );
}

export default function PagesEditor() {
  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Nội dung</h1>
      <PageEditor pageType={PAGE_TYPES.INTRO} label="Giới thiệu" />
      <PageEditor pageType={PAGE_TYPES.RULE} label="Nội quy" />
    </div>
  );
}