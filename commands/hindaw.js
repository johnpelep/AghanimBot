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
  const dateInPh = getTimeInPH();
  const record = account.records.filter(
    (r) =>
      r.month == dateInPh.getMonth() + 1 && r.year == dateInPh.getFullYear()
  )[0];
  const noRecord = !record || !record.streakCount;
  const color =
    record.streakCount > 1 && record.isWinStreak
      ? 0x89ff89
      : record.streakCount > 1 && !record.isWinStreak
      ? 0xff4534
      : 0x0099ff;

  let winRate = !noRecord
    ? ((record.winCount * 100) / (record.winCount + record.lossCount)).toFixed(
        2
      ) + '%'
    : '-';
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
        value: !noRecord ? record.winCount + record.lossCount : '-',
        inline: false,
      },
      {
        name: 'Wins',
        value: !noRecord ? record.winCount : '-',
        inline: false,
      },
      {
        name: 'Losses',
        value: !noRecord ? record.lossCount : '-',
        inline: false,
      },
      {
        name: 'Win Rate',
        value: winRate,
        inline: false,
      },
      {
        name: 'Streak',
        value: !noRecord
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

//https://stackoverflow.com/a/8207708
function getTimeInPH() {
  const OFFSET = 8; //UTC+8

  // create Date object for current location
  var d = new Date();

  // convert to msec
  // subtract local time zone offset
  // get UTC time in msec
  var utc = d.getTime() + d.getTimezoneOffset() * 60000;

  // create new Date object for different city
  // using supplied offset
  return new Date(utc + 3600000 * OFFSET);
}
