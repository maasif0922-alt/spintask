/**
 * firebase-service.js — v2 (Dynamic Sports CMS)
 * Centralized real-time service for sports data.
 * Supports: Matches, Leagues, Categories (all Firebase + localStorage fallback)
 */

const SportsDB = {
    DB_MATCHES:    'spintask_sports_matches',
    DB_LEAGUES:    'spintask_sports_leagues',
    DB_CATEGORIES: 'spintask_sports_categories',

    // ─── Local Helpers ─────────────────────────────────────────────────────

    _getLocal(key) {
        try { return JSON.parse(localStorage.getItem(key) || '[]'); }
        catch(e) { return []; }
    },
    _saveLocal(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
        localStorage.setItem('spintask_sports_version', Date.now());
    },

    // ─── Default Seed Data ──────────────────────────────────────────────────

    seedDefaults() {
        // Categories
        if (this._getLocal(this.DB_CATEGORIES).length === 0) {
            const cats = [
                { id: 'cricket',    name: 'Cricket',    icon: '🏏', visible: true, order: 1 },
                { id: 'football',   name: 'Football',   icon: '⚽', visible: true, order: 2 },
                { id: 'tennis',     name: 'Tennis',     icon: '🎾', visible: true, order: 3 },
                { id: 'basketball', name: 'Basketball', icon: '🏀', visible: true, order: 4 },
                { id: 'esports',    name: 'eSports',    icon: '🎮', visible: true, order: 5 },
            ];
            this._saveLocal(this.DB_CATEGORIES, cats);
        }

        // Matches
        if (this._getLocal(this.DB_MATCHES).length === 0) {
            const now  = new Date();
            const in2h = new Date(now.getTime() +  2*3600000).toISOString();
            const in6h = new Date(now.getTime() +  6*3600000).toISOString();
            const in1d = new Date(now.getTime() + 24*3600000).toISOString();
            const in2d = new Date(now.getTime() + 48*3600000).toISOString();

            const matches = [
                { id:'m1', sport:'cricket',    teamA:'India',            flagA:'🇮🇳', teamB:'Pakistan',        flagB:'🇵🇰',
                  league:'ICC T20 World Cup',  format:'T20',   status:'live',
                  scoreA:'156/4', scoreB:'143/8', detail:'18.2 Overs', startTime:now.toISOString(),
                  oddsA:'1.85', oddsDraw:'6.00', oddsB:'2.10',
                  featured:true, visible:true, order:1,
                  commentary:['18.2 — Bumrah bowls a yorker, Shaheen misses — DOT!','18.1 — Short delivery, Babar pulls it for 4!','17.6 — SIX! Rizwan hammers it over long-on!'],
                  stats:{} },
                { id:'m2', sport:'cricket',    teamA:'Australia',        flagA:'🇦🇺', teamB:'England',         flagB:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',
                  league:'The Ashes',          format:'Test',  status:'upcoming',
                  scoreA:'-', scoreB:'-',     detail:'Starts in 2h',   startTime:in2h,
                  oddsA:'2.20', oddsDraw:'3.40', oddsB:'2.80',
                  featured:false, visible:true, order:2, commentary:[], stats:{} },
                { id:'m3', sport:'football',   teamA:'Manchester City',  flagA:'🔵', teamB:'Real Madrid',     flagB:'⚪',
                  league:'UEFA Champions Lg', format:'90 min', status:'live',
                  scoreA:'2', scoreB:'1',     detail:"67'",             startTime:now.toISOString(),
                  oddsA:'1.70', oddsDraw:'3.50', oddsB:'4.00',
                  featured:true, visible:true, order:1,
                  commentary:["67' — GOAL! De Bruyne fires low into the corner!", "64' — Great save by Courtois to deny Haaland!", "61' — Corner kick for City"],
                  stats:{possession:'58% – 42%', shots:'12 – 7', shotsOnTarget:'5 – 3', corners:'6 – 2', yellowCards:'1 – 2'} },
                { id:'m4', sport:'football',   teamA:'Arsenal',          flagA:'🔴', teamB:'Liverpool',       flagB:'❤️',
                  league:'Premier League',    format:'90 min', status:'upcoming',
                  scoreA:'-', scoreB:'-',    detail:'GW 30 — Tomorrow', startTime:in1d,
                  oddsA:'2.10', oddsDraw:'3.20', oddsB:'3.40',
                  featured:false, visible:true, order:2, commentary:[], stats:{} },
                { id:'m5', sport:'tennis',     teamA:'Novak Djokovic',   flagA:'🇷🇸', teamB:'Carlos Alcaraz',  flagB:'🇪🇸',
                  league:'Roland Garros',     format:'Best of 5', status:'live',
                  scoreA:'6-4, 3', scoreB:'2, 5', detail:'Set 2 — Game 8', startTime:now.toISOString(),
                  oddsA:'1.75', oddsDraw:'-', oddsB:'2.00',
                  featured:true, visible:true, order:1,
                  commentary:['Set 1 won by Djokovic 6-4','Set 2 in progress — Djokovic serving'],
                  stats:{aces:'8 – 5', doubleFaults:'2 – 3', firstServePct:'68% – 72%', winners:'24 – 18', errors:'12 – 16'} },
                { id:'m6', sport:'basketball', teamA:'LA Lakers',        flagA:'💜', teamB:'Boston Celtics',  flagB:'🟢',
                  league:'NBA Playoffs',      format:'4 Quarters', status:'live',
                  scoreA:'78', scoreB:'82',  detail:"Q3 — 4:22",         startTime:now.toISOString(),
                  oddsA:'2.10', oddsDraw:'-', oddsB:'1.75',
                  featured:true, visible:true, order:1,
                  commentary:["58-78 — LeBron drives to the basket!", "Celtics timeout called"],
                  stats:{rebounds:'34 – 29', assists:'18 – 22', steals:'6 – 4', threePointers:'8 – 11'} },
                { id:'m7', sport:'esports',    teamA:'Team Vitality',    flagA:'🐝', teamB:'NAVI',           flagB:'⚓',
                  league:'ESL Pro League',    format:'BO3', status:'live',
                  scoreA:'16', scoreB:'12',  detail:'Map 2 — Inferno',  startTime:now.toISOString(),
                  oddsA:'1.90', oddsDraw:'-', oddsB:'1.95',
                  featured:true, visible:true, order:1,
                  commentary:['VITALITY win map 1 16-12 on Dust2','Map 2 on Inferno ongoing'],
                  stats:{totalKills:'47 – 39', hsShotPct:'42% – 38%', roundsWon:'16 – 12'} },
                { id:'m8', sport:'cricket',    teamA:'New Zealand',      flagA:'🇳🇿', teamB:'South Africa',   flagB:'🇿🇦',
                  league:'PSL 2026',          format:'T20',  status:'upcoming',
                  scoreA:'-', scoreB:'-',    detail:'T20 Match 14',     startTime:in6h,
                  oddsA:'1.95', oddsDraw:'7.00', oddsB:'1.95',
                  featured:false, visible:true, order:3, commentary:[], stats:{} },
            ];
            this._saveLocal(this.DB_MATCHES, matches);
        }

        // Leagues
        if (this._getLocal(this.DB_LEAGUES).length === 0) {
            const leagues = [
                { id:'l1',  sport:'cricket',    name:'IPL 2026',             flag:'🇮🇳', status:'active'   },
                { id:'l2',  sport:'cricket',    name:'PSL 2026',             flag:'🇵🇰', status:'active'   },
                { id:'l3',  sport:'cricket',    name:'ICC T20 World Cup',    flag:'🌍', status:'upcoming' },
                { id:'l4',  sport:'cricket',    name:'The Ashes',            flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', status:'upcoming' },
                { id:'l5',  sport:'cricket',    name:'Big Bash League',      flag:'🇦🇺', status:'upcoming' },
                { id:'l6',  sport:'football',   name:'Premier League',       flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', status:'active'   },
                { id:'l7',  sport:'football',   name:'La Liga',              flag:'🇪🇸', status:'active'   },
                { id:'l8',  sport:'football',   name:'UEFA Champions League',flag:'⭐', status:'active'   },
                { id:'l9',  sport:'football',   name:'Bundesliga',           flag:'🇩🇪', status:'active'   },
                { id:'l10', sport:'football',   name:'FIFA World Cup 2026',  flag:'🌍', status:'upcoming' },
                { id:'l11', sport:'tennis',     name:'Wimbledon',            flag:'🇬🇧', status:'upcoming' },
                { id:'l12', sport:'tennis',     name:'Roland Garros',        flag:'🇫🇷', status:'active'   },
                { id:'l13', sport:'tennis',     name:'US Open',              flag:'🇺🇸', status:'upcoming' },
                { id:'l14', sport:'basketball', name:'NBA Playoffs',         flag:'🏀', status:'active'   },
                { id:'l15', sport:'basketball', name:'EuroLeague',           flag:'🇪🇺', status:'active'   },
                { id:'l16', sport:'esports',    name:'ESL Pro League (CS2)', flag:'🎮', status:'active'   },
                { id:'l17', sport:'esports',    name:'Valorant Champions',   flag:'💥', status:'active'   },
                { id:'l18', sport:'esports',    name:'Dota 2 International', flag:'🎯', status:'upcoming' },
            ];
            this._saveLocal(this.DB_LEAGUES, leagues);
        }
    },

    // ─── Categories CRUD ───────────────────────────────────────────────────

    getCategories() {
        return this._getLocal(this.DB_CATEGORIES)
            .filter(c => c.visible !== false)
            .sort((a,b) => (a.order||99) - (b.order||99));
    },
    getAllCategories() {
        return this._getLocal(this.DB_CATEGORIES).sort((a,b) => (a.order||99) - (b.order||99));
    },
    saveCategory(cat) {
        const all = this._getLocal(this.DB_CATEGORIES);
        const idx = all.findIndex(c => c.id === cat.id);
        if (idx !== -1) { all[idx] = { ...all[idx], ...cat }; }
        else { all.push({ visible:true, order:99, ...cat }); }
        this._saveLocal(this.DB_CATEGORIES, all);
        if (typeof firebaseReady !== 'undefined' && firebaseReady && db)
            db.ref('sports/categories/' + cat.id).set(all[idx !== -1 ? idx : all.length-1]);
    },
    deleteCategory(id) {
        const all = this._getLocal(this.DB_CATEGORIES).filter(c => c.id !== id);
        this._saveLocal(this.DB_CATEGORIES, all);
        if (typeof firebaseReady !== 'undefined' && firebaseReady && db)
            db.ref('sports/categories/' + id).remove();
    },

    // ─── Match CRUD ────────────────────────────────────────────────────────

    getMatches(sport = null) {
        const all = this._getLocal(this.DB_MATCHES).filter(m => m.visible !== false);
        const filtered = sport ? all.filter(m => m.sport === sport) : all;
        return filtered.sort((a,b) => {
            // Live first, then by order, then by startTime
            if (a.status === 'live' && b.status !== 'live') return -1;
            if (b.status === 'live' && a.status !== 'live') return 1;
            if ((a.order||99) !== (b.order||99)) return (a.order||99) - (b.order||99);
            return new Date(a.startTime) - new Date(b.startTime);
        });
    },
    getAllMatches(sport = null) {
        const all = this._getLocal(this.DB_MATCHES);
        const filtered = sport ? all.filter(m => m.sport === sport) : all;
        return filtered.sort((a,b) => (a.order||99) - (b.order||99));
    },
    getMatchById(id) {
        return this._getLocal(this.DB_MATCHES).find(m => m.id === id) || null;
    },
    getFeaturedMatches() {
        return this._getLocal(this.DB_MATCHES).filter(m => m.featured && m.visible !== false);
    },
    saveMatch(matchData) {
        const matches = this._getLocal(this.DB_MATCHES);
        const idx = matches.findIndex(m => m.id === matchData.id);
        const enriched = {
            visible: true, featured: false, order: 99,
            commentary: [], stats: {},
            ...matchData,
            updatedAt: new Date().toISOString()
        };
        if (idx !== -1) { matches[idx] = { ...matches[idx], ...enriched }; }
        else {
            enriched.id = enriched.id || 'match_' + Date.now();
            enriched.createdAt = enriched.updatedAt;
            matches.unshift(enriched);
        }
        this._saveLocal(this.DB_MATCHES, matches);
        const saved = idx !== -1 ? matches[idx] : matches[0];
        if (typeof firebaseReady !== 'undefined' && firebaseReady && db)
            db.ref('sports/matches/' + saved.id).set(saved);
        return saved;
    },
    deleteMatch(id) {
        const matches = this._getLocal(this.DB_MATCHES).filter(m => m.id !== id);
        this._saveLocal(this.DB_MATCHES, matches);
        if (typeof firebaseReady !== 'undefined' && firebaseReady && db)
            db.ref('sports/matches/' + id).remove();
    },
    updateScore(id, scoreA, scoreB, detail, commentaryLine = null) {
        const matches = this._getLocal(this.DB_MATCHES);
        const idx = matches.findIndex(m => m.id === id);
        if (idx === -1) return;
        matches[idx].scoreA = scoreA;
        matches[idx].scoreB = scoreB;
        matches[idx].detail = detail;
        matches[idx].updatedAt = new Date().toISOString();
        if (commentaryLine) {
            if (!matches[idx].commentary) matches[idx].commentary = [];
            matches[idx].commentary.unshift(commentaryLine);
            if (matches[idx].commentary.length > 30) matches[idx].commentary.pop();
        }
        this._saveLocal(this.DB_MATCHES, matches);
        if (typeof firebaseReady !== 'undefined' && firebaseReady && db)
            db.ref('sports/matches/' + id).update({
                scoreA, scoreB, detail,
                commentary: matches[idx].commentary,
                updatedAt: matches[idx].updatedAt
            });
    },
    updateStats(id, stats) {
        const matches = this._getLocal(this.DB_MATCHES);
        const idx = matches.findIndex(m => m.id === id);
        if (idx === -1) return;
        matches[idx].stats = { ...(matches[idx].stats || {}), ...stats };
        this._saveLocal(this.DB_MATCHES, matches);
        if (typeof firebaseReady !== 'undefined' && firebaseReady && db)
            db.ref('sports/matches/' + id).update({ stats: matches[idx].stats });
    },
    updateMatchStatus(id, status) {
        const matches = this._getLocal(this.DB_MATCHES);
        const idx = matches.findIndex(m => m.id === id);
        if (idx === -1) return;
        matches[idx].status = status;
        matches[idx].updatedAt = new Date().toISOString();
        this._saveLocal(this.DB_MATCHES, matches);
        if (typeof firebaseReady !== 'undefined' && firebaseReady && db)
            db.ref('sports/matches/' + id).update({ status, updatedAt: matches[idx].updatedAt });
    },

    // ─── League CRUD ───────────────────────────────────────────────────────

    getLeagues(sport = null) {
        const all = this._getLocal(this.DB_LEAGUES);
        return sport ? all.filter(l => l.sport === sport) : all;
    },
    saveLeague(leagueData) {
        const leagues = this._getLocal(this.DB_LEAGUES);
        const idx = leagues.findIndex(l => l.id === leagueData.id);
        const enriched = { ...leagueData, updatedAt: new Date().toISOString() };
        if (idx !== -1) { leagues[idx] = { ...leagues[idx], ...enriched }; }
        else {
            enriched.id = enriched.id || 'l_' + Date.now();
            leagues.unshift(enriched);
        }
        this._saveLocal(this.DB_LEAGUES, leagues);
        const saved = idx !== -1 ? leagues[idx] : leagues[0];
        if (typeof firebaseReady !== 'undefined' && firebaseReady && db)
            db.ref('sports/leagues/' + saved.id).set(saved);
        return saved;
    },
    deleteLeague(id) {
        const leagues = this._getLocal(this.DB_LEAGUES).filter(l => l.id !== id);
        this._saveLocal(this.DB_LEAGUES, leagues);
        if (typeof firebaseReady !== 'undefined' && firebaseReady && db)
            db.ref('sports/leagues/' + id).remove();
    },

    // ─── Firebase Batch Sync (pull all data → localStorage) ───────────────
    batchSyncFromFirebase(onDone) {
        if (typeof firebaseReady === 'undefined' || !firebaseReady || !db) {
            if (onDone) onDone();
            return;
        }
        db.ref('sports').once('value', snap => {
            const data = snap.val() || {};
            if (data.matches) {
                const arr = Object.values(data.matches);
                this._saveLocal(this.DB_MATCHES, arr);
            }
            if (data.leagues) {
                const arr = Object.values(data.leagues);
                this._saveLocal(this.DB_LEAGUES, arr);
            }
            if (data.categories) {
                const arr = Object.values(data.categories);
                this._saveLocal(this.DB_CATEGORIES, arr);
            }
            if (onDone) onDone();
        });
    },

    // ─── Real-Time Listeners ───────────────────────────────────────────────

    listenMatches(sport, callback) {
        if (typeof firebaseReady !== 'undefined' && firebaseReady && db) {
            db.ref('sports/matches').on('value', snap => {
                const data = snap.val() || {};
                let list = Object.values(data).filter(m => m.visible !== false);
                if (sport) list = list.filter(m => m.sport === sport);
                list.sort((a,b) => {
                    if (a.status === 'live' && b.status !== 'live') return -1;
                    if (b.status === 'live' && a.status !== 'live') return 1;
                    return new Date(a.startTime) - new Date(b.startTime);
                });
                callback(list);
            });
        } else {
            const poll = () => callback(this.getMatches(sport));
            poll();
            return setInterval(poll, 3000);
        }
    },
    listenAllMatches(callback) {
        return this.listenMatches(null, callback);
    },
    listenMatchById(id, callback) {
        if (typeof firebaseReady !== 'undefined' && firebaseReady && db) {
            db.ref('sports/matches/' + id).on('value', snap => { callback(snap.val()); });
        } else {
            const poll = () => callback(this.getMatchById(id));
            poll();
            return setInterval(poll, 2500);
        }
    }
};

// Auto-seed and batch-sync on page load
document.addEventListener('DOMContentLoaded', () => {
    SportsDB.batchSyncFromFirebase(() => {
        SportsDB.seedDefaults();
    });
});
