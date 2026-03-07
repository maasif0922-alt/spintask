/**
 * SpinTask - App Frontend & Global Trading Logic
 */

const Trading = {
    TI_KEY: 'spintask_trading_investments',

    PLANS_DEF: [
        {
            id: 'basic',
            name: 'Basic',
            icon: '🌱',
            tagline: 'Perfect for beginners',
            price: 25,
            colorClass: 'basic',
            settingKey: 'ti_basic_rate',
            defaultRate: 5,
            badge: null,
            duration: 60
        },
        {
            id: 'standard',
            name: 'Standard',
            icon: '📊',
            tagline: 'Best value for steady growth',
            price: 50,
            colorClass: 'regular',
            settingKey: 'ti_standard_rate',
            defaultRate: 6,
            badge: 'MOST POPULAR',
            badgeClass: 'popular',
            duration: 60
        },
        {
            id: 'gold',
            name: 'Gold',
            icon: '💎',
            tagline: 'Maximum returns for serious traders',
            price: 100,
            colorClass: 'premium',
            settingKey: 'ti_gold_rate',
            defaultRate: 7,
            badge: '🔥 HOT',
            badgeClass: 'hot',
            duration: 60
        }
    ],

    getRate(plan) {
        if (typeof Admin !== 'undefined') {
            const stored = Admin.getSetting(plan.settingKey);
            const r = parseFloat(stored);
            return (!isNaN(r) && r > 0) ? r : plan.defaultRate;
        } else {
            const settings = JSON.parse(localStorage.getItem('spintask_settings') || '{}');
            const r = parseFloat(settings[plan.settingKey]);
            return (!isNaN(r) && r > 0) ? r : plan.defaultRate;
        }
    },

    getUserInvestments() {
        return JSON.parse(localStorage.getItem(this.TI_KEY) || '[]');
    },

    saveUserInvestments(inv) {
        localStorage.setItem(this.TI_KEY, JSON.stringify(inv));
    },

    getUserActivePlan(userId, planId) {
        return this.getUserInvestments().find(i => i.userId === userId && i.planId === planId && i.status === 'active');
    },

    processDailyProfits() {
        const investments = this.getUserInvestments();
        if (investments.length === 0) return;

        const users = JSON.parse(localStorage.getItem('spintask_users') || '[]');
        const now = new Date();
        let updated = false;

        investments.forEach(inv => {
            if (inv.status !== 'active') return;

            const startDate = new Date(inv.startDate);
            const daysActive = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));

            if (daysActive >= 60) {
                inv.status = 'completed';
                updated = true;
                return;
            }

            const lastCredit = new Date(inv.lastCreditDate);
            const hoursSince = (now - lastCredit) / (1000 * 60 * 60);

            if (hoursSince >= 24) {
                const plan = this.PLANS_DEF.find(p => p.id === inv.planId);
                if (!plan) return;

                const baseRate = this.getRate(plan);
                const rate = baseRate + (inv.reinvestBonus || 0);
                const dailyProfit = parseFloat(((inv.amount * rate) / 100).toFixed(2));

                const uIdx = users.findIndex(u => u.id === inv.userId);
                if (uIdx !== -1) {
                    users[uIdx].balance = parseFloat(((users[uIdx].balance || 0) + dailyProfit).toFixed(2));
                    users[uIdx].earnings = parseFloat(((users[uIdx].earnings || 0) + dailyProfit).toFixed(2));
                    inv.totalCredited = parseFloat(((inv.totalCredited || 0) + dailyProfit).toFixed(2));
                    inv.lastCreditDate = now.toISOString();
                    updated = true;
                }
            }
        });

        if (updated) {
            localStorage.setItem('spintask_users', JSON.stringify(users));
            this.saveUserInvestments(investments);
            if (typeof Auth !== 'undefined') {
                const currentUser = Auth.getCurrentUser();
                if (currentUser) {
                    window.dispatchEvent(new CustomEvent('auth:balanceUpdated', { detail: { balance: currentUser.balance } }));
                }
            }
        }
    },

    reinvestProfits(userId, investmentId) {
        const investments = this.getUserInvestments();
        const users = JSON.parse(localStorage.getItem('spintask_users') || '[]');

        const invIdx = investments.findIndex(i => i.id === investmentId && i.userId === userId && i.status === 'active');
        const uIdx = users.findIndex(u => u.id === userId);

        if (invIdx !== -1 && uIdx !== -1) {
            const inv = investments[invIdx];
            const earnedAmount = inv.totalCredited || 0;

            if (earnedAmount <= 0) {
                return { success: false, message: 'No profits earned yet to reinvest.' };
            }

            if (users[uIdx].balance < earnedAmount) {
                return { success: false, message: 'Insufficient balance. You may have withdrawn your earnings.' };
            }

            users[uIdx].balance = parseFloat((users[uIdx].balance - earnedAmount).toFixed(2));
            inv.amount = parseFloat((inv.amount + earnedAmount).toFixed(2));
            inv.reinvestBonus = parseFloat(((inv.reinvestBonus || 0) + 0.5).toFixed(2));
            inv.totalCredited = 0;

            localStorage.setItem('spintask_users', JSON.stringify(users));
            this.saveUserInvestments(investments);

            if (typeof Auth !== 'undefined') {
                window.dispatchEvent(new CustomEvent('auth:balanceUpdated', { detail: { balance: users[uIdx].balance } }));
            }

            return { success: true, message: `Successfully reinvested profits! Daily rate increased by 0.5%.` };
        }
        return { success: false, message: 'Investment not found or User not found.' };
    }
};

const App = {
    init() {
        console.log('SpinTask App Initialized');
        // Automatically process daily profits globally on app load
        Trading.processDailyProfits();
        this.bindEvents();
        this.renderContent();
    },

    bindEvents() {
        // App logic initialized
    },

    renderContent() {
        const path = window.location.pathname;
        console.log('Navigating to:', path);
    },

    isAuthenticated() {
        return !!localStorage.getItem('spintask_user');
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
