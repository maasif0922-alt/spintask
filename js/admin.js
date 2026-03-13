/**
 * Admin logic and Mock Databases
 */

const Admin = {
    // Database Keys
    DB_TRANSACTIONS: 'spintask_transactions',
    DB_SETTINGS: 'spintask_settings',
    DB_TASKS: 'spintask_tasks',
    DB_CONTENT: 'spintask_content',
    DB_LOGS: 'spintask_logs',
    DB_LUCKYDRAWS: 'spintask_luckydraws',
    DB_TICKETS: 'spintask_tickets',
    DB_NOTIFICATIONS: 'spintask_notifications',
    DB_ANNOUNCEMENTS: 'spintask_announcements',
    DB_SIGNAL: 'spintask_signal_button',
    DB_COMMUNITY_LINKS: 'spintask_community_links',
    DB_SOCIAL_MEDIA: 'spintask_social_media',
    DB_ADMIN_ALERTS: 'spintask_admin_alerts',
    DB_SPIN_SETTINGS: 'spintask_spin_settings',
    DB_TRANSFERS: 'spintask_transfers',
    DB_TRADING_SETTINGS: 'spintask_trading_settings',
    DB_PLATFORM_INCOME: 'spintask_platform_income',
    DB_SUPPORT_MESSAGES: 'spintask_support_messages',
    DB_SPORTXBET_MATCHES: 'spintask_sportxbet_matches',
    DB_SPORTXBET_BETS: 'spintask_sportxbet_bets',
    DB_SPORTXBET_SETTINGS: 'spintask_sportxbet_settings',

    // Default Settings Initialization
    init() {
        // --- Merge Global Config (Initial/Forced Sync) ---
        if (typeof GLOBAL_CONFIG !== 'undefined') {
            const config = GLOBAL_CONFIG;
            if (config.settings) {
                // Only overwrite if not exists or if we want to force a global reset
                // For "Live Sync", we overwrite key settings from the live config file
                const currentSettings = this.getObjDb(this.DB_SETTINGS);
                const mergedSettings = { ...currentSettings, ...config.settings };
                localStorage.setItem(this.DB_SETTINGS, JSON.stringify(mergedSettings));
            }
            if (config.signal) {
                localStorage.setItem(this.DB_SIGNAL, JSON.stringify(config.signal));
            }
            if (config.tasks) {
                localStorage.setItem(this.DB_TASKS, JSON.stringify(config.tasks));
            }
            if (config.announcement) {
                localStorage.setItem(this.DB_ANNOUNCEMENTS, JSON.stringify(config.announcement));
            }
        }

        if (!localStorage.getItem(this.DB_SETTINGS)) {
            // ... fallback to old defaults if GLOBAL_CONFIG is somehow missing

            // Ensure critical settings have defaults if missing (for older localStorage versions)
            const settings = this.getObjDb(this.DB_SETTINGS);
            let needsSave = false;

            const defaultKeys = {
                siteName: 'SpinTask',
                supportEmail: 'support@spintask.com',
                depositAddress: 'TRC20_DEFAULT_ADDRESS_HERE',
                btcAddress: 'BTC_DEFAULT_ADDRESS_HERE',
                minDeposit: 10,
                minWithdraw: 20,
                refLvl1: 5,
                refLvl2: 3,
                allowTransfers: true,
                ti_basic_rate: 5,
                ti_standard_rate: 6,
                ti_gold_rate: 7
            };

            for (const [key, val] of Object.entries(defaultKeys)) {
                if (settings[key] === undefined) {
                    settings[key] = val;
                    needsSave = true;
                }
            }

            if (needsSave) this.saveDb(this.DB_SETTINGS, settings);

            if (!localStorage.getItem(this.DB_SIGNAL)) {
                const defaultSignal = {
                    enabled: true,
                    telegramUrl: 'https://t.me/your_signal_group',
                    buttonText: '📡 Free Crypto & Forex Signals',
                    subText: 'Join Telegram — Get FREE Daily Signals!'
                };
                localStorage.setItem(this.DB_SIGNAL, JSON.stringify(defaultSignal));
            }

            if (!localStorage.getItem(this.DB_TASKS)) {
                const defaultTasks = [
                    { id: 't1', title: 'Visit Website', desc: 'Visit the sponsor website and stay for 30 seconds.', reward: 0.05, type: 'visit', active: true },
                    { id: 't2', title: 'Watch Video', desc: 'Watch the promotional video until the end.', reward: 0.10, type: 'video', active: true }
                ];
                localStorage.setItem(this.DB_TASKS, JSON.stringify(defaultTasks));
            }

            if (!localStorage.getItem(this.DB_CONTENT)) {
                const defaultContent = {
                    aboutText: 'The most trusted micro-task platform.',
                    termsText: 'These are the default terms and conditions.',
                    privacyText: 'Your privacy is important. We encrypt your data.',
                    contactText: 'Get in touch with us for support and inquiries.',
                    homeHero: 'Earn USDT Online with Simple Tasks and Spins',
                    homeSub: 'Complete simple actions, spin the daily wheel, and withdraw your earnings directly to your Binance wallet.'
                };
                localStorage.setItem(this.DB_CONTENT, JSON.stringify(defaultContent));
            }

            if (!localStorage.getItem(this.DB_LUCKYDRAWS)) {
                const defaultDraws = [
                    {
                        id: 'ld1',
                        title: 'Mobile Phone Draw',
                        prize: 'iPhone 15 Pro Max',
                        image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400&auto=format&fit=crop&q=60',
                        price: 1,
                        totalTickets: 500,
                        remainingTickets: 500,
                        drawDate: new Date(Date.now() + 86400000 * 7).toISOString(),
                        status: 'active'
                    },
                    {
                        id: 'ld2',
                        title: 'Used Car Draw',
                        prize: 'Toyota Corolla 2018',
                        image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&auto=format&fit=crop&q=60',
                        price: 2,
                        totalTickets: 1000,
                        remainingTickets: 1000,
                        drawDate: new Date(Date.now() + 86400000 * 14).toISOString(),
                        status: 'active'
                    },
                    {
                        id: 'ld3',
                        title: 'New Car Draw',
                        prize: 'Tesla Model 3',
                        image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&auto=format&fit=crop&q=60',
                        price: 5,
                        totalTickets: 2000,
                        remainingTickets: 2000,
                        drawDate: new Date(Date.now() + 86400000 * 30).toISOString(),
                        status: 'active'
                    }
                ];
                localStorage.setItem(this.DB_LUCKYDRAWS, JSON.stringify(defaultDraws));
            }

            if (!localStorage.getItem(this.DB_TICKETS)) {
                localStorage.setItem(this.DB_TICKETS, JSON.stringify([]));
            }

            if (!localStorage.getItem(this.DB_ANNOUNCEMENTS)) {
                const defaultAnnouncement = {
                    text: '🎉 Big News! Mobile Lucky Draw has started. Buy tickets now and win amazing prizes.',
                    enabled: true
                };
                localStorage.setItem(this.DB_ANNOUNCEMENTS, JSON.stringify(defaultAnnouncement));
            }

            if (!localStorage.getItem(this.DB_NOTIFICATIONS)) {
                localStorage.setItem(this.DB_NOTIFICATIONS, JSON.stringify([]));
            }

            if (!localStorage.getItem(this.DB_ADMIN_ALERTS)) {
                localStorage.setItem(this.DB_ADMIN_ALERTS, JSON.stringify([]));
            }

            if (!localStorage.getItem(this.DB_COMMUNITY_LINKS)) {
                const defaultCommunity = {
                    telegramLink: 'https://t.me/your_group',
                    whatsappGroupLink: 'https://chat.whatsapp.com/your_group',
                    whatsappCommunityLink: 'https://chat.whatsapp.com/your_community',
                    activeLink: 'telegram'
                };
                localStorage.setItem(this.DB_COMMUNITY_LINKS, JSON.stringify(defaultCommunity));
            }

            if (!localStorage.getItem(this.DB_SOCIAL_MEDIA)) {
                const defaultSocial = {
                    facebook: { url: 'https://facebook.com/', enabled: true },
                    telegram: { url: 'https://t.me/your_channel', enabled: true },
                    whatsapp: { url: 'https://chat.whatsapp.com/your_group', enabled: true },
                    tiktok: { url: 'https://tiktok.com/@your_page', enabled: true },
                    instagram: { url: 'https://instagram.com/your_page', enabled: true },
                    youtube: { url: 'https://youtube.com/@your_channel', enabled: true }
                };
                localStorage.setItem(this.DB_SOCIAL_MEDIA, JSON.stringify(defaultSocial));
            }

            if (!localStorage.getItem(this.DB_SPIN_SETTINGS)) {
                const defaultSpinSettings = {
                    enabled: true,
                    segments: [
                        { label: '$0.01', value: 0.01, type: 'cash' },
                        { label: '$0.02', value: 0.02, type: 'cash' },
                        { label: '$0.05', value: 0.05, type: 'cash' },
                        { label: '$0.10', value: 0.10, type: 'cash' },
                        { label: 'Try Again', value: 0, type: 'none' },
                        { label: '$0.01', value: 0.01, type: 'cash' },
                        { label: 'Bonus', value: 0, type: 'bonus' },
                        { label: '$0.02', value: 0.02, type: 'cash' }
                    ]
                };
                localStorage.setItem(this.DB_SPIN_SETTINGS, JSON.stringify(defaultSpinSettings));
            }

            if (!localStorage.getItem(this.DB_PLATFORM_INCOME)) {
                localStorage.setItem(this.DB_PLATFORM_INCOME, '[]');
            }

            if (!localStorage.getItem(this.DB_SPORTXBET_SETTINGS)) {
                const defaultSportXBetSettings = {
                    heroBgUrl: 'https://img.freepik.com/premium-photo/3d-cricket-bats-hitting-ball-stump-with-trophy-cup-winning-concept-stadium-blue-background_1302-36262.jpg',
                    heroTitle: 'CRICKET FREE BET',
                    heroSub: 'Guaranteed free bet if your bet loses',
                    heroBtnText: 'TAKE PART',
                    promo1Text: 'Accumulator Of The Day >',
                    promo1Img: 'https://sports.mrbet.com/assets/images/promotion/bonus_accumulator.png',
                    promo2Text: 'Cricket Free Bet >',
                    promo2Img: 'https://media.npr.org/assets/img/2024/06/07/gettyimages-2155798939_custom-6345dc7cff0ec843c08cdde59cba6784d1dd6813-s1100-c50.jpg',
                    comp1Img: 'https://img.freepik.com/premium-photo/3d-cricket-bats-hitting-ball-stump-with-trophy-cup-winning-concept-stadium-blue-background_1302-36262.jpg',
                    comp1Title: '🏆 Bangladesh vs Pakistan',
                    comp1Events: '1 Events',
                    comp2Img: 'https://img.freepik.com/premium-photo/3d-cricket-bats-hitting-ball-stump-with-trophy-cup-winning-concept-stadium-blue-background_1302-36262.jpg',
                    comp2Title: '🏆 Australian Champ. Women',
                    comp2Events: '1 Events',
                    comp3Img: 'https://img.freepik.com/premium-photo/3d-cricket-bats-hitting-ball-stump-with-trophy-cup-winning-concept-stadium-blue-background_1302-36262.jpg',
                    comp3Title: '🏆 Pro50 Championship',
                    comp3Events: '2 Events'
                };
                localStorage.setItem(this.DB_SPORTXBET_SETTINGS, JSON.stringify(defaultSportXBetSettings));
            }
        }
    },

    // Retrieve full dataset
    getDb(key) {
        return JSON.parse(localStorage.getItem(key) || '[]');
    },

    getObjDb(key) {
        return JSON.parse(localStorage.getItem(key) || '{}');
    },

    // Save full dataset
    saveDb(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    // Logging action
    logAction(actionDesc) {
        const logs = this.getDb(this.DB_LOGS);
        logs.push({
            time: new Date().toISOString(),
            desc: actionDesc
        });
        if (logs.length > 50) logs.shift();
        this.saveDb(this.DB_LOGS, logs);
    },

    // ─── Admin Alert System ───────────────────────────────────────────────

    /**
     * Add a system event alert for the admin notification feed
     * @param {string} type - 'registration' | 'verification' | 'task' | 'deposit' | 'withdrawal'
     * @param {string} message - Human-readable description
     */
    addAdminAlert(type, message) {
        const alerts = this.getDb(this.DB_ADMIN_ALERTS);
        alerts.unshift({
            id: 'al_' + Date.now(),
            type,
            message,
            time: new Date().toISOString(),
            read: false
        });
        // Keep last 100 alerts
        if (alerts.length > 100) alerts.pop();
        this.saveDb(this.DB_ADMIN_ALERTS, alerts);
    },

    /**
     * Distribute referral commissions for a plan purchase
     */
    distributeReferralCommissions(userId, amount) {
        const users = this.getAllUsers();
        const settings = this.getObjDb(this.DB_SETTINGS);

        const ref1Percent = parseFloat(settings.refLvl1) || 5;
        const ref2Percent = parseFloat(settings.refLvl2) || 3;

        const currentUser = users.find(u => u.id === userId);
        if (!currentUser || !currentUser.referredBy) return;

        // Level 1 Referrer
        const ref1 = users.find(u => u.referralCode === currentUser.referredBy);
        if (ref1) {
            const comm1 = parseFloat(((amount * ref1Percent) / 100).toFixed(2));
            ref1.balance = parseFloat(((ref1.balance || 0) + comm1).toFixed(2));
            ref1.earnings = parseFloat(((ref1.earnings || 0) + comm1).toFixed(2));

            this.addAdminAlert('task', `🔗 Referral Comm: ${ref1.name} earned $${comm1} (Level 1) from ${currentUser.name}'s plan activation`);

            // Level 2 Referrer
            if (ref1.referredBy) {
                const ref2 = users.find(u => u.referralCode === ref1.referredBy);
                if (ref2) {
                    const comm2 = parseFloat(((amount * ref2Percent) / 100).toFixed(2));
                    ref2.balance = parseFloat(((ref2.balance || 0) + comm2).toFixed(2));
                    ref2.earnings = parseFloat(((ref2.earnings || 0) + comm2).toFixed(2));

                    this.addAdminAlert('task', `🔗 Referral Comm: ${ref2.name} earned $${comm2} (Level 2) from ${currentUser.name}'s plan activation`);
                }
            }
        }

        localStorage.setItem('spintask_users', JSON.stringify(users));
    },

    getAdminAlerts() {
        return this.getDb(this.DB_ADMIN_ALERTS);
    },

    getUnreadAdminAlertCount() {
        return this.getAdminAlerts().filter(a => !a.read).length;
    },

    markAllAdminAlertsRead() {
        const alerts = this.getDb(this.DB_ADMIN_ALERTS);
        alerts.forEach(a => a.read = true);
        this.saveDb(this.DB_ADMIN_ALERTS, alerts);
    },

    clearAdminAlerts() {
        this.saveDb(this.DB_ADMIN_ALERTS, []);
    },

    // ─── Settings ────────────────────────────────────────────────────────

    getSetting(key) {
        return this.getObjDb(this.DB_SETTINGS)[key] || '';
    },

    updateSetting(key, val) {
        const settings = this.getObjDb(this.DB_SETTINGS);
        settings[key] = val;
        this.saveDb(this.DB_SETTINGS, settings);
        this.logAction(`Updated setting: ${key}`);
    },

    // ─── Platform Income Tracking ─────────────────────────────────────────

    recordPlatformIncome(category, amount, userId) {
        // category: 'plan' | 'luckydraw' | 'verification'
        const incomeLogs = this.getDb(this.DB_PLATFORM_INCOME);
        incomeLogs.push({
            id: 'inc_' + Date.now() + Math.random().toString(36).substr(2, 5),
            category,
            amount: parseFloat(amount),
            userId,
            date: new Date().toISOString()
        });
        this.saveDb(this.DB_PLATFORM_INCOME, incomeLogs);
    },

    // ─── Support Messaging ────────────────────────────────────────────────
    sendSupportMessage(userId, message, senderType = 'user') {
        const msgs = this.getDb(this.DB_SUPPORT_MESSAGES) || [];
        const msg = {
            id: 'msg_' + Date.now(),
            userId,
            message,
            senderType,
            time: new Date().toISOString(),
            read: false
        };
        msgs.push(msg);
        this.saveDb(this.DB_SUPPORT_MESSAGES, msgs);

        if (senderType === 'user') {
            this.addAdminAlert('task', `💬 New support message from user ID: ${userId}`);
        } else {
            this.sendNotificationToUser(userId, 'Support Reply', `Admin: ${message}`);
        }
        return msg;
    },

    getSupportMessages(userId) {
        const msgs = this.getDb(this.DB_SUPPORT_MESSAGES) || [];
        return msgs.filter(m => m.userId === userId);
    },

    getAllSupportMessages() {
        return this.getDb(this.DB_SUPPORT_MESSAGES) || [];
    },

    // ─── User Notifications (Bell Center) ──────────────────────────────────
    sendNotificationToUser(userId, subject, message) {
        const notes = this.getDb(this.DB_NOTIFICATIONS) || [];
        const note = {
            id: 'notif_' + Date.now(),
            userId,
            subject,
            message,
            date: new Date().toISOString(),
            readBy: []
        };
        notes.push(note);
        this.saveDb(this.DB_NOTIFICATIONS, notes);
        return note;
    },

    getUserNotifications(userId) {
        const all = this.getDb(this.DB_NOTIFICATIONS) || [];
        return all.filter(n => n.userId === userId || n.userId === 'all');
    },

    markNotificationRead(noteId, userId) {
        const all = this.getDb(this.DB_NOTIFICATIONS) || [];
        const idx = all.findIndex(n => n.id === noteId);
        if (idx !== -1) {
            if (!all[idx].readBy.includes(userId)) {
                all[idx].readBy.push(userId);
                this.saveDb(this.DB_NOTIFICATIONS, all);
            }
        }
    },

    // ─── Transfers ────────────────────────────────────────────────────────

    getAllTransfers() {
        return this.getDb(this.DB_TRANSFERS) || [];
    },

    addTransferRecord(transferData) {
        const transfers = this.getAllTransfers();
        transfers.unshift({
            id: 'trf_' + Date.now() + Math.random().toString(36).substr(2, 5),
            date: new Date().toISOString(),
            ...transferData
        });
        if (transfers.length > 500) transfers.length = 500; // Keep last 500 globally
        this.saveDb(this.DB_TRANSFERS, transfers);
    },

    // ─── Spin Settings ────────────────────────────────────────────────────

    getSpinSettings() {
        return this.getObjDb(this.DB_SPIN_SETTINGS);
    },

    saveSpinSettings(data) {
        this.saveDb(this.DB_SPIN_SETTINGS, data);
        this.logAction('Admin updated spin wheel settings');
    },

    // ─── Users Management ─────────────────────────────────────────────────

    getAllUsers() {
        return JSON.parse(localStorage.getItem('spintask_users') || '[]');
    },

    updateUser(updatedUser) {
        const users = this.getAllUsers();
        const index = users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
            users[index] = updatedUser;
            localStorage.setItem('spintask_users', JSON.stringify(users));
            this.logAction(`Admin modified user data: ${updatedUser.email}`);
        }
    },

    suspendUser(userId, suspend) {
        const users = this.getAllUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index].suspended = suspend;
            localStorage.setItem('spintask_users', JSON.stringify(users));
            this.logAction(`Admin ${suspend ? 'suspended' : 'activated'} user ID: ${userId}`);
        }
    },

    updateUserBalance(userId, newBalance) {
        const users = this.getAllUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index].balance = parseFloat(newBalance) || 0;
            localStorage.setItem('spintask_users', JSON.stringify(users));
            this.logAction(`Admin modified balance for user ID: ${userId}`);
        }
    },

    /**
     * Export all user records as a CSV string
     */
    exportUsersCSV() {
        const users = this.getAllUsers();
        const headers = ['Username', 'Email', 'Registration Date', 'Balance (USDT)', 'Total Earnings (USDT)', 'Verified', 'Status'];
        const rows = users.map(u => [
            `"${u.name || ''}"`,
            `"${u.email || ''}"`,
            `"${u.registeredAt ? new Date(u.registeredAt).toLocaleDateString() : (u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A')}"`,
            (u.balance || 0).toFixed(2),
            (u.earnings || 0).toFixed(2),
            u.verified ? 'Yes' : 'No',
            u.suspended ? 'Suspended' : 'Active'
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `spintask_users_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        this.logAction('Admin exported user records as CSV');
    },

    // ─── Tasks Management ─────────────────────────────────────────────────

    createTask(title, desc, reward, type, active = true) {
        const tasks = this.getDb(this.DB_TASKS);
        tasks.push({
            id: 't_' + Date.now(),
            title: title || 'New Task',
            desc: desc || '',
            reward: parseFloat(reward) || 0.01,
            type: type || 'visit',
            active: active
        });
        this.saveDb(this.DB_TASKS, tasks);
        this.logAction(`Admin created new task: ${title}`);
    },

    updateTask(taskId, updates) {
        const tasks = this.getDb(this.DB_TASKS);
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...updates };
            this.saveDb(this.DB_TASKS, tasks);
            this.logAction(`Admin updated task: ${taskId}`);
        }
    },

    toggleTaskStatus(taskId) {
        const tasks = this.getDb(this.DB_TASKS);
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            tasks[index].active = !tasks[index].active;
            this.saveDb(this.DB_TASKS, tasks);
            this.logAction(`Admin toggled task status: ${taskId} → ${tasks[index].active ? 'active' : 'inactive'}`);
        }
    },

    deleteTask(taskId) {
        let tasks = this.getDb(this.DB_TASKS);
        tasks = tasks.filter(t => t.id !== taskId);
        this.saveDb(this.DB_TASKS, tasks);
        this.logAction(`Admin deleted task ID: ${taskId}`);
    },

    // ─── Transactions ─────────────────────────────────────────────────────

    getTransactions(type = 'all') {
        const txs = this.getDb(this.DB_TRANSACTIONS);
        if (type === 'all') return txs;
        return txs.filter(t => t.type === type);
    },

    requestTransaction(userId, type, amount, address, proof = null) {
        const txs = this.getDb(this.DB_TRANSACTIONS);
        const tx = {
            id: 'tx_' + Date.now(),
            userId,
            type,
            amount: parseFloat(amount),
            address, // Can be used for withdrawal address or deposit tx/wallet info
            proof,   // { txId, screenshotData }
            status: 'pending',
            date: new Date().toISOString()
        };
        txs.push(tx);
        this.saveDb(this.DB_TRANSACTIONS, txs);

        // Fire admin alert
        const users = this.getAllUsers();
        const user = users.find(u => u.id === userId);
        const userName = user ? user.name : userId;
        this.addAdminAlert(type, `${type === 'deposit' ? '💰 Deposit' : '💸 Withdrawal'} request: ${userName} — $${parseFloat(amount).toFixed(2)} USDT`);

        return tx;
    },

    resolveTransaction(txId, newStatus) {
        const txs = this.getDb(this.DB_TRANSACTIONS);
        const index = txs.findIndex(t => t.id === txId);
        if (index !== -1 && txs[index].status === 'pending') {
            txs[index].status = newStatus;

            if (newStatus === 'approved') {
                const users = this.getAllUsers();
                const uIndex = users.findIndex(u => u.id === txs[index].userId);
                if (uIndex !== -1) {
                    if (txs[index].type === 'deposit') {
                        users[uIndex].balance += txs[index].amount;
                    } else if (txs[index].type === 'withdraw') {
                        users[uIndex].balance -= txs[index].amount;
                    }
                    localStorage.setItem('spintask_users', JSON.stringify(users));
                }
            }

            this.saveDb(this.DB_TRANSACTIONS, txs);
            this.logAction(`Admin ${newStatus} transaction ${txId}`);
        }
    },

    // ─── Lucky Draw ───────────────────────────────────────────────────────

    buyTicket(drawId, userId) {
        const draws = this.getDb(this.DB_LUCKYDRAWS);
        const tickets = this.getDb(this.DB_TICKETS);
        const users = this.getAllUsers();

        const dIndex = draws.findIndex(d => d.id === drawId);
        const uIndex = users.findIndex(u => u.id === userId);

        if (dIndex === -1 || uIndex === -1) return { success: false, message: 'Invalid Draw or User' };

        const draw = draws[dIndex];
        const user = users[uIndex];

        if (draw.status !== 'active') return { success: false, message: 'Draw is not active' };
        if (draw.remainingTickets <= 0) return { success: false, message: 'No tickets remaining' };
        if (user.balance < draw.price) return { success: false, message: 'Insufficient balance' };

        user.balance -= draw.price;
        draw.remainingTickets -= 1;

        const ticketNumber = 1000 + (draw.totalTickets - draw.remainingTickets);
        const ticket = {
            id: 'tkt_' + Date.now(),
            drawId: draw.id,
            drawTitle: draw.title,
            prize: draw.prize,
            userId: user.id,
            userName: user.name,
            ticketNumber: ticketNumber,
            date: new Date().toISOString()
        };

        tickets.push(ticket);

        this.saveDb(this.DB_LUCKYDRAWS, draws);
        this.saveDb(this.DB_TICKETS, tickets);
        localStorage.setItem('spintask_users', JSON.stringify(users));
        this.logAction(`User ${user.email} purchased ticket #${ticketNumber} for ${draw.title}`);
        this.recordPlatformIncome('luckydraw', draw.price, user.id);

        // Fire admin alert
        this.addAdminAlert('task', `🎉 Lucky Draw: ${user.name} bought a ticket for ${draw.title}`);

        return { success: true, ticketNumber };
    },

    runDraw(drawId, manualWinnerTicketId = null) {
        const draws = this.getDb(this.DB_LUCKYDRAWS);
        const tickets = this.getDb(this.DB_TICKETS);

        const dIndex = draws.findIndex(d => d.id === drawId);
        if (dIndex === -1) return { success: false, message: 'Invalid Draw' };

        const draw = draws[dIndex];
        const drawTickets = tickets.filter(t => t.drawId === drawId);

        if (drawTickets.length === 0) {
            draw.status = 'completed';
            draw.winner = 'No participants';
            this.saveDb(this.DB_LUCKYDRAWS, draws);
            return { success: false, message: 'No participants in this draw' };
        }

        let winnerTicket;
        if (manualWinnerTicketId) {
            winnerTicket = drawTickets.find(t => t.id === manualWinnerTicketId);
        } else {
            const randomIndex = Math.floor(Math.random() * drawTickets.length);
            winnerTicket = drawTickets[randomIndex];
        }

        if (!winnerTicket) return { success: false, message: 'Winner ticket not found' };

        draw.status = 'completed';
        draw.winner = {
            name: winnerTicket.userName,
            ticketNumber: winnerTicket.ticketNumber,
            userId: winnerTicket.userId
        };

        this.saveDb(this.DB_LUCKYDRAWS, draws);
        this.logAction(`Draw ${draw.title} completed. Winner: ${winnerTicket.userName} (#${winnerTicket.ticketNumber})`);

        return { success: true, winner: draw.winner };
    },

    createLuckyDraw(title, prize, image, price, totalTickets, drawDate) {
        const draws = this.getDb(this.DB_LUCKYDRAWS);
        const newDraw = {
            id: 'ld_' + Date.now(),
            title,
            prize,
            image: image || 'https://via.placeholder.com/400x300?text=No+Image',
            price: parseFloat(price),
            totalTickets: parseInt(totalTickets),
            remainingTickets: parseInt(totalTickets),
            drawDate: new Date(drawDate).toISOString(),
            status: 'active'
        };
        draws.push(newDraw);
        this.saveDb(this.DB_LUCKYDRAWS, draws);
        this.logAction(`Admin created new lucky draw: ${title}`);
    },

    // ─── Broadcast / Notifications ────────────────────────────────────────

    sendBroadcast(target, subject, message) {
        const notifications = this.getDb(this.DB_NOTIFICATIONS);
        const users = this.getAllUsers();
        let targetUserIds = [];

        if (target === 'all') {
            targetUserIds = users.filter(u => u.role !== 'admin').map(u => u.id);
        } else if (target === 'active') {
            targetUserIds = users.filter(u => u.role !== 'admin' && !u.suspended).map(u => u.id);
        } else if (target === 'depositors') {
            const txs = this.getTransactions('deposit').filter(t => t.status === 'approved');
            const depositorIds = new Set(txs.map(t => t.userId));
            targetUserIds = users.filter(u => depositorIds.has(u.id)).map(u => u.id);
        }

        const newNotification = {
            id: 'nt_' + Date.now(),
            target,
            subject,
            message,
            date: new Date().toISOString(),
            targetUserIds: targetUserIds,
            readBy: []
        };

        notifications.push(newNotification);
        this.saveDb(this.DB_NOTIFICATIONS, notifications);
        this.logAction(`Admin sent broadcast: ${subject} to ${target}`);
        return { success: true, count: targetUserIds.length };
    },

    updateAnnouncement(text, enabled) {
        const announcement = { text, enabled };
        localStorage.setItem(this.DB_ANNOUNCEMENTS, JSON.stringify(announcement));
        this.logAction(`Admin updated site announcement banner`);
    },

    getAnnouncement() {
        return JSON.parse(localStorage.getItem(this.DB_ANNOUNCEMENTS) || '{"text": "", "enabled": false}');
    },

    getUserNotifications(userId) {
        const all = this.getDb(this.DB_NOTIFICATIONS);
        return all.filter(n => n.targetUserIds.includes(userId));
    },

    markNotificationRead(noteId, userId) {
        const notes = this.getDb(this.DB_NOTIFICATIONS);
        const nIndex = notes.findIndex(n => n.id === noteId);
        if (nIndex !== -1) {
            if (!notes[nIndex].readBy.includes(userId)) {
                notes[nIndex].readBy.push(userId);
                this.saveDb(this.DB_NOTIFICATIONS, notes);
            }
        }
    },

    // ─── Community Links ─────────────────────────────────────────────────

    getCommunityLinks() {
        return this.getObjDb(this.DB_COMMUNITY_LINKS);
    },

    saveCommunityLinks(data) {
        this.saveDb(this.DB_COMMUNITY_LINKS, data);
        this.logAction('Admin updated community links');
    },

    // ─── Social Media ─────────────────────────────────────────────────────

    getSocialMedia() {
        return this.getObjDb(this.DB_SOCIAL_MEDIA);
    },

    saveSocialMedia(data) {
        this.saveDb(this.DB_SOCIAL_MEDIA, data);
        this.logAction('Admin updated social media links');
    },

    // ─── Analytics Dashboard Helpers ──────────────────────────────────────────

    getDashboardAnalytics(timeRange = 'today') {
        const users = Auth.getUsers() || [];
        const txs = this.getDb(this.DB_TRANSACTIONS) || [];

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const filterDate = (dateStr) => {
            if (timeRange === 'all') return true;
            const d = new Date(dateStr);
            if (timeRange === 'today') return d >= startOfDay;
            if (timeRange === 'week') return d >= startOfWeek;
            if (timeRange === 'month') return d >= startOfMonth;
            return true;
        };

        // Date-filtered metrics
        let deposits = 0, withdrawals = 0, registrations = 0, refEarnings = 0;

        // Categorized custom income
        let incomePlan = 0, incomeDraw = 0, incomeVerify = 0;
        const incomeLogs = this.getDb(this.DB_PLATFORM_INCOME) || [];
        incomeLogs.filter(i => filterDate(i.date)).forEach(i => {
            if (i.category === 'plan') incomePlan += i.amount;
            if (i.category === 'luckydraw') incomeDraw += i.amount;
            if (i.category === 'verification') incomeVerify += i.amount;
        });

        txs.filter(t => filterDate(t.date)).forEach(t => {
            if (t.type === 'deposit' && t.status === 'approved') deposits += t.amount || 0;
            if (t.type === 'withdraw' && t.status === 'approved') withdrawals += t.amount || 0;
        });

        users.filter(u => filterDate(u.registeredAt || u.createdAt)).forEach(u => {
            registrations++;
        });

        // Profit (Deposits - Withdrawals)
        const profit = deposits - withdrawals;

        // All Time Totals (for profit/overall)
        let allTimeDep = 0, allTimeWith = 0;
        txs.forEach(t => {
            if (t.type === 'deposit' && t.status === 'approved') allTimeDep += t.amount || 0;
            if (t.type === 'withdraw' && t.status === 'approved') allTimeWith += t.amount || 0;
        });
        const allTimeProfit = allTimeDep - allTimeWith;

        // "This Month" profit specifically for that card
        let monthDep = 0, monthWith = 0;
        txs.filter(t => new Date(t.date) >= startOfMonth).forEach(t => {
            if (t.type === 'deposit' && t.status === 'approved') monthDep += t.amount || 0;
            if (t.type === 'withdraw' && t.status === 'approved') monthWith += t.amount || 0;
        });
        const monthProfit = monthDep - monthWith;

        // Summary items (pending)
        let pendingDep = 0, pendingWith = 0;
        txs.filter(t => t.status === 'pending').forEach(t => {
            if (t.type === 'deposit') pendingDep++;
            if (t.type === 'withdraw') pendingWith++;
        });

        // User Activity
        // Active users = users with balance > 0 or earnings > 0
        const activeUsersCount = users.filter(u => (u.balance > 0 || u.earnings > 0)).length;
        // Simulated online users based on a base and random flux, capped at active users or total
        const baseOnline = Math.max(1, Math.floor(users.length * 0.15));
        const onlineUsers = Math.min(users.length, baseOnline + Math.floor(Math.random() * 5));

        // Leaderboards Calculation
        // Calculate total deposits / earnings per user within the timeframe
        let userStats = {};
        users.forEach(u => {
            userStats[u.id] = { id: u.id, name: u.name, totalDep: 0, earnings: u.earnings || 0, refs: u.referralCount || 0 };
        });

        txs.filter(t => filterDate(t.date) && t.status === 'approved' && t.type === 'deposit').forEach(t => {
            if (userStats[t.userId]) userStats[t.userId].totalDep += t.amount;
        });

        const usersArr = Object.values(userStats);

        // Sorting for leaderboards
        const topEarner = [...usersArr].sort((a, b) => b.earnings - a.earnings).slice(0, 5);
        const topInvestor = [...usersArr].sort((a, b) => b.totalDep - a.totalDep).slice(0, 5);
        const topReferrer = [...usersArr].sort((a, b) => b.refs - a.refs).slice(0, 5);

        return {
            filtered: { deposits, withdrawals, registrations, profit, refEarnings },
            profit: { today: profit, month: monthProfit, allTime: allTimeProfit },
            summary: { totalDep: allTimeDep, totalWith: allTimeWith, pendingDep, pendingWith },
            users: { online: onlineUsers, active: activeUsersCount, total: users.length },
            leaderboards: { topEarner, topInvestor, topReferrer },
            categorizedIncome: { plan: incomePlan, luckydraw: incomeDraw, verification: incomeVerify }
        };
    },

    // ─── Trading Investment Admin Methods ─────────────────────────────────

    /**
     * Get all active trading investments across all users
     */
    getAllTradingInvestments() {
        return JSON.parse(localStorage.getItem('spintask_trading_investments') || '[]');
    },

    /**
     * Get active trading investments grouped by plan
     * @returns {Object} { basic: [...], regular: [...], premium: [...] }
     */
    getTradingByPlan() {
        const all = this.getAllTradingInvestments().filter(i => i.status === 'active');
        const users = this.getAllUsers();
        const getUserName = (id) => { const u = users.find(u => u.id === id); return u ? u.name : id; };
        const getUserEmail = (id) => { const u = users.find(u => u.id === id); return u ? u.email : ''; };
        return {
            basic: all.filter(i => i.planId === 'basic').map(i => ({ ...i, userName: getUserName(i.userId), userEmail: getUserEmail(i.userId) })),
            standard: all.filter(i => i.planId === 'standard').map(i => ({ ...i, userName: getUserName(i.userId), userEmail: getUserEmail(i.userId) })),
            gold: all.filter(i => i.planId === 'gold').map(i => ({ ...i, userName: getUserName(i.userId), userEmail: getUserEmail(i.userId) }))
        };
    },

    /**
     * Update daily profit rate for a plan
     * @param {string} planId - 'basic' | 'standard' | 'gold'
     * @param {number} rate - percentage (5 to 8)
     */
    setTradingRate(planId, rate) {
        const r = parseFloat(rate);
        if (isNaN(r) || r < 0 || r > 100) return false;
        const key = `ti_${planId}_rate`;
        this.updateSetting(key, r);
        this.logAction(`Admin set ${planId} trading plan rate to ${r}%`);
        return true;
    },

    /**
     * Manually credit all active trading investors for a plan now
     */
    manualCreditTrading(planId) {
        const PLANS_AMOUNTS = { basic: 25, standard: 50, gold: 100 };
        const investments = this.getAllTradingInvestments();
        const users = JSON.parse(localStorage.getItem('spintask_users') || '[]');
        const rate = parseFloat(this.getSetting(`ti_${planId}_rate`)) || (planId === 'basic' ? 5 : planId === 'standard' ? 6 : 7);
        let credited = 0;

        investments.forEach(inv => {
            if (inv.planId !== planId || inv.status !== 'active') return;
            const dailyProfit = parseFloat(((inv.amount * rate) / 100).toFixed(2));
            const uIdx = users.findIndex(u => u.id === inv.userId);
            if (uIdx !== -1) {
                users[uIdx].balance = parseFloat(((users[uIdx].balance || 0) + dailyProfit).toFixed(2));
                users[uIdx].earnings = parseFloat(((users[uIdx].earnings || 0) + dailyProfit).toFixed(2));
                inv.totalCredited = parseFloat(((inv.totalCredited || 0) + dailyProfit).toFixed(2));
                inv.lastCreditDate = new Date().toISOString();
                credited++;
            }
        });

        localStorage.setItem('spintask_users', JSON.stringify(users));
        localStorage.setItem('spintask_trading_investments', JSON.stringify(investments));
        const message = `Successfully credited ${credited} users in ${planId} plan @ ${rate}%`;
        this.logAction(message);
        this.addAdminAlert('task', `📈 Trading: ${message}`);
        return { success: true, message, credited };
    },

    getChartData() {
        const txs = this.getDb(this.DB_TRANSACTIONS) || [];
        const users = Auth.getUsers() || [];

        // Create an array for the last 7 days
        const labels = [];
        const deposits = [];
        const withdrawals = [];
        const newUsers = [];

        const now = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            labels.push(dateStr);

            // Map transactions to this exact day
            const startOfDay = new Date(d);
            const endOfDay = new Date(d);
            endOfDay.setDate(endOfDay.getDate() + 1);

            let dayDep = 0;
            let dayWith = 0;

            txs.filter(t => t.status === 'approved').forEach(t => {
                const txD = new Date(t.date);
                if (txD >= startOfDay && txD < endOfDay) {
                    if (t.type === 'deposit') dayDep += t.amount;
                    if (t.type === 'withdraw') dayWith += t.amount;
                }
            });

            let dayUsers = 0;
            users.forEach(u => {
                const ud = new Date(u.registeredAt || u.createdAt);
                if (ud >= startOfDay && ud < endOfDay) dayUsers++;
            });

            deposits.push(dayDep);
            withdrawals.push(dayWith);
            newUsers.push(dayUsers);
        }

        return { labels, deposits, withdrawals, newUsers };
    },

    // ─── SportXBet ────────────────────────────────────────────────────────

    getSportXBetSettings() {
        return this.getObjDb(this.DB_SPORTXBET_SETTINGS) || {};
    },

    saveSportXBetSettings(data) {
        this.saveDb(this.DB_SPORTXBET_SETTINGS, data);
        this.logAction('Admin updated SportXBet UI Settings');
    },

    getMatches() {
        return this.getDb(this.DB_SPORTXBET_MATCHES) || [];
    },

    addMatch(sport, teamA, teamB, oddsA, oddsB, isLive) {
        const matches = this.getMatches();
        const newMatch = {
            id: 'm_' + Date.now(),
            sport, teamA, teamB,
            oddsA: parseFloat(oddsA),
            oddsB: parseFloat(oddsB),
            isLive: !!isLive,
            status: 'upcoming',
            winner: null
        };
        matches.push(newMatch);
        this.saveDb(this.DB_SPORTXBET_MATCHES, matches);
        this.logAction(`Admin added SportXBet match: ${teamA} vs ${teamB}`);
        return newMatch;
    },

    updateMatch(matchId, sport, teamA, teamB, oddsA, oddsB, isLive, status) {
        const matches = this.getMatches();
        const m = matches.find(x => x.id === matchId);
        if(m) {
            m.sport = sport;
            m.teamA = teamA;
            m.teamB = teamB;
            m.oddsA = parseFloat(oddsA);
            m.oddsB = parseFloat(oddsB);
            m.isLive = !!isLive;
            m.status = status;
            this.saveDb(this.DB_SPORTXBET_MATCHES, matches);
            this.logAction(`Admin updated SportXBet match: ${teamA} vs ${teamB}`);
        }
    },

    updateMatchStatus(matchId, status) {
        const matches = this.getMatches();
        const match = matches.find(m => m.id === matchId);
        if (match) {
            match.status = status;
            this.saveDb(this.DB_SPORTXBET_MATCHES, matches);
        }
    },

    deleteMatch(matchId) {
        let matches = this.getMatches();
        matches = matches.filter(m => m.id !== matchId);
        this.saveDb(this.DB_SPORTXBET_MATCHES, matches);
    },

    getBets() {
        return this.getDb(this.DB_SPORTXBET_BETS) || [];
    },

    placeBet(userId, matchId, team, amount, odds) {
        const users = this.getAllUsers();
        const uIndex = users.findIndex(u => u.id === userId);
        if (uIndex === -1) return { success: false, message: 'User not found' };

        const user = users[uIndex];
        const betAmount = parseFloat(amount);
        if (user.balance < betAmount) return { success: false, message: 'Insufficient balance' };

        user.balance -= betAmount;
        localStorage.setItem('spintask_users', JSON.stringify(users));

        const bets = this.getBets();
        const newBet = {
            id: 'b_' + Date.now(),
            userId, userName: user.name, userEmail: user.email,
            matchId, team, amount: betAmount, odds: parseFloat(odds),
            potentialPayout: betAmount * parseFloat(odds),
            status: 'pending', date: new Date().toISOString()
        };
        bets.unshift(newBet);
        this.saveDb(this.DB_SPORTXBET_BETS, bets);
        this.logAction(`User ${user.email} placed $${betAmount} bet on ${team}`);
        this.addAdminAlert('task', `📉 SportXBet: ${user.name} placed $${betAmount} bet on ${team}`);

        return { success: true, message: 'Bet placed successfully!', newBalance: user.balance };
    },

    processMatchResult(matchId, winningTeam) {
        const matches = this.getMatches();
        const match = matches.find(m => m.id === matchId);
        if (!match) return { success: false, message: 'Match not found' };

        match.status = 'finished';
        match.winner = winningTeam;
        this.saveDb(this.DB_SPORTXBET_MATCHES, matches);

        const bets = this.getBets();
        const users = this.getAllUsers();
        let totalPayout = 0;
        let winnersCount = 0;

        bets.forEach(bet => {
            if (bet.matchId === matchId && bet.status === 'pending') {
                if (bet.team === winningTeam) {
                    bet.status = 'won';
                    const uIndex = users.findIndex(u => u.id === bet.userId);
                    if (uIndex !== -1) {
                        users[uIndex].balance = parseFloat((users[uIndex].balance + bet.potentialPayout).toFixed(2));
                        users[uIndex].earnings = parseFloat(((users[uIndex].earnings || 0) + (bet.potentialPayout - bet.amount)).toFixed(2));
                        totalPayout += bet.potentialPayout;
                        winnersCount++;
                    }
                } else {
                    bet.status = 'lost';
                }
            }
        });

        this.saveDb(this.DB_SPORTXBET_BETS, bets);
        localStorage.setItem('spintask_users', JSON.stringify(users));
        this.logAction(`Processed results for match ${matchId}. Paid out $${totalPayout} to ${winnersCount} winners.`);
        this.addAdminAlert('task', `🏆 SportXBet: Processed results for match ${matchId}. Paid $${totalPayout.toFixed(2)} to ${winnersCount} winners.`);
        
        return { success: true, message: `Processed results. Paid out $${totalPayout.toFixed(2)} to ${winnersCount} winners.` };
    }
};

// Initialize Admin Storage if not exists
document.addEventListener('DOMContentLoaded', () => {
    Admin.init();
});
