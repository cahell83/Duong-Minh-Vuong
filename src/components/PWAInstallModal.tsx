import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  Share, 
  PlusSquare, 
  CheckCircle2, 
  X, 
  Globe, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isStandalone, installApp } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirectInstall = async () => {
    const outcome = await installApp();
    if (outcome === 'accepted') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl text-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            <img 
              src="/icon.svg" 
              alt="Pickleball Cún Cưng Logo" 
              className="w-16 h-16 rounded-2xl shadow-lg border-2 border-emerald-500/40 object-cover bg-slate-950 p-1"
            />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white tracking-tight">Pickleball Cún Cưng</h3>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PWA Web App
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Cài đặt trực tiếp lên điện thoại & máy tính</p>
          </div>
        </div>

        {/* Status banner */}
        {isStandalone || isInstalled ? (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-emerald-300">Ứng dụng đã được cài đặt!</p>
              <p className="text-xs text-emerald-400/80">Bạn đang sử dụng phiên bản Web App độc lập mượt mà.</p>
            </div>
          </div>
        ) : null}

        {/* Main Installation Options */}
        <div className="space-y-4 mb-6">
          {/* Option 1: Chrome / Android 1-click Install */}
          {isInstallable && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-900/40 to-slate-800/60 border border-emerald-500/30">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-emerald-400" />
                    <span className="font-semibold text-white text-sm">Cài đặt nhanh 1 chạm</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Dành cho Android (Chrome) hoặc Máy tính (Chrome/Edge). Tự động ghim icon ra màn hình chính.
                  </p>
                </div>
                <button
                  onClick={handleDirectInstall}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-4 h-4" />
                  Cài Đặt Ngay
                </button>
              </div>
            </div>
          )}

          {/* Option 2: iOS iPhone / iPad Guide */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="w-5 h-5 text-amber-400" />
              <h4 className="font-semibold text-white text-sm">Hướng dẫn cài trên iPhone / iPad (Safari)</h4>
              {isIOS && (
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Thiết bị của bạn
                </span>
              )}
            </div>
            
            <ol className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-200 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <span>
                  Mở link web này bằng trình duyệt <strong className="text-white">Safari</strong> trên iPhone.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-200 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <span className="flex items-center gap-1.5 flex-wrap">
                  Nhấn vào nút <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-700 rounded text-sky-400 font-medium"><Share className="w-3.5 h-3.5" /> Chia sẻ</span> ở thanh công cụ dưới đáy màn hình.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-200 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <span className="flex items-center gap-1.5 flex-wrap">
                  Cuộn xuống chọn <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-700 rounded text-emerald-400 font-medium"><PlusSquare className="w-3.5 h-3.5" /> Thêm vào MH chính</span> (Add to Home Screen).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-200 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  4
                </span>
                <span>
                  Nhấn <strong className="text-white">Thêm</strong> ở góc trên bên phải. Ứng dụng sẽ có biểu tượng Cún Cưng 🐶 riêng trên màn hình!
                </span>
              </li>
            </ol>
          </div>

          {/* Option 3: Copy Link to share with members */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                Link gửi cho thành viên CLB:
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">Miễn phí 100% trọn đời</span>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={currentUrl} 
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg font-mono focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Option 4: Download Source Code / Build Zip */}
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between gap-3 flex-wrap">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <span>📦</span> Tải mã nguồn code đưa lên GitHub / Netlify:
              </div>
              <p className="text-[11px] text-slate-400">
                Nếu bạn muốn tạo kho lưu trữ GitHub riêng hoặc tự deploy.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/pickleball-cun-cung-source.zip"
                download="pickleball-cun-cung-source.zip"
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> Tải Code .ZIP
              </a>
              <a
                href="/pickleball-cun-cung-dist.zip"
                download="pickleball-cun-cung-dist.zip"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> Bản Build .ZIP
              </a>
            </div>
          </div>
        </div>

        {/* Benefits of PWA */}
        <div className="border-t border-slate-800/80 pt-4">
          <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Lợi ích khi dùng dạng Web App (PWA):
          </h5>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/40">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Không cần cài qua App Store / CH Play</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/40">
              <Smartphone className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Chạy toàn màn hình như App gốc</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/40">
              <ExternalLink className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Dung lượng siêu nhẹ (&lt; 2MB), mở tức thì</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/40">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Tự động cập nhật khi admin thay đổi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
