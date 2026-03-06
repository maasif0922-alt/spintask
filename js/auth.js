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
            // Insecure fallback for local file:/// environments where Web Crypto API is disabled
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
            referralCode: 'REF' + Math.random().toString(36).substring(2, 7).toUpperCase(),
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem(this.DB_KEY, JSON.stringify(users));
        return { success: true };
    },

    /**
     * Login a user
     */
    async login(email, password, rememberMe = false) {
        // Rate Limiting Check
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

        // Clear attempts on success
        this.clearAttempts(email);

        // Create Session
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

        // Dispatch custom event for UI updates
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

        users[userIndex].earnings = parseFloat((users[userIndex].earnings + amount).toFixed(3));
        localStorage.setItem(this.DB_KEY, JSON.stringify(users));
        return users[userIndex].earnings;
    },

    /**
     * Auth Guard: Protect Dashboard Pages
     */
    guard() {
        const currentUser = this.getCurrentUser();
        const path = window.location.pathname;

        const isUserAuthPage = path.includes('login.html') || path.includes('register.html');
        const isAdminAuthPage = path.includes('admin-login.html');
        const isAdminDashboard = path.includes('admin-dashboard.html') || path.includes('admin.html');

        // For local testing on some systems, path might not include .html or could be different, 
        // but for this implementation we assume standard filename matching.

        if (!currentUser) {
            if (isAdminDashboard) {
                window.location.href = 'admin-login.html';
            } else if (!isUserAuthPage && !isAdminAuthPage) {
                // If trying to access a protected user page while not logged in
                // Standard landing pages are handled by isLandingPage check in DOMContentLoaded
                window.location.href = 'login.html';
            }
        } else {
            // Logged in
            if (isUserAuthPage) {
                window.location.href = 'dashboard.html';
            } else if (isAdminAuthPage) {
                window.location.href = 'admin-dashboard.html';
            } else if (isAdminDashboard && currentUser.role !== 'admin') {
                // Block non-admins from admin panel
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
                // Lockout expired
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
    // Generate a demo and admin account for easy testing
    let users = Auth.getUsers();
    if (users.length === 0) {
        try {
            await Auth.register('Demo User', 'demo@spintask.com', '123456');
            console.log('Demo account auto-created: demo@spintask.com / 123456');

            await Auth.register('Admin Manager', 'admin@spintask.com', 'admin123');
            console.log('Admin account auto-created: admin@spintask.com / admin123');

            // Give Admin a nice balance and role indicator
            let freshUsers = Auth.getUsers();
            let adminIndex = freshUsers.findIndex(u => u.email === 'admin@spintask.com');
            if (adminIndex !== -1) {
                freshUsers[adminIndex].balance = 5000;
                freshUsers[adminIndex].earnings = 12000;
                // Add a mock role to distinguish the admin
                freshUsers[adminIndex].role = 'admin';
                localStorage.setItem(Auth.DB_KEY, JSON.stringify(freshUsers));
            }
        } catch (e) {
            console.warn('Could not create demo/admin accounts:', e);
        }
    }

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
            balanceDisplays.forEach(el => el.innerText = `$${user.balance.toFixed(2)} USDT`);
        }
    }
});

// Sync balance updates across elements
window.addEventListener('auth:balanceUpdated', (e) => {
    const balanceDisplays = document.querySelectorAll('.user-balance-value');
    balanceDisplays.forEach(el => el.innerText = `$${e.detail.balance.toFixed(2)} USDT`);
});

