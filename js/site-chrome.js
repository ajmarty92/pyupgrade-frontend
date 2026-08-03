// Shared header/footer for the marketing pages (index/about/contact/privacy/terms).
// Previously each page carried its own copy of this markup, which had already
// drifted once (index.html's nav anchors vs every other page's). Loading it
// from one place means there's only one copy to get right.
(function () {
    async function inject(placeholderId, partialUrl) {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) return;
        try {
            const response = await fetch(partialUrl);
            if (!response.ok) throw new Error(`Failed to load ${partialUrl}: ${response.status}`);
            placeholder.outerHTML = await response.text();
        } catch (error) {
            console.error(error);
        }
    }

    Promise.all([
        inject('site-header', 'partials/header.html'),
        inject('site-footer', 'partials/footer.html'),
    ]).then(() => {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        if (!mobileMenuButton || !mobileMenu) return;
        mobileMenuButton.addEventListener('click', () => {
            const willBeOpen = mobileMenu.classList.contains('hidden');
            mobileMenu.classList.toggle('hidden');
            mobileMenuButton.setAttribute('aria-expanded', String(willBeOpen));
        });
    });
})();
