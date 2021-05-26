const axios = require('axios');
const { aghanimApiUrl } = require('../config');

module.exports = {
  name: 'hindaw',
  description: 'Hindaw!',
  async execute(message, args) {
    // check if there is argument
    if (!args) return message.reply('no player name specified');

    const personaName = args;

    // get account from api
    const accounts = await axios
      .get(encodeURI(`${aghanimApiUrl}/players?personaName=${personaName}`))
      .then((response) => response.data)
      .catch((err) => {
        if (err.response.status == 404) return [];
        throw err;
      });

    // check if account exist
    if (!accounts.length)
      return message.reply(
        `account **${personaName}** is wara sa listahan. Paki-add anay gamit an **Invite!** command`
      );

    const account = accounts[0];

    // get account record from api
    account.record = await axios
      .get(`${aghanimApiUrl}/players/${account.steamId64}/record`)
      .then((response) => response.data)
      .catch((err) => {
        throw err;
      });

    // check if account has record
    if (!account.record || !account.record.streakCount)
      return message.reply(
        `si **${personaName}** waray pa nagpaparm yana nga bulan`
      );

    const messageObj = createEmbeddedMessage(account);

    return message.channel.send(messageObj);
  },
};

function createEmbeddedMessage(account) {
  const record = account.record;
  const color =
    record.streakCount > 1 && record.isWinStreak
      ? 0x89ff89
      : record.streakCount > 1 && !record.isWinStreak
      ? 0xff4534
      : 0x0099ff;

  let winRate =
    ((record.winCount * 100) / (record.winCount + record.lossCount)).toFixed(
      2
    ) + '%';
  if (winRate.endsWith('.00%')) winRate = winRate.slice(0, -4) + '%';

  const embedMessage = {
    color: color,
    author: {
      name: account.personaName,
      icon_url: account.avatar,
    },
    thumbnail: {
      url: account.rank.medalImageUrl,
    },
    fields: [
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: 'Total Games',
        value: record.winCount + record.lossCount,
        inline: false,
      },
      {
        name: 'Wins',
        value: record.winCount,
        inline: false,
      },
      {
        name: 'Losses',
        value: record.lossCount,
        inline: false,
      },
      {
        name: 'Win Rate',
        value: winRate,
        inline: false,
      },
      {
        name: 'Streak',
        value:
          record.streakCount == 1
            ? 'No streak'
            : `${record.streakCount} ${record.isWinStreak ? 'wins' : 'losses'}`,
        inline: false,
      },
    ],
  };

  return { embed: embedMessage };
}
