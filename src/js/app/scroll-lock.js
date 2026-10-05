/** Shared modal scroll locking without changing the document scroll container. */
(function initializeScrollLock() {
    const locks = new Set();

    function sync() {
        document.body.style.removeProperty('overflow');
        document.body.classList.toggle('no-scroll', locks.size > 0);
    }

    function lock(owner) {
        locks.add(String(owner || 'anonymous'));
        sync();
    }

    function unlock(owner) {
        locks.delete(String(owner || 'anonymous'));
        sync();
    }

    function reset() {
        locks.clear();
        sync();
    }

    window.SkinIDScrollLock = Object.freeze({ lock, unlock, reset, isLocked: () => locks.size > 0 });

    const updateHeader = () => {
        document.querySelector('.site-header')?.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    window.addEventListener('scroll', updateHeader, { passive: true });
    document.addEventListener('skinid:ready', updateHeader);
    updateHeader();
})();
