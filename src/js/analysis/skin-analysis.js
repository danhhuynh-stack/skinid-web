// GLOBAL CATALOG FILTER STATE
let currentBrandFilter = 'all';
let currentStepFilter = 'all';
let currentBenefitFilter = 'all';
let currentSearchQuery = '';

let currentBudget = 'Essential';
window.currentCaptureStep = 1;
window.capturedImages = []; // stores base64 strings without data prefix
window.webcamStream = null;
window.currentRoutineIds = [];
    window.excludedRoutineIds = new Set();

function readModernAuth(message = '') {
    const detail = { isAuthenticated: false, user: null, message };
    document.dispatchEvent(new CustomEvent('skinid:analysis-auth-check', { detail }));
    return detail;
}

function requestModernAnalysis(payload) {
    return new Promise((resolve, reject) => {
        document.dispatchEvent(new CustomEvent('skinid:analysis-request', { detail: { payload, resolve, reject } }));
    });
}

function saveModernSkinReport(report, emailReport) {
    return new Promise((resolve, reject) => {
        document.dispatchEvent(new CustomEvent('skinid:analysis-save-report', { detail: { report, emailReport, resolve, reject } }));
    });
}

// Gemini credentials live only in the authenticated Cloud Function.

// UTILS
function formatPrice(price) {
    return price.toLocaleString('vi-VN') + 'đ';
}

function addToCart(productId) {
    document.dispatchEvent(new CustomEvent('skinid:cart-add', { detail: { productId, quantity: 1 } }));
    showToast('Đã thêm sản phẩm vào giỏ hàng!');
}

function addAllToCart() {
    if (window.currentRoutineIds && window.currentRoutineIds.length > 0) {
        document.dispatchEvent(new CustomEvent('skinid:cart-add-many', { detail: { productIds: window.currentRoutineIds } }));
        showToast(`Đã thêm toàn bộ phác đồ (${window.currentRoutineIds.length} sản phẩm) vào giỏ hàng!`);
    } else {
        showToast('Không có sản phẩm nào trong phác đồ để thêm!');
    }
}

