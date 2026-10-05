function compactActiveLabel(value) {
        const text = String(value || '').split(':')[0].replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
        const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
        if (!normalized || normalized.startsWith('KHONG SU DUNG')) return '';
        const curatedLabels = [
            ['HOA SEN', 'Hoa sen'], ['HUONG PHAN', 'Hương phấn'], ['HOA TRANG', 'Hoa trắng'],
            ['TRAI CAY', 'Trái cây'], ['GO TRAM', 'Gỗ trầm'], ['GO GU', 'Hương gỗ'],
            ['THAO MOC', 'Thảo mộc'], ['VANI', 'Vani'], ['TINH DAU', 'Tinh dầu'],
            ['VITAMIN E', 'Vitamin E'], ['CERAMIDE', 'Ceramide'], ['GLYCERIN', 'Glycerin'],
            ['PANTHENOL', 'Panthenol'], ['NIACINAMIDE', 'Niacinamide'],
            ['HYALURONIC', 'Hyaluronic acid'], ['SALICYLIC', 'Salicylic acid'], ['SODIUM DNA', 'Sodium DNA']
        ];
        const match = curatedLabels.find(([keyword]) => normalized.includes(keyword));
        if (match) return match[1];
        const compact = text.split(' ').filter(word => word && word !== '&').slice(0, 3).join(' ').toLocaleLowerCase('vi-VN');
        return compact.replace(/^\p{Ll}/u, character => character.toLocaleUpperCase('vi-VN'));
}

