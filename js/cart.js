class ShoppingCart {
    constructor() {
        this.items = []; // Array of { productId, quantity }
        this.loadCart();
        this.initDOM();
    }

    loadCart() {
        const stored = localStorage.getItem('skinid_cart');
        if (stored) {
            try {
                this.items = JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse cart", e);
                this.items = [];
            }
        }
        this.updateBadge();
    }

    saveCart() {
        localStorage.setItem('skinid_cart', JSON.stringify(this.items));
        this.updateBadge();
        this.renderCartUI();
    }

    addItem(productId, quantity = 1) {
        const existing = this.items.find(item => item.productId === productId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.items.push({ productId, quantity });
        }
        this.saveCart();
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.productId !== productId);
        this.saveCart();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.productId === productId);
        if (item) {
            item.quantity = quantity;
            if (item.quantity <= 0) {
                this.removeItem(productId);
            } else {
                this.saveCart();
            }
        }
    }

    clearCart() {
        this.items = [];
        this.saveCart();
    }

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    updateBadge() {
        const count = this.getTotalItems();
        const mainBadge = document.getElementById('cart-badge');
        const mobileBadge = document.getElementById('mobile-cart-badge');
        
        if (mainBadge) {
            mainBadge.innerText = count;
            count > 0 ? mainBadge.classList.remove('opacity-0') : mainBadge.classList.add('opacity-0');
        }
        if (mobileBadge) {
            mobileBadge.innerText = count;
            count > 0 ? mobileBadge.classList.remove('opacity-0') : mobileBadge.classList.add('opacity-0');
        }
    }

    toggleCartUI() {
        const overlay = document.getElementById('cart-overlay');
        const panel = document.getElementById('cart-panel');
        if (!overlay || !panel) return;

        if (overlay.classList.contains('hidden')) {
            // Open
            overlay.classList.remove('hidden');
            setTimeout(() => {
                overlay.classList.remove('opacity-0');
                panel.classList.remove('translate-x-full');
            }, 10);
            this.renderCartUI();
        } else {
            // Close
            overlay.classList.add('opacity-0');
            panel.classList.add('translate-x-full');
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 300);
        }
    }

    getProductDetails(productId) {
        // PRODUCTS is available globally from skin-ai.js
        if (typeof PRODUCTS !== 'undefined') {
            return PRODUCTS.find(p => p.id === productId);
        }
        return null;
    }

    renderCartUI() {
        const container = document.getElementById('cart-items-container');
        const subtotalEl = document.getElementById('cart-subtotal');
        if (!container || !subtotalEl) return;

        if (this.items.length === 0) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                    <i data-feather="shopping-bag" class="w-12 h-12 mb-4 opacity-50"></i>
                    <p class="font-medium text-sm">Giỏ hàng của bạn đang trống</p>
                    <button onclick="cartManager.toggleCartUI()" class="mt-4 px-6 py-2 bg-brand-light text-brand-primary rounded-lg text-sm font-semibold hover:bg-brand-petal transition-colors">
                        Tiếp tục mua sắm
                    </button>
                </div>
            `;
            subtotalEl.innerText = '0đ';
            if (typeof feather !== 'undefined') feather.replace();
            return;
        }

        let html = '';
        let subtotal = 0;

        this.items.forEach(item => {
            const product = this.getProductDetails(item.productId);
            if (!product) return; // Skip if product not found

            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;

            html += `
                <div class="flex gap-4 p-4 border-b border-gray-50 bg-white">
                    <div class="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center">
                        <img src="public${product.image}" class="w-full h-full object-cover" onerror="this.outerHTML='<div class=\\'w-full h-full text-[8px] text-center p-1 text-gray-400\\'>${product.brand}</div>'">
                    </div>
                    <div class="flex-grow flex flex-col justify-between">
                        <div class="flex justify-between items-start gap-2">
                            <div>
                                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">${product.brand}</p>
                                <h4 class="text-sm font-bold text-gray-800 line-clamp-2 leading-snug">${product.name}</h4>
                            </div>
                            <button onclick="cartManager.removeItem('${item.productId}')" class="text-gray-400 hover:text-red-500 transition-colors p-1 flex-shrink-0">
                                <i data-feather="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                        <div class="flex justify-between items-end mt-2">
                            <div class="flex items-center gap-3 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
                                <button onclick="cartManager.updateQuantity('${item.productId}', ${item.quantity - 1})" class="text-gray-500 hover:text-brand-primary p-1">
                                    <i data-feather="minus" class="w-3 h-3"></i>
                                </button>
                                <span class="text-sm font-semibold w-4 text-center">${item.quantity}</span>
                                <button onclick="cartManager.updateQuantity('${item.productId}', ${item.quantity + 1})" class="text-gray-500 hover:text-brand-primary p-1">
                                    <i data-feather="plus" class="w-3 h-3"></i>
                                </button>
                            </div>
                            <div class="text-right">
                                <p class="text-sm font-bold text-brand-primary">${formatPrice(product.price)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        subtotalEl.innerText = formatPrice(subtotal);
        if (typeof feather !== 'undefined') feather.replace();
    }

    checkoutZalo() {
        if (this.items.length === 0) return;
        
        let message = "Xin chào SkinID, mình muốn đặt mua các sản phẩm sau:\n\n";
        let subtotal = 0;

        this.items.forEach((item, index) => {
            const product = this.getProductDetails(item.productId);
            if (product) {
                const itemTotal = product.price * item.quantity;
                subtotal += itemTotal;
                message += `${index + 1}. ${product.name}\n   Số lượng: ${item.quantity} x ${formatPrice(product.price)}\n`;
            }
        });

        message += `\nTổng tạm tính: ${formatPrice(subtotal)}`;
        
        const zaloUrl = `https://zalo.me/0924093461?text=${encodeURIComponent(message)}`;
        window.open(zaloUrl, '_blank');
        
        // Optional: clear cart after redirecting to checkout
        // this.clearCart();
    }

    initDOM() {
        // Create Cart Overlay and Panel if not exists
        if (!document.getElementById('cart-overlay')) {
            const cartHTML = `
                <!-- Cart Overlay -->
                <div id="cart-overlay" class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[9999] hidden opacity-0 transition-opacity duration-300" onclick="if(event.target === this) cartManager.toggleCartUI()">
                    
                    <!-- Cart Panel -->
                    <div id="cart-panel" class="absolute right-0 top-0 bottom-0 w-full md:w-[400px] bg-white shadow-2xl transform translate-x-full transition-transform duration-300 flex flex-col">
                        
                        <!-- Header -->
                        <div class="flex items-center justify-between p-4 border-b border-gray-100 bg-white z-10">
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand-primary">
                                    <i data-feather="shopping-bag" class="w-4 h-4"></i>
                                </div>
                                <h3 class="text-lg font-bold text-gray-900">Giỏ hàng</h3>
                            </div>
                            <button onclick="cartManager.toggleCartUI()" class="p-2 text-gray-400 hover:text-gray-800 bg-gray-50 rounded-full transition-colors">
                                <i data-feather="x" class="w-5 h-5"></i>
                            </button>
                        </div>

                        <!-- Items List -->
                        <div id="cart-items-container" class="flex-grow overflow-y-auto bg-gray-50/50">
                            <!-- Items will be rendered here -->
                        </div>

                        <!-- Footer -->
                        <div class="p-5 border-t border-gray-100 bg-white shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                            <div class="flex justify-between items-center mb-4">
                                <span class="text-gray-500 font-medium">Tạm tính</span>
                                <span id="cart-subtotal" class="text-xl font-bold text-brand-primary">0đ</span>
                            </div>
                            <button onclick="cartManager.checkoutZalo()" class="w-full py-3.5 bg-brand-primary text-white rounded-xl font-bold text-base hover:bg-brand-dark transition-colors flex justify-center items-center gap-2 shadow-lg shadow-brand-primary/20">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" class="w-5 h-5 object-contain" alt="Zalo">
                                Thanh toán qua Zalo
                            </button>
                            <p class="text-[11px] text-gray-400 text-center mt-3">*Bạn sẽ được chuyển hướng tới Zalo OA của chuyên gia để xác nhận và thanh toán.</p>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', cartHTML);
            if (typeof feather !== 'undefined') feather.replace();
        }
    }
}

// Format price helper (duplicate from skin-ai.js in case cart.js is loaded standalone, but we can reuse if global)
if (typeof window.formatPrice === 'undefined') {
    window.formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };
}

// Initialize global CartManager
const cartManager = new ShoppingCart();
