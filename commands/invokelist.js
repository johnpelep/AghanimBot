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
				}
			]
		};

		message.channel.send({ embed: embedMessage });
    }
}