function productDisplayName(product) {
        const name = String(product.name || '')
            .replace(/\s*\d+(?:[.,]\d+)?\s*(?:ml|gr|kg|g|l)\b/gi, '')
            .replace(/\s+([–—-])\s+/g, ' $1 ')
            .replace(/\s+/g, ' ')
            .trim();

        let displayName = name.toLocaleLowerCase('vi-VN');

        displayName = displayName.replace(/^\p{Ll}/u, character => character.toLocaleUpperCase('vi-VN'));
        displayName = displayName.replace(/([–—-]\s*)\p{Ll}/gu, segment => segment.toLocaleUpperCase('vi-VN'));

        const preferredCasing = [
            [/(^|\s)d'vah(?=\s|$)/giu, "$1D'VAH"],
            [/\brilastil\b/giu, 'Rilastil'], [/\btwon\b/giu, 'TWON'],
            [/\bkamal\b/giu, 'Kamal'], [/\bmalini\b/giu, 'Malini'],
            [/\brakta\b/giu, 'Rakta'], [/\bsarika\b/giu, 'Sarika'], [/\btanmaya\b/giu, 'Tanmaya'],
            [/\bspf\b/giu, 'SPF'], [/\bdna\b/giu, 'DNA'], [/\bpb\b/giu, 'PB']
        ];
        preferredCasing.forEach(([pattern, replacement]) => {
            displayName = displayName.replace(pattern, replacement);
        });
        return displayName;
}

function productBenefit(product) {
        const brand = String(product.brand || '').toLocaleLowerCase('vi-VN');
        const step = String(product.stepType || '').toLocaleLowerCase('vi-VN');
        if (brand.includes("d'vah") || brand.includes('dvah')) return 'Hương thơm tinh tế · Tiện mang theo mỗi ngày';
        if (brand.includes('twon')) return 'Nuôi dưỡng cơ thể · Mềm mịn và lưu hương';
        const benefits = {
            cleanser: 'Làm sạch dịu nhẹ · Duy trì hàng rào ẩm',
            toner: 'Cân bằng da · Chuẩn bị cho bước dưỡng',
            balance: 'Cân bằng da · Làm dịu và cấp ẩm',
            treatment: 'Chăm sóc chuyên sâu · Cải thiện dấu hiệu da',
            special: 'Tác động chuyên biệt · Hỗ trợ phục hồi da',
            moisturizer: 'Cấp ẩm sâu · Củng cố hàng rào bảo vệ',
            sunscreen: 'Bảo vệ phổ rộng · Hạn chế tác động tia UV',
            body: 'Nuôi dưỡng cơ thể · Da mềm mại hơn'
        };
        return benefits[step] || 'Chăm sóc da hằng ngày · Công thức chuyên biệt';
}

function productSocialProof(product) {
        const rating = Number(product.rating);
        const reviews = Number(product.reviewCount);
        const sold = Number(product.soldCount);
        if (!Number.isFinite(rating) || rating <= 0) return '';
        const soldText = sold > 0 ? ` · Đã bán ${sold >= 1000 ? `${(sold / 1000).toFixed(sold % 1000 === 0 ? 0 : 1)}k` : sold}` : '';
        return `<div class="product-card__social" aria-label="Đánh giá ${rating.toFixed(1)} trên 5">
            <span class="product-card__star">★</span> ${rating.toFixed(1)}${reviews > 0 ? ` (${reviews})` : ''}${soldText}
        </div>`;
}

// Shared catalog card; horizontal mode adds routine-specific selection controls.
function createProductCard(p, options = {}) {
        const imgSrc = (p.image.startsWith('http') || p.image.startsWith('data:'))
            ? p.image
            : (window.SKINID_ASSET_URL ? window.SKINID_ASSET_URL(p.image, p.brandSlug) : p.image);
        
        // Badges for main actives
        let activesBadges = '';
        if (p.mainActives && p.mainActives.length > 0) {
            activesBadges = p.mainActives.slice(0, 2).map(compactActiveLabel).filter(Boolean).join(' · ');
        }
        const medicalLine = [p.line, activesBadges].filter(Boolean).join(' · ');
        const benefit = productBenefit(p);
        const socialProof = productSocialProof(p);

        // Promotion / Tag Badge
        let promoBadge = '';
        if (p.originalPrice && p.originalPrice > p.price) {
            const discount = Math.round((1 - p.price / p.originalPrice) * 100);
            promoBadge = `<span class="product-card__discount">−${discount}%</span>`;
        }

        const displayName = productDisplayName(p);

        const card = document.createElement('div');
        card.className = 'product-card bg-white rounded-2xl flex flex-col h-full relative group overflow-hidden cursor-pointer';
        card.onclick = (e) => {
            if (e.target.closest('button, input, label')) return; // Ignore if clicked on Add to Cart button
            openProductDetailModal(p.id);
        };

        card.innerHTML = `
            <div class="product-card__badge-layer">
                ${p.tier ? `<span class="product-card__tier-label">${p.tier}</span>` : ''}
                ${promoBadge}
            </div>
            <div class="product-card__media">
                <img src="${imgSrc}" alt="${p.name}" loading="lazy"
                     class="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 ease-in-out"
                     onerror="if(this.dataset.fallback!=='true'&&'${p.originalImageUrl||''}'){this.dataset.fallback='true';this.src='${p.originalImageUrl}';}else{this.outerHTML='<div class=\\\'w-full h-full missing-image-placeholder text-center px-4 flex items-center justify-center text-xs text-gray-400 font-semibold\\\'>${p.brand}</div>';}">
            </div>
            
            <div class="product-card__content">
                <div class="product-card__actives">${medicalLine}</div>
                <div class="flex-grow">
                    <div class="product-card__title-row">
                        <h4 class="product-card__name">${displayName}</h4>
                    </div>
                    <p class="product-card__benefit">${benefit}</p>
                    ${socialProof}
                </div>
                <div class="product-card__footer">
                    <div class="product-card__price-row">
                        <div class="product-card__prices">
                            <span class="product-card__price">${formatPrice(p.price)}</span>
                            ${p.originalPrice && p.originalPrice > p.price ? `<span class="product-card__original-price">${formatPrice(p.originalPrice)}</span>` : ''}
                            ${p.volume ? `<span class="product-card__volume">${p.volume}</span>` : ''}
                        </div>
                    </div>
                    <div class="product-card__actions">
                        <button data-cart-product-id="${p.id}" class="product-card__cart-button" aria-label="Thêm ${displayName} vào giỏ" title="Thêm vào giỏ">
                            <i data-feather="shopping-bag"></i><span>Thêm vào giỏ</span>
                        </button>
                        <button data-buy-product-id="${p.id}" class="product-card__buy-button" aria-label="Mua ngay ${displayName}" title="Mua ngay">
                            <span>Mua ngay</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        const cartButton = card.querySelector('[data-cart-product-id]');
        if (cartButton) cartButton.onclick = event => {
            event.stopPropagation();
            document.dispatchEvent(new CustomEvent('skinid:cart-add', { detail: { productId: p.id, quantity: 1 } }));
            if (typeof showToast === 'function') showToast('Đã thêm sản phẩm vào giỏ hàng!');
        };
        const buyButton = card.querySelector('[data-buy-product-id]');
        if (buyButton) buyButton.onclick = event => {
            event.stopPropagation();
            document.dispatchEvent(new CustomEvent('skinid:buy-now', { detail: { productId: p.id, quantity: 1 } }));
        };

        const detailLink = document.createElement('button');
        detailLink.type = 'button';
        detailLink.className = 'product-card__title-link';
        detailLink.textContent = displayName;
        detailLink.onclick = () => openProductDetailModal(p.id);
        card.querySelector('.product-card__name').replaceChildren(detailLink);

        if (options.variant === 'horizontal') {
            card.classList.add('product-card--horizontal');
            card.querySelector('.product-card__badge-layer').remove();
            card.querySelector('.product-badge--tier')?.remove();
            card.querySelector('.product-card__actions').remove();
            const content = card.querySelector('.product-card__content');
            const step = document.createElement('div');
            step.className = 'product-card__step';
            const stepText = document.createElement('span');
            stepText.textContent = options.step;
            const match = document.createElement('span');
            match.className = 'product-card__match';
            match.textContent = 'Khớp ' + options.matchScore + '%';
            step.append(stepText, match);
            content.prepend(step);
            content.append(card.querySelector('.product-card__actives'));
            const actions = card.querySelector('.product-card__footer');
            actions.classList.add('product-card__selection');
            card.append(actions);
            const controls = document.createElement('div');
            controls.className = 'product-card__controls';
            const info = document.createElement('button');
            info.type = 'button';
            info.className = 'product-card__info';
            info.setAttribute('aria-label', 'Chi tiết ' + p.name);
            info.innerHTML = '<i data-feather="info"></i>';
            info.onclick = () => openProductDetailModal(p.id);
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = !window.excludedRoutineIds?.has(p.id);
            checkbox.dataset.routineProduct = p.id;
            checkbox.setAttribute('aria-label', 'Chọn ' + p.name + ' vào giỏ');
            checkbox.onchange = () => {
                window.excludedRoutineIds ||= new Set();
                if (checkbox.checked) window.excludedRoutineIds.delete(p.id);
                else window.excludedRoutineIds.add(p.id);
                document.querySelectorAll('[data-routine-product]').forEach(input => {
                    if (input.dataset.routineProduct === p.id) input.checked = checkbox.checked;
                });
            };
            controls.append(info, checkbox);
            actions.append(controls);
        }
        return card;
}
