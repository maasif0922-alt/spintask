/**
 * Global Configuration - Source of Truth for all users.
 * This file is updated by the Assistant when requested by the Admin.
 */
const GLOBAL_CONFIG = {
    settings: {
        siteName: 'SpinTask',
        supportEmail: 'support@spintask.com',
        depositAddress: 'TRC20_WALLET_ADDRESS_HERE',
        btcAddress: 'BTC_WALLET_ADDRESS_HERE',
        minDeposit: 10,
        minWithdraw: 20,
        refLvl1: 5,
        refLvl2: 3,
        allowTransfers: true,
        ti_basic_rate: 5,
        ti_standard_rate: 6,
        ti_gold_rate: 7
    },
    signal: {
        enabled: true,
        telegramUrl: 'https://t.me/your_signal_group',
        buttonText: '🚀 VIP Signal Hub',
        subText: 'Join our official signal community and never miss profitable updates.'
    },
    tasks: [
        { id: 't1', title: 'Visit Website', desc: 'Visit the sponsor website and stay for 30 seconds.', reward: 0.05, type: 'visit', active: true, duration: 30 },
        { id: 't2', title: 'Watch Video', desc: 'Watch the promotional video until the end.', reward: 0.10, type: 'video', active: true, duration: 60 }
    ],
    announcement: {
        text: '🎉 Big News! Mobile Lucky Draw has started. Buy tickets now and win amazing prizes.',
        enabled: true
    },
    version: '1.0.0',
    lastUpdated: new Date().toISOString()
};
