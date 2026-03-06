/**
 * market.js - Crypto Market API & Rendering Logic
 * Uses CoinGecko API to fetch live cryptocurrency data.
 */

const Market = {
    BASE_URL: 'https://api.coingecko.org/api/v3',
    TRENDING_COINS: ['bitcoin', 'ethereum', 'tether', 'binancecoin', 'solana'],

    /**
     * Fetch simple price data for specific IDs
     */
    async fetchTrending() {
        try {
            const ids = this.TRENDING_COINS.join(',');
            const response = await fetch(`${this.BASE_URL}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching trending coins:', error);
            return [];
        }
    },

    /**
     * Fetch top 50 coins for the full market page
     */
    async fetchTop50() {
        try {
            const response = await fetch(`${this.BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching top 50 coins:', error);
            return [];
        }
    },

    /**
     * Render the trending section on the home page
     */
    async renderHomeSection() {
        const container = document.getElementById('trending-market-container');
        if (!container) return;

        const coins = await this.fetchTrending();
        if (coins.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Unable to load market data. Please try again later.</p>';
            return;
        }

        container.innerHTML = '';
        coins.forEach(coin => {
            const change = coin.price_change_percentage_24h || 0;
            const changeClass = change >= 0 ? 'up' : 'down';
            const changeSign = change >= 0 ? '+' : '';

            const card = document.createElement('div');
            card.className = 'market-card glass glass-hover';
            card.innerHTML = `
                <img src="${coin.image}" alt="${coin.name}" class="coin-icon">
                <div class="coin-name">${coin.name} (${coin.symbol.toUpperCase()})</div>
                <div class="coin-price">$${coin.current_price.toLocaleString()}</div>
                <div class="price-change ${changeClass}">${changeSign}${change.toFixed(2)}%</div>
            `;
            container.appendChild(card);
        });

        // Update Ticker if it exists
        this.updateTicker(coins);
    },

    /**
     * Update the scrolling ticker at the top
     */
    updateTicker(coins) {
        const tickerContent = document.getElementById('ticker-content');
        if (!tickerContent) return;

        let content = '';
        // Duplicate for seamless loop
        const displayCoins = [...coins, ...coins];
        displayCoins.forEach(coin => {
            const change = coin.price_change_percentage_24h || 0;
            const changeClass = change >= 0 ? 'up' : 'down';
            content += `
                <span class="ticker-item">
                    ${coin.symbol.toUpperCase()}: $${coin.current_price.toLocaleString()} 
                    <span class="${changeClass}">${change >= 0 ? '▲' : '▼'} ${Math.abs(change).toFixed(2)}%</span>
                </span>
            `;
        });
        tickerContent.innerHTML = content;
    },

    /**
     * Render the full market table
     */
    async renderFullMarket(filter = '') {
        const tbody = document.getElementById('market-table-body');
        if (!tbody) return;

        // Show loader first time
        if (tbody.innerHTML === '') {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 50px;">Loading market data...</td></tr>';
        }

        let coins = await this.fetchTop50();
        if (coins.length === 0) return;

        if (filter) {
            coins = coins.filter(c =>
                c.name.toLowerCase().includes(filter.toLowerCase()) ||
                c.symbol.toLowerCase().includes(filter.toLowerCase())
            );
        }

        tbody.innerHTML = '';
        coins.forEach((coin, index) => {
            const change = coin.price_change_percentage_24h || 0;
            const changeClass = change >= 0 ? 'up' : 'down';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${coin.image}" alt="" style="width: 25px; height: 25px;">
                        <strong>${coin.name}</strong> 
                        <span style="color: var(--text-muted); font-size: 0.8rem;">${coin.symbol.toUpperCase()}</span>
                    </div>
                </td>
                <td>$${coin.current_price.toLocaleString()}</td>
                <td class="${changeClass}">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</td>
                <td>$${coin.market_cap.toLocaleString()}</td>
            `;
            tbody.appendChild(tr);
        });
    }
};

// Initialize based on page
document.addEventListener('DOMContentLoaded', () => {
    // Check for home section
    if (document.getElementById('trending-market-container')) {
        Market.renderHomeSection();
        // Refresh every 60 seconds
        setInterval(() => Market.renderHomeSection(), 60000);
    }

    // Check for full market table
    const tableBody = document.getElementById('market-table-body');
    if (tableBody) {
        Market.renderFullMarket();

        const searchInput = document.getElementById('market-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                Market.renderFullMarket(e.target.value);
            });
        }

        setInterval(() => {
            const val = searchInput ? searchInput.value : '';
            Market.renderFullMarket(val);
        }, 60000);
    }
});
