const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { aghanimApiUrl } = require('../config');

Date.prototype.addHours = function (h) {
  this.setTime(this.getTime() + h * 60 * 60 * 1000);
  return this;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hindaw')
    .setDescription('Hindaw!')
    .addStringOption((option) => option
      .setName('player-ign')
      .setDescription('Player IGN')
      .setRequired(true)),
  async execute(interaction) {
    const personaName = interaction.options.getString('player-ign');

    // check if there is argument
    if (!personaName) return interaction.reply('no player name specified');

    // get account from api
    const account = await axios
      .get(encodeURI(`${aghanimApiUrl}/api/players/${personaName}`))
      .then((response) => response.data)
      .catch((err) => {
        if (err.response && err.response.status == 404) return null;
        throw err;
      });

    // check if account exist
    if (!account)
      return interaction.reply(
        `account **${personaName}** is wara sa listahan. Paki-add anay gamit an **Invite!** command`
      );

    const embedMessage = createEmbeddedMessage(account);
    return interaction.channel.send({ embeds: [embedMessage] });
  },
};

function createEmbeddedMessage(account) {
  const record = account.record;
  const hasRecord = record.totalGames > 0;
  const color =
    record.streakCount > 1 && record.isWinStreak
      ? 0x89ff89
      : record.streakCount > 1 && !record.isWinStreak
        ? 0xff4534
        : 0x0099ff;

  const embedMessage = new EmbedBuilder()
    .setColor(color)
    .setAuthor({
      name: account.personaName,
      iconURL: account.avatar,
    })
    .setThumbnail(account.rank.medalUrl)
    .addFields([
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: 'Total Games',
        value: hasRecord ? Number(record.totalGames).toString() : '-',
        inline: false,
      },
      {
        name: 'Wins',
        value: hasRecord ? Number(record.winCount).toString() : '-',
        inline: false,
      },
      {
        name: 'Losses',
        value: hasRecord ? Number(record.lossCount).toString() : '-',
        inline: false,
      },
      {
        name: 'Win Rate',
        value: hasRecord ? `${record.winRate}%` : '-',
        inline: false,
      },
      {
        name: 'Streak',
        value: hasRecord
          ? record.streakCount == 1
            ? 'No streak'
            : `${record.streakCount} ${record.isWinStreak ? 'wins' : 'losses'}`
          : '-',
        inline: false,
      },
    ]);

  return embedMessage;
}
