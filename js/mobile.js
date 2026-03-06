/**
 * mobile.js - Responsive mobile navigation for SpinTask
 * Handles:
 *  1. Dashboard sidebar toggle (hamburger in top-header)
 *  2. More-sheet slide-up (⋯ More button in bottom nav)
 *  3. Public page drawer (hamburger in public header)
 */
(function () {
    'use strict';

    // ── Dashboard sidebar ──────────────────────────────
    const menuBtn = document.getElementById('mob-menu-btn');
    const sidebar = document.getElementById('main-sidebar');
    const sideOverlay = document.getElementById('sidebar-overlay');

    function openSidebar() {
        if (sidebar) sidebar.classList.add('mobile-open');
        if (sideOverlay) sideOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeSidebar() {
        if (sidebar) sidebar.classList.remove('mobile-open');
        if (sideOverlay) sideOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (menuBtn) {
        menuBtn.addEventListener('click', function () {
            sidebar && sidebar.classList.contains('mobile-open') ? closeSidebar() : openSidebar();
        });
    }
    if (sideOverlay) {
        sideOverlay.addEventListener('click', closeSidebar);
    }

    // ── More Sheet ────────────────────────────────────
    const moreBtn = document.getElementById('more-btn');
    const moreSheet = document.getElementById('more-sheet');
    const moreOverlay = document.getElementById('more-overlay');

    function openMoreSheet() {
        if (moreSheet) moreSheet.classList.add('open');
        if (moreOverlay) moreOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeMoreSheet() {
        if (moreSheet) moreSheet.classList.remove('open');
        if (moreOverlay) moreOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (moreBtn) {
        moreBtn.addEventListener('click', function (e) {
            e.preventDefault();
            moreSheet && moreSheet.classList.contains('open') ? closeMoreSheet() : openMoreSheet();
        });
    }
    if (moreOverlay) {
        moreOverlay.addEventListener('click', closeMoreSheet);
    }

    // ── Public page hamburger ──────────────────────────
    const hamBtn = document.getElementById('hamburger-btn');
    const drawer = document.getElementById('mobile-drawer');
    const drawerOvl = document.getElementById('drawer-overlay');

    function openDrawer() {
        if (hamBtn) hamBtn.classList.add('open');
        if (drawer) drawer.classList.add('open');
        if (drawerOvl) drawerOvl.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function closeDrawer() {
        if (hamBtn) hamBtn.classList.remove('open');
        if (drawer) drawer.classList.remove('open');
        if (drawerOvl) drawerOvl.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (hamBtn) {
        hamBtn.addEventListener('click', function () {
            drawer && drawer.classList.contains('open') ? closeDrawer() : openDrawer();
        });
    }
    if (drawerOvl) {
        drawerOvl.addEventListener('click', closeDrawer);
    }

    // Close sidebar/drawer on window resize to desktop
    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
            closeSidebar();
            closeDrawer();
            closeMoreSheet();
        }
    });
})();
