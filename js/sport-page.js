/**
 * sport-page.js — Universal Dynamic Sports Page Renderer v2
 * Renders live/upcoming/league tabs from SportsDB data.
 */

const SportPage = {
    sport: null,
    pollInterval: null,

    // ── Entry Point ─────────────────────────────────────────────────────────
    init({ sport }) {
        this.sport = sport;
        document.addEventListener('DOMContentLoaded', () => {
            this._buildPage();
        });
    },

    _buildPage() {
        const main = document.querySelector('main') || document.querySelector('.sp-main');
        if (!main) return;

        main.innerHTML = `
          <!-- Tab Bar -->
          <div class="sp-tab-bar">
            <button class="sp-tab active" id="sp-tab-live" onclick="SportPage.showTab('live')">
              🔴 Live <span class="sp-tab-count" id="sp-live-count">0</span>
            </button>
            <button class="sp-tab" id="sp-tab-upcoming" onclick="SportPage.showTab('upcoming')">
              📅 Upcoming <span class="sp-tab-count" id="sp-upcoming-count">0</span>
            </button>
            <button class="sp-tab" id="sp-tab-leagues" onclick="SportPage.showTab('leagues')">
              🏆 Leagues
            </button>
          </div>

          <!-- Sections -->
          <div class="sp-section" id="sp-section-live">
            <div class="container">
              <div class="sp-match-grid" id="sp-live-grid">
                <div class="sp-empty"><span class="sp-loading-dots">Loading</span></div>
              </div>
            </div>
          </div>

          <div class="sp-section sp-section-hidden" id="sp-section-upcoming">
            <div class="container">
              <div class="sp-match-grid" id="sp-upcoming-grid">
                <div class="sp-empty"><span class="sp-loading-dots">Loading</span></div>
              </div>
            </div>
          </div>

          <div class="sp-section sp-section-hidden" id="sp-section-leagues">
            <div class="container">
              <div class="sp-leagues-grid" id="sp-leagues-grid">
                <div class="sp-empty"><span class="sp-loading-dots">Loading</span></div>
              </div>
            </div>
          </div>
        `;

        // Start real-time listener
        this.pollInterval = SportsDB.listenMatches(this.sport, (matches) => {
            this._renderMatches(matches);
        });

        // Leagues (static-ish, no real-time needed)
        this._renderLeagues();
    },

    // ── Tab Switching ────────────────────────────────────────────────────────
    showTab(tab) {
        ['live','upcoming','leagues'].forEach(t => {
            const sec = document.getElementById('sp-section-' + t);
            const btn = document.getElementById('sp-tab-' + t);
            if (sec) sec.classList.toggle('sp-section-hidden', t !== tab);
            if (btn) btn.classList.toggle('active', t === tab);
        });
    },

    // ── Render Matches ───────────────────────────────────────────────────────
    _renderMatches(matches) {
        const live     = matches.filter(m => m.status === 'live');
        const upcoming = matches.filter(m => m.status === 'upcoming');
        const completed= matches.filter(m => m.status === 'completed');

        // Update counts
        const lc = document.getElementById('sp-live-count');
        const uc = document.getElementById('sp-upcoming-count');
        if (lc) lc.textContent = live.length;
        if (uc) uc.textContent = upcoming.length;

        // Update hero stats if present
        const liveEl     = document.getElementById('live-count');
        const upcomingEl = document.getElementById('upcoming-count');
        if (liveEl)     liveEl.textContent = live.length;
        if (upcomingEl) upcomingEl.textContent = upcoming.length;

        this._fillGrid('sp-live-grid',     live.length     ? live     : null, 'No live matches right now');
        this._fillGrid('sp-upcoming-grid', upcoming.length ? upcoming : null, 'No upcoming matches scheduled');
    },

    _fillGrid(gridId, matches, emptyMsg) {
        const grid = document.getElementById(gridId);
        if (!grid) return;
        if (!matches) {
            grid.innerHTML = `<div class="sp-empty">${emptyMsg}</div>`;
            return;
        }
        grid.innerHTML = matches.map(m => this._matchCardHTML(m)).join('');
    },

    _matchCardHTML(m) {
        const isLive = m.status === 'live';
        const statusLabel = isLive
            ? `<span class="sp-status-badge live"><span class="sp-live-dot"></span> LIVE</span>`
            : m.status === 'upcoming'
                ? `<span class="sp-status-badge upcoming">📅 UPCOMING</span>`
                : `<span class="sp-status-badge completed">✓ COMPLETED</span>`;

        const scoreHTML = isLive
            ? `<div class="sp-score live-score">${m.scoreA || '0'} <span style="font-size:0.6em;color:#555">–</span> ${m.scoreB || '0'}</div>`
            : `<div class="sp-score"><span class="sp-vs">VS</span></div>`;

        const drawOdd = m.oddsDraw && m.oddsDraw !== '-'
            ? `<div class="sp-odd-btn"><span class="sp-odd-label">Draw</span><span class="sp-odd-val">${m.oddsDraw}</span></div>` : '';

        const oddsRow = (m.oddsA || m.oddsB)
            ? `<div class="sp-odds-row">
                <div class="sp-odd-btn"><span class="sp-odd-label">${m.teamA}</span><span class="sp-odd-val">${m.oddsA || '?'}</span></div>
                ${drawOdd}
                <div class="sp-odd-btn"><span class="sp-odd-label">${m.teamB}</span><span class="sp-odd-val">${m.oddsB || '?'}</span></div>
               </div>` : '';

        const startFmt = m.startTime && m.status === 'upcoming'
            ? `<span style="color:#6b7280;font-size:0.75rem;margin-left:6px;">${SportPage._formatTime(m.startTime)}</span>` : '';

        return `
          <a href="match-details.html?id=${m.id}" class="sp-match-card ${m.status}" style="text-decoration:none;">
            <div class="sp-card-header">
              <span class="sp-league-name">🏆 ${m.league || ''} ${m.format ? '· '+m.format : ''}</span>
              ${statusLabel}
            </div>
            <div class="sp-teams">
              <div class="sp-team">
                <div class="sp-team-flag">${m.flagA || '🏳'}</div>
                <div class="sp-team-name">${m.teamA}</div>
              </div>
              ${scoreHTML}
              <div class="sp-team">
                <div class="sp-team-flag">${m.flagB || '🏳'}</div>
                <div class="sp-team-name">${m.teamB}</div>
              </div>
            </div>
            <div class="sp-card-detail">${m.detail || ''} ${startFmt}</div>
            ${oddsRow}
            <div class="sp-view-btn">View Details →</div>
          </a>`;
    },

    // ── Render Leagues ───────────────────────────────────────────────────────
    _renderLeagues() {
        const grid = document.getElementById('sp-leagues-grid');
        if (!grid) return;
        const leagues = SportsDB.getLeagues(this.sport);
        if (!leagues.length) {
            grid.innerHTML = `<div class="sp-empty">No leagues configured.</div>`;
            return;
        }
        grid.innerHTML = leagues.map(l => `
          <div class="sp-league-card">
            <div class="sp-league-icon">${l.flag || '🏆'}</div>
            <div class="sp-league-info">
              <div class="sp-league-title">${l.name}</div>
              <div class="sp-league-status ${l.status||'upcoming'}">${(l.status||'upcoming').toUpperCase()}</div>
            </div>
          </div>`).join('');
    },

    // ── Helpers ──────────────────────────────────────────────────────────────
    _formatTime(iso) {
        try {
            const d = new Date(iso);
            const now = new Date();
            const diff = d - now;
            if (diff < 0) return 'Started';
            if (diff < 3600000) return `in ${Math.round(diff/60000)}m`;
            if (diff < 86400000) return `in ${Math.round(diff/3600000)}h`;
            return d.toLocaleDateString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
        } catch(e) { return ''; }
    }
};
