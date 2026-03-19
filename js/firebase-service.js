/**
 * firebase-service.js
 * Centralized service for real-time sports data (Matches, Leagues, Tournaments).
 * Falls back to localStorage if Firebase is not configured.
 */

const SportsDB = {
    DB_MATCHES: 'spintask_sports_matches',
    DB_LEAGUES: 'spintask_sports_leagues',

    // ─── Helpers ─────────────────────────────────────────────────────────

    _getLocal(key) {
        return JSON.parse(localStorage.getItem(key) || '[]');
    },
    _saveLocal(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
        // Bump config version so other tabs/pages pick up changes
        const cfg = JSON.parse(localStorage.getItem('spintask_sports_version') || '0');
        localStorage.setItem('spintask_sports_version', Date.now());
    },

    // ─── Default Seed Data ────────────────────────────────────────────────

    seedDefaults() {
        if (this._getLocal(this.DB_MATCHES).length === 0) {
            const now = new Date();
            const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
            const in6h = new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString();
            const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
            const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();

            const matches = [
                {
                    id: 'match_' + Date.now() + '1',
                    sport: 'cricket',
                    teamA: 'India', flagA: '🇮🇳',
                    teamB: 'Pakistan', flagB: '🇵🇰',
                    league: 'ICC T20 World Cup',
                    status: 'live',
                    scoreA: '156/4', scoreB: '143/8',
                    detail: '18.2 Overs', format: 'T20',
                    oddsA: '1.85', oddsDraw: '6.00', oddsB: '2.10',
                    startTime: now.toISOString(),
                    commentary: [
                        '18.2 — Bumrah bowls a yorker, Shaheen misses — DOT!',
                        '18.1 — Short delivery, Babar pulls it for 4!',
                        '17.6 — SIX! Rizwan hammers it over long-on!',
                        '17.5 — Dot ball, tight bowling from Hardik.',
                        '17.4 — Single taken, 2 off 2'
                    ],
                    stats: {}
                },
                {
                    id: 'match_' + Date.now() + '2',
                    sport: 'cricket',
                    teamA: 'Australia', flagA: '🇦🇺',
                    teamB: 'England', flagB: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
                    league: 'The Ashes',
                    status: 'upcoming',
                    scoreA: '-', scoreB: '-',
                    detail: 'Test Match - Day 1',
                    format: 'Test',
                    oddsA: '2.20', oddsDraw: '3.40', oddsB: '2.80',
                    startTime: in2h,
                    commentary: [],
                    stats: {}
                },
                {
                    id: 'match_' + Date.now() + '3',
                    sport: 'cricket',
                    teamA: 'New Zealand', flagA: '🇳🇿',
                    teamB: 'South Africa', flagB: '🇿🇦',
                    league: 'PSL 2026',
                    status: 'upcoming',
                    scoreA: '-', scoreB: '-',
                    detail: 'T20 - Match 14', format: 'T20',
                    oddsA: '1.95', oddsDraw: '7.00', oddsB: '1.95',
                    startTime: in6h,
                    commentary: [],
                    stats: {}
                },
                {
                    id: 'match_' + Date.now() + '4',
                    sport: 'football',
                    teamA: 'Manchester City', flagA: '🔵',
                    teamB: 'Real Madrid', flagB: '⚪',
                    league: 'UEFA Champions League',
                    status: 'live',
                    scoreA: '2', scoreB: '1',
                    detail: "67'",
                    format: '90 min',
                    oddsA: '1.70', oddsDraw: '3.50', oddsB: '4.00',
                    startTime: now.toISOString(),
                    commentary: [],
                    stats: { possession: '58% - 42%', shots: '12 - 7', shotsOnTarget: '5 - 3', corners: '6 - 2', fouls: '9 - 13', yellowCards: '1 - 2', redCards: '0 - 0' }
                },
                {
                    id: 'match_' + Date.now() + '5',
                    sport: 'football',
                    teamA: 'Arsenal', flagA: '🔴',
                    teamB: 'Liverpool', flagB: '🔴',
                    league: 'Premier League',
                    status: 'upcoming',
                    scoreA: '-', scoreB: '-',
                    detail: 'GW 30',
                    format: '90 min',
                    oddsA: '2.10', oddsDraw: '3.20', oddsB: '3.40',
                    startTime: in24h,
                    commentary: [],
                    stats: {}
                },
                {
                    id: 'match_' + Date.now() + '6',
                    sport: 'football',
                    teamA: 'Barcelona', flagA: '🔵',
                    teamB: 'Atletico Madrid', flagB: '🔴',
                    league: 'La Liga',
                    status: 'upcoming',
                    scoreA: '-', scoreB: '-',
                    detail: 'La Liga', format: '90 min',
                    oddsA: '1.60', oddsDraw: '3.80', oddsB: '4.50',
                    startTime: in48h,
                    commentary: [],
                    stats: {}
                },
                {
                    id: 'match_' + Date.now() + '7',
                    sport: 'tennis',
                    teamA: 'Novak Djokovic', flagA: '🇷🇸',
                    teamB: 'Carlos Alcaraz', flagB: '🇪🇸',
                    league: 'Roland Garros',
                    status: 'live',
                    scoreA: '6-4, 3', scoreB: '2, 5',
                    detail: 'Set 2 — Game 8',
                    format: 'Best of 5',
                    oddsA: '1.75', oddsDraw: '-', oddsB: '2.00',
                    startTime: now.toISOString(),
                    commentary: ['Set 1 won by Djokovic 6-4', 'Set 2 is in progress'],
                    stats: { aces: '8 - 5', doubleFaults: '2 - 3', firstServePct: '68% - 72%', winners: '24 - 18', errors: '12 - 16' }
                },
                {
                    id: 'match_' + Date.now() + '8',
                    sport: 'tennis',
                    teamA: 'Jannik Sinner', flagA: '🇮🇹',
                    teamB: 'Daniil Medvedev', flagB: '🇷🇺',
                    league: 'Wimbledon 2026',
                    status: 'upcoming',
                    scoreA: '-', scoreB: '-',
                    detail: 'Quarter Final',
                    format: 'Best of 5',
                    oddsA: '1.55', oddsDraw: '-', oddsB: '2.50',
                    startTime: in24h,
                    commentary: [],
                    stats: {}
                },
                {
                    id: 'match_' + Date.now() + '9',
                    sport: 'basketball',
                    teamA: 'LA Lakers', flagA: '💜',
                    teamB: 'Boston Celtics', flagB: '🟢',
                    league: 'NBA Playoffs',
                    status: 'live',
                    scoreA: '78', scoreB: '82',
                    detail: 'Q3 — 4:22',
                    format: '4 Quarters',
                    oddsA: '2.10', oddsDraw: '-', oddsB: '1.75',
                    startTime: now.toISOString(),
                    commentary: [],
                    stats: { rebounds: '34 - 29', assists: '18 - 22', steals: '6 - 4', blocks: '3 - 5', turnovers: '9 - 7', threePointers: '8 - 11' }
                },
                {
                    id: 'match_' + Date.now() + '10',
                    sport: 'basketball',
                    teamA: 'Golden State Warriors', flagA: '🔵',
                    teamB: 'Miami Heat', flagB: '🔴',
                    league: 'NBA Regular Season',
                    status: 'upcoming',
                    scoreA: '-', scoreB: '-',
                    detail: 'Game 55',
                    format: '4 Quarters',
                    oddsA: '1.65', oddsDraw: '-', oddsB: '2.25',
                    startTime: in2h,
                    commentary: [],
                    stats: {}
                },
                {
                    id: 'match_' + Date.now() + '11',
                    sport: 'esports',
                    teamA: 'Team Vitality', flagA: '🐝',
                    teamB: 'NAVI', flagB: '⚓',
                    league: 'ESL Pro League',
                    status: 'live',
                    scoreA: '16', scoreB: '12',
                    detail: 'Map 2 — Inferno — CT: 16 T: 12',
                    format: 'BO3',
                    oddsA: '1.90', oddsDraw: '-', oddsB: '1.95',
                    startTime: now.toISOString(),
                    commentary: ['VITALITY win map 1 16-12 on Dust2', 'Map 2 on Inferno ongoing'],
                    stats: { totalKills: '47 - 39', hsShotPct: '42% - 38%', roundsWon: '16 - 12' }
                },
                {
                    id: 'match_' + Date.now() + '12',
                    sport: 'esports',
                    teamA: 'Team Liquid', flagA: '💧',
                    teamB: 'FaZe Clan', flagB: '💀',
                    league: 'Valorant Champions Tour',
                    status: 'upcoming',
                    scoreA: '-', scoreB: '-',
                    detail: 'Grand Final',
                    format: 'BO5',
                    oddsA: '2.05', oddsDraw: '-', oddsB: '1.80',
                    startTime: in6h,
                    commentary: [],
                    stats: {}
                }
            ];
            this._saveLocal(this.DB_MATCHES, matches);
        }

        if (this._getLocal(this.DB_LEAGUES).length === 0) {
            const leagues = [
                { id: 'l1', sport: 'cricket', name: 'IPL 2026', flag: '🇮🇳', status: 'active' },
                { id: 'l2', sport: 'cricket', name: 'PSL 2026', flag: '🇵🇰', status: 'active' },
                { id: 'l3', sport: 'cricket', name: 'ICC T20 World Cup', flag: '🌍', status: 'upcoming' },
                { id: 'l4', sport: 'cricket', name: 'The Ashes', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', status: 'upcoming' },
                { id: 'l5', sport: 'cricket', name: 'Big Bash League', flag: '🇦🇺', status: 'upcoming' },
                { id: 'l6', sport: 'cricket', name: 'ICC Cricket World Cup', flag: '🌍', status: 'upcoming' },
                { id: 'l7', sport: 'football', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', status: 'active' },
                { id: 'l8', sport: 'football', name: 'La Liga', flag: '🇪🇸', status: 'active' },
                { id: 'l9', sport: 'football', name: 'UEFA Champions League', flag: '⭐', status: 'active' },
                { id: 'l10', sport: 'football', name: 'Bundesliga', flag: '🇩🇪', status: 'active' },
                { id: 'l11', sport: 'football', name: 'Serie A', flag: '🇮🇹', status: 'active' },
                { id: 'l12', sport: 'football', name: 'FIFA World Cup 2026', flag: '🌍', status: 'upcoming' },
                { id: 'l13', sport: 'tennis', name: 'Wimbledon', flag: '🇬🇧', status: 'upcoming' },
                { id: 'l14', sport: 'tennis', name: 'US Open', flag: '🇺🇸', status: 'upcoming' },
                { id: 'l15', sport: 'tennis', name: 'Roland Garros', flag: '🇫🇷', status: 'active' },
                { id: 'l16', sport: 'tennis', name: 'Australian Open', flag: '🇦🇺', status: 'upcoming' },
                { id: 'l17', sport: 'basketball', name: 'NBA Playoffs', flag: '🏀', status: 'active' },
                { id: 'l18', sport: 'basketball', name: 'EuroLeague', flag: '🇪🇺', status: 'active' },
                { id: 'l19', sport: 'basketball', name: 'FIBA World Cup', flag: '🌍', status: 'upcoming' },
                { id: 'l20', sport: 'esports', name: 'ESL Pro League (CS2)', flag: '🎮', status: 'active' },
                { id: 'l21', sport: 'esports', name: 'Valorant Champions Tour', flag: '💥', status: 'active' },
                { id: 'l22', sport: 'esports', name: 'Dota 2 The International', flag: '🎯', status: 'upcoming' },
                { id: 'l23', sport: 'esports', name: 'PUBG Global Series', flag: '🔫', status: 'upcoming' }
            ];
            this._saveLocal(this.DB_LEAGUES, leagues);
        }
    },

    // ─── Match CRUD ───────────────────────────────────────────────────────

    getMatches(sport = null) {
        const all = this._getLocal(this.DB_MATCHES);
        return sport ? all.filter(m => m.sport === sport) : all;
    },

    getMatchById(id) {
        return this._getLocal(this.DB_MATCHES).find(m => m.id === id) || null;
    },

    saveMatch(matchData) {
        const matches = this._getLocal(this.DB_MATCHES);
        const idx = matches.findIndex(m => m.id === matchData.id);
        
        // Ensure new fields exist
        const enrichedData = {
            ...matchData,
            logoA: matchData.logoA || '',
            logoB: matchData.logoB || '',
            bettingMargin: matchData.bettingMargin || '0',
            redirectUrl: matchData.redirectUrl || '',
            stats: matchData.stats || {},
            updatedAt: new Date().toISOString()
        };

        if (idx !== -1) {
            matches[idx] = { ...matches[idx], ...enrichedData };
        } else {
            enrichedData.id = enrichedData.id || 'match_' + Date.now();
            enrichedData.createdAt = enrichedData.updatedAt;
            matches.unshift(enrichedData);
        }
        this._saveLocal(this.DB_MATCHES, matches);

        if (firebaseReady && db) {
            const m = idx !== -1 ? matches[idx] : matches[0];
            db.ref('sports/matches/' + m.id).set(m);
        }
    },

    deleteMatch(id) {
        let matches = this._getLocal(this.DB_MATCHES);
        matches = matches.filter(m => m.id !== id);
        this._saveLocal(this.DB_MATCHES, matches);
        if (firebaseReady && db) db.ref('sports/matches/' + id).remove();
    },

    updateScore(id, scoreA, scoreB, detail, commentaryLine = null) {
        const matches = this._getLocal(this.DB_MATCHES);
        const idx = matches.findIndex(m => m.id === id);
        if (idx === -1) return;
        matches[idx].scoreA = scoreA;
        matches[idx].scoreB = scoreB;
        matches[idx].detail = detail;
        if (commentaryLine) {
            if (!matches[idx].commentary) matches[idx].commentary = [];
            matches[idx].commentary.unshift(commentaryLine);
            if (matches[idx].commentary.length > 20) matches[idx].commentary.pop();
        }
        this._saveLocal(this.DB_MATCHES, matches);
        if (firebaseReady && db) db.ref('sports/matches/' + id).update({ scoreA, scoreB, detail, commentary: matches[idx].commentary });
    },

    updateStats(id, stats) {
        const matches = this._getLocal(this.DB_MATCHES);
        const idx = matches.findIndex(m => m.id === id);
        if (idx === -1) return;
        matches[idx].stats = { ...(matches[idx].stats || {}), ...stats };
        this._saveLocal(this.DB_MATCHES, matches);
        if (firebaseReady && db) db.ref('sports/matches/' + id).update({ stats: matches[idx].stats });
    },

    // ─── League CRUD ──────────────────────────────────────────────────────

    getLeagues(sport = null) {
        const all = this._getLocal(this.DB_LEAGUES);
        return sport ? all.filter(l => l.sport === sport) : all;
    },

    saveLeague(leagueData) {
        const leagues = this._getLocal(this.DB_LEAGUES);
        const idx = leagues.findIndex(l => l.id === leagueData.id);
        const enriched = { ...leagueData, updatedAt: new Date().toISOString() };
        
        if (idx !== -1) {
            leagues[idx] = { ...leagues[idx], ...enriched };
        } else {
            enriched.id = enriched.id || 'l_' + Date.now();
            leagues.unshift(enriched);
        }
        this._saveLocal(this.DB_LEAGUES, leagues);
        const final = idx !== -1 ? leagues[idx] : leagues[0];
        if (firebaseReady && db) db.ref('sports/leagues/' + final.id).set(final);
        return final;
    },

    deleteLeague(id) {
        let leagues = this._getLocal(this.DB_LEAGUES);
        leagues = leagues.filter(l => l.id !== id);
        this._saveLocal(this.DB_LEAGUES, leagues);
        if (firebaseReady && db) db.ref('sports/leagues/' + id).remove();
    },

    // ─── Firebase Real-Time Listeners ────────────────────────────────────

    listenMatches(sport, callback) {
        if (firebaseReady && db) {
            db.ref('sports/matches').orderByChild('sport').equalTo(sport).on('value', snap => {
                const data = snap.val() || {};
                const list = Object.values(data).sort((a, b) => {
                    // Live first
                    if (a.status === 'live' && b.status !== 'live') return -1;
                    if (b.status === 'live' && a.status !== 'live') return 1;
                    return new Date(a.startTime) - new Date(b.startTime);
                });
                callback(list);
            });
        } else {
            // Local fallback - poll every 3 seconds
            const poll = () => callback(this.getMatches(sport));
            poll();
            return setInterval(poll, 3000);
        }
    },

    listenMatchById(id, callback) {
        if (firebaseReady && db) {
            db.ref('sports/matches/' + id).on('value', snap => {
                callback(snap.val());
            });
        } else {
            const poll = () => callback(this.getMatchById(id));
            poll();
            return setInterval(poll, 2000);
        }
    }
};

// Auto-seed on load
document.addEventListener('DOMContentLoaded', () => SportsDB.seedDefaults());
