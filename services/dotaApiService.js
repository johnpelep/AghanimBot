const fetch = require('node-fetch');
const { key, getPlayerSummaryUrl, getMatchesUrl } = require('../config');

module.exports = {
    async getPlayerSummary(accounts) {
        const res = await fetch(buildUrl(accounts)).then(response => response.json());
        return res.response.players;
    },
    async getRecentMatches(player, limit) {
        const LOBBY_TYPE = 7; // ranked
        const SORT_BY = "match_id";
        const res = await fetch(`${getMatchesUrl.replace('{account_id}', player.accountId)}?limit=${limit}&lobby_type=${LOBBY_TYPE}&sort=${SORT_BY}`).then(response => response.json());
        let win = 0;
        let loss = 0;
        let streak = 0;
        let isWinStreak = false;
        let isStreakEnd = false;
    
        if (res.length) {
            for (let j = 0; j < res.length; j++) {
                let match = res[j];
    
                if (match.lobby_type == 7) {
                    let isWinner = (match.player_slot < 128 && match.radiant_win) || (match.player_slot > 127 && !match.radiant_win);
    
                    if (j == 0 && isWinner)
                        isWinStreak = true;
        
                    if (isWinner == isWinStreak && !isStreakEnd)
                        streak++;
                    else
                        isStreakEnd = true;
        
                    if (isWinner)
                        win++;
                    else
                        loss++;
                }
            }
        }
    
        player.win = win;
        player.loss = loss;
        player.streak = streak;
        player.isWinStreak = isWinStreak;
    
        return player;
    }
}

function buildUrl(accounts) {
	const steamIds = [];

	for (let i = 0; i < accounts.length; i++) {
		steamIds.push(accounts[i].steamId64);
	}

	return `${getPlayerSummaryUrl}?key=${key}&steamids=${steamIds.join(',')}`
}