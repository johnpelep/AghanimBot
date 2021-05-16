const Discord = require('discord.js');
const accountService = require('../services/accountService');
const dotaApiService = require('../services/dotaApiService');
const accountHelper = require('../helpers/accountHelper');

module.exports = {
  name: 'hindaw',
  description: 'Hindaw!',
  async execute(message, args) {
    // check if there is argument
    if (!args) return message.reply('no player name specified');

    const personaName = args;

    // get account from db
    let account = await accountService.getAccount({ personaName: args });

    // check if account exist
    if (!account)
      return message.reply(
        `account **${personaName}** is wara sa listahan. Paki-add anay gamit an **Invite!** command`
      );

    // sync account
    account = await accountHelper.syncAccount(account);

    // check if account has record
    if (!account.record || !account.record.streakCount)
      return message.reply(
        `account **${personaName}** has no match recorded for this month`
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
    title: account.personaName,
    thumbnail: {
      url: account.avatar,
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
