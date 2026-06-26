import { Link } from 'react-router-dom';
import { MapPinIcon, PhoneIcon, EnvelopeIcon, ClockIcon } from '@heroicons/react/24/outline';
import logoImage from '../assets/cht_logo.png';

export default function Footer() {
  return (
    <footer className="relative bg-blue-950 text-blue-100/80">
      {/* Viền trên mảnh, đồng bộ với header */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Cột giới thiệu */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 border border-white/20 shrink-0">
                <img src={logoImage} alt="CHT Logo" className="w-full h-full object-cover" />
              </div>
              <div className="leading-tight">
                <div className="text-white font-bold text-base tracking-tight">
                  KTX Chuyên Hà Tĩnh
                </div>
              </div>
            </Link>
            <p className="text-sm text-blue-200/60 mt-3 leading-relaxed">
              Hệ thống quản lý ký túc xá.
            </p>
          </div>

          {/* Địa chỉ */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wide uppercase mb-3">
              Địa chỉ
            </h3>
            <div className="flex gap-2.5 text-sm">
              <MapPinIcon className="w-4 h-4 mt-0.5 text-amber-300 shrink-0" />
              <p className="text-blue-200/70 leading-relaxed">
                Số 50, Đường Hà Hoàng, Phường Trần Phú, Tỉnh Hà Tĩnh
              </p>
            </div>
          </div>

          {/* Liên hệ manager */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wide uppercase mb-3">
              Liên hệ quản lý
            </h3>
            <div className="space-y-2.5 text-sm">
              <a
                href="tel:0000000000"
                className="flex items-center gap-2.5 text-blue-200/70 hover:text-amber-300 transition-colors w-fit"
              >
                <PhoneIcon className="w-4 h-4 text-amber-300 shrink-0" />
                <span>[Số điện thoại]</span>
              </a>

              <a
                href="mailto:contact@ktxchuyenhatinh.edu.vn"
                className="flex items-center gap-2.5 text-blue-200/70 hover:text-amber-300 transition-colors w-fit"
              >
                <EnvelopeIcon className="w-4 h-4 text-amber-300 shrink-0" />
                <span>[Email liên hệ]</span>
              </a>
            </div>
          </div>

          {/* Giờ tiếp đón */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wide uppercase mb-3">
              Giờ tiếp đón
            </h3>
            <div className="flex gap-2.5 text-sm">
              <ClockIcon className="w-4 h-4 mt-0.5 text-amber-300 shrink-0" />
              <div className="text-blue-200/70 leading-relaxed">
                {/* TODO: thay bằng giờ thật */}
                <p>Thứ 2 – Thứ 6: 07:00 – 17:00</p>
                <p>Thứ 7: 07:00 – 11:30</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dòng cuối: copyright */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-blue-200/50">
          © {new Date().getFullYear()} KTX Chuyên Hà Tĩnh.
        </div>
      </div>
    </footer>
  );
}