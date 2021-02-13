module.exports = {
    name: 'invokelist',
    description: 'InvokeList!',
    execute(message, args) {
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
					value: 'Listahan san active ngan passive',
					inline: false
				},
				{
					name: '\u200b',
					value: '\u200b',
					inline: false
				},
				{
					name: 'Friends! -active',
					value: 'Listahan san mga nagpaparm',
					inline: false
				},
				{
					name: '\u200b',
					value: '\u200b',
					inline: false
				},
				{
					name: 'Friends! -passive',
					value: 'Listahan san mga nag-inanggoy',
					inline: false
				},
				{
					name: '\u200b',
					value: '\u200b',
					inline: false
				},
				{
					name: 'Friends! -busog',
					value: 'Listahan san mga win streak',
					inline: false
				},
				{
					name: '\u200b',
					value: '\u200b',
					inline: false
				},
				{
					name: 'Friends! -gutom',
					value: 'Listahan san mga lose streak',
					inline: false
				},
				{
					name: '\u200b',
					value: '\u200b',
					inline: false
				},
				{
					name: 'Invite! <SteamProfileURL>',
					value: 'Pag add sa listahan',
					inline: false
				},
				{
					name: '\u200b',
					value: '\u200b',
					inline: false
				},
				{
					name: 'Kick! <SteamProfileURL>',
					value: 'Pag remove sa listahan',
					inline: false
				},
				{
					name: '\u200b',
					value: '\u200b',
					inline: false
				},
				{
					name: 'Hindaw! <PlayerName>',
					value: 'Paghimo infographic',
					inline: false
				}
			]
		};

		message.channel.send({ embed: embedMessage });
    }
}