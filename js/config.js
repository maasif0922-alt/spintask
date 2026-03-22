/**
 * Global Configuration - Source of Truth for all users.
 * This file is updated by the Assistant when pushing new data bundles.
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
        "btcAddress": "BTC_WALLET_ADDRESS_HERE",
        "ti_basic_rate": 2,
        "ti_regular_rate": 6,
        "ti_premium_rate": 7,
        "ti_standard_rate": 3.5,
        "ti_gold_rate": 4.5,
        "allowTransfers": true
    },
    "tasks": [
        {
            "id": "t_1773782243127",
            "title": "earn money",
            "desc": "visit and like vedio",
            "reward": 3,
            "type": "visit",
            "active": true
        }
    ],
    "content": {
        "aboutText": "The most trusted micro-task platform.",
        "termsText": "These are the default terms and conditions.",
        "homeHero": "Earn USDT Online with Simple Tasks and Spins",
        "homeSub": "Complete simple actions, spin the daily wheel, and withdraw your earnings directly to your Binance wallet.",
        "privacyText": "Your privacy is important. We encrypt your data.",
        "contactText": "Get in touch with us for support and inquiries."
    },
    "luckydraws": [
        {
            "id": "ld1",
            "title": "Mobile Phone Draw",
            "prize": "iPhone 15 Pro Max",
            "image": "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400&auto=format&fit=crop&q=60",
            "price": 1,
            "totalTickets": 500,
            "remainingTickets": 498,
            "drawDate": "2026-03-13T08:28:27.417Z",
            "status": "active"
        },
        {
            "id": "ld2",
            "title": "Used Car Draw",
            "prize": "Toyota Corolla 2018",
            "image": "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&auto=format&fit=crop&q=60",
            "price": 2,
            "totalTickets": 1000,
            "remainingTickets": 998,
            "drawDate": "2026-03-20T08:28:27.417Z",
            "status": "active"
        },
        {
            "id": "ld3",
            "title": "New Car Draw",
            "prize": "Tesla Model 3",
            "image": "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&auto=format&fit=crop&q=60",
            "price": 5,
            "totalTickets": 2000,
            "remainingTickets": 1999,
            "drawDate": "2026-04-05T08:28:27.417Z",
            "status": "active"
        },
        {
            "id": "ld_1772860827799",
            "title": "Khan Mobile",
            "prize": "iphone 3",
            "image": "https://via.placeholder.com/400x300?text=No+Image",
            "price": 50,
            "totalTickets": 100,
            "remainingTickets": 100,
            "drawDate": "2016-04-01T00:00:00.000Z",
            "status": "active"
        },
        {
            "id": "ld_1773783452954",
            "title": "asif ",
            "prize": "loptop",
            "image": "https://www.google.com/imgres?q=mobile%20phone&imgurl=https%3A%2F%2Fcellmart.pk%2Fwp-content%2Fuploads%2F2025%2F10%2Fvivo-y21d-red-cellmart-350x350.png&imgrefurl=https%3A%2F%2Fcellmart.pk%2Fmobile-phones%2F&docid=P0szs0yQ0KWRzM&tbnid=I7gVvrzlr_okGM&vet=12ahUKEwjQ97WPk6mTAxV_VKQEHa6tOa0QnPAOegQIIBAB..i&w=350&h=350&hcb=2&ved=2ahUKEwjQ97WPk6mTAxV_VKQEHa6tOa0QnPAOegQIIBAB",
            "price": 456,
            "totalTickets": 544,
            "remainingTickets": 544,
            "drawDate": "2026-03-03T00:00:00.000Z",
            "status": "active"
        }
    ],
    "signal": {
        "enabled": true,
        "telegramUrl": "https://t.me/your_signal_group",
        "buttonText": "🚀 VIP Signal Hub",
        "subText": "Join our official signal community and never miss profitable updates."
    },
    "community_links": {
        "telegramLink": "https://t.me/+f2-FUTEOIAtjOTE0",
        "whatsappGroupLink": "",
        "whatsappCommunityLink": "",
        "activeLink": "telegram"
    },
    "social_media": {
        "facebook": {
            "url": "https://facebook.com/",
            "enabled": true
        },
        "telegram": {
            "url": "https://t.me/your_channel",
            "enabled": true
        },
        "whatsapp": {
            "url": "https://chat.whatsapp.com/your_group",
            "enabled": true
        },
        "tiktok": {
            "url": "https://tiktok.com/@your_page",
            "enabled": true
        },
        "instagram": {
            "url": "https://instagram.com/your_page",
            "enabled": true
        },
        "youtube": {
            "url": "https://youtube.com/@your_channel",
            "enabled": true
        }
    },
    "announcement": {
        "text": "🎉 Asif love you",
        "enabled": true
    },
    "spin_settings": {
        "enabled": true,
        "segments": [
            {
                "label": "$0.01",
                "value": 0.01,
                "type": "cash"
            },
            {
                "label": "$0.02",
                "value": 0.02,
                "type": "cash"
            },
            {
                "label": "$0.05",
                "value": 0.05,
                "type": "cash"
            },
            {
                "label": "$0.10",
                "value": 0.1,
                "type": "cash"
            },
            {
                "label": "Try Again",
                "value": 0,
                "type": "none"
            },
            {
                "label": "$0.01",
                "value": 0.01,
                "type": "cash"
            },
            {
                "label": "Bonus",
                "value": 0,
                "type": "bonus"
            },
            {
                "label": "$0.02",
                "value": 0.02,
                "type": "cash"
            }
        ]
    },
    "version": "1.0.0",
    "lastUpdated": "2026-03-22T08:17:23.009Z"
};
