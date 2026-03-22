/**
 * GLOBAL CONFIGURATION - SOURCE OF TRUTH
 * This file contains the default data for the application.
 * Admin actions will update localStorage, but this serves as the fallback.
 */

const GLOBAL_CONFIG = {
  "spintask_settings": {
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
  "spintask_tasks": [
    {
      "id": "t_1773782243127",
      "title": "earn money",
      "desc": "visit and like vedio",
      "reward": 3,
      "type": "visit",
      "active": true
    }
  ],
  "spintask_content": {
    "aboutText": "The most trusted micro-task platform.",
    "termsText": "These are the default terms and conditions.",
    "homeHero": "Earn USDT Online with Simple Tasks and Spins",
    "homeSub": "Complete simple actions, spin the daily wheel, and withdraw your earnings directly to your Binance wallet.",
    "privacyText": "Your privacy is important. We encrypt your data.",
    "contactText": "Get in touch with us for support and inquiries."
  },
  "spintask_luckydraws": [
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
      "image": "https://cellmart.pk/wp-content/uploads/2025/10/vivo-y21d-red-cellmart-350x350.png",
      "price": 456,
      "totalTickets": 544,
      "remainingTickets": 544,
      "drawDate": "2026-03-03T00:00:00.000Z",
      "status": "active"
    }
  ],
  "spintask_signal_button": {
    "enabled": true,
    "telegramUrl": "https://t.me/your_signal_group",
    "buttonText": "🚀 VIP Signal Hub",
    "subText": "Join our official signal community and never miss profitable updates."
  },
  "spintask_community_links": {
    "telegramLink": "https://t.me/+f2-FUTEOIAtjOTE0",
    "whatsappGroupLink": "",
    "whatsappCommunityLink": "",
    "activeLink": "telegram"
  },
  "spintask_social_media": {
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
  "spintask_announcements": {
    "text": "🎉 Asif love you",
    "enabled": true
  },
  "spintask_spin_settings": {
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
  "lastUpdated": "2026-03-22T23:21:49",
  "version": "1.0.2"
};
