// require the discord.js module
const Discord = require('discord.js');
const config = require('./config.json');
const fetch = require('node-fetch');
const ytdl = require('ytdl-core');

// create a new Discord client
const client = new Discord.Client();

let isPlaying = false;

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', async message => {
	// ignore message from bot
	if (message.author.bot) return;

	const args = message.content.trim().split(/ +/);
	const command = args.shift().toLowerCase();
	
	if (command == `friends${config.suffix}`) {
		let status = '';

		if (args.length) 
			status = args[0].toLowerCase();

		const url = buildUrl();
		const res = await fetch(url).then(response => response.json());
		let players = res.response.players;
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

		for (var i = 0; i < players.length; i++) {
			fields = buildMessageFields(players[i], fields);

			if ((i+1) % 6 == 0 || i == players.length-1) {
				embedMessage.fields = fields;
				embedMessage.footer = {
					text: `Page ${Math.ceil((i+1)/6)} of ${Math.ceil(players.length/6)}`
				}
				fields = [ 
					{
						name: '\u200b',
						value: '\u200b',
						inline: false
					}
				];
				message.reply({ embed: embedMessage });
			}
		}
	}
	else if (command == `djviper${config.suffix}`) {
		// Voice only works in guilds, if the message does not come from a guild,
		// we ignore it
		
		if (!message.guild) return;

		if (isPlaying) {
			return message.reply('wet, may ginpi-play pa si djviper.');
		}
		
		const voiceChannel = message.member.voice.channel;

		// Only try to join the sender's voice channel if they are in one themselves
		if (!voiceChannel) {
			return message.reply('pag-join anay voice channel yot.');
		}

		if (args.indexOf('-link') == -1) {
			return message.reply('ibutang liwat an youtube link yot pati volume (1 an normal). Sample: DjViper! -link https://www.youtube.com/mekeh -volume 0.5');
		}
		
		try {
			let options = {};

			if (args.indexOf('-volume') > -1) {
				options.volume = args[3];
			}
			else {
				options.volume = 1;
			}
			
			const link = args[1];
			const connection = await message.member.voice.channel.join();

			const songInfo = await ytdl.getInfo(args[1]);
			
			// const dispatcher = connection.play('C:/Users/johann/Music/Charlie Puth - Girlfriend.mp3');
			// const dispatcher = connection.play('https://gamepedia.cursecdn.com/dota2_gamepedia/f/f7/Vo_pudge_pud_ability_hook_10.mp3', { volume: 2});
			const dispatcher = connection.play(ytdl(link, { filter: 'audioonly' }), options);

			dispatcher.on('start', () => {
				isPlaying = true;
				message.reply(`Now playing: ${songInfo.videoDetails.title}`);
				console.log('audio.mp3 is now playing!');
			});
			
			dispatcher.on('finish', () => {
				isPlaying = false;
				console.log('audio.mp3 has finished playing!');
				voiceChannel.leave();
			});

			// Always remember to handle errors appropriately!
			dispatcher.on('error', () => {
				isPlaying = false;
				console.error;
				voiceChannel.leave();
			});
		} catch (error) {
			console.error(error);
			voiceChannel.leave();
		}

		
	}
	else if (command == `invokelist${config.suffix}`) {
		const embedMessage = {
			color: 0x0099ff,
			title: 'Invoke List',
			fields: [
				{
					name: '\u200b',
					value: '\u200b',
					inline: false
				},
				{
					name: 'Friends!',
					value: 'Pagkita kun sino active ngan passive',
					inline: false
				},
				{
					name: '\u200b',
					value: '\u200b',
					inline: false
				},
				{
					name: 'Friends! -active',
					value: 'Listahan san malalakas',
					inline: false
				},
				{
					name: '\u200b',
					value: '\u200b',
					inline: false
				},
				{
					name: 'Friends! -passive',
					value: 'Listahan san mga bayot',
					inline: false
				},
				{
					name: '\u200b',
					value: '\u200b',
					inline: false
				},
				{
					name: 'DjViper! -link https://www.youtube.com/mekeh -volume 1',
					value: 'Pandisco-disco.',
					inline: false
				}
			]
		};

		message.reply({ embed: embedMessage });
	}
});

// login to Discord with your app's token
client.login(config.token);

function buildUrl() {
	const steamIds = [];
	
	for (var i = 0; i < config.accounts.length; i++) {
		steamIds.push(config.accounts[i].steamIds);
	}

	return `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${config.steamApiKey}&steamids=${steamIds.join(',')}`
}

function buildMessageFields(player, fields) {
	let status = '';
	
	switch(player.personastate) {
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