const accounts = require('../accounts.json').accounts;
const fetch = require('node-fetch');
const { key, url, recentMatchesUrl } = require('../config');

module.exports = {
    name: 'friends',
    description: 'Friends!',
    async execute(message, args) {
        let status = '';

		if (args.length)
			status = args.shift().toLowerCase();

		// get player summary from steam api
		const res = await fetch(buildUrl()).then(response => response.json());
		let players = res.response.players;

		// filter players by status
		const ingamePlayers = players.filter(item => item.gameextrainfo != undefined);
		const onlinePlayers = players.filter(item => item.personastate > 0 && item.gameextrainfo == undefined);
		const offlinePlayers = players.filter(item => item.personastate == 0 && item.lastlogoff != undefined);
		const offlinePlayersNotFriend = players.filter(item => item.personastate == 0 && item.lastlogoff == undefined);

		// sort ingame and online players by status
		ingamePlayers.sort((a, b) => a.personastate - b.personastate);
		onlinePlayers.sort((a, b) => a.personastate - b.personastate);

		//sort offline players by lastlogoff
		offlinePlayers.sort((a, b) => b.lastlogoff - a.lastlogoff);

		//soft offline not friend players by personaname
		offlinePlayersNotFriend.sort((a, b) => a.personaname.localeCompare(b.personaname));

		switch (status) {
			case '-active':
				players = ingamePlayers.concat(onlinePlayers);
				break;
			case '-passive':
				players = offlinePlayers.concat(offlinePlayersNotFriend);
				break;
			default:
				players = ingamePlayers.concat(onlinePlayers).concat(offlinePlayers).concat(offlinePlayersNotFriend);
		}

		let fields = [
			{
				name: '\u200b',
				value: '\u200b',
				inline: false
			}
		];

		let embedMessage = {
			color: 0x0099ff,
			title: 'Let us skirmish!',
		};

		// get recent matches win/loss
		if (status == '-busog' || status == '-gutom') {
			for (let i = 0; i < players.length; i++) {
				let player = players[i];
				player.accountId = accounts.find(a => a.steamId == player.steamid).accountId;
				player = await getRecentMatches(player);
			}

			// remove players with no games
			players = players.filter(p => p.streak > 0);

			if (status == '-busog')
				players = players.filter(p => p.isWinStreak && p.streak > 0);
			else
				players = players.filter(p => !p.isWinStreak && p.streak > 0);

			players.sort((a, b) => {
				if (a.streak > b.streak)
					return -1;
				else
					return 1;
			});
		}


		for (let i = 0; i < players.length; i++) {
			let player = players[i];

			if (status == '-busog' || status == '-gutom') {
				fields = buildAppetiteMessageFields(player, fields)
			} else
				fields = buildActivityMessageFields(player, fields);

			if ((i + 1) % 6 == 0 || i == players.length - 1) {
				embedMessage.fields = fields;
				embedMessage.footer = {
					text: `Page ${Math.ceil((i + 1) / 6)} of ${Math.ceil(players.length / 6)}`
				}
				fields = [];
				message.channel.send({ embed: embedMessage });
				delete embedMessage.title;
			}
		}
    }
};

function buildUrl() {
	const steamIds = [];

	for (let i = 0; i < accounts.length; i++) {
		steamIds.push(accounts[i].steamId);
	}

	return `${url}?key=${key}&steamids=${steamIds.join(',')}`
}

function buildActivityMessageFields(player, fields) {
	let status = '';

	switch (player.personastate) {
		case 0:
			status = 'Offline';
			break;
		case 1:
			status = 'Online';
			break;
		case 2:
			status = 'Busy';
			break;
		case 3:
			status = 'Away (Nauro ine na klase)';
			break;
		case 4:
			status = 'Snooze';
			break;
		case 5:
			status = 'Looking to Trade';
			break;
		case 6:
			status = 'Looking to Play';
			break;
		default:
			status = 'Ambot daw'
	}

	// Name
	fields.push({
		name: 'Name',
		value: player.personaname,
		inline: false
	});

	// Status
	if (player.gameextrainfo != undefined) {
		fields.push({
			name: 'Status',
			value: `Playing ${player.gameextrainfo}`,
			inline: false
		});
	}
	else {
		fields.push({
			name: 'Status',
			value: status,
			inline: false
		});
	}

	// Last Log Off
	if (status === 'Offline' && player.lastlogoff != undefined) {
		var date = new Date(player.lastlogoff * 1000);
		fields.push({
			name: 'Logged Off Since',
			value: `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`,
			inline: false
		});
	}

	//break line
	fields.push({
		name: '\u200b',
		value: '\u200b',
		inline: false
	});

	return fields;
}

function buildAppetiteMessageFields(player, fields) {
	// Name
	fields.push({
		name: 'Name',
		value: player.personaname,
		inline: false
	});

	// Win/Lose
	fields.push({
		name: `Recent 20 Matches (${player.win + player.loss == 20 ? 'All' : player.win + player.loss} Ranked) Win/Loss`,
		value: `${player.win}/${player.loss}`,
		inline: false
	});

	// Current Streak
	fields.push({
		name: 'Current Streak',
		value: `${player.streak} ${player.isWinStreak ? player.streak > 1 ? 'wins' : 'win' : player.streak > 1 ? 'losses' : 'loss'}`,
		inline: false
	});

	//break line
	fields.push({
		name: '\u200b',
		value: '\u200b',
		inline: false
	});

	return fields;
}

async function getRecentMatches(player) {
	const res = await fetch(recentMatchesUrl.replace('{account_id}', player.accountId)).then(response => response.json());
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