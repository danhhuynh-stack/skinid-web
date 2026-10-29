export const CURATED_COMBOS = [
  {
    id: 'combo-nang-xinh',
    code: 'COMBO 1',
    badge: 'TIẾT KIỆM 25%',
    title: 'Nàng Xinh ♡',
    subtitle: 'DƯỠNG TRẮNG TOÀN DIỆN',
    slogan: 'Da mịn màng — Tươi sáng mỗi ngày',
    description: 'Bộ ba sản phẩm dưỡng trắng body toàn diện từ TWON: làm sạch, ủ dưỡng sáng mịn và dưỡng ẩm sâu mềm mượt, tặng kèm túi quà tặng SkinID sang trọng.',
    tagline: '🎁 Tặng kèm Túi quà tặng SkinID sang trọng',
    products: [
      {
        id: 'twon-body-lotion',
        name: 'Kem body dưỡng trắng TWON',
        capacity: '250ml',
        image: '/images/products/twon/twon-body-lotion.png',
        brandSlug: 'twon',
        price: 279000
      },
      {
        id: 'twon-kem-u-trang',
        name: 'Kem ủ trắng TWON',
        capacity: '250ml',
        image: '/images/products/twon/twon-kem-u-trang.png',
        brandSlug: 'twon',
        price: 249000
      },
      {
        id: 'twon-sua-tam',
        name: 'Sữa tắm TWON',
        capacity: '450ml',
        image: '/images/products/twon/twon-sua-tam.png',
        brandSlug: 'twon',
        price: 179000
      }
    ],
    productIds: ['twon-body-lotion', 'twon-kem-u-trang', 'twon-sua-tam'],
    features: [
      'Dưỡng trắng an toàn',
      'Làm mịn da đều màu',
      'Lưu hương lâu',
      'Không nhờn rít'
    ],
    originalPrice: 707000,
    price: 529000,
    savedPrice: 178000,
    discountPercent: 25
  },
  {
    id: 'combo-nang-quyen-ru',
    code: 'COMBO 2',
    badge: 'TIẾT KIỆM 22%',
    title: 'Nàng Quyến Rũ ♡',
    subtitle: 'HƯƠNG NƯỚC HOA SANG TRỌNG',
    slogan: 'Tự tin tỏa sáng mỗi ngày',
    description: 'Sự kết hợp hoàn hảo giữa làn da mịn màng thơm ngát cùng hương nước hoa D\'VAH Kamal ấm áp ngọt ngào, tặng kèm túi quà tặng SkinID sang trọng.',
    tagline: '🎁 Tặng kèm Túi quà tặng SkinID sang trọng',
    products: [
      {
        id: 'twon-body-lotion',
        name: 'Kem body dưỡng trắng TWON',
        capacity: '250ml',
        image: '/images/products/twon/twon-body-lotion.png',
        brandSlug: 'twon',
        price: 279000
      },
      {
        id: 'twon-sua-tam',
        name: 'Sữa tắm TWON',
        capacity: '450ml',
        image: '/images/products/twon/twon-sua-tam.png',
        brandSlug: 'twon',
        price: 179000
      },
      {
        id: 'dvah-kamal',
        name: 'Nước hoa D\'VAH KAMAL Mini',
        capacity: '10ml',
        image: '/images/products/dvah/dvah-kamal.png',
        brandSlug: 'dvah',
        price: 179000
      }
    ],
    productIds: ['twon-body-lotion', 'twon-sua-tam', 'dvah-kamal'],
    features: [
      'Hương thơm sang trọng',
      'Làm sạch dịu nhẹ',
      'Dưỡng ẩm mịn màng',
      'Lưu hương dài lâu'
    ],
    originalPrice: 637000,
    price: 499000,
    savedPrice: 138000,
    discountPercent: 22
  },
  {
    id: 'combo-nang-thom',
    code: 'COMBO 3',
    badge: 'TIẾT KIỆM 18%',
    title: 'Nàng Thơm ♡',
    subtitle: 'THƠM MỀM QUYẾN RŨ',
    slogan: 'Dưỡng sâu — Lưu hương dài lâu',
    description: 'Chăm sóc body toàn diện kết hợp nước hoa D\'VAH Tanmaya trầm ấm hiện đại cuốn hút, tặng kèm túi quà tặng SkinID sang trọng.',
    tagline: '🎁 Tặng kèm Túi quà tặng SkinID sang trọng',
    products: [
      {
        id: 'twon-body-lotion',
        name: 'Kem body dưỡng trắng TWON',
        capacity: '250ml',
        image: '/images/products/twon/twon-body-lotion.png',
        brandSlug: 'twon',
        price: 279000
      },
      {
        id: 'twon-sua-tam',
        name: 'Sữa tắm TWON',
        capacity: '450ml',
        image: '/images/products/twon/twon-sua-tam.png',
        brandSlug: 'twon',
        price: 179000
      },
      {
        id: 'dvah-tanmaya',
        name: 'Nước hoa D\'VAH TANMAYA Mini',
        capacity: '10ml',
        image: '/images/products/dvah/dvah-tanmaya.png',
        brandSlug: 'dvah',
        price: 179000
      }
    ],
    productIds: ['twon-body-lotion', 'twon-sua-tam', 'dvah-tanmaya'],
    features: [
      'Dưỡng trắng an toàn',
      'Lưu hương lâu',
      'Giúp da mềm mịn',
      'Thơm quyến rũ suốt ngày dài'
    ],
    originalPrice: 607000,
    price: 499000,
    savedPrice: 108000,
    discountPercent: 18
  }
];

