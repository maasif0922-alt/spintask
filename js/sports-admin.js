/**
 * sports-admin.js — Sports CMS Admin Module v2
 * Manages matches, leagues, categories from the admin dashboard.
 * Called by admin-dashboard.html inside the Sports CMS tab.
 */

const SportsAdmin = {

    // ─── Tab switching in admin panel ──────────────────────────────────────
    showSubTab(sub) {
        ['matches','leagues','categories','liveupdate'].forEach(t => {
            const el = document.getElementById('sa-subtab-' + t);
            const btn = document.getElementById('sa-stbtn-' + t);
            if (el)  el.style.display  = (t === sub) ? 'block' : 'none';
            if (btn) btn.classList.toggle('sa-stbtn-active', t === sub);
        });
        if (sub === 'matches')     this.renderMatches();
        if (sub === 'leagues')     this.renderLeagues();
        if (sub === 'categories')  this.renderCategories();
        if (sub === 'liveupdate')  this.renderLiveUpdatePanel();
    },

    // ─── Matches Tab ────────────────────────────────────────────────────────
    renderMatches() {
        const container = document.getElementById('sa-matches-list');
        if (!container) return;
        const matches = SportsDB.getAllMatches();
        if (!matches.length) {
            container.innerHTML = '<div style="color:#6b7280;text-align:center;padding:30px;">No matches yet. Add one above.</div>';
            return;
        }

        const sportColors = { cricket:'#39ff14', football:'#4d9fff', tennis:'#ffaa00', basketball:'#ff7c4d', esports:'#b33fff' };

        container.innerHTML = matches.map(m => {
            const sc = sportColors[m.sport] || '#888';
            const statusBadge = m.status === 'live'
                ? `<span style="background:rgba(255,53,53,0.15);color:#ff3535;border:1px solid rgba(255,53,53,0.3);border-radius:10px;padding:2px 8px;font-size:0.7rem;font-weight:700;">🔴 LIVE</span>`
                : m.status === 'upcoming'
                    ? `<span style="background:rgba(255,170,0,0.1);color:#ffaa00;border-radius:10px;padding:2px 8px;font-size:0.7rem;font-weight:700;">📅 UPCOMING</span>`
                    : `<span style="background:rgba(107,114,128,0.1);color:#6b7280;border-radius:10px;padding:2px 8px;font-size:0.7rem;font-weight:700;">✓ DONE</span>`;
            return `
            <div class="task-row" style="border-left:3px solid ${sc};margin-bottom:10px;">
              <div style="flex:1;min-width:0;">
                <div style="font-weight:700;font-size:0.9rem;margin-bottom:4px;">
                  ${m.flagA||'🏳'} ${m.teamA} <span style="color:#6b7280">vs</span> ${m.flagB||'🏳'} ${m.teamB}
                </div>
                <div style="font-size:0.78rem;color:#6b7280;">
                  ${m.sport?.toUpperCase()} · ${m.league||'–'} · ${m.format||'–'}
                </div>
                <div style="margin-top:4px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                  ${statusBadge}
                  ${m.featured ? '<span style="background:rgba(255,170,0,0.15);color:#ffaa00;border-radius:10px;padding:2px 8px;font-size:0.65rem;font-weight:700;">⭐ Featured</span>' : ''}
                  ${m.visible === false ? '<span style="background:rgba(255,77,77,0.15);color:#ff4d4d;border-radius:10px;padding:2px 8px;font-size:0.65rem;font-weight:700;">🚫 Hidden</span>' : ''}
                </div>
                ${m.status === 'live' ? `<div style="font-size:0.82rem;color:#39ff14;margin-top:4px;">${m.scoreA||'–'} – ${m.scoreB||'–'} | ${m.detail||''}</div>` : ''}
              </div>
              <div class="tr-actions">
                <button class="btn btn-outline" style="font-size:0.78rem;padding:6px 12px;" onclick="SportsAdmin.editMatch('${m.id}')">✏️ Edit</button>
                <button class="btn btn-outline" style="font-size:0.78rem;padding:6px 12px;border-color:#39ff14;color:#39ff14;" onclick="SportsAdmin.openScorePanel('${m.id}')">📊 Score</button>
                <button class="btn btn-outline" style="font-size:0.78rem;padding:6px 12px;border-color:#ff4d4d;color:#ff4d4d;" onclick="SportsAdmin.deleteMatch('${m.id}')">🗑️</button>
              </div>
            </div>`;
        }).join('');
    },

    editMatch(id) {
        const m = id ? SportsDB.getMatchById(id) : null;
        document.getElementById('sa-match-id').value         = m?.id || '';
        document.getElementById('sa-match-sport').value      = m?.sport || 'cricket';
        document.getElementById('sa-match-teamA').value      = m?.teamA || '';
        document.getElementById('sa-match-flagA').value      = m?.flagA || '';
        document.getElementById('sa-match-teamB').value      = m?.teamB || '';
        document.getElementById('sa-match-flagB').value      = m?.flagB || '';
        document.getElementById('sa-match-league').value     = m?.league || '';
        document.getElementById('sa-match-format').value     = m?.format || '';
        document.getElementById('sa-match-status').value     = m?.status || 'upcoming';
        document.getElementById('sa-match-startTime').value  = m?.startTime?.slice(0,16) || '';
        document.getElementById('sa-match-scoreA').value     = m?.scoreA || '';
        document.getElementById('sa-match-scoreB').value     = m?.scoreB || '';
        document.getElementById('sa-match-detail').value     = m?.detail || '';
        document.getElementById('sa-match-oddsA').value      = m?.oddsA || '';
        document.getElementById('sa-match-oddsDraw').value   = m?.oddsDraw || '';
        document.getElementById('sa-match-oddsB').value      = m?.oddsB || '';
        document.getElementById('sa-match-featured').checked = !!m?.featured;
        document.getElementById('sa-match-visible').checked  = m?.visible !== false;
        document.getElementById('sa-match-order').value      = m?.order ?? 99;
        document.getElementById('sa-match-form-title').textContent = id ? 'Edit Match' : 'Add New Match';
        document.getElementById('sa-match-form').scrollIntoView({ behavior:'smooth' });
    },

    saveMatch() {
        const get = id => document.getElementById(id)?.value?.trim() || '';
        const matchData = {
            id:        get('sa-match-id') || 'match_' + Date.now(),
            sport:     get('sa-match-sport'),
            teamA:     get('sa-match-teamA'),
            flagA:     get('sa-match-flagA'),
            teamB:     get('sa-match-teamB'),
            flagB:     get('sa-match-flagB'),
            league:    get('sa-match-league'),
            format:    get('sa-match-format'),
            status:    get('sa-match-status'),
            startTime: get('sa-match-startTime') ? new Date(get('sa-match-startTime')).toISOString() : new Date().toISOString(),
            scoreA:    get('sa-match-scoreA') || '-',
            scoreB:    get('sa-match-scoreB') || '-',
            detail:    get('sa-match-detail'),
            oddsA:     get('sa-match-oddsA'),
            oddsDraw:  get('sa-match-oddsDraw'),
            oddsB:     get('sa-match-oddsB'),
            featured:  document.getElementById('sa-match-featured')?.checked || false,
            visible:   document.getElementById('sa-match-visible')?.checked !== false,
            order:     parseInt(get('sa-match-order')) || 99,
        };
        if (!matchData.teamA || !matchData.teamB) { alert('Team names are required.'); return; }
        SportsDB.saveMatch(matchData);
        this.clearMatchForm();
        this.renderMatches();
        this._toast('✅ Match saved!');
    },

    clearMatchForm() {
        ['sa-match-id','sa-match-teamA','sa-match-flagA','sa-match-teamB','sa-match-flagB',
         'sa-match-league','sa-match-format','sa-match-scoreA','sa-match-scoreB','sa-match-detail',
         'sa-match-oddsA','sa-match-oddsDraw','sa-match-oddsB','sa-match-order'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const vis = document.getElementById('sa-match-visible');
        const feat = document.getElementById('sa-match-featured');
        if (vis) vis.checked = true;
        if (feat) feat.checked = false;
        document.getElementById('sa-match-status').value = 'upcoming';
        document.getElementById('sa-match-form-title').textContent = 'Add New Match';
    },

    deleteMatch(id) {
        const m = SportsDB.getMatchById(id);
        if (!m) return;
        if (!confirm(`Delete match: ${m.teamA} vs ${m.teamB}?`)) return;
        SportsDB.deleteMatch(id);
        this.renderMatches();
        this._toast('🗑️ Match deleted.');
    },

    // ─── Live Score Update Panel ────────────────────────────────────────────
    renderLiveUpdatePanel() {
        const sel = document.getElementById('sa-score-match-sel');
        if (!sel) return;
        const matches = SportsDB.getAllMatches();
        sel.innerHTML = '<option value="">— Select Match —</option>' +
            matches.map(m => `<option value="${m.id}">${m.flagA||''}${m.teamA} vs ${m.flagB||''}${m.teamB} (${m.status})</option>`).join('');
    },

    updateScore() {
        const id = document.getElementById('sa-score-match-sel')?.value;
        if (!id) { alert('Please select a match.'); return; }
        const scoreA   = document.getElementById('sa-score-a')?.value?.trim();
        const scoreB   = document.getElementById('sa-score-b')?.value?.trim();
        const detail   = document.getElementById('sa-score-detail')?.value?.trim();
        const line     = document.getElementById('sa-commentary-line')?.value?.trim();
        SportsDB.updateScore(id, scoreA, scoreB, detail, line || null);
        if (document.getElementById('sa-commentary-line'))
            document.getElementById('sa-commentary-line').value = '';
        this._toast('✅ Score updated!');
    },

    updateStats() {
        const id = document.getElementById('sa-score-match-sel')?.value;
        if (!id) { alert('Please select a match first.'); return; }
        const raw = document.getElementById('sa-stats-json')?.value?.trim();
        if (!raw) return;
        try {
            const stats = JSON.parse(raw);
            SportsDB.updateStats(id, stats);
            this._toast('✅ Stats updated!');
        } catch(e) { alert('Invalid JSON. Example: {"possession":"60% - 40%"}'); }
    },

    openScorePanel(id) {
        this.showSubTab('liveupdate');
        setTimeout(() => {
            const sel = document.getElementById('sa-score-match-sel');
            if (sel) { sel.value = id; }
            // Prefill current scores
            const m = SportsDB.getMatchById(id);
            if (m) {
                ['sa-score-a','sa-score-b','sa-score-detail'].forEach((eid, i) => {
                    const el = document.getElementById(eid);
                    if (el) el.value = [m.scoreA, m.scoreB, m.detail][i] || '';
                });
            }
        }, 100);
    },

    // ─── Leagues Tab ────────────────────────────────────────────────────────
    renderLeagues() {
        const container = document.getElementById('sa-leagues-list');
        if (!container) return;
        const leagues = SportsDB.getLeagues();
        if (!leagues.length) {
            container.innerHTML = '<div style="color:#6b7280;text-align:center;padding:20px;">No leagues yet.</div>';
            return;
        }
        container.innerHTML = leagues.map(l => `
          <div class="task-row" style="margin-bottom:8px;">
            <div style="flex:1;">
              <span style="font-size:1.1rem;margin-right:8px;">${l.flag||'🏆'}</span>
              <strong style="font-size:0.9rem;">${l.name}</strong>
              <span style="margin-left:8px;font-size:0.75rem;color:#6b7280;">${l.sport}</span>
              <span style="margin-left:8px;font-size:0.72rem;color:${l.status==='active'?'#39ff14':l.status==='upcoming'?'#ffaa00':'#6b7280'};font-weight:700;">${(l.status||'').toUpperCase()}</span>
            </div>
            <div class="tr-actions">
              <button class="btn btn-outline" style="font-size:0.75rem;padding:5px 10px;" onclick="SportsAdmin.editLeague('${l.id}')">✏️</button>
              <button class="btn btn-outline" style="font-size:0.75rem;padding:5px 10px;border-color:#ff4d4d;color:#ff4d4d;" onclick="SportsAdmin.deleteLeague('${l.id}')">🗑️</button>
            </div>
          </div>`).join('');
    },

    editLeague(id) {
        const l = SportsDB.getLeagues().find(x => x.id === id);
        if (!l) return;
        document.getElementById('sa-league-id').value     = l.id;
        document.getElementById('sa-league-name').value   = l.name;
        document.getElementById('sa-league-sport').value  = l.sport;
        document.getElementById('sa-league-flag').value   = l.flag || '';
        document.getElementById('sa-league-status').value = l.status || 'upcoming';
    },

    saveLeague() {
        const get = id => document.getElementById(id)?.value?.trim() || '';
        const data = {
            id:     get('sa-league-id') || 'l_' + Date.now(),
            name:   get('sa-league-name'),
            sport:  get('sa-league-sport'),
            flag:   get('sa-league-flag'),
            status: get('sa-league-status'),
        };
        if (!data.name) { alert('League name required.'); return; }
        SportsDB.saveLeague(data);
        ['sa-league-id','sa-league-name','sa-league-flag'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
        this.renderLeagues();
        this._toast('✅ League saved!');
    },

    deleteLeague(id) {
        if (!confirm('Delete this league?')) return;
        SportsDB.deleteLeague(id);
        this.renderLeagues();
        this._toast('🗑️ League deleted.');
    },

    // ─── Categories Tab ─────────────────────────────────────────────────────
    renderCategories() {
        const container = document.getElementById('sa-cats-list');
        if (!container) return;
        const cats = SportsDB.getAllCategories();
        container.innerHTML = cats.map(c => `
          <div class="task-row" style="margin-bottom:8px;">
            <div style="flex:1;display:flex;align-items:center;gap:10px;">
              <span style="font-size:1.4rem;">${c.icon||'🏅'}</span>
              <span style="font-weight:700;font-size:0.9rem;">${c.name}</span>
              <span style="font-size:0.72rem;color:#6b7280;">order: ${c.order||99}</span>
            </div>
            <div class="tr-actions" style="align-items:center;">
              <label style="display:flex;align-items:center;gap:6px;font-size:0.8rem;cursor:pointer;">
                <input type="checkbox" ${c.visible !== false ? 'checked' : ''} onchange="SportsAdmin.toggleCategory('${c.id}', this.checked)">
                Visible
              </label>
              <button class="btn btn-outline" style="font-size:0.75rem;padding:5px 10px;" onclick="SportsAdmin.editCategory('${c.id}')">✏️</button>
            </div>
          </div>`).join('');
    },

    toggleCategory(id, visible) {
        const cats = SportsDB.getAllCategories();
        const cat = cats.find(c => c.id === id);
        if (!cat) return;
        SportsDB.saveCategory({ ...cat, visible });
        this._toast(visible ? '✅ Category shown.' : '🚫 Category hidden.');
    },

    editCategory(id) {
        const cat = SportsDB.getAllCategories().find(c => c.id === id);
        if (!cat) return;
        document.getElementById('sa-cat-id').value    = cat.id;
        document.getElementById('sa-cat-name').value  = cat.name;
        document.getElementById('sa-cat-icon').value  = cat.icon || '';
        document.getElementById('sa-cat-order').value = cat.order ?? 99;
    },

    saveCategory() {
        const get = id => document.getElementById(id)?.value?.trim() || '';
        const id = get('sa-cat-id');
        if (!id) { alert('Category ID is required (e.g. cricket).'); return; }
        const cats = SportsDB.getAllCategories();
        const existing = cats.find(c => c.id === id) || {};
        SportsDB.saveCategory({
            ...existing,
            id,
            name:  get('sa-cat-name') || id,
            icon:  get('sa-cat-icon') || '🏅',
            order: parseInt(get('sa-cat-order')) || 99,
        });
        this.renderCategories();
        this._toast('✅ Category saved!');
    },

    // ─── Utility ────────────────────────────────────────────────────────────
    _toast(msg) {
        const existing = document.getElementById('sa-toast');
        if (existing) existing.remove();
        const t = document.createElement('div');
        t.id = 'sa-toast';
        t.textContent = msg;
        t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1a1a1a;border:1px solid rgba(57,255,20,0.4);color:#39ff14;padding:10px 20px;border-radius:10px;font-size:0.85rem;font-weight:600;z-index:9999;animation:sp-slide-in 0.3s ease;';
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 2800);
    }
};
