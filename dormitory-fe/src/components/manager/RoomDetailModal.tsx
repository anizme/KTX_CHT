import { useEffect, useState } from 'react';
import { roomApi } from '../../services/api';
import type { Room } from '../../services/api';
import { GENDER_LABELS } from '../../types';
import Modal from './Modal';

interface RoomDetail extends Room {
  students: {
    id: number; full_name: string; gender: string;
    class_name: string; hometown: string; violation_count: number;
  }[];
}

interface Props {
  room: Room;
  onClose: () => void;
}

export default function RoomDetailModal({ room, onClose }: Props) {
  const [detail, setDetail] = useState<RoomDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    roomApi.get(room.id)
      .then(r => setDetail(r.data as RoomDetail))
      .finally(() => setLoading(false));
  }, [room.id]);

  return (
    <Modal open title={`Chi tiết phòng ${room.label} - ${room.code}`} onClose={onClose}>
      {loading ? (
        <p className="text-slate-400 text-sm py-4 text-center">Đang tải...</p>
      ) : detail ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-0.5">Loại phòng</div>
              <div className="font-medium">{detail.type}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-0.5">Sức chứa</div>
              <div className="font-medium">{detail.occupancy} / {detail.capacity}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-0.5">Còn trống</div>
              <div className={`font-medium ${detail.available_slots === 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                {detail.available_slots} chỗ
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-0.5">Mã phòng</div>
              <div className="font-mono font-medium">{detail.code}</div>
            </div>
          </div>

          {detail.students?.length > 0 && (
            <div>
              <div className="text-sm font-medium text-slate-600 mb-2">
                Học sinh ({detail.students.length})
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {detail.students.map(s => (
                  <div key={s.id} className="flex justify-between items-center border rounded-lg px-3 py-2 text-sm">
                    <div>
                      <span className="font-medium">{s.full_name}</span>
                      <span className="text-xs text-slate-400 ml-2">
                        {GENDER_LABELS[s.gender as 'MALE'|'FEMALE'] ?? s.gender} - {s.class_name}
                      </span>
                    </div>
                    {s.violation_count > 0 && (
                      <span className="text-xs text-red-500 font-medium">{s.violation_count} vi phạm</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-slate-400 text-sm text-center py-4">Không tải được dữ liệu</p>
      )}
    </Modal>
  );
}