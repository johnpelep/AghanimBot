const Discord = require('discord.js');
const accountService = require('../services/accountService');
const dotaApiService = require('../services/dotaApiService');
const accountHelper = require('../helpers/accountHelper');

module.exports = {
  name: 'hindaw',
  description: 'Hindaw!',
  async execute(message, args) {
    // get quota
    let res = await dotaApiService.getBannerbearAccount();

    // check if quota is reached
    if (res.free_trial_image_quota == res.free_trial_image_usage)
      return message.reply('sorry, free trial image quota is already reached');

    // check if there is argument
    if (!args.length) 
      return message.reply('no player name specified');

    const personaName = args.join(' ');

    // get account from db
    let account = await accountService.getAccount({ personaName: personaName });

    // check if account exist
    if (!account) 
      return message.reply(`account **${personaName}** is wara sa listahan`);

    // sync account
    account = await accountHelper.syncAccount(account);

    // check if account has record
    if (!account.record || !account.record.streakCount)
      return message.reply(`account **${personaName}** has no match recorded for this month`);
    
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

    // send image to discord chat
    message.channel.send({
      files: [imageUrl]
    });
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