function showToast(message) {
    // Check if toast container exists, if not create it
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-4 right-4 z-[9999] flex flex-col gap-2';
        document.body.appendChild(container);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'bg-brand-dark text-white px-6 py-3 rounded-xl shadow-xl font-medium text-sm transform transition-all duration-300 translate-y-10 opacity-0 flex items-center gap-2';
    toast.innerHTML = `<i data-feather="check-circle" class="w-4 h-4 text-brand-primary"></i> ${message}`;
    
    container.appendChild(toast);
    
    // Initialize feather icons for the new element
    if (typeof feather !== 'undefined') feather.replace();
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

document.addEventListener('skinid:scan-toast', (event) => {
    if (event.detail?.message) showToast(event.detail.message);
});

// CATALOG

// AUTOMATIC SKINCARE STEP TYPE CLASSIFICATION FOR ALL PRODUCTS
function getProductStepType(p) {
    return getProductCategories(p)[0] || '';
}

function renderCatalog() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    grid.innerHTML = '';
    if (window.location.pathname === '/products') {
        const params = new URLSearchParams();
        if (currentBrandFilter !== 'all') params.set('brand', currentBrandFilter);
        if (currentStepFilter !== 'all') params.set('step', currentStepFilter);
        if (currentBenefitFilter !== 'all') params.set('benefit', currentBenefitFilter);
        if (currentSearchQuery) params.set('search', currentSearchQuery);
        const sort = document.getElementById('catalog-sort')?.value;
        if (sort && sort !== 'featured') params.set('sort', sort);
        const next = '/products' + (params.size ? '?' + params : '') + window.location.hash;
        if (next !== window.location.pathname + window.location.search + window.location.hash) history.replaceState(null, '', next);
    }
    const benefitSelect = document.getElementById('benefit-filter-select');
    if (benefitSelect) benefitSelect.value = currentBenefitFilter;
    
    const filtered = filterProducts(PRODUCTS, {
        brand: currentBrandFilter,
        step: currentStepFilter,
        benefit: currentBenefitFilter,
        query: currentSearchQuery
    });

    // Update Result Count UI Indicator
    const countEl = document.getElementById('filter-result-count');
    if (countEl) {
        let benefitTag = '';
        if (currentBenefitFilter && currentBenefitFilter !== 'all') {
            const labels = {
                'tri-mun-kiem-dau': 'Da dầu & mụn',
                'cap-am-chuyen-sau': 'Da khô & cấp ẩm',
                'phuc-hoi-diu-da': 'Da nhạy cảm',
                'sang-da-mo-tham': 'Thâm nám & sắc tố',
                'chong-lao-hoa': 'Chống lão hóa',
                'chong-nang': 'Chống nắng',
                'body-nuoc-hoa': 'Body & Nước hoa'
            };
            const label = labels[currentBenefitFilter] || currentBenefitFilter;
            benefitTag = ` <span class="inline-flex items-center gap-1 ml-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">${label} <button type="button" onclick="window.filterByBenefit && window.filterByBenefit('all')" class="hover:text-red-500 font-bold ml-1 cursor-pointer" title="Bỏ lọc nhu cầu">×</button></span>`;
        }
        countEl.innerHTML = `<strong>${filtered.length}</strong> sản phẩm${benefitTag}`;
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-20 px-6 bg-[#FFFFFF] rounded-2xl border border-[#E9ECEF] shadow-xs flex flex-col items-center justify-center">
                <div class="w-16 h-16 rounded-full bg-[#F8F9FA] border border-[#E9ECEF] flex items-center justify-center mb-4 text-[#6C757D]">
                    <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="7"></circle>
                        <line x1="21" y1="21" x2="16.5" y2="16.5"></line>
                        <circle cx="11" cy="11" r="3" stroke-dasharray="1.5 1.5"></circle>
                    </svg>
                </div>
                <h3 class="text-base font-semibold text-[#181517]">Không tìm thấy sản phẩm Dược mỹ phẩm phù hợp</h3>
                <p class="text-xs text-[#6C757D] mt-1.5 max-w-md leading-relaxed">Bộ lọc hiện tại không có kết quả khớp. Bạn có thể xóa tiêu chí lọc để duyệt toàn bộ danh mục sản phẩm chính hãng.</p>
                <button
                    type="button"
                    onclick="window.resetAllFilters && window.resetAllFilters()"
                    class="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-[#181517] hover:bg-[#BE185D] transition-colors shadow-xs cursor-pointer"
                >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                        <path d="M3 3v5h5"></path>
                    </svg>
                    <span>Xóa bộ lọc & Xem tất cả</span>
                </button>
            </div>
        `;
        return;
    }

    filtered.forEach(p => grid.appendChild(createProductCard(p)));
    
    if (window.feather) feather.replace();
}


window.filterByBrand = function(brand, el) {
    currentBrandFilter = brand;
    const brandSelect = document.getElementById('brand-filter-select');
    if (brandSelect) brandSelect.value = brand;
    window.syncCatalogDropdown?.(brandSelect);
    const brandBtns = document.querySelectorAll('#brand-filters .filter-btn');
    brandBtns.forEach(b => b.classList.remove('active'));
    if (el) {
        const targetBtn = el.closest ? el.closest('.filter-btn') : el;
        if (targetBtn) {
            targetBtn.classList.add('active');
        }
    }
    renderCatalog();
};

window.filterByStep = function(step, el) {
    currentStepFilter = step;
    window.syncPrimaryNavigation?.(step);
    const stepSelect = document.getElementById('step-filter-select');
    if (stepSelect) stepSelect.value = step;
    window.syncCatalogDropdown?.(stepSelect);
    const stepBtns = document.querySelectorAll('#step-filters .step-filter-btn');
    stepBtns.forEach(b => b.classList.remove('active'));
    if (el) {
        const targetBtn = el.closest ? el.closest('.step-filter-btn') : el;
        if (targetBtn) {
            targetBtn.classList.add('active');
        }
    }
    renderCatalog();
};

window.filterByBenefit = function(benefit, el) {
    currentBenefitFilter = benefit;
    const benefitSelect = document.getElementById('benefit-filter-select');
    if (benefitSelect) {
        benefitSelect.value = benefit;
        window.syncCatalogDropdown?.(benefitSelect);
    }
    const tabs = document.querySelectorAll('#benefit-filters .benefit-filter-tab');
    tabs.forEach(t => {
        const isMatch = t.dataset.benefit === benefit;
        t.classList.toggle('is-active', isMatch);
        t.classList.toggle('text-[#C8526B]', isMatch);
        t.classList.toggle('font-bold', isMatch);
        t.classList.toggle('border-[#D96B82]', isMatch);
        t.classList.toggle('border-transparent', !isMatch);
        t.classList.toggle('text-gray-500', !isMatch);
        t.classList.toggle('font-medium', !isMatch);
    });
    renderCatalog();
};

window.resetAllFilters = function() {
    currentBrandFilter = 'all';
    currentStepFilter = 'all';
    currentBenefitFilter = 'all';
    currentSearchQuery = '';

    // Reset Benefit Text Tabs
    const tabs = document.querySelectorAll('#benefit-filters .benefit-filter-tab');
    tabs.forEach(t => {
        const isAll = t.dataset.benefit === 'all';
        t.classList.toggle('is-active', isAll);
        t.classList.toggle('text-[#C8526B]', isAll);
        t.classList.toggle('font-bold', isAll);
        t.classList.toggle('border-[#D96B82]', isAll);
        t.classList.toggle('border-transparent', !isAll);
        t.classList.toggle('text-gray-500', !isAll);
        t.classList.toggle('font-medium', !isAll);
    });

    // Reset Brand Select
    const brandSelect = document.getElementById('brand-filter-select');
    if (brandSelect) {
        brandSelect.value = 'all';
        window.syncCatalogDropdown?.(brandSelect);
    }
    // Reset Step Select
    const stepSelect = document.getElementById('step-filter-select');
    if (stepSelect) {
        stepSelect.value = 'all';
        window.syncCatalogDropdown?.(stepSelect);
    }
    // Reset Benefit Select
    const benefitSelect = document.getElementById('benefit-filter-select');
    if (benefitSelect) {
        benefitSelect.value = 'all';
        window.syncCatalogDropdown?.(benefitSelect);
    }
    const sort = document.getElementById('catalog-sort');
    if (sort) { sort.value = 'featured'; window.syncCatalogDropdown?.(sort); sort.dispatchEvent(new Event('change')); }
    // Reset search
    const searchInput = document.getElementById('product-search');
    if (searchInput) searchInput.value = '';

    renderCatalog();
};

function initCatalog() {
    if (window.location.pathname === '/products') {
        const params = new URLSearchParams(window.location.search);
        const valid = (key, values) => values.includes(params.get(key)) ? params.get(key) : 'all';
        currentBrandFilter = valid('brand', ['rilastil', 'twon', 'dvah']);
        currentStepFilter = valid('step', ['cleanser', 'toner', 'treatment', 'moisturizer', 'sunscreen', 'special']);
        currentBenefitFilter = valid('benefit', ['tri-mun-kiem-dau', 'cap-am-chuyen-sau', 'phuc-hoi-diu-da', 'sang-da-mo-tham', 'chong-lao-hoa', 'chong-nang', 'body-nuoc-hoa']);
        currentSearchQuery = params.get('search') || '';
        for (const [id, value] of [
            ['brand-filter-select', currentBrandFilter], ['step-filter-select', currentStepFilter],
            ['benefit-filter-select', currentBenefitFilter], ['product-search', currentSearchQuery],
            ['catalog-sort', ['price-asc', 'price-desc'].includes(params.get('sort')) ? params.get('sort') : 'featured']
        ]) { const control = document.getElementById(id); if (control) control.value = value; }
    }
    renderCatalog();

    const brandSelect = document.getElementById('brand-filter-select');
    brandSelect?.addEventListener('change', () => filterByBrand(brandSelect.value));

    const stepSelect = document.getElementById('step-filter-select');
    stepSelect?.addEventListener('change', () => filterByStep(stepSelect.value));

    const benefitSelect = document.getElementById('benefit-filter-select');
    benefitSelect?.addEventListener('change', () => filterByBenefit(benefitSelect.value));
    
    // Setup brand filters
    const brandBtns = document.querySelectorAll('#brand-filters .filter-btn');
    brandBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetBtn = e.target.closest('.filter-btn');
            if (!targetBtn) return;
            filterByBrand(targetBtn.dataset.brand, targetBtn);
        });
    });

    // Setup step category filters
    const stepBtns = document.querySelectorAll('#step-filters .step-filter-btn');
    stepBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetBtn = e.target.closest('.step-filter-btn');
            if (!targetBtn) return;
            filterByStep(targetBtn.dataset.step, targetBtn);
        });
    });

    // Setup benefit filter tabs
    const benefitBtns = document.querySelectorAll('#benefit-filters .benefit-filter-tab');
    benefitBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetBtn = e.target.closest('.benefit-filter-tab');
            if (!targetBtn) return;
            filterByBenefit(targetBtn.dataset.benefit, targetBtn);
        });
    });

    // Setup search
    const searchInput = document.getElementById('product-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value;
            renderCatalog();
        });
    }
}

// PRODUCT DETAIL MODAL (Matching Rilastil Training & Product Spec)
window.openProductDetailModal ||= function(productId) {
    const catalog = (Array.isArray(window.PRODUCTS) && window.PRODUCTS.length > 0)
        ? window.PRODUCTS
        : (Array.isArray(window.LOCAL_PRODUCTS) ? window.LOCAL_PRODUCTS : (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []));
    const p = catalog.find(prod => prod.id === productId);
    if (!p) return;

    let modal = document.getElementById('product-detail-modal');
    if (!modal) return;

    const imgSrc = (p.image && (p.image.startsWith('http') || p.image.startsWith('data:')))
        ? p.image
        : (window.SKINID_ASSET_URL ? window.SKINID_ASSET_URL(p.image, p.brandSlug) : p.image);
    
    // Fill data
    const lineEl = document.getElementById('pmodal-line');
    if (lineEl) lineEl.innerText = p.line || p.brand || 'CHĂM SÓC DA';
    const titleEl = document.getElementById('pmodal-title');
    if (titleEl) titleEl.innerText = (typeof productDisplayName === 'function' ? productDisplayName(p) : p.name);
    const priceEl = document.getElementById('pmodal-price');
    if (priceEl) priceEl.innerText = formatPrice(p.price);
    
    const origPriceEl = document.getElementById('pmodal-original-price');
    if (origPriceEl) {
        if (p.originalPrice && p.originalPrice > p.price) {
            origPriceEl.innerText = formatPrice(p.originalPrice);
            origPriceEl.classList.remove('hidden');
        } else {
            origPriceEl.classList.add('hidden');
        }
    }

    const volEl = document.getElementById('pmodal-volume');
    if (volEl) volEl.innerText = p.volume || 'Tiêu chuẩn';
    const usesEl = document.getElementById('pmodal-uses');
    if (usesEl) usesEl.innerText = p.uses || p.description || 'Sản phẩm dược mỹ phẩm chuyên sâu từ Rilastil.';
    const usageEl = document.getElementById('pmodal-usage');
    if (usageEl) usageEl.innerText = p.usage || 'Sử dụng hàng ngày vào sáng và tối.';
    
    // Key actives formatted list
    const activesContainer = document.getElementById('pmodal-key-actives');
    if (activesContainer) {
        activesContainer.innerHTML = '';
        if (p.keyActives && p.keyActives.length > 0) {
            p.keyActives.forEach(act => {
                const parts = act.split(':');
                const title = parts[0] ? parts[0].trim() : '';
                const desc = parts.slice(1).join(':').trim();
                activesContainer.innerHTML += `
                    <div class="mb-2.5">
                        <span class="font-bold text-gray-900 text-xs sm:text-sm uppercase tracking-wide text-brand-dark">${title}:</span>
                        <span class="text-xs sm:text-sm text-gray-700 leading-relaxed"> ${desc}</span>
                    </div>
                `;
            });
        } else {
            activesContainer.innerHTML = '<p class="text-xs text-gray-600">Được bào chế với các hoạt chất sinh học tối ưu cho da liễu.</p>';
        }
    }

    // Full INCI ingredients
    const fullIngEl = document.getElementById('pmodal-full-ingredients');
    if (fullIngEl) {
        fullIngEl.innerText = p.fullIngredients || 'Được kiểm nghiệm da liễu nghiêm ngặt tại Ý.';
    }

    // Certification & Legal Info (Chuẩn Bộ Y Tế NĐ 181/2013)
    const certEl = document.getElementById('pmodal-certification-text');
    if (certEl) {
        if (p.brand === 'TWON' || p.brand === 'D\'VAH') {
            certEl.innerHTML = '<strong>Số Phiếu công bố Mỹ phẩm Bộ Y Tế:</strong> 001248/23/CBMP-HCM • <strong>Thương nhân chịu trách nhiệm:</strong> CÔNG TY TNHH FIELDMAN (MST: 0319200638 - VP: Tầng 9, 343 Phạm Ngũ Lão, Q.1, TP.HCM).';
        } else {
            certEl.innerHTML = '<strong>Số Phiếu công bố Mỹ phẩm Bộ Y Tế:</strong> 184920/22/CBMP-QLD • <strong>Nhập khẩu chính ngạch từ Ý & Phân phối:</strong> CÔNG TY TNHH FIELDMAN (Đầy đủ Hóa đơn GTGT).';
        }
    }

    if (window.feather) window.feather.replace();

    // Image
    const imgEl = document.getElementById('pmodal-img');
    if (imgEl) {
        imgEl.src = imgSrc;
        imgEl.onerror = () => {
            if (p.originalImageUrl && imgEl.src !== p.originalImageUrl) {
                imgEl.src = p.originalImageUrl;
            }
        };
    }

    // Add to cart action button
    const addBtn = document.getElementById('pmodal-add-cart-btn');
    if (addBtn) {
        addBtn.onclick = () => {
            document.dispatchEvent(new CustomEvent('skinid:cart-add', { detail: { productId: p.id, quantity: 1 } }));
            if (typeof showToast === 'function') {
                showToast('Đã thêm sản phẩm vào giỏ hàng!');
            }
            window.closeProductDetailModal?.();
        };
    }

    // Open animation
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');
        const content = document.getElementById('product-detail-modal-content');
        if (content) {
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }
        if (typeof feather !== 'undefined') feather.replace();
    }, 10);
    window.SkinIDScrollLock?.lock('product-detail');
};

window.toggleLicensePreview = function() {
    const drawer = document.getElementById('pmodal-license-drawer');
    const toggleText = document.getElementById('pmodal-license-toggle-text');
    const arrow = document.getElementById('pmodal-license-arrow');
    if (!drawer) return;

    const isHidden = drawer.classList.contains('hidden');
    if (isHidden) {
        drawer.classList.remove('hidden');
        if (toggleText) toggleText.innerText = 'Thu gọn';
        if (arrow) arrow.classList.add('rotate-180');
    } else {
        drawer.classList.add('hidden');
        if (toggleText) toggleText.innerText = 'Xem phiếu';
        if (arrow) arrow.classList.remove('rotate-180');
    }
};

window.openLicenseModal = function() {
    const modal = document.getElementById('license-preview-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        window.SkinIDScrollLock?.lock('license-preview');
    }
};

window.closeLicenseModal = function() {
    const modal = document.getElementById('license-preview-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        window.SkinIDScrollLock?.unlock('license-preview');
    }
};

window.closeProductDetailModal ||= function() {
    window.closeLicenseModal?.();
    const modal = document.getElementById('product-detail-modal');
    if (!modal) return;
    const content = document.getElementById('product-detail-modal-content');
    if (content) {
        content.classList.remove('scale-100', 'opacity-100');
        content.classList.add('scale-95', 'opacity-0');
    }
    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        modal.style.display = 'none';
        window.SkinIDScrollLock?.unlock('product-detail');
    }, 250);
};

// SMART AI INGREDIENT & CONCERN MATCHING
function matchProductForStep(stepType, targetConcerns, activeIngredients, budgetTier) {
    let pool = PRODUCTS.filter(p => p.stepType === stepType);
    if (pool.length === 0) pool = PRODUCTS;

    // Score each candidate
    const scored = pool.map(p => {
        let score = 0;
        
        // 1. Budget Tier Match (+30)
        if (p.tier === budgetTier) score += 30;

        // 2. Target Concern Match (+25 per concern)
        if (p.targetConcerns && targetConcerns) {
            targetConcerns.forEach(c => {
                if (p.targetConcerns.includes(c)) score += 25;
            });
        }

        // 3. Active Ingredients Match (+35 per matching active)
        if (activeIngredients && p.keyActives) {
            const productText = (p.name + ' ' + (p.keyActives || []).join(' ') + ' ' + (p.fullIngredients || '')).toLowerCase();
            activeIngredients.forEach(ing => {
                if (productText.includes(ing.toLowerCase())) score += 35;
            });
        }

        // 4. Prefer products with rich key actives
        if (p.keyActives && p.keyActives.length > 0) score += 10;

        return { product: p, score: score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.product || pool[0];
}



// PRIVACY MODAL FLOW
function openPrivacyModal() {
    const modal = document.getElementById('privacy-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Reset state
    const checkbox = document.getElementById('privacy-consent-checkbox');
    if (checkbox) {
        checkbox.checked = false;
        checkbox.onchange = togglePrivacyButton;
    }
    togglePrivacyButton();

    const btn = document.getElementById('btn-privacy-continue');
    if (btn) {
        btn.onclick = function(e) {
            if (e) e.preventDefault();
            requestCameraPermissionAndProceed();
        };
    }

    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');
        const content = document.getElementById('privacy-modal-content');
        if (content) {
            content.classList.remove('scale-95');
            content.classList.add('scale-100');
        }
    }, 10);
}

function closePrivacyModal() {
    const modal = document.getElementById('privacy-modal');
    if (!modal) return;
    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0');
    const content = document.getElementById('privacy-modal-content');
    if (content) {
        content.classList.remove('scale-100');
        content.classList.add('scale-95');
    }
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 300);
}

function togglePrivacyButton() {
    const checkbox = document.getElementById('privacy-consent-checkbox');
    const btn = document.getElementById('btn-privacy-continue');
    if (!btn) return;
    
    btn.classList.add('scan-primary-button');
    btn.disabled = !checkbox?.checked;
    if (checkbox?.checked) {
        if (btn.classList?.remove) btn.classList.remove('bg-gray-300', 'cursor-not-allowed');
        if (btn.classList?.add) btn.classList.add('bg-brand-primary', 'hover:bg-brand-dark', 'cursor-pointer');
    } else {
        if (btn.classList?.remove) btn.classList.remove('bg-brand-primary', 'hover:bg-brand-dark', 'cursor-pointer');
        if (btn.classList?.add) btn.classList.add('bg-gray-300', 'cursor-not-allowed');
    }
}

let isRequestingCamera = false;

async function requestCameraPermissionAndProceed() {
    const checkbox = document.getElementById('privacy-consent-checkbox');
    if (!checkbox || !checkbox.checked) return;
    if (isRequestingCamera) return;
    isRequestingCamera = true;

    const btn = document.getElementById('btn-privacy-continue');
    if (btn) {
        btn.innerHTML = '<i data-feather="loader" class="w-4 h-4 animate-spin"></i> Đang mở giao diện...';
        if (window.feather) feather.replace();
    }

    try {
        if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                stream.getTracks().forEach(track => track.stop());
            } catch (e) {
                console.warn("Camera access not available or denied, file upload is supported.", e);
            }
        }
    } catch (err) {
        console.error("Camera permission error:", err);
    } finally {
        closePrivacyModal();
        setTimeout(() => {
            openScanModal();
            isRequestingCamera = false;
            const b = document.getElementById('btn-privacy-continue');
            if (b) {
                b.innerHTML = '<i data-feather="camera" class="w-4 h-4"></i> Cấp quyền Camera';
                togglePrivacyButton();
                if (window.feather) feather.replace();
            }
        }, 300);
    }
}

// AI SCAN FLOW
function openScanModal() {
    const modal = document.getElementById('ai-modal');
    if (!modal) return;
    document.body.classList.remove('scan-results-ready');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');
    }, 10);
    
    const isDedicatedPage = document.body.classList.contains('scan-page-body');
    if (!isDedicatedPage) window.SkinIDScrollLock?.lock('skin-analysis');
    
    document.getElementById('capture-flow').classList.remove('hidden');
    document.getElementById('capture-flow').classList.add('flex');
    
    document.getElementById('analyzing-flow').classList.add('hidden');
    document.getElementById('analyzing-flow').classList.remove('flex');
    
    document.getElementById('results-flow').classList.add('hidden');
    document.getElementById('results-flow').classList.remove('flex');
    
    window.currentCaptureStep = 1;
    window.capturedImages = [];
    
    for(let i=1; i<=3; i++) {
        const thumb = document.getElementById('thumb-'+i);
        if (thumb) thumb.innerHTML = '';
    }
    
    const capBtn = document.getElementById('capture-btn');
    if (capBtn) capBtn.classList.remove('hidden');
    const actBtn = document.getElementById('analyze-action');
    if (actBtn) actBtn.classList.add('hidden');
    
    updateStepUI();
    if (typeof window.startWebcam === 'function') {
        window.startWebcam();
    } else {
        startWebcam();
    }
    if (isDedicatedPage) {
        setTimeout(() => modal.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
}

function closeScanModal() {
    if (typeof window.stopWebcam === 'function') {
        window.stopWebcam();
    } else {
        stopWebcam();
    }
    const modal = document.getElementById('ai-modal');
    if (!modal) return;
    document.body.classList.remove('scan-results-ready');
    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        if (document.body.classList.contains('scan-page-body')) {
            document.getElementById('scan-start')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 300);
    window.SkinIDScrollLock?.unlock('skin-analysis');
}

window.openPrivacyModal = openPrivacyModal;
window.closePrivacyModal = closePrivacyModal;
window.togglePrivacyButton = togglePrivacyButton;
window.requestCameraPermissionAndProceed = requestCameraPermissionAndProceed;
window.openScanModal = openScanModal;
window.closeScanModal = closeScanModal;

function initScanSetup() {
    const consentCheckbox = document.getElementById('privacy-consent-checkbox');
    if (consentCheckbox) {
        consentCheckbox.addEventListener('change', togglePrivacyButton);
    }
    const privacyBtn = document.getElementById('btn-privacy-continue');
    if (privacyBtn) {
        privacyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            requestCameraPermissionAndProceed();
        });
    }

    const budgetBtns = document.querySelectorAll('.budget-btn');
    if (budgetBtns) {
        budgetBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                budgetBtns.forEach(b => {
                    b.classList.remove('border-brand-primary', 'bg-brand-blush', 'text-brand-primary');
                    b.classList.add('border-gray-200', 'text-gray-600');
                });
                e.target.classList.remove('border-gray-200', 'text-gray-600');
                e.target.classList.add('border-brand-primary', 'bg-brand-blush', 'text-brand-primary');
                currentBudget = e.target.dataset.budget;
            });
        });
    }

    const capBtn = document.getElementById('capture-btn');
    if (capBtn) {
        capBtn.onclick = function(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            if (typeof window.captureFrame === 'function') {
                window.captureFrame();
            } else if (typeof captureFrame === 'function') {
                captureFrame();
            }
        };
    }

    const startBtn = document.getElementById('start-analysis-btn');
    if (startBtn) {
        startBtn.onclick = function() {
            if (typeof startAnalysis === 'function') startAnalysis();
        };
    }
}

function updateStepUI() {
    const texts = ["Chụp/Tải ảnh chính diện khuôn mặt", "Nghiêng trái 45 độ", "Nghiêng phải 45 độ"];
    if (window.currentCaptureStep <= 3) {
        const inst = document.getElementById('instruction-text');
        if (inst) inst.innerText = texts[window.currentCaptureStep-1];
    }
    
    for (let i = 1; i <= 3; i++) {
        const ind = document.getElementById(`step-${i}-indicator`);
        if (!ind) continue;
        const num = ind.querySelector('div');
        const text = ind.querySelector('span');
        
        if (i < window.currentCaptureStep) {
            num.className = 'w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm shadow-md transition-colors border-4 border-white';
            num.innerHTML = '<i data-feather="check" class="w-4 h-4"></i>';
            if (text) text.className = 'text-xs font-semibold text-green-500';
        } else if (i === window.currentCaptureStep) {
            num.className = 'w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm shadow-md transition-colors border-4 border-white';
            num.innerHTML = i;
            if (text) text.className = 'text-xs font-semibold text-brand-primary';
        } else {
            num.className = 'w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm transition-colors border-4 border-white';
            num.innerHTML = i;
            if (text) text.className = 'text-xs font-medium text-gray-500';
        }
    }
    if (window.feather) feather.replace();
}

window.updateStepUI = updateStepUI;

let webcamStream = null;

async function startWebcam() {
    const video = document.getElementById('webcam') || document.getElementById('webcam-video');
    if (!video) return;
    try {
        webcamStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } });
        video.srcObject = webcamStream;
        const loading = document.getElementById('camera-loading');
        if (loading) loading.classList.add('hidden');
    } catch (err) {
        console.warn("Webcam unavailable, file upload is enabled.", err);
    }
}

function stopWebcam() {
    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
    }
}

let isCapturing = false;

function captureFrame() {
    if (isCapturing) return;
    isCapturing = true;
    setTimeout(() => { isCapturing = false; }, 800);

    if (typeof window.captureFrameAndPreProcess === 'function') {
        window.captureFrameAndPreProcess();
        return;
    }

    const video = document.getElementById('webcam') || document.getElementById('webcam-video');
    const canvas = document.createElement('canvas');
    if (video && video.videoWidth > 0) {
        const maxDim = 800;
        let w = video.videoWidth;
        let h = video.videoHeight;
        if (w > maxDim || h > maxDim) {
            if (w > h) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
            } else {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
            }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(video, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        saveCapturedImage(dataUrl.split(',')[1]);
    } else {
        let fileInput = document.getElementById('file-upload-input');
        if (!fileInput) {
            fileInput = document.createElement('input');
            fileInput.id = 'file-upload-input';
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            fileInput.onchange = handleFileUpload;
            document.body.appendChild(fileInput);
        }
        fileInput.click();
    }
}

window.startWebcam = startWebcam;
window.stopWebcam = stopWebcam;
window.captureFrame = captureFrame;

window.openScanFilePicker = function() {
    let fileInput = document.getElementById('file-upload-input');
    if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.id = 'file-upload-input';
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        fileInput.onchange = handleFileUpload;
        document.body.appendChild(fileInput);
    }
    fileInput.value = '';
    fileInput.click();
};

function compressImageFile(file, maxDimension = 800, quality = 0.82) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let w = img.naturalWidth || img.width;
                let h = img.naturalHeight || img.height;
                if (w > maxDimension || h > maxDimension) {
                    if (w > h) {
                        h = Math.round((h * maxDimension) / w);
                        w = maxDimension;
                    } else {
                        w = Math.round((w * maxDimension) / h);
                        h = maxDimension;
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', quality).split(',')[1]);
            };
            img.onerror = () => reject(new Error('Không thể đọc file ảnh này.'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Lỗi khi đọc file ảnh.'));
        reader.readAsDataURL(file);
    });
}

async function handleFileUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
        const base64Data = await compressImageFile(file, 1280, 0.85);
        saveCapturedImage(base64Data);
    } catch (err) {
        console.error('[SkinID Upload]', err);
        showToast(err.message || 'Không thể tải ảnh này.');
    } finally {
        event.target.value = '';
    }
}

let isSavingCapturedImage = false;

function saveCapturedImage(base64Image) {
    if (isSavingCapturedImage) return;
    isSavingCapturedImage = true;
    setTimeout(() => { isSavingCapturedImage = false; }, 800);

    if (!window.capturedImages) window.capturedImages = [];
    window.capturedImages.push(base64Image);
    
    const thumb = document.getElementById('thumb-' + window.currentCaptureStep);
    if (thumb) {
        thumb.innerHTML = `<img src="data:image/jpeg;base64,${base64Image}" class="w-full h-full object-cover rounded-xl border border-brand-petal shadow-sm">`;
    }
    
    window.currentCaptureStep++;
    if (window.currentCaptureStep > 3) {
        document.getElementById('capture-btn')?.classList.add('hidden');
        document.getElementById('analyze-action')?.classList.remove('hidden');
        const inst = document.getElementById('instruction-text');
        if (inst) inst.innerText = 'Đã hoàn tất 3 góc chụp! Hãy nhấn nút Phân tích da.';
        if (typeof window.stopWebcam === 'function') {
            window.stopWebcam();
        } else if (typeof stopWebcam === 'function') {
            stopWebcam();
        }
    } else {
        updateStepUI();
    }
}

window.saveCapturedImage = saveCapturedImage;

// Helper string hash for deterministic Report ID
function stringHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash).toString(16).toUpperCase().padStart(4, '0');
}

// --- Scan step animation helper ---
function activateScanStep(stepNum, totalSteps) {
    const steps = document.querySelectorAll('#scan-steps-list .scan-step');
    const titles = [
        { title: '🔍 Đang nhận diện khuôn mặt...', desc: 'Xác định vùng da từ 3 góc chụp' },
        { title: '🧬 Phân tích cấu trúc biểu bì...', desc: 'Quét lớp biểu bì và hạ bì' },
        { title: '💧 Đo lường chỉ số da...', desc: 'Đo độ ẩm, dầu, sắc tố melanin' },
        { title: '📊 Tổng hợp 12 chỉ số...', desc: 'Kết xuất biểu đồ cấu trúc da' },
        { title: '✨ Hoàn tất phân tích!', desc: 'Đang tạo báo cáo cá nhân hóa' }
    ];

    steps.forEach((s, i) => {
        s.classList.remove('active', 'done');
        if (i + 1 < stepNum) s.classList.add('done');
        else if (i + 1 === stepNum) s.classList.add('active');
    });

    const titleEl = document.getElementById('scan-step-title');
    const descEl = document.getElementById('scan-step-desc');
    if (titleEl && titles[stepNum - 1]) {
        titleEl.textContent = titles[stepNum - 1].title;
        descEl.textContent = titles[stepNum - 1].desc;
    }

    const progressBar = document.getElementById('analysis-progress');
    if (progressBar) {
        progressBar.style.width = Math.round((stepNum / totalSteps) * 100) + '%';
    }

    if (window.feather) feather.replace();
}

// --- Weather API (Open-Meteo, no key needed) ---
async function fetchWeatherData() {
    try {
        const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, () => reject('no-geo'), { timeout: 5000 });
        });
        const lat = pos.coords.latitude.toFixed(2);
        const lon = pos.coords.longitude.toFixed(2);
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,uv_index&timezone=auto`);
        const data = await res.json();
        return {
            temp: Math.round(data.current.temperature_2m),
            humidity: Math.round(data.current.relative_humidity_2m),
            uvIndex: Math.round(data.current.uv_index)
        };
    } catch (e) {
        console.warn('Weather fallback to defaults', e);
        return { temp: 31, humidity: 78, uvIndex: 7 };
    }
}

