import { useMemo, useState } from 'react';
import { IconChevronRight } from './AdminIcons.jsx';

const money = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency', currency: 'VND', maximumFractionDigits: 0
}).format(Number(value) || 0);

export default function AdminAnalyticsOverview({
  orders = [],
  kpi = {},
  blogPosts = [],
  onNavigateTab
}) {
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [activePointIndex, setActivePointIndex] = useState(6); // Mặc định điểm mới nhất (07/06)
  const [hoveredSlice, setHoveredSlice] = useState(null);

  // 1. Data cho Biểu đồ Doanh thu 7 ngày gần đây (Tính toán thực tế từ đơn hàng thật - Không số giả)
  const revenueChartData = useMemo(() => {
    // Tạo 7 ngày gần nhất tính đến hôm nay
    const days = [];
    const today = new Date();
    const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      const dayFull = `${dayNames[d.getDay()]}, ${dateStr}`;

      let dayAmount = 0;
      let dayOrders = 0;
      if (orders && orders.length > 0) {
        orders.forEach((ord) => {
          // Bỏ qua đơn hủy hoặc hoàn tiền khỏi doanh thu thực
          if (ord.status === 'cancelled' || ord.paymentStatus === 'refunded') return;
          const ordDate = ord.createdAt?.seconds
            ? new Date(ord.createdAt.seconds * 1000)
            : ord.createdAt ? new Date(ord.createdAt) : null;
          if (ordDate && ordDate.getDate() === d.getDate() && ordDate.getMonth() === d.getMonth()) {
            dayAmount += (Number(ord.total) || 0);
            dayOrders += 1;
          }
        });
      }

      days.push({
        date: dateStr,
        dayFull,
        amount: dayAmount,
        orders: dayOrders,
        change: dayOrders > 0 ? `+${dayOrders} đơn` : '0 đơn'
      });
    }

    const width = 640;
    const height = 190;
    const paddingX = 40;
    const paddingTop = 20;
    const paddingBottom = 32;

    const isRevenue = selectedMetric === 'revenue';
    const highestVal = Math.max(...days.map((d) => (isRevenue ? d.amount : d.orders)), 0);
    const maxVal = highestVal > 0 ? highestVal * 1.25 : (isRevenue ? 10000000 : 10);
    const minVal = 0;

    const points = days.map((d, index) => {
      const val = isRevenue ? d.amount : d.orders;
      const x = paddingX + (index * (width - paddingX * 2)) / (days.length - 1);
      const y = height - paddingBottom - ((val - minVal) / (maxVal - minVal)) * (height - paddingTop - paddingBottom);
      return { x, y, ...d, displayVal: val };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

    const step = maxVal / 5;
    const yAxisLabels = [
      isRevenue ? `${Math.round((step * 5) / 1000000)}tr` : `${Math.round(step * 5)}`,
      isRevenue ? `${Math.round((step * 4) / 1000000)}tr` : `${Math.round(step * 4)}`,
      isRevenue ? `${Math.round((step * 3) / 1000000)}tr` : `${Math.round(step * 3)}`,
      isRevenue ? `${Math.round((step * 2) / 1000000)}tr` : `${Math.round(step * 2)}`,
      isRevenue ? `${Math.round((step * 1) / 1000000)}tr` : `${Math.round(step * 1)}`,
      '0'
    ];

    return { points, pathD, areaD, width, height, paddingBottom, yAxisLabels, isRevenue };
  }, [orders, selectedMetric]);

  const activePoint = revenueChartData.points[activePointIndex] || revenueChartData.points[6];

  // 2. Data cho Biểu đồ Donut Đơn hàng theo trạng thái (Tính động từ đơn hàng thật)
  const donutData = useMemo(() => {
    const list = Array.isArray(orders) && orders.length > 0 ? orders : [];
    let pendingCount = 0;
    let completedCount = 0;
    let cancelledCount = 0;
    let returnedCount = 0;

    list.forEach((o) => {
      const st = o.status || 'pending';
      if (st === 'pending' || st === 'confirmed' || st === 'packing') pendingCount++;
      else if (st === 'completed' || st === 'shipping' || st === 'delivered') completedCount++;
      else if (st === 'cancelled') cancelledCount++;
      else returnedCount++;
    });

    const totalOrders = pendingCount + completedCount + cancelledCount + returnedCount;

    if (totalOrders === 0) {
      return {
        total: '0',
        slices: [
          {
            id: 'empty',
            label: 'Chưa có đơn hàng',
            percent: 100,
            color: '#E2E8F0',
            count: 0,
            strokeDasharray: `${2 * Math.PI * 45} 0`,
            strokeDashoffset: 0
          }
        ]
      };
    }

    const rawSlices = [
      { id: 'pending', label: 'Đang xử lý', percent: Math.round((pendingCount / totalOrders) * 100) || 0, color: '#F59E0B', count: pendingCount },
      { id: 'completed', label: 'Đã giao', percent: Math.round((completedCount / totalOrders) * 100) || 0, color: '#10B981', count: completedCount },
      { id: 'cancelled', label: 'Đã hủy', percent: Math.round((cancelledCount / totalOrders) * 100) || 0, color: '#E06D81', count: cancelledCount },
      { id: 'returned', label: 'Hoàn trả', percent: Math.round((returnedCount / totalOrders) * 100) || 0, color: '#0EA5E9', count: returnedCount }
    ];

    const circumference = 2 * Math.PI * 45;
    let accumulated = 0;

    const computedSlices = rawSlices.map((s) => {
      const strokeLength = (s.percent / 100) * circumference;
      const strokeOffset = circumference - accumulated;
      accumulated += strokeLength;
      return {
        ...s,
        strokeDasharray: `${strokeLength} ${circumference - strokeLength}`,
        strokeDashoffset: strokeOffset
      };
    });

    return { total: new Intl.NumberFormat('vi-VN').format(totalOrders), slices: computedSlices };
  }, [orders]);

  // 3. Danh sách 4 bài viết nổi bật
  const featuredPosts = useMemo(() => {
    const sourcePosts = (blogPosts && blogPosts.length > 0)
      ? blogPosts.slice(0, 4)
      : [
          {
            id: 'post-1',
            title: 'Bảo toàn màng ẩm tự nhiên: Bí quyết chọn sữa rửa mặt chuẩn pH 5.5 cho da nhạy cảm',
            status: 'published',
            readTime: '4 phút đọc',
            relatedProductIds: ['rilastil-1774', 'rilastil-523'],
            image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80'
          },
          {
            id: 'post-2',
            title: 'Giải mã công nghệ cấp ẩm đa tầng: Hyaluronic Acid phân tử kép hoạt động như thế nào?',
            status: 'review',
            readTime: '5 phút đọc',
            relatedProductIds: ['rilastil-525', 'rilastil-2067'],
            image: 'https://images.unsplash.com/photo-1608248597359-00f7e1b5db33?w=500&auto=format&fit=crop&q=80'
          },
          {
            id: 'post-3',
            title: 'Khóa ẩm chuyên sâu 72H: Bí quyết hạn chế mất nước qua biểu bì giúp da luôn căng mịn',
            status: 'draft',
            readTime: '4 phút đọc',
            relatedProductIds: ['rilastil-2067', 'rilastil-1774'],
            image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=80'
          },
          {
            id: 'post-4',
            title: 'Chống nắng phổ rộng & Ánh sáng xanh HEV: Bước bảo vệ toàn diện cho làn da hiện đại',
            status: 'published',
            readTime: '6 phút đọc',
            relatedProductIds: ['rilastil-1857'],
            image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500&auto=format&fit=crop&q=80'
          }
        ];

    return sourcePosts.map((post) => {
      const status = post.status || 'published';
      const statusLabel = post.statusLabel || (
        status === 'draft' ? 'Bản nháp' :
        status === 'review' || status === 'pending' ? 'Chờ duyệt' :
        'Đã xuất bản'
      );
      const statusColor = post.statusColor || (
        status === 'draft' ? 'bg-slate-100 text-slate-700 border-slate-200' :
        status === 'review' || status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
        'bg-emerald-50 text-emerald-700 border-emerald-200'
      );
      const productsCount = typeof post.productsCount === 'number'
        ? post.productsCount
        : (Array.isArray(post.relatedProductIds) ? post.relatedProductIds.length : 0);

      return {
        ...post,
        statusLabel,
        statusColor,
        productsCount,
        readTime: post.readTime || '4 phút đọc',
        image: post.image || post.coverImage || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80'
      };
    });
  }, [blogPosts]);

  return (
    <div className="space-y-6">
      {/* HÀNG 2: BIỂU ĐỒ DOANH THU 7 NGÀY & ĐƠN HÀNG THEO TRẠNG THÁI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CỘT TRÁI (65%): DOANH THU 7 NGÀY GẦN ĐÂY */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-800 tracking-tight">
                Doanh thu 7 ngày gần đây
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Rê chuột lên điểm nút để xem chi tiết doanh thu và đơn hàng
              </p>
            </div>

            {/* Quick Live Snapshot Badge */}
            <div className="flex items-center gap-2">
              {activePoint && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#FFF0F3] to-[#FCE7EC] border border-rose-200/70 rounded-full animate-in fade-in duration-200 shadow-2xs">
                  <span className="text-[11px] text-[#4A3E42] font-medium">{activePoint.date}:</span>
                  <span className="text-xs font-bold text-[#BD3F5B] font-mono">
                    {revenueChartData.isRevenue ? money(activePoint.amount) : `${activePoint.orders} đơn`}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-white/90 px-1.5 py-0.5 rounded-full border border-emerald-200/60 shadow-2xs">
                    {activePoint.change}
                  </span>
                </div>
              )}

              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 outline-none cursor-pointer hover:bg-slate-100 transition-all duration-150"
              >
                <option value="revenue">Doanh thu</option>
                <option value="orders">Số đơn hàng</option>
              </select>
            </div>
          </div>

          {/* SVG Smooth Area Chart với Interactive Crosshair */}
          {/* SVG Smooth Area Chart với Interactive Crosshair */}
          <div className="relative w-full pt-1 pb-1">
            {/* Trục Y mờ bên trái */}
            <div className="absolute left-0 top-2 bottom-8 flex flex-col justify-between text-[10px] font-mono text-slate-400 select-none">
              {revenueChartData.yAxisLabels.map((lbl, idx) => (
                <span key={idx}>{lbl}</span>
              ))}
            </div>

            {/* SVG Chart */}
            <div className="ml-10 relative">
              <svg
                viewBox={`0 0 ${revenueChartData.width} ${revenueChartData.height}`}
                className="w-full h-44 overflow-visible"
              >
                <defs>
                  {/* Gradient Fill Hồng phấn thương hiệu */}
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#BD3F5B" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#E06D81" stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {/* Các đường Grid ngang mờ */}
                {[0.15, 0.35, 0.55, 0.75].map((ratio) => {
                  const y = revenueChartData.height * ratio;
                  return (
                    <line
                      key={ratio}
                      x1="20"
                      y1={y}
                      x2={revenueChartData.width}
                      y2={y}
                      stroke="#F8FAFC"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Đường gióng dọc (Crosshair) mượt mà */}
                {activePoint && (
                  <line
                    x1={activePoint.x}
                    y1={12}
                    x2={activePoint.x}
                    y2={revenueChartData.height - revenueChartData.paddingBottom}
                    stroke="#BD3F5B"
                    strokeDasharray="3 3"
                    strokeWidth="1.5"
                    strokeOpacity="0.6"
                    className="transition-all duration-150"
                  />
                )}

                {/* Area Fill */}
                <path
                  d={revenueChartData.areaD}
                  fill="url(#revenueGradient)"
                  className="transition-all duration-500 ease-out"
                />

                {/* Line Path */}
                <path
                  d={revenueChartData.pathD}
                  fill="none"
                  stroke="#BD3F5B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-500 ease-out"
                />

                {/* Data Points với Hover Halo Effect */}
                {revenueChartData.points.map((pt, i) => {
                  const isSelected = activePointIndex === i;
                  return (
                    <g
                      key={i}
                      onMouseEnter={() => setActivePointIndex(i)}
                      className="cursor-pointer"
                    >
                      {/* Invisible wider hit area for smooth hover */}
                      <circle cx={pt.x} cy={pt.y} r="18" fill="transparent" />

                      {/* Halo ring when active */}
                      {isSelected && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="9"
                          fill="#FFF0F3"
                          stroke="#BD3F5B"
                          strokeWidth="1.5"
                          className="animate-pulse"
                        />
                      )}

                      {/* Core circle */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isSelected ? "5" : "3.5"}
                        fill="#FFFFFF"
                        stroke="#BD3F5B"
                        strokeWidth={isSelected ? "3" : "2"}
                        className="transition-all duration-200"
                      />

                      {/* Trục X nhãn ngày tháng căn thẳng data point */}
                      <text
                        x={pt.x}
                        y={revenueChartData.height - 8}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight={isSelected ? "700" : "500"}
                        fill={isSelected ? "#BD3F5B" : "#94A3B8"}
                        className="transition-all duration-150 select-none"
                      >
                        {pt.date}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (35%): ĐƠN HÀNG THEO TRẠNG THÁI (DONUT CHART) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
          <div>
            <h3 className="font-bold text-sm text-slate-800 tracking-tight">
              Đơn hàng theo trạng thái
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Rê chuột vào cung tròn để xem tỷ lệ phân bổ
            </p>
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            {/* SVG Donut Chart với Dynamic Center Focus */}
            <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="transparent"
                  stroke="#F8FAFC"
                  strokeWidth="10"
                />
                {/* Colored Slices với Interactive Hover Expanding Effect */}
                {donutData.slices.map((slice) => {
                  const isHovered = hoveredSlice?.id === slice.id;
                  return (
                    <circle
                      key={slice.id}
                      cx="50"
                      cy="50"
                      r="45"
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth={isHovered ? 13 : 10}
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      onMouseEnter={() => setHoveredSlice(slice)}
                      onMouseLeave={() => setHoveredSlice(null)}
                      className="transition-all duration-300 ease-out cursor-pointer"
                    />
                  );
                })}
              </svg>

              {/* Dynamic Center Total / Hover Detail */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none transition-all duration-200">
                {hoveredSlice ? (
                  <div className="animate-in fade-in zoom-in-95 duration-150">
                    <span
                      className="text-lg font-black tracking-tight leading-tight block font-mono"
                      style={{ color: hoveredSlice.color }}
                    >
                      {hoveredSlice.count}
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 block -mt-0.5">
                      {hoveredSlice.label} ({hoveredSlice.percent}%)
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="text-xl font-black text-slate-800 tracking-tight leading-tight font-mono">
                      {donutData.total}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Tổng đơn</span>
                  </>
                )}
              </div>
            </div>

            {/* Legend bên phải với hover highlight */}
            <div className="flex-1 space-y-2 text-xs">
              {donutData.slices.map((item) => {
                const isHovered = hoveredSlice?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredSlice(item)}
                    onMouseLeave={() => setHoveredSlice(null)}
                    className={`flex items-center justify-between p-1 rounded-lg transition-all duration-150 cursor-pointer ${
                      isHovered ? 'bg-slate-50 font-bold scale-[1.02]' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform duration-150"
                        style={{
                          backgroundColor: item.color,
                          transform: isHovered ? 'scale(1.3)' : 'scale(1)'
                        }}
                      />
                      <span className={`text-[11px] truncate ${isHovered ? 'text-slate-900 font-bold' : 'text-slate-600 font-medium'}`}>
                        {item.label}
                      </span>
                    </div>
                    <span className="font-bold text-slate-800 font-mono text-[11px]">{item.percent}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
            <span>Tỷ lệ hoàn tất đơn:</span>
            <span className="font-bold text-emerald-600">80% thành công</span>
          </div>
        </div>
      </div>

      {/* HÀNG 3: BÀI VIẾT NỔI BẬT & BANNER PROMO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* PHẦN TRÁI (8 CỘT - ~67%): BÀI VIẾT NỔI BẬT */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-800 tracking-tight">
                Bài viết nổi bật
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Các bài viết tư vấn skincare có tỷ lệ chuyển đổi cao nhất
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('blog')}
              className="text-xs font-semibold text-[#E06D81] hover:text-[#D05A6F] flex items-center gap-1 transition-all duration-150 hover:gap-1.5 cursor-pointer"
            >
              <span>Xem tất cả</span>
              <span>→</span>
            </button>
          </div>

          {/* 4 Cards Bài Viết Grid với Hover Smooth Lift & Zoom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
            {featuredPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => onNavigateTab && onNavigateTab('blog')}
                className="group cursor-pointer bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-rose-200/80 rounded-xl overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md flex flex-col justify-between"
              >
                {/* Thumbnail với Badge trạng thái & Smooth Scale */}
                <div className="relative aspect-[16/10] bg-stone-50 overflow-hidden flex items-center justify-center">
                  <img
                    src={post.image || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80'}
                    alt={post.title}
                    className={`group-hover:scale-105 transition-transform duration-500 ease-out ${
                      String(post.image || '').startsWith('/images/products/')
                        ? 'max-h-full max-w-full object-contain p-3'
                        : 'w-full h-full object-cover'
                    }`}
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border backdrop-blur-xs shadow-2xs ${post.statusColor}`}>
                      {post.statusLabel}
                    </span>
                  </div>
                </div>

                {/* Nội dung tóm tắt */}
                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-[#E06D81] transition-colors duration-200">
                    {post.title}
                  </h4>
                  <div className="pt-2 text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
                    <span>{post.readTime}</span>
                    <span>•</span>
                    <span>{post.productsCount} sản phẩm</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PHẦN PHẢI (4 CỘT - ~33%): BANNER PROMO HỒNG PHẤN */}
        <div className="lg:col-span-4 rounded-2xl bg-gradient-to-br from-[#FFE3E8] via-[#FFD6DE] to-[#FFC5CF] p-6 relative overflow-hidden flex flex-col justify-between border border-rose-100/80 shadow-[0_2px_12px_rgba(224,109,129,0.08)] group hover:shadow-[0_8px_24px_rgba(224,109,129,0.15)] transition-all duration-300">
          {/* Logo SkinID.vn nhỏ */}
          <div className="relative z-10 flex items-center gap-1.5">
            <span className="font-black text-sm tracking-tight text-[#E06D81]">SkinID.vn</span>
          </div>

          {/* Nghệ thuật Typography */}
          <div className="relative z-10 py-5 space-y-1">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              Hiểu làn da<br />
              <span className="text-[#E06D81]">Đẹp theo</span><br />
              cách riêng
            </h3>
            <p className="text-[11px] text-slate-600 font-medium pt-1 max-w-[200px]">
              Công nghệ phân tích da & gợi ý chu trình chăm sóc cá nhân hóa
            </p>
          </div>

          {/* CTA Pill button với Micro-interaction */}
          <div className="relative z-10">
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('promotions')}
              className="px-4 py-2 bg-[#E06D81] hover:bg-[#D05A6F] active:scale-95 text-white text-xs font-bold rounded-full shadow-sm hover:shadow-md transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Khám phá ngay</span>
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </button>
          </div>

          {/* Hình model / vector trang trí tinh tế mờ ở góc phải */}
          <div className="absolute right-0 bottom-0 top-6 w-36 pointer-events-none opacity-85 select-none overflow-hidden group-hover:scale-105 transition-transform duration-500 ease-out">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80"
              alt="Model Skincare"
              className="w-full h-full object-cover object-top"
              style={{
                maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
