/**
 * Notifications Logic for User Dashboard
 * Handles banner rendering, notification bell, and popups.
 */

const Notifications = {
    init() {
        this.renderAnnouncementBar();
        this.renderNotificationCenter();
        this.checkForPopups();
    },

    renderAnnouncementBar() {
        const announcement = Admin.getAnnouncement();
        if (announcement && announcement.enabled && announcement.text) {
            // Remove existing if any
            const existing = document.getElementById('global-announcement-bar');
            if (existing) existing.remove();

            const bar = document.createElement('div');
            bar.id = 'global-announcement-bar';
            
            // Responsive left offset based on sidebar visibility
            const isMobile = window.innerWidth <= 992;
            const leftOffset = isMobile ? '0' : '280px';
            const barTop = '70px';

            bar.style.cssText = `
                background: linear-gradient(90deg, var(--primary-neon), #00d4ff);
                color: #000;
                padding: 10px 20px;
                text-align: center;
                font-weight: 700;
                font-size: 0.9rem;
                border-radius: 0 0 12px 12px;
                box-shadow: 0 4px 15px rgba(57, 255, 20, 0.3);
                position: fixed;
                top: ${barTop};
                left: ${leftOffset};
                right: 0;
                z-index: 999;
            `;
            bar.innerHTML = announcement.text;

            // Insert into body
            document.body.appendChild(bar);

            // Add top padding to main-content so content isn't hidden behind the bar
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                const barHeight = bar.offsetHeight || 42; 
                mainContent.style.paddingTop = (40 + barHeight) + 'px';
            }

            // Update on resize
            window.addEventListener('resize', () => {
                const newIsMobile = window.innerWidth <= 992;
                bar.style.left = newIsMobile ? '0' : '280px';
            });
        }
    },

    renderNotificationCenter() {
        const user = Auth.getCurrentUser();
        if (!user) return;

        const topBar = document.querySelector('.top-bar');
        if (!topBar) return;

        // Check if bell already exists
        if (document.getElementById('notif-bell-container')) return;

        const container = document.createElement('div');
        container.id = 'notif-bell-container';
        container.style.cssText = 'position: relative; cursor: pointer; margin-right: 20px;';

        const unreadCount = this.getUnreadCount(user.id);

        container.innerHTML = `
            <div id="notif-bell" style="font-size: 1.5rem;">🔔</div>
            ${unreadCount > 0 ? `<span id="notif-badge" style="position: absolute; top: -5px; right: -5px; background: #ff4d4d; color: #fff; border-radius: 50%; width: 18px; height: 18px; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; font-weight: bold;">${unreadCount}</span>` : ''}
        `;

        // Insert before the balance or user info in top-bar
        topBar.appendChild(container);

        container.onclick = () => this.showNotificationModal(user.id);
    },

    getUnreadCount(userId) {
        const notes = Admin.getUserNotifications(userId);
        return notes.filter(n => !n.readBy.includes(userId)).length;
    },

    showNotificationModal(userId) {
        const notes = Admin.getUserNotifications(userId);

        const modal = document.createElement('div');
        modal.id = 'notif-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); backdrop-filter: blur(5px);
            z-index: 2000; display: flex; align-items: center; justify-content: center;
        `;

        let notesHtml = notes.length > 0 ? notes.reverse().map(n => `
            <div style="padding: 15px; background: rgba(255,255,255,0.05); border-radius: 12px; margin-bottom: 15px; border-left: 4px solid ${n.readBy.includes(userId) ? 'rgba(255,255,255,0.1)' : 'var(--primary-neon)'}">
                <div style="font-weight: bold; color: ${n.readBy.includes(userId) ? '#fff' : 'var(--primary-neon)'}">${n.subject}</div>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 5px;">${n.message}</div>
                <div style="font-size: 0.7rem; color: rgba(255,255,255,0.3); margin-top: 8px;">${new Date(n.date).toLocaleString()}</div>
            </div>
        `).join('') : '<p style="text-align:center; color: var(--text-muted);">No notifications yet.</p>';

        modal.innerHTML = `
            <div class="glass" style="width: 90%; max-width: 500px; padding: 30px; border-radius: 20px; max-height: 80vh; overflow-y: auto; position: relative;">
                <button style="position: absolute; top: 20px; right: 20px; background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer;" onclick="document.getElementById('notif-modal').remove()">×</button>
                <h2 style="margin-bottom: 25px;">Notification Center</h2>
                ${notesHtml}
                <button class="btn btn-primary" style="width: 100%; margin-top: 20px;" onclick="Notifications.markAllRead('${userId}')">Mark All as Read</button>
            </div>
        `;

        document.body.appendChild(modal);
    },

    markAllRead(userId) {
        const notes = Admin.getUserNotifications(userId);
        notes.forEach(n => Admin.markNotificationRead(n.id, userId));
        document.getElementById('notif-modal').remove();
        this.renderNotificationCenter(); // Refresh badge
    },

    checkForPopups() {
        const user = Auth.getCurrentUser();
        if (!user) return;

        const notes = Admin.getUserNotifications(user.id);
        const unread = notes.filter(n => !n.readBy.includes(user.id));

        // Show the latest unread message as a popup if user hasn't seen it this session
        if (unread.length > 0) {
            const latest = unread[unread.length - 1];
            const sessionKey = `popup_seen_${latest.id}`;

            if (!sessionStorage.getItem(sessionKey)) {
                this.showBroadcastPopup(latest);
                sessionStorage.setItem(sessionKey, 'true');
            }
        }
    },

    showBroadcastPopup(note) {
        const popup = document.createElement('div');
        popup.style.cssText = `
            position: fixed; bottom: 30px; right: 30px; width: 320px;
            z-index: 1500; animation: slideIn 0.5s ease;
        `;
        popup.innerHTML = `
            <div class="glass" style="padding: 20px; border-radius: 15px; border-left: 5px solid var(--primary-neon); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <strong style="color: var(--primary-neon);">📣 Broadcast</strong>
                    <button style="background: none; border: none; color: #fff; cursor: pointer;" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                <div style="font-weight: 600; margin-bottom: 5px;">${note.subject}</div>
                <div style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">${note.message}</div>
                <div style="margin-top: 15px; font-size: 0.8rem;">
                    <a href="#" style="color: var(--primary-neon);" onclick="this.parentElement.parentElement.parentElement.remove(); Notifications.showNotificationModal('${Auth.getCurrentUser().id}')">View All Notifications</a>
                </div>
            </div>
            <style>
                @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            </style>
        `;
        document.body.appendChild(popup);
    }
};

// Auto-init on dashboard pages
document.addEventListener('DOMContentLoaded', () => {
    if (typeof Auth !== 'undefined' && Auth.getCurrentUser()) {
        Notifications.init();
    }
});
