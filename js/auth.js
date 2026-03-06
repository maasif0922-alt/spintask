/**
 * auth.js - Secure Browser-Based Authentication System
 * Uses Web Crypto API for secure hashing and localStorage for persistence.
 */

const Auth = {
    DB_KEY: 'spintask_users',
    SESSION_KEY: 'spintask_current_user',
    ATTEMPTS_KEY: 'spintask_login_attempts',
    MAX_ATTEMPTS: 5,
    LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutes

    /**
     * Hash a password using SHA-256 (with fallback for file:/// local testing)
     */
    async hashPassword(password) {
        if (typeof crypto !== 'undefined' && crypto.subtle) {
            const msgUint8 = new TextEncoder().encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } else {
            let hash = 0;
            for (let i = 0; i < password.length; i++) {
                const char = password.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return Math.abs(hash).toString(16) + 'local';
        }
    },

    /**
     * Get all users from local storage
     */
    getUsers() {
        const users = localStorage.getItem(this.DB_KEY);
        return users ? JSON.parse(users) : [];
    },

    /**
     * Register a new user
     */
    async register(name, email, password) {
        const users = this.getUsers();
        if (users.find(u => u.email === email)) {
            throw new Error('Email already registered.');
        }

        const hashedPassword = await this.hashPassword(password);
        const newUser = {
            id: 'user_' + Date.now(),
            name,
            email,
            password: hashedPassword,
            balance: 0,
            earnings: 0,
            verified: false,
            verificationDate: null,
            registeredAt: new Date().toISOString(),
            referralCode: 'REF' + Math.random().toString(36).substring(2, 7).toUpperCase(),
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem(this.DB_KEY, JSON.stringify(users));

        // Fire admin alert for new registration
        if (typeof Admin !== 'undefined') {
            Admin.addAdminAlert('registration', `New user registered: ${name} (${email})`);
        }

        return { success: true, user: newUser };
    },

    /**
     * Login a user
     */
    async login(email, password, rememberMe = false) {
        this.checkRateLimit(email);

        const users = this.getUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            this.recordAttempt(email);
            throw new Error('Invalid email or password.');
        }

        const hashedPassword = await this.hashPassword(password);
        if (user.password !== hashedPassword) {
            this.recordAttempt(email);
            throw new Error('Invalid email or password.');
        }

        this.clearAttempts(email);

        const sessionData = {
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role || 'user',
            lastLogin: Date.now()
        };

        if (rememberMe) {
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
        } else {
            sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
        }

        return { success: true, user: sessionData };
    },

    /**
     * Logout
     */
    logout() {
        const isAdmin = window.location.pathname.includes('admin');
        localStorage.removeItem(this.SESSION_KEY);
        sessionStorage.removeItem(this.SESSION_KEY);
        window.location.href = isAdmin ? 'admin-login.html' : 'login.html';
    },

    /**
     * Get current user (full data from DB)
     */
    getCurrentUser() {
        const sessionStr = localStorage.getItem(this.SESSION_KEY) || sessionStorage.getItem(this.SESSION_KEY);
        if (!sessionStr) return null;

        try {
            const session = JSON.parse(sessionStr);
            const users = this.getUsers();
            return users.find(u => u.id === session.userId) || null;
        } catch (e) {
            return null;
        }
    },

    /**
     * Verify Account — deducts $1 and marks user as verified
     */
    verifyAccount() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return { success: false, message: 'Not logged in.' };
        if (currentUser.verified) return { success: false, message: 'Account already verified.' };
        if ((currentUser.balance || 0) < 1) return { success: false, message: 'Insufficient balance. You need at least $1.00 USDT to verify.' };

        const users = this.getUsers();
        const idx = users.findIndex(u => u.id === currentUser.id);
        if (idx === -1) return { success: false, message: 'User not found.' };

        users[idx].balance = parseFloat((users[idx].balance - 1).toFixed(2));
        users[idx].verified = true;
        users[idx].verificationDate = new Date().toISOString();
        localStorage.setItem(this.DB_KEY, JSON.stringify(users));

        // Fire admin alert
        if (typeof Admin !== 'undefined') {
            Admin.addAdminAlert('verification', `User verified account: ${currentUser.name} (${currentUser.email})`);
        }

        window.dispatchEvent(new CustomEvent('auth:balanceUpdated', {
            detail: { balance: users[idx].balance }
        }));

        return { success: true };
    },

    /**
     * Update user balance in DB
     */
    updateBalance(amount) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return;

        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex === -1) return;

        users[userIndex].balance = parseFloat((users[userIndex].balance + amount).toFixed(2));
        localStorage.setItem(this.DB_KEY, JSON.stringify(users));

        window.dispatchEvent(new CustomEvent('auth:balanceUpdated', {
            detail: { balance: users[userIndex].balance }
        }));

        return users[userIndex].balance;
    },

    /**
     * Update user total earnings in DB
     */
    updateEarnings(amount) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return;

        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex === -1) return;

        users[userIndex].earnings = parseFloat(((users[userIndex].earnings || 0) + amount).toFixed(3));
        localStorage.setItem(this.DB_KEY, JSON.stringify(users));
        return users[userIndex].earnings;
    },

    // ─── User-to-User Transfer Logic ──────────────────────────────────────

    /**
     * Transfer points (USD) to another user via email
     */
    transferPoints(senderId, receiverEmail, amountPoints, note = '') {
        try {
            // Check if transfers are globally enabled
            if (typeof Admin !== 'undefined' && Admin.getSetting('allowTransfers') === 'false') {
                return { success: false, message: 'User transfers are currently disabled by the administrator.' };
            }

            const amount = parseFloat(amountPoints);
            if (isNaN(amount) || amount < 1) {
                return { success: false, message: 'Minimum transfer amount is 1 Point.' };
            }

            const users = this.getUsers();

            const senderIndex = users.findIndex(u => u.id === senderId);
            if (senderIndex === -1) return { success: false, message: 'Sender not found.' };

            const sender = users[senderIndex];

            if (!sender.verified) {
                return { success: false, message: 'You must verify your email/account to send points.' };
            }
            if ((sender.balance || 0) < amount) {
                return { success: false, message: 'Insufficient balance.' };
            }
            if (sender.email.toLowerCase() === receiverEmail.toLowerCase()) {
                return { success: false, message: 'Cannot transfer points to yourself.' };
            }

            const receiverIndex = users.findIndex(u => u.email.toLowerCase() === receiverEmail.toLowerCase());
            if (receiverIndex === -1) {
                return { success: false, message: 'Receiver account not found in SpinTask system.' };
            }

            const receiver = users[receiverIndex];
            if (!receiver.verified) {
                return { success: false, message: 'The receiving account must be verified before they can accept transfers.' };
            }

            // Execute Transfer
            users[senderIndex].balance = parseFloat((users[senderIndex].balance - amount).toFixed(2));
            users[receiverIndex].balance = parseFloat(((users[receiverIndex].balance || 0) + amount).toFixed(2));

            localStorage.setItem(this.DB_KEY, JSON.stringify(users));

            // Record Global Transaction
            const transferRecord = {
                senderId: sender.id,
                senderName: sender.name,
                receiverId: receiver.id,
                receiverName: receiver.name,
                receiverEmail: receiver.email,
                amount: amount,
                note: note
            };

            if (typeof Admin !== 'undefined') {
                Admin.addTransferRecord(transferRecord);
            }

            // Sync sender's UI if they are logged in currently
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.id === sender.id) {
                window.dispatchEvent(new CustomEvent('auth:balanceUpdated', {
                    detail: { balance: users[senderIndex].balance }
                }));
            }

            return { success: true, message: `Successfully sent ${amount} Points to ${receiver.name}.` };
        } catch (e) {
            console.error(e);
            return { success: false, message: 'System error during transfer processing.' };
        }
    },

    getUserTransfers(userId) {
        if (typeof Admin === 'undefined') return [];
        const allTransfers = Admin.getAllTransfers();
        return allTransfers.filter(t => t.senderId === userId || t.receiverId === userId);
    },

    /**
     * Auth Guard: Protect Dashboard Pages
     */
    guard() {
        const currentUser = this.getCurrentUser();
        const path = window.location.pathname;

        const isAdminAuthPage = path.includes('admin-login.html');
        // Make sure 'admin-login.html' doesn't falsely trigger as a user auth page
        const isUserAuthPage = (path.includes('login.html') && !isAdminAuthPage) || path.includes('register.html');
        const isAdminDashboard = path.includes('admin-dashboard.html') || path.includes('admin.html');

        if (!currentUser) {
            if (isAdminDashboard) {
                window.location.href = 'admin-login.html';
            } else if (!isUserAuthPage && !isAdminAuthPage) {
                window.location.href = 'login.html';
            }
        } else {
            if (isAdminAuthPage) {
                window.location.href = 'admin-dashboard.html';
            } else if (isUserAuthPage) {
                window.location.href = 'dashboard.html';
            } else if (isAdminDashboard && currentUser.role !== 'admin') {
                window.location.href = 'dashboard.html';
            }
        }
    },

    /**
     * Rate Limiting Logic
     */
    recordAttempt(email) {
        let attempts = JSON.parse(localStorage.getItem(this.ATTEMPTS_KEY) || '{}');
        if (!attempts[email]) attempts[email] = { count: 0, lastTry: 0 };
        attempts[email].count++;
        attempts[email].lastTry = Date.now();
        localStorage.setItem(this.ATTEMPTS_KEY, JSON.stringify(attempts));
    },

    checkRateLimit(email) {
        let attempts = JSON.parse(localStorage.getItem(this.ATTEMPTS_KEY) || '{}');
        const attempt = attempts[email];
        if (attempt && attempt.count >= this.MAX_ATTEMPTS) {
            const waitTime = this.LOCKOUT_TIME - (Date.now() - attempt.lastTry);
            if (waitTime > 0) {
                const minutes = Math.ceil(waitTime / 60000);
                throw new Error(`Too many login attempts. Please try again in ${minutes} minutes.`);
            } else {
                this.clearAttempts(email);
            }
        }
    },

    clearAttempts(email) {
        let attempts = JSON.parse(localStorage.getItem(this.ATTEMPTS_KEY) || '{}');
        delete attempts[email];
        localStorage.setItem(this.ATTEMPTS_KEY, JSON.stringify(attempts));
    }
};