function showAnalysisError(message, isNotFace = false) {
    const errorCard = document.getElementById('analysis-error-card');
    const errorMsgEl = document.getElementById('analysis-error-message');
    const retryBtn = document.getElementById('analysis-retry-btn');
    const recaptureBtn = document.getElementById('analysis-recapture-btn');

    if (errorMsgEl) errorMsgEl.textContent = message;
    if (errorCard) {
        errorCard.classList.remove('hidden');
        if (window.feather) feather.replace();
    }
    if (retryBtn) {
        if (isNotFace) {
            retryBtn.classList.add('hidden');
        } else {
            retryBtn.classList.remove('hidden');
            retryBtn.onclick = () => {
                if (errorCard) errorCard.classList.add('hidden');
                startAnalysis();
            };
        }
    }
    if (recaptureBtn) {
        recaptureBtn.onclick = () => {
            if (errorCard) errorCard.classList.add('hidden');
            resetToCaptureFlow();
        };
    }
}

async function startAnalysis() {
    if (!window.capturedImages || window.capturedImages.length < 3) {
        showToast('Vui lòng hoàn tất đủ 3 góc chụp trước khi phân tích.');
        resetToCaptureFlow();
        return;
    }
    // switch UI
    document.getElementById('capture-flow').classList.add('hidden');
    document.getElementById('capture-flow').classList.remove('flex');
    
    document.getElementById('analyzing-flow').classList.remove('hidden');
    document.getElementById('analyzing-flow').classList.add('flex');

    const errorCard = document.getElementById('analysis-error-card');
    if (errorCard) errorCard.classList.add('hidden');

    // Show scan thumbnails with captured images
    if (window.capturedImages) {
        for (let i = 0; i < Math.min(3, window.capturedImages.length); i++) {
            const thumb = document.getElementById('scan-thumb-' + (i + 1));
            if (thumb) {
                const existingImg = thumb.querySelector('img');
                if (existingImg) existingImg.remove();
                const img = document.createElement('img');
                img.src = 'data:image/jpeg;base64,' + window.capturedImages[i];
                img.className = 'w-full h-full object-cover';
                thumb.prepend(img);
            }
        }
    }

    if (window.feather) feather.replace();

    // Smooth step progression timers
    const stepTimers = [];
    activateScanStep(1, 5);
    stepTimers.push(setTimeout(() => activateScanStep(2, 5), 1500));
    stepTimers.push(setTimeout(() => activateScanStep(3, 5), 4500));
    stepTimers.push(setTimeout(() => activateScanStep(4, 5), 8500));

    const skinType = document.getElementById('user-skin-type')?.value || 'Da hỗn hợp';
    
    try {
        const authStatus = readModernAuth('Đăng nhập để AI tiến hành phân tích 3 góc khuôn mặt và lưu phác đồ riêng của bạn ✨');
        if (!authStatus.isAuthenticated) {
            stepTimers.forEach(clearTimeout);
            window.pendingAnalysisAfterAuth = true;
            document.getElementById('analyzing-flow').classList.add('hidden');
            document.getElementById('analyzing-flow').classList.remove('flex');
            document.getElementById('capture-flow').classList.remove('hidden');
            document.getElementById('capture-flow').classList.add('flex');
            return;
        }
        const [resultJson, weatherData] = await Promise.all([
            requestModernAnalysis({ images: window.capturedImages, skinType }),
            fetchWeatherData()
        ]);
        stepTimers.forEach(clearTimeout);
        if (resultJson?.isNotFace) {
            showAnalysisError('Không nhận diện được khuôn mặt người rõ ràng trong đủ 3 ảnh. Vui lòng chụp lại ở nơi đủ sáng.', true);
            return;
        }
        if (!resultJson?.skinTypeSummary) throw new Error('Máy chủ trả về kết quả không hợp lệ.');
        activateScanStep(5, 5);
        await new Promise(resolve => setTimeout(resolve, 400));
        renderResults(resultJson, weatherData);
    } catch (error) {
        stepTimers.forEach(clearTimeout);
        console.error('[SkinID AI]', error);
        const message = error.message
            || 'Không thể hoàn tất phân tích da. Vui lòng thử lại.';
        showAnalysisError(message, false);
    }
}

