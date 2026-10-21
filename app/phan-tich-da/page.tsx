'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import ProductCard, { Product } from '@/components/ProductCard';
import productsData from '@/data/products.json';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Sparkles, Camera, Upload, CheckCircle2, ShieldCheck, ArrowRight, RotateCcw } from 'lucide-react';

export default function SkinAIScan() {
  const [step, setStep] = useState<number>(1); // 1: Consent, 2: Photo, 3: Quiz, 4: Loading, 5: Result
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [skinType, setSkinType] = useState<string>('Da dầu mụn');
  const [selectedTier, setSelectedTier] = useState<'Essential' | 'Select' | 'Signature'>('Select');

  const products = productsData as Product[];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoPreview(URL.createObjectURL(file));
      setStep(3); // Go to questionnaire
    }
  };

  const handleStartAnalysis = () => {
    setStep(4); // Loading
    setTimeout(() => {
      setStep(5); // Show Results
    }, 2500);
  };

  // Mock Routine products based on selected Tier
  const routineProducts = products.filter(p => p.tier === selectedTier).slice(0, 3);
  const totalPrice = routineProducts.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 pb-24">

        {/* STEP HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-blush border border-brand-petal/50 text-brand-pink text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SkinID AI Analyzer v2</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-brand-espresso">
            Phân Tích Làn Da Thông Minh
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Nhận phác đồ dược mỹ phẩm chuẩn hóa cá nhân trong 30 giây
          </p>
        </div>

        {/* STEP 1: CONSENT */}
        {step === 1 && (
          <div className="rounded-3xl bg-white/90 border border-brand-petal/40 p-6 sm:p-8 shadow-pink-soft max-w-lg mx-auto text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-brand-blush text-brand-pink mx-auto flex items-center justify-center">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <h2 className="font-serif text-xl font-bold text-brand-espresso">
              Cam kết bảo mật & Quyền riêng tư
            </h2>

            <div className="text-xs text-brand-muted space-y-2.5 text-left bg-brand-soft p-4 rounded-2xl border border-brand-petal/20">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-pink shrink-0 mt-0.5" />
                <span>Ảnh chụp khuôn mặt chỉ phục vụ phân tích chỉ số da tạm thời.</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-pink shrink-0 mt-0.5" />
                <span>Tuyệt đối không chia sẻ hoặc sử dụng ảnh cho bất kỳ mục đích nào khác.</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-pink shrink-0 mt-0.5" />
                <span>Tự động xóa khỏi bộ nhớ đệm ngay khi hoàn tất luồng phân tích.</span>
              </p>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-brand-pink to-brand-pink-bright text-white font-semibold text-sm shadow-pink-glow hover:brightness-105 active:scale-95 transition-all"
            >
              Tôi đồng ý & Bắt đầu chụp ảnh
            </button>
          </div>
        )}

        {/* STEP 2: PHOTO CAPTURE OR UPLOAD */}
        {step === 2 && (
          <div className="rounded-3xl bg-white/90 border border-brand-petal/40 p-6 sm:p-8 shadow-pink-soft max-w-lg mx-auto text-center space-y-6">
            <h2 className="font-serif text-lg font-bold text-brand-espresso">
              Tải hoặc chụp ảnh chính diện khuôn mặt
            </h2>

            <div className="border-2 border-dashed border-brand-petal/60 rounded-3xl p-8 bg-brand-soft flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-full bg-brand-blush text-brand-pink flex items-center justify-center">
                <Camera className="w-7 h-7" />
              </div>
              <p className="text-xs text-brand-muted">
                Đảm bảo ánh sáng tự nhiên, không trang điểm đậm
              </p>

              <label className="cursor-pointer mt-2 px-6 py-2.5 rounded-full bg-brand-pink text-white text-xs font-semibold shadow-pink-glow hover:brightness-105 transition-all flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>Chọn ảnh từ thiết bị</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* STEP 3: QUESTIONNAIRE */}
        {step === 3 && (
          <div className="rounded-3xl bg-white/90 border border-brand-petal/40 p-6 sm:p-8 shadow-pink-soft max-w-lg mx-auto space-y-5">
            <h2 className="font-serif text-lg font-bold text-brand-espresso text-center">
              Khảo sát ngắn về tình trạng da
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-brand-espresso block mb-1.5">1. Mối quan tâm chính của bạn?</label>
                <select
                  value={skinType}
                  onChange={(e) => setSkinType(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-brand-soft border border-brand-petal/40 text-brand-espresso font-medium focus:outline-none focus:ring-2 focus:ring-brand-pink"
                >
                  <option>Da dầu mụn & Lỗ chân lông to</option>
                  <option>Da thâm nám & Không đều màu</option>
                  <option>Da khô thiếu nước & Lão hóa</option>
                  <option>Da nhạy cảm & Dễ kích ứng</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-brand-espresso block mb-1.5">2. Chọn Phân khúc Ngân sách dự kiến?</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Essential', 'Select', 'Signature'] as const).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setSelectedTier(tier)}
                      className={`p-2.5 rounded-2xl border text-center transition-all ${
                        selectedTier === tier
                          ? 'border-brand-pink bg-brand-blush font-bold text-brand-pink'
                          : 'border-brand-petal/40 bg-white text-brand-espresso'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleStartAnalysis}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-brand-pink to-brand-pink-bright text-white font-semibold text-sm shadow-pink-glow hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Chạy AI Phân Tích & Tạo Phác Đồ</span>
            </button>
          </div>
        )}

        {/* STEP 4: AI LOADING */}
        {step === 4 && (
          <div className="rounded-3xl bg-white/90 border border-brand-petal/40 p-10 shadow-pink-soft max-w-lg mx-auto text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-brand-blush border-t-brand-pink animate-spin" />
              <div className="absolute inset-2 rounded-full bg-brand-blush flex items-center justify-center text-brand-pink">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-brand-espresso">
                AI đang quét vi chỉ số làn da...
              </h2>
              <p className="text-xs text-brand-muted mt-1">
                Đang đối chiếu chỉ số với dữ liệu Dược mỹ phẩm Rilastil, TWON & DVAH
              </p>
            </div>
          </div>
        )}

        {/* STEP 5: RESULT PROFILE & ROUTINE */}
        {step === 5 && (
          <div className="space-y-8">
            
            {/* AI Diagnosis Summary Card */}
            <div className="rounded-3xl glass-card p-6 sm:p-8 shadow-pink-soft border border-brand-petal/40">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-brand-petal/30">
                <div className="text-center sm:text-left">
                  <span className="text-xs font-bold text-brand-pink uppercase tracking-wider">Hồ sơ phân tích làn da #AI882</span>
                  <h2 className="font-serif text-2xl font-bold text-brand-espresso mt-1">
                    Tình trạng: {skinType}
                  </h2>
                  <p className="text-xs text-brand-muted mt-0.5">
                    Đã được đề xuất Phác đồ phân khúc: <strong className="text-brand-pink">{selectedTier}</strong>
                  </p>
                </div>

                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-full border border-brand-petal text-xs font-medium text-brand-espresso hover:bg-brand-blush transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Phân tích lại</span>
                </button>
              </div>

              {/* Routine Total Bar */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/80 p-4 rounded-2xl border border-brand-petal/30">
                <div>
                  <span className="text-xs text-brand-muted block">Tổng giá trị cả Routine 3 bước:</span>
                  <span className="text-xl font-bold text-brand-espresso">
                    {totalPrice.toLocaleString('vi-VN')}đ
                  </span>
                  <span className="text-[10px] text-brand-muted block">Đã bao gồm VAT 8% & Miễn phí vận chuyển</span>
                </div>

                <Link
                  href="/gio-hang"
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-brand-pink to-brand-pink-bright text-white text-xs font-semibold shadow-pink-glow hover:brightness-105 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                >
                  <span>Thêm cả Routine vào Giỏ</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Recommended Routine Products Grid */}
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-espresso mb-4">
                3 Bước Chăm Sóc Da Được AI Đề Xuất
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {routineProducts.map((product, idx) => (
                  <div key={product.id} className="relative">
                    <div className="absolute top-2 left-2 z-10 px-2.5 py-1 rounded-full bg-brand-pink text-white text-[10px] font-bold shadow-sm">
                      Bước {idx + 1}: {idx === 0 ? 'Làm sạch' : idx === 1 ? 'Tinh chất' : 'Dưỡng ẩm'}
                    </div>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
