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

    // Default Settings Initialization
    init() {
        if (!localStorage.getItem(this.DB_SETTINGS)) {
            const defaultSettings = {
                siteName: 'SpinTask',
                supportEmail: 'support@spintask.com',
                depositAddress: 'TRC20_DEFAULT_ADDRESS_HERE',
                minDeposit: 10,
                minWithdraw: 20,
                refLvl1: 10,
                refLvl2: 5
            };
            localStorage.setItem(this.DB_SETTINGS, JSON.stringify(defaultSettings));
        }

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
                { id: 't1', title: 'Visit Website', reward: 0.05, type: 'visit', active: true },
                { id: 't2', title: 'Watch Video', reward: 0.10, type: 'video', active: true }
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

        if (!localStorage.getItem(this.DB_COMMUNITY_LINKS)) {
            const defaultCommunity = {
                telegramLink: 'https://t.me/your_group',
                whatsappGroupLink: 'https://chat.whatsapp.com/your_group',
                whatsappCommunityLink: 'https://chat.whatsapp.com/your_community',
                activeLink: 'telegram' // 'telegram' | 'whatsappGroup' | 'whatsappCommunity'
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
        // Keep only last 50 logs to save space
        if (logs.length > 50) logs.shift();
        this.saveDb(this.DB_LOGS, logs);
    },

    // Get specific settings
    getSetting(key) {
        return this.getObjDb(this.DB_SETTINGS)[key] || '';
    },

    updateSetting(key, val) {
        const settings = this.getObjDb(this.DB_SETTINGS);
        settings[key] = val;
        this.saveDb(this.DB_SETTINGS, settings);
        this.logAction(`Updated setting: ${key}`);
    },

    // Users Management Wrapper
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

    // Tasks Management Wrapper
    createTask(title, desc, reward, duration) {
        const tasks = this.getDb(this.DB_TASKS);
        tasks.push({
            id: 't_' + Date.now(),
            title: title || 'New Task',
            desc: desc || '',
            reward: parseFloat(reward) || 0.01,
            duration: parseInt(duration) || 10,
            active: true
        });
        this.saveDb(this.DB_TASKS, tasks);
        this.logAction(`Admin created new task: ${title}`);
    },

    deleteTask(taskId) {
        let tasks = this.getDb(this.DB_TASKS);
        tasks = tasks.filter(t => t.id !== taskId);
        this.saveDb(this.DB_TASKS, tasks);
        this.logAction(`Admin deleted task ID: ${taskId}`);
    },

    // Transactions
    getTransactions(type = 'all') { // type: 'deposit', 'withdraw', 'all'
        const txs = this.getDb(this.DB_TRANSACTIONS);
        if (type === 'all') return txs;
        return txs.filter(t => t.type === type);
    },

    // Creating mock transaction (for users depositing)
    requestTransaction(userId, type, amount, address) {
        const txs = this.getDb(this.DB_TRANSACTIONS);
        const tx = {
            id: 'tx_' + Date.now(),
            userId,
            type,
            amount: parseFloat(amount),
            address,
            status: 'pending',
            date: new Date().toISOString()
        };
        txs.push(tx);
        this.saveDb(this.DB_TRANSACTIONS, txs);
        return tx;
    },

    resolveTransaction(txId, newStatus) { // 'approved' or 'rejected'
        const txs = this.getDb(this.DB_TRANSACTIONS);
        const index = txs.findIndex(t => t.id === txId);
        if (index !== -1 && txs[index].status === 'pending') {
            txs[index].status = newStatus;

            // Apply balance changes
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

    // Lucky Draw Methods
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

        // Deduct balance
        user.balance -= draw.price;
        draw.remainingTickets -= 1;

        // Create ticket
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

        // Save
        this.saveDb(this.DB_LUCKYDRAWS, draws);
        this.saveDb(this.DB_TICKETS, tickets);
        localStorage.setItem('spintask_users', JSON.stringify(users));
        this.logAction(`User ${user.email} purchased ticket #${ticketNumber} for ${draw.title}`);

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

    // Notification Hub Logic
    sendBroadcast(target, subject, message) {
        const notifications = this.getDb(this.DB_NOTIFICATIONS);
        const users = this.getAllUsers();
        let targetUserIds = [];

        if (target === 'all') {
            targetUserIds = users.filter(u => u.role !== 'admin').map(u => u.id);
        } else if (target === 'active') {
            // Logic for active could be last login date, but for now we'll treat all as active unless suspended
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
            readBy: [] // Track which users have read it
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

    // Community Links
    getCommunityLinks() {
        return this.getObjDb(this.DB_COMMUNITY_LINKS);
    },
    saveCommunityLinks(data) {
        this.saveDb(this.DB_COMMUNITY_LINKS, data);
        this.logAction('Admin updated community links');
    },

    // Social Media
    getSocialMedia() {
        return this.getObjDb(this.DB_SOCIAL_MEDIA);
    },
    saveSocialMedia(data) {
        this.saveDb(this.DB_SOCIAL_MEDIA, data);
        this.logAction('Admin updated social media links');
    }
};

// Initialize Admin Storage if not exists
document.addEventListener('DOMContentLoaded', () => {
    Admin.init();
});
