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
    async register(name, email, password, referredByCode = null) {
        // 1. Check if email exists locally (for speed) then in Firestore
        const users = this.getUsers();
        if (users.find(u => u.email === email)) {
            throw new Error('Email already registered locally.');
        }

        // Firestore check
        if (typeof fs !== 'undefined' && fs !== null) {
            const snap = await fs.collection('users').where('email', '==', email).get();
            if (!snap.empty) {
                throw new Error('Email already registered in system.');
            }
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
            role: 'user',
            registeredAt: new Date().toISOString(),
            referralCode: 'REF' + Math.random().toString(36).substring(2, 7).toUpperCase(),
            referredBy: referredByCode || null,
            referralCount: 0,
            createdAt: new Date().toISOString()
        };

        // 2. Save locally
        users.push(newUser);
        localStorage.setItem(this.DB_KEY, JSON.stringify(users));

        // 3. Save to Firestore
        if (typeof fs !== 'undefined' && fs !== null) {
            try {
                await fs.collection('users').doc(newUser.id).set(newUser);
                console.log('[Firestore] User saved successfully.');
            } catch (e) {
                console.error('[Firestore] User save failed:', e);
            }
        }

        // 4. Fire admin alert for new registration
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

        // Try local lookup first for speed
        let users = this.getUsers();
        let user = users.find(u => u.email === email);

        // If not found locally, try Firestore (Cross-device sync)
        if (!user && typeof fs !== 'undefined' && fs !== null) {
            console.log('[Auth] User not found locally, checking Firestore...');
            const snap = await fs.collection('users').where('email', '==', email).get();
            if (!snap.empty) {
                user = snap.docs[0].data();
                // Cache user locally
                users.push(user);
                localStorage.setItem(this.DB_KEY, JSON.stringify(users));
            }
        }

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

        // Record Platform Income (Verification Fee)
        if (typeof Admin !== 'undefined' && Admin.recordPlatformIncome) {
            Admin.recordPlatformIncome('verification', 1, currentUser.id);
        } else {
            let incomeLogs = JSON.parse(localStorage.getItem('spintask_platform_income') || '[]');
            incomeLogs.push({
                id: 'inc_' + Date.now() + Math.random().toString(36).substr(2, 5),
                category: 'verification',
                amount: 1,
                userId: currentUser.id,
                date: new Date().toISOString()
            });
            localStorage.setItem('spintask_platform_income', JSON.stringify(incomeLogs));
        }

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
                Admin.addAdminAlert('transfer', `🎁 Transfer: ${sender.name} sent $${amount} to ${receiver.name}`);
                Admin.logAction(`${sender.email} transferred $${amount} to ${receiver.email}`);
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
    },
    // ─── Password Reset Logic ──────────────────────────────────────

    /**
     * Request a password reset OTP
     */
    async requestPasswordReset(email) {
        if (typeof fs === 'undefined' || fs === null) {
            throw new Error('Firebase Firestore is not initialized.');
        }

        // 1. Check if user exists
        const snap = await fs.collection('users').where('email', '==', email).get();
        if (snap.empty) {
            throw new Error('No account found with this email address.');
        }

        // 2. Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = Date.now() + 600000; // 10 minutes

        // 3. Save to Firestore
        await fs.collection('password_resets').doc(email).set({
            email,
            otp,
            expires,
            used: false,
            createdAt: new Date().toISOString()
        });

        // 4. Log for admin (and simulation)
        console.log(`[Auth] OTP for ${email}: ${otp}`);
        if (typeof Admin !== 'undefined') {
            Admin.addAdminAlert('security', `Password reset requested for ${email}. OTP: ${otp}`);
        }

        return { success: true, otp }; // Returning OTP for simulation
    },

    /**
     * Verify OTP
     */
    async verifyOTP(email, otp) {
        if (typeof fs === 'undefined' || fs === null) {
            throw new Error('Firebase Firestore is not initialized.');
        }

        const doc = await fs.collection('password_resets').doc(email).get();
        if (!doc.exists) throw new Error('No reset request found for this email.');

        const data = doc.data();
        if (data.used) throw new Error('This OTP has already been used.');
        if (Date.now() > data.expires) throw new Error('This OTP has expired.');
        if (data.otp !== otp) throw new Error('Invalid OTP code.');

        return { success: true };
    },

    /**
     * Reset Password
     */
    async resetPassword(email, otp, newPassword) {
        if (typeof fs === 'undefined' || fs === null) {
            throw new Error('Firebase Firestore is not initialized.');
        }

        // 1. Double check OTP
        await this.verifyOTP(email, otp);

        // 2. Hash new password
        const hashedPassword = await this.hashPassword(newPassword);

        // 3. Update User in Firestore
        const snap = await fs.collection('users').where('email', '==', email).get();
        if (snap.empty) throw new Error('User not found.');
        
        const userId = snap.docs[0].id;
        await fs.collection('users').doc(userId).update({
            password: hashedPassword
        });

        // 4. Mark OTP as used
        await fs.collection('password_resets').doc(email).update({
            used: true
        });

        // 5. Update Local Cache
        let users = this.getUsers();
        let idx = users.findIndex(u => u.email === email);
        if (idx !== -1) {
            users[idx].password = hashedPassword;
            localStorage.setItem(this.DB_KEY, JSON.stringify(users));
        }

        if (typeof Admin !== 'undefined') {
            Admin.logAction(`Password reset successfully for ${email}`);
        }

        return { success: true };
    }
};

