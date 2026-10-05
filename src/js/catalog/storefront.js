/* SkinID storefront presentation layer.
 * Keeps navigation, merchandising and consultation interactions separate from
 * the product catalogue and service prototypes.
 */
(function () {
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    function scrollToCatalog() {
        ($('#featured-products') || $('#catalog'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function syncPrimaryNavigation(step = 'all') {
        $$('.desktop-nav a').forEach((link) => {
            const navStep = link.dataset.navStep;
            const navTarget = link.dataset.navTarget;
            const key = navStep || navTarget;
            const isActive = key === step;
            link.classList.toggle('is-active', isActive);
            if (isActive) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });
        window.dispatchEvent(new CustomEvent('skinid:nav-sync', { detail: step }));
    }

    function chooseFilterButton(selector, dataName, value) {
        const buttons = $$(selector);
        return buttons.find((button) => button.dataset[dataName] === value) || null;
    }

    function applyCatalogState({ brand = 'all', step = 'all', benefit = 'all', query = '' } = {}) {
        if (window.location.pathname !== '/products') {
            const params = new URLSearchParams();
            if (brand !== 'all') params.set('brand', String(brand).toLowerCase());
            if (step !== 'all') params.set('step', step);
            if (benefit !== 'all') params.set('benefit', benefit);
            if (query) params.set('search', query);
            window.location.href = '/products' + (params.size ? '?' + params : '');
            return;
        }
        const brandButton = chooseFilterButton('#brand-filters .filter-btn', 'brand', String(brand).toLowerCase());
        const stepButton = chooseFilterButton('#step-filters .step-filter-btn', 'step', step);
        const searchInput = $('#product-search');
        const brandSelect = $('#brand-filter-select');
        const stepSelect = $('#step-filter-select');
        const benefitSelect = $('#benefit-filter-select');

        if (typeof filterByBrand === 'function') filterByBrand(brand, brandButton);
        if (typeof filterByStep === 'function') filterByStep(step, stepButton);
        if (typeof filterByBenefit === 'function') filterByBenefit(benefit);
        if (searchInput) searchInput.value = query;
        if (brandSelect) brandSelect.value = String(brand).toLowerCase();
        if (stepSelect) stepSelect.value = step;
        if (benefitSelect) benefitSelect.value = benefit;
        window.syncCatalogDropdown?.(brandSelect);
        window.syncCatalogDropdown?.(stepSelect);
        window.syncCatalogDropdown?.(benefitSelect);
        syncPrimaryNavigation(step);
        if (typeof currentSearchQuery !== 'undefined') currentSearchQuery = query;
        if (typeof renderCatalog === 'function') renderCatalog();
        scrollToCatalog();
    }

    function setupCatalogDropdowns() {
        const dropdowns = $$('[data-catalog-dropdown]');
        const closeAll = (except = null) => dropdowns.forEach((dropdown) => {
            if (dropdown === except) return;
            dropdown.querySelector('.catalog-dropdown__panel')?.setAttribute('hidden', '');
            dropdown.querySelector('.catalog-dropdown__trigger')?.setAttribute('aria-expanded', 'false');
        });
        const sync = (input) => {
            if (!input) return;
            const dropdown = input.closest('[data-catalog-dropdown]');
            if (!dropdown) return;
            const options = $$('[data-dropdown-value]', dropdown);
            const selected = options.find((option) => option.dataset.dropdownValue === input.value) || options[0];
            const defaultLabel = dropdown.dataset.defaultLabel;
            const selectedLabel = selected?.textContent?.replace('✓', '').trim() || '';
            dropdown.querySelector('[data-dropdown-label]').textContent = input.value === 'all' && defaultLabel ? defaultLabel : selectedLabel;
            options.forEach((option) => {
                const isActive = option === selected;
                option.classList.toggle('is-active', isActive);
                option.setAttribute('aria-selected', String(isActive));
            });
        };
        window.syncCatalogDropdown = sync;
        dropdowns.forEach((dropdown) => {
            const input = $('input[type="hidden"]', dropdown);
            const trigger = $('.catalog-dropdown__trigger', dropdown);
            const panel = $('.catalog-dropdown__panel', dropdown);
            const options = $$('[data-dropdown-value]', dropdown);
            const open = () => {
                closeAll(dropdown);
                panel.hidden = false;
                trigger.setAttribute('aria-expanded', 'true');
            };
            const close = () => {
                panel.hidden = true;
                trigger.setAttribute('aria-expanded', 'false');
            };
            trigger.addEventListener('click', () => panel.hidden ? open() : close());
            trigger.addEventListener('keydown', (event) => {
                if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
                event.preventDefault();
                open();
                (options.find((option) => option.classList.contains('is-active')) || options[0])?.focus();
            });
            panel.addEventListener('keydown', (event) => {
                const current = options.indexOf(document.activeElement);
                if (event.key === 'Escape') { close(); trigger.focus(); return; }
                if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
                event.preventDefault();
                const direction = event.key === 'ArrowDown' ? 1 : -1;
                options[(current + direction + options.length) % options.length]?.focus();
            });
            options.forEach((option) => option.addEventListener('click', () => {
                input.value = option.dataset.dropdownValue;
                sync(input);
                input.dispatchEvent(new Event('change', { bubbles: true }));
                close();
                trigger.focus();
            }));
            sync(input);
        });
        document.addEventListener('click', (event) => {
            if (!event.target.closest('[data-catalog-dropdown]')) closeAll();
        });
    }
    function setupMerchandisingLinks() {
        $$('.desktop-nav a[data-nav-target]').forEach((link) => {
            link.addEventListener('click', (event) => {
                const targetId = link.dataset.navTarget;
                syncPrimaryNavigation(targetId);
                const section = document.getElementById(targetId);
                if (section) {
                    event.preventDefault();
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });


        $$('#categories .category-item, #categories [data-step]').forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                applyCatalogState({ step: button.dataset.step || 'all', benefit: 'all' });
            });
        });

        $$('.brand-cards [data-brand]').forEach((button) => {
            button.addEventListener('click', () => {
                applyCatalogState({ brand: button.dataset.brand, benefit: 'all' });
            });
        });

        $$('.concern-card').forEach((button) => {
            button.addEventListener('click', () => {
                applyCatalogState({
                    brand: 'all',
                    step: 'all',
                    benefit: button.dataset.benefit || 'all',
                    query: ''
                });
            });
        });

        $$('.routine-step').forEach((button) => {
            button.addEventListener('click', () => {
                $$('.routine-step').forEach((item) => item.classList.remove('active'));
                button.classList.add('active');
                applyCatalogState({ step: button.dataset.step });
            });
        });
    }

    function setupSort() {
        const sort = $('#catalog-sort');
        if (!sort || typeof PRODUCTS === 'undefined') return;
        const initialOrder = new Map(PRODUCTS.map((product, index) => [product.id, index]));

        sort.addEventListener('change', () => {
            PRODUCTS.sort((a, b) => {
                if (sort.value === 'price-asc') return a.price - b.price;
                if (sort.value === 'price-desc') return b.price - a.price;
                return initialOrder.get(a.id) - initialOrder.get(b.id);
            });
            renderCatalog();
        });
        sort.dispatchEvent(new Event('change'));
    }

    function setupCarousel() {
        const carousel = $('#hero-carousel');
        if (!carousel) return;
        const slides = $$('.hero-slide', carousel);
        const dots = $$('[data-carousel-dot]', carousel);
        const brandTabs = $$('[data-brand-tab]');
        const carouselRotationMs = 5500;
        let activeIndex = 0;
        let timer = null;

        const showSlide = (index) => {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                const isActive = slideIndex === activeIndex;
                slide.classList.toggle('is-active', isActive);
                slide.setAttribute('aria-hidden', String(!isActive));
                $$('a, button', slide).forEach((control) => {
                    control.tabIndex = isActive ? 0 : -1;
                });
            });
            dots.forEach((dot, dotIndex) => {
                const isActive = dotIndex === activeIndex;
                dot.classList.toggle('is-active', isActive);
                dot.setAttribute('aria-selected', String(isActive));
            });
            brandTabs.forEach((tab) => {
                const isActive = Number(tab.dataset.activeSlide) === activeIndex;
                tab.classList.toggle('is-active', isActive);
                tab.setAttribute('aria-pressed', String(isActive));
            });
        };
        const stop = () => {
            if (timer !== null) window.clearTimeout(timer);
            timer = null;
        };

        // Every tab uses the same clock boundary. This prevents two browsers
        // from drifting to different hero banners simply because they opened
        // the page at different times.
        const syncedSlideIndex = () => Math.floor(Date.now() / carouselRotationMs) % slides.length;
        const start = () => {
            stop();
            if (document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            const delayToNextBoundary = carouselRotationMs - (Date.now() % carouselRotationMs) + 16;
            timer = window.setTimeout(() => {
                showSlide(syncedSlideIndex());
                start();
            }, delayToNextBoundary);
        };

        $('[data-carousel-prev]', carousel)?.addEventListener('click', () => { showSlide(activeIndex - 1); start(); });
        $('[data-carousel-next]', carousel)?.addEventListener('click', () => { showSlide(activeIndex + 1); start(); });
        dots.forEach((dot) => dot.addEventListener('click', () => { showSlide(Number(dot.dataset.carouselDot)); start(); }));
        brandTabs.forEach((tab) => tab.addEventListener('click', () => { showSlide(Number(tab.dataset.activeSlide)); start(); }));
        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        carousel.addEventListener('focusin', stop);
        carousel.addEventListener('focusout', start);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stop();
                return;
            }
            showSlide(syncedSlideIndex());
            start();
        });
        $$('[data-hero-brand]', carousel).forEach((button) => button.addEventListener('click', () => applyCatalogState({ brand: button.dataset.heroBrand })));
        showSlide(0);
        start();
    }

    window.toggleMobileMenu = function (force) {
        const menu = $('#mobile-menu');
        if (!menu) return;
        const shouldOpen = typeof force === 'boolean' ? force : menu.classList.contains('hidden');
        menu.classList.toggle('hidden', !shouldOpen);
    };

    window.handleHeaderSearch = function (value, submit) {
        const searchInput = $('#product-search');
        if (searchInput) {
            searchInput.value = value;
            if (typeof currentSearchQuery !== 'undefined') currentSearchQuery = value;
            if (typeof renderCatalog === 'function') renderCatalog();
            if (submit) scrollToCatalog();
            return;
        }
        if (submit && value.trim()) {
            window.location.href = `/products?search=${encodeURIComponent(value.trim())}`;
        }
    };

    let selectedConsultationStep = '';

    window.openConsultation = function () {
        $('#consultation-modal')?.classList.add('is-open');
        window.SkinIDScrollLock?.lock('consultation');
        setTimeout(() => $('.consult-option')?.focus(), 20);
    };

    window.closeConsultation = function () {
        $('#consultation-modal')?.classList.remove('is-open');
        window.SkinIDScrollLock?.unlock('consultation');
    };

    function setupConsultation() {
        const cta = $('#consultation-cta');
        const result = $('#consultation-result');
        const copyByStep = {
            'tri-mun-kiem-dau': '<strong>Gợi ý cấu trúc:</strong> Làm sạch dịu nhẹ → hoạt chất đặc trị kiểm soát dầu mụn → dưỡng phục hồi nhẹ thoáng → chống nắng kiềm dầu.',
            'cap-am-chuyen-sau': '<strong>Gợi ý cấu trúc:</strong> Làm sạch không khô căng → tinh chất cấp nước đa tầng → kem dưỡng khóa ẩm → chống nắng.',
            'sang-da-mo-tham': '<strong>Gợi ý cấu trúc:</strong> Làm sạch → tinh chất mờ thâm/chống oxy hóa → dưỡng ẩm đều màu → chống nắng phổ rộng.',
            'phuc-hoi-diu-da': '<strong>Gợi ý cấu trúc:</strong> Làm sạch tối giản → tinh chất làm dịu phục hồi → kem dưỡng củng cố hàng rào da → chống nắng dịu nhẹ.',
            treatment: '<strong>Gợi ý cấu trúc:</strong> Làm sạch dịu nhẹ → hoạt chất đặc trị phù hợp → dưỡng phục hồi → chống nắng mỗi sáng.',
            moisturizer: '<strong>Gợi ý cấu trúc:</strong> Làm sạch không khô căng → lớp cấp ẩm → kem dưỡng khóa ẩm → chống nắng.',
            sunscreen: '<strong>Gợi ý cấu trúc:</strong> Làm sạch → sản phẩm hỗ trợ đều màu/đàn hồi → dưỡng ẩm → chống nắng phổ rộng.'
        };

        $$('.consult-option').forEach((button) => {
            button.addEventListener('click', () => {
                $$('.consult-option').forEach((item) => item.classList.remove('active'));
                button.classList.add('active');
                selectedConsultationStep = button.dataset.consult;
                const benefitUrl = `/products?benefit=${encodeURIComponent(selectedConsultationStep)}`;
                if (result) {
                    result.innerHTML = `
                        <div class="result-header">
                            <span class="modal-kicker">Routine cho ${button.dataset.label}</span>
                            <a class="result-category-link" href="${benefitUrl}">Xem category ${button.dataset.label} ↗</a>
                        </div>
                        <p>${copyByStep[selectedConsultationStep] || ''}</p>
                    `;
                    result.classList.remove('hidden');
                }
                if (cta) {
                    cta.removeAttribute('disabled');
                    cta.classList.remove('is-disabled');
                    cta.setAttribute('aria-disabled', 'false');
                    cta.setAttribute('href', benefitUrl);
                    cta.textContent = `Xem sản phẩm theo yêu cầu (${button.dataset.label}) →`;
                }
            });
        });

        cta?.addEventListener('click', (event) => {
            if (!selectedConsultationStep || cta.getAttribute('aria-disabled') === 'true') {
                event.preventDefault();
                return;
            }
            const isBenefit = ['tri-mun-kiem-dau', 'cap-am-chuyen-sau', 'phuc-hoi-diu-da', 'sang-da-mo-tham', 'chong-lao-hoa'].includes(selectedConsultationStep);
            if (window.location.pathname === '/products') {
                event.preventDefault();
                closeConsultation();
                if (isBenefit) {
                    applyCatalogState({ brand: 'all', step: 'all', benefit: selectedConsultationStep, query: '' });
                } else {
                    applyCatalogState({ step: selectedConsultationStep });
                }
            } else {
                closeConsultation();
                // Let the anchor navigate directly to benefitUrl
            }
        });
    }

    const policies = {
        shipping: {
            eyebrow: 'Mua hàng an tâm',
            title: 'Giao hàng & đổi trả',
            body: '<p>Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500.000₫. Sản phẩm lỗi từ nhà sản xuất hoặc tem niêm phong không còn nguyên vẹn được hỗ trợ đổi trong 7 ngày kể từ khi nhận hàng.</p><p>Vui lòng giữ hóa đơn và quay video khi mở kiện để việc hỗ trợ diễn ra nhanh chóng.</p>'
        },
        privacy: {
            eyebrow: 'Quyền riêng tư',
            title: 'Bảo mật dữ liệu',
            body: '<p>SkinID chỉ sử dụng thông tin khách hàng để hỗ trợ tư vấn, xử lý đơn hàng và cung cấp trải nghiệm đã được khách hàng đồng ý.</p><p>Thông tin cá nhân không được kinh doanh hoặc chia sẻ cho bên thứ ba ngoài phạm vi cần thiết để cung cấp dịch vụ.</p>'
        },
        terms: {
            eyebrow: 'Thông tin sử dụng',
            title: 'Điều khoản & lưu ý',
            body: '<p>Nội dung tư vấn và gợi ý routine trên website mang tính chất tham khảo. Sản phẩm chăm sóc da không phải là thuốc và không thay thế chẩn đoán, điều trị y khoa.</p><p>Với tình trạng da viêm, kích ứng kéo dài hoặc có dấu hiệu bệnh lý, khách hàng nên thăm khám bác sĩ da liễu.</p>'
        }
    };

    window.openPolicy = function (type) {
        const policy = policies[type] || policies.terms;
        const content = $('#policy-content');
        if (content) content.innerHTML = `<span class="modal-kicker">${policy.eyebrow}</span><h2 id="policy-title">${policy.title}</h2>${policy.body}`;
        $('#policy-modal')?.classList.add('is-open');
        window.SkinIDScrollLock?.lock('policy');
    };

    window.closePolicy = function () {
        $('#policy-modal')?.classList.remove('is-open');
        window.SkinIDScrollLock?.unlock('policy');
    };

    function setupModalDismissal() {
        $$('.modal').forEach((modal) => {
            modal.addEventListener('click', (event) => {
                if (event.target !== modal) return;
                modal.classList.remove('is-open');
                window.SkinIDScrollLock?.unlock(modal.id === 'policy-modal' ? 'policy' : 'consultation');
            });
        });
        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape') return;
            closeConsultation();
            closePolicy();
            toggleMobileMenu(false);
        });
    }

    function init() {
        window.syncPrimaryNavigation = syncPrimaryNavigation;
        setupMerchandisingLinks();
        setupCatalogDropdowns();
        setupSort();
        setupCarousel();
        setupConsultation();
        setupModalDismissal();
        if (window.location.pathname !== '/products') {
            const incoming = new URLSearchParams(window.location.search);
            if (['step', 'brand', 'benefit', 'search'].some(key => incoming.has(key)) || window.location.hash === '#catalog') {
                window.location.replace('/products' + window.location.search);
                return;
            }
        }
        if (new URLSearchParams(window.location.search).get('auth') === '1') {
            document.dispatchEvent(new CustomEvent('skinid:auth-dialog-open'));
        }
        if (window.location.hash === '#brands') {
            syncPrimaryNavigation('brands');
        } else if (window.location.hash === '#acie-teaser') {
            syncPrimaryNavigation('acie-teaser');
        }
        window.addEventListener('hashchange', () => {
            if (window.location.hash === '#brands') syncPrimaryNavigation('brands');
            else if (window.location.hash === '#acie-teaser') syncPrimaryNavigation('acie-teaser');
            else if (window.location.hash === '#catalog' || window.location.hash === '#featured-products') syncPrimaryNavigation('all');
        });
        if (window.feather) feather.replace();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