window.startAnalysis = startAnalysis;

function resetToCaptureFlow() {
    document.body.classList.remove('scan-results-ready');
    const errorCard = document.getElementById('analysis-error-card');
    if (errorCard) errorCard.classList.add('hidden');
    document.getElementById('analyzing-flow').classList.add('hidden');
    document.getElementById('analyzing-flow').classList.remove('flex');
    document.getElementById('capture-flow').classList.remove('hidden');
    document.getElementById('capture-flow').classList.add('flex');
    // Reset scan thumbnails
    for (let i = 1; i <= 3; i++) {
        const thumb = document.getElementById('scan-thumb-' + i);
        if (thumb) {
            const img = thumb.querySelector('img');
            if (img) img.remove();
        }
    }
}

function scrollScanWorkspaceToTop() {
    const modal = document.getElementById('ai-modal');
    if (!modal) return;
    if (document.body.classList.contains('scan-page-body')) {
        const target = document.body.classList.contains('scan-results-ready')
            ? document.getElementById('results-flow')
            : modal;
        const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({
            top: Math.max(0, target.offsetTop - 96),
            behavior: reducedMotion ? 'auto' : 'smooth'
        });
    } else {
        modal.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function renderResults(data, weatherData) {
    document.getElementById('analyzing-flow').classList.add('hidden');
    document.getElementById('analyzing-flow').classList.remove('flex');
    
    document.getElementById('results-flow').classList.remove('hidden');
    document.getElementById('results-flow').classList.add('flex');
    document.body.classList.add('scan-results-ready');
    
    // Header
    const now = new Date();
    document.getElementById('report-date').innerText = `Ngày: ${now.toLocaleDateString('vi-VN')}`;
    
    const reportSeed = (data.skinTypeSummary || '') + (data.healthScore || '') + (data.analysis3Angles || '').substring(0, 20);
    document.getElementById('report-id').innerText = `ID: SKN-${stringHash(reportSeed)}`;
    document.getElementById('result-skin-type').innerText = data.skinTypeSummary;
    
    // Text
    document.getElementById('result-assessment').innerText = data.analysis3Angles;
    
    // Tags (Keywords/Ingredients)
    const tagsContainer = document.getElementById('result-tags');
    if (tagsContainer) {
        tagsContainer.innerHTML = '';
        if (data.activeIngredients && Array.isArray(data.activeIngredients)) {
            data.activeIngredients.forEach(ing => {
                tagsContainer.innerHTML += `<span class="bg-brand-blush text-brand-primary px-3 py-1 rounded-full text-xs font-bold border border-brand-petal">${ing}</span>`;
            });
        }
    }

    // --- B1: Overall Grade Badge ---
    const gradeBadge = document.getElementById('overall-grade-badge');
    const gradeLetter = document.getElementById('overall-grade-letter');
    const gradeText = document.getElementById('overall-grade-text');
    if (gradeBadge && data.overallGrade) {
        const gradeColors = {
            'A': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
            'B': { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700' },
            'C': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
            'D': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
            'F': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' }
        };
        const gc = gradeColors[data.overallGrade.toUpperCase()] || gradeColors['C'];
        gradeBadge.className = `inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-3 border transition-all duration-500 ${gc.bg} ${gc.border} ${gc.text}`;
        gradeBadge.style.display = 'inline-flex';
        gradeLetter.textContent = data.overallGrade.toUpperCase();
        gradeText.textContent = data.overallGradeComment || 'Đánh giá tổng thể';
    }
    
    // Animate health score with GLOW effect
    let score = 0;
    const targetScore = Math.min(100, Math.max(10, parseInt(data.healthScore) || 72));
    const scoreText = document.getElementById('health-score-text');
    const scoreRing = document.getElementById('health-score-ring');
    const scoreGlow = document.getElementById('score-glow');
    
    // Determine color based on score
    let ringColor, glowColor;
    if (targetScore >= 75) {
        ringColor = '#10b981'; glowColor = 'rgba(16,185,129,0.4)';
    } else if (targetScore >= 55) {
        ringColor = '#f59e0b'; glowColor = 'rgba(245,158,11,0.4)';
    } else {
        ringColor = '#ef4444'; glowColor = 'rgba(239,68,68,0.4)';
    }

    if (scoreText && scoreRing) {
        scoreRing.style.stroke = ringColor;
        const interval = setInterval(() => {
            if(score >= targetScore) { 
                clearInterval(interval);
                // Apply glow after animation completes
                if (scoreGlow) {
                    scoreGlow.style.boxShadow = `0 0 30px ${glowColor}, 0 0 60px ${glowColor}`;
                }
                // Confetti for good scores
                if (targetScore >= 80) triggerConfetti();
                return; 
            }
            score++;
            scoreText.innerText = score;
            scoreRing.style.strokeDasharray = `${score}, 100`;
        }, 20);
    }

    // Render Metrics Accordion
    const metricsContainer = document.getElementById('metrics-container');
    if (metricsContainer) {
        metricsContainer.innerHTML = '';
        const metricDefs = [
            { id: 'moisture', name: 'Độ ẩm', score: parseInt(data.moisture) || 60, isInverse: false, icon: 'droplet' },
            { id: 'sebum', name: 'Dầu thừa', score: parseInt(data.sebum) || 60, isInverse: true, icon: 'wind' },
            { id: 'pores', name: 'Lỗ chân lông', score: parseInt(data.pores) || 60, isInverse: true, icon: 'maximize' },
            { id: 'pigmentation', name: 'Sắc tố', score: parseInt(data.pigmentation) || 50, isInverse: true, icon: 'sun' },
            { id: 'elasticity', name: 'Độ đàn hồi', score: parseInt(data.elasticity) || 65, isInverse: false, icon: 'activity' }
        ];

        metricDefs.forEach(m => {
            let goodScore = m.isInverse ? (100 - m.score) : m.score;
            let level = "Cần cải thiện";
            let textClass = "text-rose-600";
            let bgClass = "bg-rose-100";
            let progressClass = "bg-rose-500";
            
            if (goodScore >= 80) {
                level = "Tốt"; textClass = "text-teal-600"; bgClass = "bg-teal-100"; progressClass = "bg-teal-400";
            } else if (goodScore >= 60) {
                level = "Khá"; textClass = "text-pink-400"; bgClass = "bg-pink-50"; progressClass = "bg-pink-300";
            } else if (goodScore >= 40) {
                level = "Cần chú ý"; textClass = "text-pink-600"; bgClass = "bg-pink-100"; progressClass = "bg-pink-500";
            }

            const html = `
            <div class="border border-gray-100 rounded-xl overflow-hidden transition-all duration-300">
                <div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:bg-gray-50 gap-4" onclick="this.nextElementSibling.classList.toggle('hidden'); const icon = this.querySelector('.chevron-icon'); icon.style.transform = icon.style.transform === 'rotate(180deg)' ? 'rotate(0deg)' : 'rotate(180deg)';">
                    <div class="flex items-center gap-3 sm:w-2/5">
                        <div class="p-2 rounded-lg ${bgClass} ${textClass}">
                            <i data-feather="${m.icon}" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <p class="font-bold text-gray-800 text-sm">${m.name}</p>
                            <p class="${textClass} text-xs font-semibold">${m.score}% - ${level}</p>
                        </div>
                    </div>
                    <div class="sm:w-2/5 px-2">
                        <div class="w-full bg-gray-100 rounded-full h-2">
                            <div class="${progressClass} h-2 rounded-full transition-all duration-1000" style="width: 0%" data-target="${m.score}"></div>
                        </div>
                    </div>
                    <div class="sm:w-1/5 text-right flex justify-end">
                        <i data-feather="chevron-down" class="w-5 h-5 text-gray-400 transition-transform chevron-icon"></i>
                    </div>
                </div>
                <div class="hidden border-t border-gray-100 bg-gray-50 p-4 text-sm space-y-3">
                    <div class="flex gap-2">
                        <span class="font-bold text-gray-700 min-w-[80px]">Vì sao?</span>
                        <span class="text-gray-600 leading-relaxed">${(data.detailedAdvice && data.detailedAdvice[m.id] && data.detailedAdvice[m.id].why) || `Chỉ số ${m.name.toLowerCase()} ở mức ${m.score}% cho thấy tình trạng thực tế từ phân tích hình ảnh AI.`}</span>
                    </div>
                    <div class="flex gap-2">
                        <span class="font-bold text-gray-700 min-w-[80px]">Nên làm:</span>
                        <span class="text-gray-600 leading-relaxed">${(data.detailedAdvice && data.detailedAdvice[m.id] && data.detailedAdvice[m.id].shouldDo) || 'Sử dụng sản phẩm chứa thành phần đặc trị phù hợp với chỉ số này.'}</span>
                    </div>
                    <div class="flex gap-2">
                        <span class="font-bold text-gray-700 min-w-[80px]">Cần tránh:</span>
                        <span class="text-gray-600 leading-relaxed">${(data.detailedAdvice && data.detailedAdvice[m.id] && data.detailedAdvice[m.id].avoid) || 'Hạn chế tiếp xúc trực tiếp tia UV và các thói quen gây hại cho da.'}</span>
                    </div>
                </div>
            </div>
            `;
            metricsContainer.innerHTML += html;
        });

        if(window.feather) { feather.replace(); }

        setTimeout(() => {
            metricsContainer.querySelectorAll('[data-target]').forEach(bar => {
                bar.style.width = bar.getAttribute('data-target') + '%';
            });
        }, 100);
    }

    window.currentActiveIngredients = Array.isArray(data.activeIngredients) ? data.activeIngredients : [];
    window.currentWorstMetrics = [
        { id: 'sebum', score: parseInt(data.sebum) || 60, health: 100 - (parseInt(data.sebum) || 60) },
        { id: 'pores', score: parseInt(data.pores) || 60, health: 100 - (parseInt(data.pores) || 60) },
        { id: 'pigmentation', score: parseInt(data.pigmentation) || 50, health: 100 - (parseInt(data.pigmentation) || 50) },
        { id: 'moisture', score: parseInt(data.moisture) || 60, health: parseInt(data.moisture) || 60 },
        { id: 'elasticity', score: parseInt(data.elasticity) || 65, health: parseInt(data.elasticity) || 65 }
    ].sort((a, b) => a.health - b.health).slice(0, 2);
    window.currentRoutineIds = [];
    window.excludedRoutineIds = new Set();

    buildRoutine('routine-morning', true);
    buildRoutine('routine-evening', false);
    
    renderProductRecommendations();
    
    const skinAgeText = document.getElementById('skin-age-text');
    if (skinAgeText) {
        let skinAge = parseInt(data.skinAge);
        if (!skinAge || isNaN(skinAge)) {
            const health = targetScore;
            const elasticity = parseInt(data.elasticity) || 65;
            skinAge = Math.round(38 - (health * 0.1) - (elasticity * 0.1));
        }
        skinAgeText.innerText = skinAge;
    }

    const concernTitle = document.getElementById('concern-title');
    const concernDesc = document.getElementById('concern-desc');
    
    let m = [
        { id: 'sebum', score: parseInt(data.sebum) || 60 },
        { id: 'pigment', score: parseInt(data.pigmentation) || 50 },
        { id: 'pores', score: parseInt(data.pores) || 60 },
        { id: 'moisture', score: parseInt(data.moisture) || 60 },
        { id: 'elasticity', score: parseInt(data.elasticity) || 65 }
    ];
    let sortedMetrics = [...m].sort((a,b) => {
        let healthA = (a.id === 'sebum' || a.id === 'pores' || a.id === 'pigment') ? (100 - a.score) : a.score;
        let healthB = (b.id === 'sebum' || b.id === 'pores' || b.id === 'pigment') ? (100 - b.score) : b.score;
        return healthA - healthB; 
    });
    
    let worst1 = sortedMetrics[0] || {id: 'sebum'};
    let worst2 = sortedMetrics[1] || {id: 'pigment'};
    
    const translateConcern = (id) => {
        if(id === 'sebum') return "Bã nhờn vùng chữ T";
        if(id === 'pigment') return "Sắc tố ẩn UV";
        if(id === 'pores') return "Lỗ chân lông to";
        if(id === 'moisture') return "Thiếu ẩm bề mặt";
        if(id === 'elasticity') return "Độ đàn hồi suy giảm";
        return id;
    };
    
    if (concernTitle && concernDesc) {
        concernTitle.innerText = `${translateConcern(worst1.id)} & ${translateConcern(worst2.id)}`;
        concernDesc.innerText = `Điểm da tổng thể là ${targetScore}/100. Bạn nên ưu tiên cân bằng ${translateConcern(worst1.id).toLowerCase()} và ${translateConcern(worst2.id).toLowerCase()} bằng một routine dịu nhẹ, đều đặn.`;
    }

    const moistureH = parseInt(data.moisture) || 60;
    const sebumH = Math.max(10, 100 - (parseInt(data.sebum) || 60));
    const poresH = Math.max(10, 100 - (parseInt(data.pores) || 60));
    const pigmentH = Math.max(10, 100 - (parseInt(data.pigmentation) || 50));
    const elasticityH = parseInt(data.elasticity) || 65;
    const melasmaH = parseInt(data.melasma) || Math.max(15, pigmentH - 10);
    const eyeWrinklesH = parseInt(data.eyeWrinkles) || Math.round(elasticityH * 0.95);
    const nasolabialFoldsH = parseInt(data.nasolabialFolds) || Math.round(elasticityH * 0.9);
    const rednessH = parseInt(data.redness) || Math.round(moistureH * 0.7 + 25);

    scrollScanWorkspaceToTop();

    // Persist the report independently from the optional chart library. A chart
    // rendering failure must never make a completed scan disappear from Profile.
    const authState = readModernAuth();
    if (authState.isAuthenticated && window.lastSavedSkinReportSeed !== reportSeed) {
        const currentUser = authState.user || {};
        const routineProducts = (window.currentRoutineProducts && window.currentRoutineProducts.length > 0)
            ? window.currentRoutineProducts
            : (window.currentRoutineIds ? PRODUCTS.filter(p => window.currentRoutineIds.includes(p.id)) : []);
        const report = {
            userName: currentUser.name,
            healthScore: targetScore,
            skinType: data.skinTypeSummary || 'Da hỗn hợp',
            skinAge: parseInt(data.skinAge) || 25,
            primaryConcerns: data.activeIngredients || [],
            overallGrade: data.overallGrade || 'B',
            overallGradeComment: data.overallGradeComment || 'Làn da ở mức ổn định',
            analysis3Angles: data.analysis3Angles || '',
            fullAnalysis: data,
            metrics: {
                moisture: data.moisture,
                sebum: data.sebum,
                pores: data.pores,
                pigmentation: data.pigmentation,
                elasticity: data.elasticity,
                melasma: data.melasma,
                eyeWrinkles: data.eyeWrinkles,
                nasolabialFolds: data.nasolabialFolds,
                redness: data.redness,
                acneBacteria: data.acneBacteria,
                texture: data.texture,
                darkCircles: data.darkCircles
            },
            recommendedRoutine: window.currentRoutineIds || [],
            recommendedRoutineProducts: routineProducts
        };
        window.lastSavedSkinReportSeed = reportSeed;
        saveModernSkinReport(report, {
            userName: currentUser.name,
            healthScore: targetScore,
            skinType: data.skinTypeSummary || 'Da hỗn hợp',
            skinAge: parseInt(data.skinAge) || 25,
            recommendedRoutineProducts: routineProducts
        }).catch(error => {
            window.lastSavedSkinReportSeed = '';
            console.error('[SkinID history]', error);
        });
    }

    const ctxRadar = document.getElementById('radarChart');
    if (ctxRadar && typeof Chart !== 'undefined') {
        if (window.skinRadarChart) window.skinRadarChart.destroy();

        const acneBacteriaH = parseInt(data.acneBacteria) || Math.round(sebumH * 0.8 + 15);
        const textureH = parseInt(data.texture) || Math.round((moistureH + poresH) / 2);
        const darkCirclesH = parseInt(data.darkCircles) || Math.round((targetScore + pigmentH) / 2);

        const radarData = {
            labels: [
                'Độ ẩm (Hydration)', 'Dầu thừa (Sebum)', 'Lỗ chân lông (Pores)', 'Sắc tố UV', 
                'Sạm nám', 'Đàn hồi (Elasticity)', 'Nhăn đuôi mắt', 'Rãnh cười', 
                'Đỏ da (Redness)', 'Khuẩn mụn', 'Kết cấu (Texture)', 'Quầng thâm'
            ],
            datasets: [{
                label: 'Sức khỏe cấu trúc da',
                data: [
                    moistureH, sebumH, poresH, pigmentH, 
                    melasmaH, elasticityH, eyeWrinklesH, nasolabialFoldsH, 
                    rednessH, acneBacteriaH, textureH, darkCirclesH
                ],
                backgroundColor: 'rgba(232, 122, 144, 0.2)',
                borderColor: 'rgba(232, 122, 144, 1)',
                pointBackgroundColor: 'rgba(232, 122, 144, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(232, 122, 144, 1)',
                borderWidth: 2,
            }]
        };

        window.skinRadarChart = new Chart(ctxRadar, {
            type: 'radar',
            data: radarData,
            options: {
                scales: {
                    r: {
                        angleLines: { color: 'rgba(0,0,0,0.05)' },
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        pointLabels: {
                            font: { size: 10, family: "'Inter', sans-serif", weight: '600' },
                            color: '#4A5568'
                        },
                        ticks: { display: false, min: 0, max: 100 }
                    }
                },
                plugins: { legend: { display: false } },
                elements: { line: { tension: 0.3 } }
            }
        });
        
        const envMetrics = document.getElementById('environment-metrics');
        if (envMetrics) {
            const temp = (weatherData && (weatherData.tempC ?? weatherData.temp)) || 31;
            const humidity = (weatherData && weatherData.humidity) || 78;
            const uvIndex = (weatherData && weatherData.uvIndex) || 7;
            const isRealtime = weatherData && weatherData.temp;
            
            envMetrics.innerHTML = `
                <div class="scan-env-stat">
                    <p class="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Nhiệt độ</p>
                    <p class="font-bold text-gray-800 text-lg">${temp}°C</p>
                </div>
                <div class="scan-env-stat">
                    <p class="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Độ ẩm</p>
                    <p class="font-bold text-gray-800 text-lg">${humidity}%</p>
                </div>
                <div class="scan-env-stat scan-env-stat--uv">
                    <p class="text-[10px] text-orange-500 uppercase tracking-wider font-semibold">Tia UV</p>
                    <p class="font-bold text-orange-600 text-lg">${uvIndex}</p>
                </div>
            `;
            
            let impactText = "Thời tiết ổn định, phù hợp để duy trì chu trình dưỡng da hiện tại.";
            if (uvIndex > 7 && humidity > 75) {
                impactText = "Tác động: Tia UV và độ ẩm cao đang kích thích tuyến bã nhờn hoạt động mạnh, làm tăng nguy cơ bít tắc lỗ chân lông và sạm nám ẩn.";
            } else if (uvIndex > 5 && temp > 30) {
                impactText = "Tác động: Nắng nóng và tia UV ở mức trung bình-cao. Cần chống nắng SPF50+ và tăng cấp ẩm.";
            } else if (temp > 32) {
                impactText = "Tác động: Nhiệt độ cao làm da mất nước nhanh, cần tăng cường cấp ẩm và chống nắng.";
            } else if (humidity < 50) {
                impactText = "Tác động: Độ ẩm thấp khiến da dễ khô, cần tăng cường serum cấp ẩm và kem dưỡng khóa ẩm.";
            }
            document.getElementById('environment-impact').innerText = impactText;
        }


        // --- NEW: ROOT CAUSE & FORECAST ---
        const METRIC_DETAILS = {
            'sebum': {
                name: 'Dầu thừa (Sebum)',
                cause: 'Tuyến bã nhờn hoạt động quá mức do màng lipid bề mặt bị tổn thương, khiến da mất nước và cơ thể phải tiết dầu để bù ẩm.',
                forecast: 'Nếu không cân bằng lại dầu và độ ẩm, lỗ chân lông có thể trông rõ hơn và da dễ xuất hiện bít tắc.'
            },
            'pigment': {
                name: 'Sắc tố UV',
                cause: 'Hắc sắc tố Melanin dưới đáy hạ bì bị kích thích đẩy lên liên tục do bức xạ mặt trời phá hủy tế bào.',
                forecast: 'Sắc tố có thể đậm và kém đồng đều hơn nếu da tiếp tục tiếp xúc tia UV mà không được bảo vệ đầy đủ.'
            },
            'pores': {
                name: 'Lỗ chân lông to',
                cause: 'Sự tích tụ tế bào chết và bã nhờn lâu ngày làm bít tắc cổ nang lông, kết hợp với sự suy giảm collagen quanh nang lông.',
                forecast: 'Bề mặt da có thể sần và dễ bít tắc hơn; nên ưu tiên làm sạch dịu nhẹ và chăm sóc đều đặn.'
            },
            'moisture': {
                name: 'Độ ẩm bề mặt',
                cause: 'Hàng rào bảo vệ da (Skin Barrier) bị nứt gãy khiến nước bốc hơi nhanh chóng (TEWL) ra ngoài môi trường.',
                forecast: 'Da có thể khô căng, bong nhẹ và nhạy cảm hơn nếu hàng rào bảo vệ chưa được phục hồi.'
            },
            'elasticity': {
                name: 'Độ đàn hồi',
                cause: 'Mạng lưới sợi Collagen và Elastin bị đứt gãy do tuổi tác, tia UV hoặc gốc tự do phá hoại mà không được tổng hợp bù đắp.',
                forecast: 'Độ săn chắc có thể giảm dần; chống nắng, ngủ đủ và routine phù hợp sẽ hỗ trợ duy trì cấu trúc da.'
            }
        };

        const rcaContainer = document.getElementById('root-cause-analysis');
        const forecastText = document.getElementById('skin-forecast-text');
        
        if (rcaContainer && forecastText) {
            const getDetail = (id) => METRIC_DETAILS[id] || { 
                name: translateConcern(id), 
                cause: 'Rối loạn chức năng tế bào hoặc tổn thương do môi trường.', 
                forecast: 'Trở ngại lớn cho việc hấp thụ dưỡng chất, khiến da xỉn màu và nhanh lão hóa.' 
            };
            
            const detail1 = getDetail(worst1.id);
            const detail2 = getDetail(worst2.id);

            rcaContainer.innerHTML = `
                <div class="scan-cause-item scan-cause-item--primary p-4">
                    <h5 class="font-bold text-red-800 mb-1 flex items-center gap-2">
                        <i data-feather="alert-triangle" class="w-4 h-4"></i> ${detail1.name}
                    </h5>
                    <p class="text-sm text-red-700 leading-relaxed"><span class="font-semibold">Cơ chế:</span> ${detail1.cause}</p>
                </div>
                <div class="scan-cause-item scan-cause-item--secondary p-4">
                    <h5 class="font-bold text-orange-800 mb-1 flex items-center gap-2">
                        <i data-feather="alert-circle" class="w-4 h-4"></i> ${detail2.name}
                    </h5>
                    <p class="text-sm text-orange-700 leading-relaxed"><span class="font-semibold">Cơ chế:</span> ${detail2.cause}</p>
                </div>
            `;
            
            forecastText.innerHTML = `Nếu duy trì thói quen hiện tại: <br><br> 1. ${detail1.forecast} <br> 2. ${detail2.forecast} <br><br> Hãy bắt đầu từ một routine dịu nhẹ, theo dõi phản ứng của da và tham khảo bác sĩ da liễu khi có dấu hiệu bất thường.`;
            
            if (typeof feather !== 'undefined') {
                setTimeout(() => feather.replace(), 100);
            }
        }

        // --- NEW: DETAILED METRICS GRID ---
        const detailedGrid = document.getElementById('detailed-metrics-grid');
        if (detailedGrid && typeof radarData !== 'undefined') {
            let detailedHtml = '';
            const labels = radarData.labels;
            const values = radarData.datasets[0].data;
            
            for (let i = 0; i < labels.length; i++) {
                const label = labels[i];
                const score = Math.round(values[i]);
                
                detailedHtml += `
                    <div class="scan-metric-item flex flex-col gap-1.5">
                        <div class="flex justify-between items-center text-sm">
                            <span class="font-semibold text-gray-700">${label}</span>
                            <span class="scan-metric-value font-bold">${score}/100</span>
                        </div>
                        <div class="scan-metric-track">
                            <div class="scan-metric-fill" style="width: ${score}%"></div>
                        </div>
                    </div>
                `;
            }
            detailedGrid.innerHTML = detailedHtml;
        }




        const radarInsights = document.getElementById('radar-insights');
        if(radarInsights) {
            radarInsights.innerHTML = `
                <div class="scan-insight-item flex items-center gap-3 p-3 mb-2">
                    <div class="scan-insight-dot"></div>
                    <span class="text-sm font-medium">${translateConcern(worst1.id)} là chỉ số nên được ưu tiên theo dõi.</span>
                </div>
                <div class="scan-insight-item flex items-center gap-3 p-3">
                    <div class="scan-insight-dot"></div>
                    <span class="text-sm font-medium">${translateConcern(worst2.id)} cần được chăm sóc ổn định và đánh giá lại.</span>
                </div>
            `;
        }
    }

    // smooth scroll to top of modal
    scrollScanWorkspaceToTop();
}


function calcMatchScore(product, targetConcerns) {
    let score = 88;
    if (product && product.targetConcerns && targetConcerns) {
        product.targetConcerns.forEach(c => {
            if (targetConcerns.includes(c)) score += 3;
        });
    }
    if (product && product.mainActives && window.currentActiveIngredients) {
        product.mainActives.forEach(act => {
            if (window.currentActiveIngredients.some(ai => ai.toLowerCase().includes(act.toLowerCase()))) score += 2;
        });
    }
    return Math.min(99, Math.max(86, score));
}

function buildRoutine(containerId, isMorning) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    
    // Target concerns from worst metrics
    const targetConcerns = [];
    if (window.currentWorstMetrics) {
        window.currentWorstMetrics.forEach(m => {
            if (m.id === 'sebum' || m.id === 'acne') targetConcerns.push('acne', 'sebum');
            if (m.id === 'pores') targetConcerns.push('pores', 'sebum');
            if (m.id === 'pigmentation' || m.id === 'uv_spots') targetConcerns.push('pigmentation', 'uv_spots');
            if (m.id === 'moisture') targetConcerns.push('moisture', 'dehydration');
            if (m.id === 'elasticity' || m.id === 'wrinkles') targetConcerns.push('aging', 'elasticity', 'wrinkles');
            if (m.id === 'redness') targetConcerns.push('redness', 'sensitivity');
        });
    }
    if (targetConcerns.length === 0) targetConcerns.push('moisture', 'aging');

    const activeIngredients = window.currentActiveIngredients || ['Hyaluronic Acid', 'Niacinamide'];

    let steps = [];
    if (isMorning) {
        steps = [
            { stepType: 'cleanser', title: "Bước 1: Làm sạch & Cân bằng", desc: "Loại bỏ dầu thừa đêm qua và ổn định độ pH" },
            { stepType: 'treatment', title: "Bước 2: Tinh chất đặc trị", desc: "Thẩm thấu sâu khắc phục vấn đề da hàng đầu" },
            { stepType: 'sunscreen', title: "Bước 3: Bảo vệ phổ rộng (SPF 50+)", desc: "Bảo vệ màng tế bào trước tia UVA/UVB và gốc tự do" }
        ];
    } else {
        steps = [
            { stepType: 'cleanser', title: "Bước 1: Làm sạch sâu & Tẩy trang", desc: "Hút sạch bụi mịn PM2.5 và bã nhờn tích tụ" },
            { stepType: 'treatment', title: "Bước 2: Đặc trị & Phục hồi chuyên sâu", desc: "Tái tạo liên kết tế bào trong giấc ngủ" },
            { stepType: 'moisturizer', title: "Bước 3: Khóa ẩm & Tái thiết lập màng Lipid", desc: "Chống mất nước qua biểu bì và củng cố hàng rào bảo vệ" }
        ];
    }
    
    steps.forEach((step, idx) => {
        const product = matchProductForStep(step.stepType, targetConcerns, activeIngredients, currentBudget);
        if (product) {
            window.currentRoutineIds.push(product.id);
            const matchScore = calcMatchScore(product, targetConcerns);
            container.appendChild(createProductCard(product, {
                variant: 'horizontal', step: step.title, matchScore
            }));
        }
    });
    
    if (window.feather) feather.replace();
}



function renderProductRecommendations() {
    const container = document.getElementById('product-recommendations');
    if (!container) return;
    container.innerHTML = '';
    
    const uniqueIds = [...new Set(window.currentRoutineIds)];
    
    uniqueIds.forEach(id => {
        const p = PRODUCTS.find(prod => prod.id === id);
        if (!p) return;
        
        container.appendChild(createProductCard(p));
    });
    
    if(window.feather) { feather.replace(); }
}


function addAllToCart() {
    const uniqueIds = [...new Set(window.currentRoutineIds)].filter(id => !window.excludedRoutineIds?.has(id));
    if (!uniqueIds.length) {
        showToast('Vui lòng chọn ít nhất một sản phẩm trong phác đồ.');
        return;
    }
    document.dispatchEvent(new CustomEvent('skinid:cart-add-many', { detail: { productIds: uniqueIds } }));
    showToast(`Đã thêm ${uniqueIds.length} sản phẩm vào giỏ hàng!`);
}


// BOOTSTRAP INITIALIZATION
function bootstrapApp() {
    console.log("SkinID App Bootstrapping with", PRODUCTS.length, "products...");
    initCatalog();
    initScanSetup();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapApp);
} else {
    bootstrapApp();
}