export const RETAIL_50_DEALS = [
  {
    id: 'twon-sua-tam',
    name: 'Sữa tắm dưỡng da TWON 450ml',
    brand: 'TWON',
    brandSlug: 'twon',
    image: '/images/products/twon/twon-sua-tam.png',
    originalPrice: 179000,
    price: 89500,
    discountPercent: 50,
    features: ['Làm sạch dịu nhẹ', 'Dưỡng ẩm mịn màng', 'Lưu hương lâu', 'Không nhờn rít']
  },
  {
    id: 'twon-body-lotion',
    name: 'Kem body dưỡng trắng TWON 250ml',
    brand: 'TWON',
    brandSlug: 'twon',
    image: '/images/products/twon/twon-body-lotion.png',
    originalPrice: 279000,
    price: 139500,
    discountPercent: 50,
    features: ['Dưỡng trắng an toàn', 'Làm mịn da, đều màu', 'Thấm nhanh, không nhờn rít', 'Hương nước hoa nhẹ nhàng']
  },
  {
    id: 'twon-kem-u-trang',
    name: 'Kem ủ trắng TWON 250ml',
    brand: 'TWON',
    brandSlug: 'twon',
    image: '/images/products/twon/twon-kem-u-trang.png',
    originalPrice: 249000,
    price: 124500,
    discountPercent: 50,
    features: ['Dưỡng trắng chuyên sâu', 'Cải thiện thô ráp', 'Giúp da sáng mịn', 'Hương thơm sang trọng']
  },
  {
    id: 'dvah-kamal',
    name: 'Nước hoa Mini 10ml D\'VAH KAMAL',
    brand: "D'VAH",
    brandSlug: 'dvah',
    image: '/images/products/dvah/dvah-kamal.png',
    originalPrice: 179000,
    price: 89500,
    discountPercent: 50,
    scent: 'Hương ấm ngọt ngào Quyến rũ',
    features: ['Hương ấm ngọt ngào', 'Quyến rũ tinh tế', 'Độ lưu hương 6-8h']
  },
  {
    id: 'dvah-malini',
    name: 'Nước hoa Mini 10ml D\'VAH MALINI',
    brand: "D'VAH",
    brandSlug: 'dvah',
    image: '/images/products/dvah/dvah-malini.png',
    originalPrice: 179000,
    price: 89500,
    discountPercent: 50,
    scent: 'Hương hoa thuần khiết Nữ tính',
    features: ['Hương hoa thuần khiết', 'Nữ tính dịu dàng', 'Độ lưu hương 6-8h']
  },
  {
    id: 'dvah-sarika',
    name: 'Nước hoa Mini 10ml D\'VAH SARIKA',
    brand: "D'VAH",
    brandSlug: 'dvah',
    image: '/images/products/dvah/dvah-sarika.png',
    originalPrice: 179000,
    price: 89500,
    discountPercent: 50,
    scent: 'Hương ngọt sang trọng Tinh tế',
    features: ['Hương ngọt sang trọng', 'Tinh tế cuốn hút', 'Độ lưu hương 6-8h']
  },
  {
    id: 'dvah-tanmaya',
    name: 'Nước hoa Mini 10ml D\'VAH TANMAYA',
    brand: "D'VAH",
    brandSlug: 'dvah',
    image: '/images/products/dvah/dvah-tanmaya.png',
    originalPrice: 179000,
    price: 89500,
    discountPercent: 50,
    scent: 'Hương trầm ấm Hiện đại Cuốn hút',
    features: ['Hương trầm ấm hiện đại', 'Cuốn hút quyến rũ', 'Độ lưu hương 6-8h']
  },
  {
    id: 'dvah-rakta',
    name: 'Nước hoa Mini 10ml D\'VAH RAKTA',
    brand: "D'VAH",
    brandSlug: 'dvah',
    image: '/images/products/dvah/dvah-rakta.png',
    originalPrice: 179000,
    price: 89500,
    discountPercent: 50,
    scent: 'Hương thơm nồng nàn Cá tính',
    features: ['Hương nồng nàn cá tính', 'Sang trọng đẳng cấp', 'Độ lưu hương 6-8h']
  }
];

export const CAMPAIGN_STEPS = [
  { step: '1', title: 'LIKE & FOLLOW', desc: 'Fanpage chính thức SkinID' },
  { step: '2', title: 'SHARE BÀI VIẾT', desc: 'Ở chế độ CÔNG KHAI trên trang cá nhân' },
  { step: '3', title: 'COMMENT "SKINID50"', desc: 'Ngay dưới bài viết để nhận mã xác nhận' }
];
