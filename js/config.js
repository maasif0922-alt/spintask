/**
 * Global Configuration - Source of Truth for all users.
 * This file is updated by the Assistant when requested by the Admin.
 */
const GLOBAL_CONFIG = {
    "settings": {
        "siteName": "SpinTask",
        "supportEmail": "support@spintask.com",
        "depositAddress": "TF49Zav6GJoHtagHYhNcQHHe4EioBywrkZ",
        "minDeposit": 10,
        "minWithdraw": 20,
        "refLvl1": 5,
        "refLvl2": 3,
        "ti_basic_rate": 2,
        "ti_standard_rate": 3.5,
        "ti_gold_rate": 4.5,
        "btcAddress": "BTC_WALLET_ADDRESS_HERE",
        "allowTransfers": true
    },
    "signal": {
        "enabled": true,
        "telegramUrl": "https://t.me/your_signal_group",
        "buttonText": "🚀 VIP Signal Hub",
        "subText": "Join our official signal community and never miss profitable updates."
    },
    "tasks": [
        {
            "id": "t1",
            "title": "Visit Website",
            "desc": "Visit the sponsor website and stay for 30 seconds.",
            "reward": 0.05,
            "type": "visit",
            "active": true,
            "duration": 30
        },
        {
            "id": "t2",
            "title": "Watch Video",
            "desc": "Watch the promotional video until the end.",
            "reward": 0.1,
            "type": "video",
            "active": true,
            "duration": 60
        }
    ],
    "announcement": {
        "text": "🎉 Big News! Mobile Lucky Draw ",
        "enabled": true
    },
    "version": "1.0.4555",
    "lastUpdated": "2026-03-07T05:28:44.555Z"
};
