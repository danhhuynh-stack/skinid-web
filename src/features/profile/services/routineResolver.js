import { CATALOG_SUMMARY } from '../../catalog/data/catalogSummary.generated.js';

export function resolveScanRoutine(scan = {}) {
  let products = Array.isArray(scan.recommendedRoutineProducts) && scan.recommendedRoutineProducts.length
    ? scan.recommendedRoutineProducts.filter(Boolean)
    : [];

  if (!products.length && Array.isArray(scan.recommendedRoutine) && scan.recommendedRoutine.length) {
    products = scan.recommendedRoutine
      .map((id) => CATALOG_SUMMARY.find((p) => p.id === id))
      .filter(Boolean);
  }

  // Fallback matching if products are still empty or fewer than 3
  if (products.length < 3) {
    const skinTypeLower = String(scan.skinType || '').toLowerCase();
    const isOilyOrAcne = skinTypeLower.includes('dầu') || skinTypeLower.includes('mụn') || skinTypeLower.includes('nhờn');
    const isDry = skinTypeLower.includes('khô') || skinTypeLower.includes('căng');
    const isAging = skinTypeLower.includes('lão') || skinTypeLower.includes('nám') || (Number(scan.skinAge) >= 30);

    let cleanserId = 'rilastil-1774';
    let serumId = 'rilastil-525';
    let sunId = 'rilastil-1857';
    let nightCreamId = 'rilastil-2067';

    if (isOilyOrAcne) {
      cleanserId = 'rilastil-1805';
      serumId = 'rilastil-1831';
      sunId = 'rilastil-1856';
      nightCreamId = 'rilastil-1528';
    } else if (isAging) {
      cleanserId = 'rilastil-2098';
      serumId = 'rilastil-2101';
      sunId = 'rilastil-1562';
      nightCreamId = 'rilastil-1564';
    } else if (isDry) {
      cleanserId = 'rilastil-1774';
      serumId = 'rilastil-525';
      sunId = 'rilastil-1860';
      nightCreamId = 'rilastil-2067';
    }

    const fallbackIds = [cleanserId, serumId, sunId, nightCreamId];
    products = fallbackIds
      .map((id) => CATALOG_SUMMARY.find((p) => p.id === id) || products.find((p) => p.id === id))
      .filter(Boolean);
  }

  const p1 = products[0] || CATALOG_SUMMARY[0];
  const p2 = products[1] || CATALOG_SUMMARY[2];
  const p3 = products[2] || products.find((p) => p.name?.toLowerCase().includes('chống nắng')) || CATALOG_SUMMARY[4];
  const p4 = products[3] || products[products.length - 1] || CATALOG_SUMMARY[1];

  const morningSteps = [
    {
      step: 1,
      title: 'Làm sạch & Cân bằng pH',
      desc: 'Loại bỏ dầu nhờn đêm qua, làm sạch dịu nhẹ và cân bằng màng ẩm tự nhiên.',
      product: p1
    },
    {
      step: 2,
      title: 'Tinh chất chuyên sâu & Cấp ẩm',
      desc: 'Thẩm thấu sâu vào tầng trung bì, phục hồi cấu trúc và cấp nước tế bào.',
      product: p2
    },
    {
      step: 3,
      title: 'Bảo vệ phổ rộng (SPF 50+)',
      desc: 'Ngăn ngừa tia UVA/UVB, ánh sáng xanh và chống oxy hóa bề mặt da.',
      product: p3
    }
  ];

  const eveningSteps = [
    {
      step: 1,
      title: 'Làm sạch sâu & Tẩy trang',
      desc: 'Hút sạch bụi mịn PM2.5, bã nhờn và cặn kem chống nắng tích tụ cả ngày.',
      product: p1
    },
    {
      step: 2,
      title: 'Phục hồi chuyên sâu & Tái tạo',
      desc: 'Tăng sinh collagen, phục hồi hàng rào sinh học và tái tạo tế bào trong giấc ngủ.',
      product: p2
    },
    {
      step: 3,
      title: 'Khóa ẩm & Màng Lipid',
      desc: 'Củng cố màng lipid ceramide, khóa chặt dưỡng chất và chống mất nước xuyên biểu bì.',
      product: p4
    }
  ];

  const allRoutineProducts = [...new Map([p1, p2, p3, p4].filter(Boolean).map((p) => [p.id, p])).values()];

  return {
    products: allRoutineProducts,
    morningSteps,
    eveningSteps
  };
}
