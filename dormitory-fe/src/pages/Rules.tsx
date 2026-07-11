import { useEffect, useState } from 'react';
import { pageApi } from '../services/api';
import { PAGE_TYPES } from '../types';
import type { Page } from '../types';
import RichContent from '../components/RichContent';
import InfoTabs from '../components/InfoTabs';

export default function Rules() {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pageApi.get(PAGE_TYPES.RULE).then(r => setPage(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <InfoTabs />
      {loading ? (
        <p className="text-slate-400">Đang tải...</p>
      ) : !page ? (
        <p className="text-slate-400">Chưa có nội quy.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-1">{page.title}</h1>
          <p className="text-sm text-slate-400 mb-6">
            Cập nhật: {new Date(page.updated_at).toLocaleDateString('vi-VN')}
          </p>
          <RichContent content={page.content} />
        </div>
      )}
    </div>
  );
}