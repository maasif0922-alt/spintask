/**
 * sport-page.js
 * Shared logic for all individual sport pages (cricket, football, tennis, basketball, esports).
 * Usage: include this after firebase-service.js, then call SportPage.init(config)
 */

const SportPage = {
    config: null,

    init(cfg) {
        this.config = cfg;
        document.addEventListener('DOMContentLoaded', () => {
            SportsDB.seedDefaults();
            this._render();
        });
    },

    _formatTime(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        const now = new Date();
        const diff = d - now;
        if (diff <= 0) return 'Started';
        if (diff < 3600000) return `In ${Math.round(diff / 60000)}m`;
        if (diff < 86400000) return `In ${Math.round(diff / 3600000)}h`;
        return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    },

    _renderMatchCard(m) {
        const isLive = m.status === 'live';
        const scoreA = isLive ? m.scoreA : '—';
        const scoreB = isLive ? m.scoreB : '—';
        const statusHtml = isLive
            ? `<span class="sp-live-dot">● LIVE</span>`
            : `<span class="sp-up-dot">⏰ ${this._formatTime(m.startTime)}</span>`;
        const hasDraw = m.sport === 'cricket' || m.sport === 'football';

        return `
        <div class="sp-match-card" onclick="window.location.href='match-details.html?id=${m.id}'">
            <div class="sp-card-top">
                <span class="sp-league-tag">${m.league || ''}</span>
                ${statusHtml}
            </div>
            <div class="sp-teams-row">
                <div class="sp-team">
                    <span class="sp-flag">${m.flagA || ''}</span>
                    <span class="sp-tname">${m.teamA || ''}</span>
                    ${isLive ? `<span class="sp-score sp-score-a">${scoreA}</span>` : ''}
                </div>
                <div class="sp-vs-col">
                    <div class="sp-vs">VS</div>
                    ${isLive ? `<div class="sp-detail">${m.detail || ''}</div>` : ''}
                </div>
                <div class="sp-team sp-team-b">
                    <span class="sp-flag">${m.flagB || ''}</span>
                    <span class="sp-tname">${m.teamB || ''}</span>
                    ${isLive ? `<span class="sp-score sp-score-b">${scoreB}</span>` : ''}
                </div>
            </div>
            <div class="sp-odds-row">
                <button class="sp-odds-btn" onclick="event.stopPropagation();window.location.href='match-details.html?id=${m.id}'">
                    <span class="sp-odds-label">${m.teamA} Win</span>
                    <span class="sp-odds-val">${m.oddsA || '—'}</span>
                </button>
                ${hasDraw && m.oddsDraw && m.oddsDraw !== '-' ? `<button class="sp-odds-btn" onclick="event.stopPropagation();window.location.href='match-details.html?id=${m.id}'">
                    <span class="sp-odds-label">Draw</span>
                    <span class="sp-odds-val">${m.oddsDraw}</span>
                </button>` : ''}
                <button class="sp-odds-btn" onclick="event.stopPropagation();window.location.href='match-details.html?id=${m.id}'">
                    <span class="sp-odds-label">${m.teamB} Win</span>
                    <span class="sp-odds-val">${m.oddsB || '—'}</span>
                </button>
            </div>
        </div>`;
    },

    _renderEmpty(msg) {
        return `<div class="sp-empty">${msg}</div>`;
    },

    _renderLeagueList(leagues) {
        if (!leagues.length) return '<div class="sp-empty">No leagues found.</div>';
        return leagues.map(l => `
            <div class="sp-league-item">
                <span class="sp-league-flag">${l.flag || '🏆'}</span>
                <div>
                    <div class="sp-league-name">${l.name}</div>
                    <div class="sp-league-status">${l.status === 'active' ? '🟢 Ongoing' : '🟡 Upcoming'}</div>
                </div>
            </div>`).join('');
    },

    _render() {
        const cfg = this.config;
        const sport = cfg.sport;
        const matches = SportsDB.getMatches(sport);
        const leagues = SportsDB.getLeagues(sport);

        const live = matches.filter(m => m.status === 'live');
        const upcoming = matches.filter(m => m.status === 'upcoming');

        const liveContainer = document.getElementById('live-matches');
        const upcomingContainer = document.getElementById('upcoming-matches');
        const leagueContainer = document.getElementById('leagues-list');

        liveContainer.innerHTML = live.length
            ? live.map(m => this._renderMatchCard(m)).join('')
            : this._renderEmpty('No live matches right now. Check upcoming events below.');

        upcomingContainer.innerHTML = upcoming.length
            ? upcoming.map(m => this._renderMatchCard(m)).join('')
            : this._renderEmpty('No upcoming matches scheduled yet.');

        leagueContainer.innerHTML = this._renderLeagueList(leagues);

        // Real-time listener
        SportsDB.listenMatches(sport, (updatedMatches) => {
            const updLive = updatedMatches.filter(m => m.status === 'live');
            const updUp = updatedMatches.filter(m => m.status === 'upcoming');
            liveContainer.innerHTML = updLive.length ? updLive.map(m => this._renderMatchCard(m)).join('') : this._renderEmpty('No live matches right now.');
            upcomingContainer.innerHTML = updUp.length ? updUp.map(m => this._renderMatchCard(m)).join('') : this._renderEmpty('No upcoming matches scheduled yet.');
        });
    }
};
