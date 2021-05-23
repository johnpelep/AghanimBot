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
          inline: false,
        },
        {
          name: 'Friends!',
          value: 'Pagkita san listahan',
          inline: false,
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: false,
        },
        {
          name: 'Friends! -active',
          value: 'Pagkita san listahan san mga nagpaparm',
          inline: false,
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: false,
        },
        {
          name: 'Friends! -passive',
          value: 'Pagkita san listahan san mga nag-iinanggoy',
          inline: false,
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: false,
        },
        {
          name: 'Friends! -busog',
          value: 'Pagkita san listahan san mga win streak',
          inline: false,
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: false,
        },
        {
          name: 'Friends! -gutom',
          value: 'Pagkita san listahan san mga lose streak',
          inline: false,
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: false,
        },
        {
          name: 'Invite! <SteamProfileURL>',
          value: 'Pag add sa listahan',
          inline: false,
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: false,
        },
        {
          name: 'Kick! <PlayerName>',
          value: 'Pag remove sa listahan',
          inline: false,
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: false,
        },
        {
          name: 'Hindaw! <PlayerName>',
          value: 'Pankumusta kun okeh pa',
          inline: false,
        },
      ],
    };

    message.channel.send({ embed: embedMessage });
  },
};
