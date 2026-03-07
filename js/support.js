/**
 * support.js - User Support Messaging System
 */

const Support = {
    init() {
        this.renderSupportIcon();
    },

    renderSupportIcon() {
        const topBar = document.querySelector('.top-bar');
        if (!topBar) return;
        if (document.getElementById('support-icon-container')) return;

        const container = document.createElement('div');
        container.id = 'support-icon-container';
        container.style.cssText = 'position: relative; cursor: pointer; margin-right: 15px;';

        container.innerHTML = `<div id="support-icon" style="font-size: 1.5rem;">💬</div>`;

        // Find notification bell container to insert before it
        const bell = document.getElementById('notif-bell-container');
        if (bell) {
            topBar.insertBefore(container, bell);
        } else {
            topBar.appendChild(container);
        }

        container.onclick = () => this.showChatModal();
    },

    showChatModal() {
        const user = Auth.getCurrentUser();
        if (!user) return;

        const modal = document.createElement('div');
        modal.id = 'support-modal';
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
            z-index: 2100; display: flex; align-items: center; justify-content: center;
        `;

        modal.innerHTML = `
            <div class="glass" style="width: 95%; max-width: 500px; height: 80vh; display: flex; flex-direction: column; border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                <div style="padding: 20px; background: rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0;">💬 Support Chat</h3>
                    <button style="background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer;" onclick="document.getElementById('support-modal').remove()">×</button>
                </div>
                
                <div id="chat-messages" style="flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px;">
                    <!-- Messages will appear here -->
                </div>

                <div style="padding: 20px; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.1); display: flex; gap: 10px;">
                    <input type="text" id="support-input" placeholder="Type your message..." style="flex: 1; padding: 12px 18px; border-radius: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; outline: none;">
                    <button onclick="Support.sendMessage()" class="btn btn-primary" style="padding: 10px 20px;">Send</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.loadMessages();

        // Scroll to bottom
        setTimeout(() => {
            const container = document.getElementById('chat-messages');
            if (container) container.scrollTop = container.scrollHeight;
        }, 100);

        // Enter key to send
        document.getElementById('support-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    },

    loadMessages() {
        const user = Auth.getCurrentUser();
        if (!user) return;
        const messages = Admin.getSupportMessages(user.id);
        const container = document.getElementById('chat-messages');
        if (!container) return;

        if (messages.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: var(--text-muted); margin-top: 50px;">How can we help you today? Send us a message!</div>';
            return;
        }

        container.innerHTML = messages.map(m => {
            const isUser = m.senderType === 'user';
            const time = new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return `
                <div style="align-self: ${isUser ? 'flex-end' : 'flex-start'}; max-width: 80%;">
                    <div style="background: ${isUser ? 'var(--primary-neon)' : 'rgba(255,255,255,0.1)'}; color: ${isUser ? '#000' : '#fff'}; padding: 10px 15px; border-radius: 15px; border-bottom-${isUser ? 'right' : 'left'}-radius: 2px;">
                        ${m.message}
                    </div>
                    <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 4px; text-align: ${isUser ? 'right' : 'left'}">${time}</div>
                </div>
            `;
        }).join('');
        container.scrollTop = container.scrollHeight;
    },

    sendMessage() {
        const input = document.getElementById('support-input');
        const user = Auth.getCurrentUser();
        const msg = input.value.trim();
        if (!msg || !user) return;

        Admin.sendSupportMessage(user.id, msg, 'user');
        input.value = '';
        this.loadMessages();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (typeof Auth !== 'undefined' && Auth.getCurrentUser()) {
        Support.init();
    }
});
