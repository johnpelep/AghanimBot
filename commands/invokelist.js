const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invokelist')
    .setDescription('InvokeList!'),
  execute(interaction) {
    const embedMessage = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Invoke List')
      .setThumbnail('https://static.wikia.nocookie.net/defenseoftheancients/images/9/9a/Invoke-r9ei.png/revision/latest/scale-to-width-down/64?cb=20110907022217')
      .addFields(
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
        {
          name: '\u200b',
          value: '\u200b',
          inline: false,
        },
        {
          name: 'LodiList!',
          value: 'Pagkita san ranking',
          inline: false,
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: false,
        },
        {
          name: 'LodiList! <1/2/3...>',
          value: 'Pagkita san ranking sa usa nga tier',
          inline: false,
        },
      );

    interaction.channel.send({ embeds: [embedMessage] });
  },
};