// --- NEW: Traffic & Visitor Tracking ---
const Traffic = {
    STORAGE_KEY: 'spintask_traffic_stats',

    init() {
        this.trackVisitor();
        this.trackClick();
        // Add global listener for all clicks to track general activity
        document.addEventListener('click', () => this.trackClick());
    },

    getStats() {
        const stats = localStorage.getItem(this.STORAGE_KEY);
        const today = new Date().toDateString();
        const defaultStats = {
            totalClicks: 0,
            dailyStats: {}, // { "DateString": clicks }
            uniqueVisitors: {}, // { "DateString": [userIds] }
            totalVisitors: 0,
            visitorLog: [] // last 100 IPs/IDs for "activity"
        };
        return stats ? JSON.parse(stats) : defaultStats;
    },

    saveStats(stats) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
        // Trigger storage event for real-time updates in admin dash
        window.dispatchEvent(new Event('storage'));
    },

    trackClick() {
        const stats = this.getStats();
        const today = new Date().toDateString();

        stats.totalClicks = (stats.totalClicks || 0) + 1;
        stats.dailyStats[today] = (stats.dailyStats[today] || 0) + 1;

        this.saveStats(stats);

        // Legacy compatibility for existing dashboard field
        const legacyClicks = { date: today, count: stats.dailyStats[today] };
        localStorage.setItem('spintask_clicks', JSON.stringify(legacyClicks));
    },

    trackVisitor() {
        const stats = this.getStats();
        const today = new Date().toDateString();
        const user = Auth.getCurrentUser();
        const visitorId = user ? user.id : 'guest_' + this.getFingerprint();

        if (!stats.uniqueVisitors[today]) {
            stats.uniqueVisitors[today] = [];
        }

        if (!stats.uniqueVisitors[today].includes(visitorId)) {
            stats.uniqueVisitors[today].push(visitorId);
            stats.totalVisitors = (stats.totalVisitors || 0) + 1;
            
            // Add to activity log
            stats.visitorLog.unshift({
                id: visitorId,
                name: user ? user.name : 'Guest',
                time: new Date().toISOString(),
                type: 'visit'
            });
            if (stats.visitorLog.length > 100) stats.visitorLog.pop();

            // Log to System Logs for real-time visibility
            if (typeof Admin !== 'undefined') {
                Admin.logAction(`New visitor arrival: ${user ? user.email : 'Guest (' + visitorId + ')'}`);
            }
        }

        this.saveStats(stats);
    },

    getFingerprint() {
        // Simple fingerprint for guests
        return btoa(navigator.userAgent).substring(0, 16);
    }
};

// Auto-run guard and UI population on load
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Traffic Tracking
    Traffic.init();

    const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html');
    const isLandingPage = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('about.html') || window.location.pathname.endsWith('support.html') || window.location.pathname.endsWith('terms.html') || window.location.pathname.endsWith('cricket.html') || window.location.pathname.endsWith('football.html') || window.location.pathname.endsWith('tennis.html') || window.location.pathname.endsWith('basketball.html') || window.location.pathname.endsWith('esports.html') || window.location.pathname.endsWith('betting.html') || window.location.pathname.endsWith('match-details.html') || window.location.pathname.endsWith('method-details.html');

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
