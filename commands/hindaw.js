const Discord = require('discord.js');
const accountService = require('../services/accountService');
const dotaApiService = require('../services/dotaApiService');
const accountHelper = require('../helpers/accountHelper');

module.exports = {
  name: 'hindaw',
  description: 'Hindaw!',
  async execute(message, args) {
   

    // check if there is argument
    if (!args.length) 
      return message.reply('no player name specified');

    const personaName = args.join(' ');

    // get account from db
    let account = await accountService.getAccount({ personaName: personaName });

    // check if account exist
    if (!account) 
      return message.reply(`account **${personaName}** is wara sa listahan. Paki-add anay gamit an **Invite!** command`);

    // sync account
    account = await accountHelper.syncAccount(account);

    // check if account has record
    if (!account.record || !account.record.streakCount)
      return message.reply(`account **${personaName}** has no match recorded for this month`);
    
    // get quota
    let res = await dotaApiService.getBannerbearAccount();

    let messageObj = {};

    // check if quota is reached
    if (res.free_trial_image_quota == res.free_trial_image_usage) {
      message.reply('naabot na an free trial image quota. Kalako niyo, adi la anay');

      // create embedded message
      messageObj = createEmbeddedMessage(account);
    } else {
      // create image message
      messageObj = await createImageMessage(account);
    }
    
    return message.channel.send(messageObj);
  }
}

async function createImageMessage(account) {
  // create infographic image
  res = await dotaApiService.createInfographic(account);

  // check if pending, and wait to complete
  if (res.status.toLowerCase() == 'pending') {
    while (res.status == 'pending') {
      await sleep(1000);
      res = await dotaApiService.getInfographic(res.self);
    }
  }

  // get image url
  let imageUrl = res.image_url;

  // remove image url query
  if (imageUrl.indexOf('?') > -1)
    imageUrl = imageUrl.substring(0, imageUrl.indexOf('?'));
  
  return { files: [imageUrl] };
}

function createEmbeddedMessage(account) {
  const record = account.record;
  const color = record.streakCount > 1 && record.isWinStreak ? 0x89ff89 : record.streakCount > 1 && !record.isWinStreak ? 0xff4534 : 0x0099ff; 
  
  let winRate = (record.winCount * 100 / (record.winCount + record.lossCount)).toFixed(2) + '%';
  if (winRate.endsWith('.00%'))
    winRate = winRate.slice(0, -4) + '%';

  const embedMessage = {
    color: color,
    title: account.personaName,
    fields: [
      {
        name: '\u200b',
        value: '\u200b',
        inline: false
      },
      {
        name: 'Total Games',
        value: record.winCount + record.lossCount,
        inline: false
      },
      {
        name: 'Wins',
        value: record.winCount,
        inline: false
      },
      {
        name: 'Losses',
        value: record.lossCount,
        inline: false
      },
      {
        name: 'Win Rate',
        value: winRate,
        inline: false
      }
    ]
  };

  if (record.streakCount > 1) {
    embedMessage.fields.push({
        name: 'Streak',
        value: `${record.streakCount} ${record.isWinStreak ? 'wins' : 'losses'}`,
        inline: false
    });
  }

  return { embed: embedMessage };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
