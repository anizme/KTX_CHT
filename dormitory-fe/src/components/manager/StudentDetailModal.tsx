import { useEffect, useState } from 'react';
import Modal from './Modal';
import { studentApi } from '../../services/api';
import { GENDER_LABELS } from '../../types';
import type { Student } from '../../services/api';

interface Violation {
  id: number;
  description: string;
  created_at?: string;
}

interface StudentDetailData {
  id: number;
  full_name: string;
  gender: string;
  class_name: string;
  hometown: string;

  phone?: string;
  citizen_id?: string;

  building_code?: string;
  floor_number?: number;
  room_label?: string;

  violation_count: number;
  violations?: Violation[];
}

interface Props {
  student: Student;
  onClose: () => void;
}

export default function StudentDetailModal({
  student,
  onClose,
}: Props) {
  const [detail, setDetail] = useState<StudentDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentApi
      .get(student.id)
      .then(r => setDetail(r.data))
      .finally(() => setLoading(false));
  }, [student.id]);

  return (
    <Modal
      open
      onClose={onClose}
      title={`Chi tiết học sinh - ${student.full_name}`}
    >
      {loading ? (
        <p className="text-center text-slate-400 py-6">
          Đang tải...
        </p>
      ) : !detail ? (
        <p className="text-center text-slate-400 py-6">
          Không tải được dữ liệu
        </p>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoCard
              label="Họ tên"
              value={detail.full_name}
            />

            <InfoCard
              label="Giới tính"
              value={
                GENDER_LABELS[
                  detail.gender as 'MALE' | 'FEMALE'
                ] ?? detail.gender
              }
            />

            <InfoCard
              label="Lớp"
              value={detail.class_name}
            />

            <InfoCard
              label="Quê quán"
              value={detail.hometown}
            />

            <InfoCard
              label="CCCD"
              value={detail.citizen_id ?? '-'}
            />

            <InfoCard
              label="Số điện thoại"
              value={detail.phone ?? '-'}
            />
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-700 mb-2">
              Thông tin phòng
            </div>

            {detail.room_label ? (
              <div className="grid grid-cols-3 gap-3 text-sm">
                <InfoCard
                  label="Tòa"
                  value={detail.building_code ?? '-'}
                />

                <InfoCard
                  label="Tầng"
                  value={`Tầng ${detail.floor_number}`}
                />

                <InfoCard
                  label="Phòng"
                  value={detail.room_label}
                />
              </div>
            ) : (
              <div className="bg-slate-50 border rounded-lg p-3 text-sm text-slate-400">
                Chưa được xếp phòng
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <div className="text-sm font-semibold text-slate-700">
                Vi phạm
              </div>

              <span className="text-sm text-red-500 font-medium">
                {detail.violation_count} vi phạm
              </span>
            </div>

            {detail.violations?.length ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {detail.violations.map(v => (
                  <div
                    key={v.id}
                    className="border rounded-lg px-3 py-2 text-sm"
                  >
                    <div className="font-medium">
                      {v.description}
                    </div>

                    {v.created_at && (
                      <div className="text-xs text-slate-400 mt-1">
                        {new Date(v.created_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border rounded-lg p-3 text-sm text-slate-400">
                Không có vi phạm
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <div className="text-xs text-slate-400 mb-1">
        {label}
      </div>

      <div className="font-medium">
        {value}
      </div>
    </div>
  );
}