// Auto-run guard and UI population on load
document.addEventListener('DOMContentLoaded', async () => {
    const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html');
    const isLandingPage = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('about.html') || window.location.pathname.endsWith('support.html') || window.location.pathname.endsWith('terms.html');

    if (!isLandingPage) {
        Auth.guard();
    }

    // Populate UI if user is logged in
    const user = Auth.getCurrentUser();
    if (user) {
        const nameDisplay = document.getElementById('user-name-display');
        const avatarDisplay = document.getElementById('user-avatar');
        const welcomeMsg = document.getElementById('welcome-msg');
        const balanceDisplays = document.querySelectorAll('.user-balance-value');

        if (nameDisplay) nameDisplay.innerText = user.name;
        if (avatarDisplay) avatarDisplay.innerText = user.name.charAt(0).toUpperCase();
        if (welcomeMsg) welcomeMsg.innerText = `Welcome back, ${user.name.split(' ')[0]}! 👋`;

        if (balanceDisplays.length > 0) {
            balanceDisplays.forEach(el => el.innerText = `$${(user.balance || 0).toFixed(2)} USDT`);
        }
    }
});

// Sync balance updates across elements
window.addEventListener('auth:balanceUpdated', (e) => {
    const balanceDisplays = document.querySelectorAll('.user-balance-value');
    balanceDisplays.forEach(el => el.innerText = `$${e.detail.balance.toFixed(2)} USDT`);
});
