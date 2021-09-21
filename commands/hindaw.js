const axios = require('axios');
const { aghanimApiUrl } = require('../config');

Date.prototype.addHours = function (h) {
  this.setTime(this.getTime() + h * 60 * 60 * 1000);
  return this;
};

module.exports = {
  name: 'hindaw',
  description: 'Hindaw!',
  async execute(message, args) {
    // check if there is argument
    if (!args) return message.reply('no player name specified');

    const personaName = args;

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
      return message.reply(
        `account **${personaName}** is wara sa listahan. Paki-add anay gamit an **Invite!** command`
      );

    const messageObj = createEmbeddedMessage(account);

    return message.channel.send(messageObj);
  },
};

function createEmbeddedMessage(account) {
  const dateInPh = new Date().getTimeInPh();
  const record = account.records.filter(
    (r) =>
      r.month == dateInPh.getMonth() + 1 && r.year == dateInPh.getFullYear()
  )[0];
  const hasRecord = record && record.streakCount;
  const color =
    record.streakCount > 1 && record.isWinStreak
      ? 0x89ff89
      : record.streakCount > 1 && !record.isWinStreak
      ? 0xff4534
      : 0x0099ff;

  const embedMessage = {
    color: color,
    author: {
      name: account.personaName,
      icon_url: account.avatar,
    },
    thumbnail: {
      url: account.rank.medalUrl,
    },
    fields: [
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: 'Total Games',
        value: hasRecord ? record.winCount + record.lossCount : '-',
        inline: false,
      },
      {
        name: 'Wins',
        value: hasRecord ? record.winCount : '-',
        inline: false,
      },
      {
        name: 'Losses',
        value: hasRecord ? record.lossCount : '-',
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
    ],
  };

  return { embed: embedMessage };
}
