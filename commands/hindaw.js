const Discord = require('discord.js');
const accountService = require('../services/accountService');
const dotaApiService = require('../services/dotaApiService');
const accountHelper = require('../helpers/accountHelper');

module.exports = {
  name: 'hindaw',
  description: 'Hindaw!',
  async execute(message, args) {
    let res = await dotaApiService.getBannerbearAccount();

    if (res.free_trial_image_quota == res.free_trial_image_usage)
      return message.reply('free trial image quota is reached');

    if (!args.length) 
      return message.reply('no player name specified');

    const personaName = args.join(' ');

    let account = await accountService.getAccount({ personaName: personaName });

    if (!account) 
      return message.reply(`Account ${personaName} is not found`);

    account = await accountHelper.syncAccount(account);

    res = await dotaApiService.createInfographic(account);

    if (res.status.toLowerCase() == 'pending') {
      while (res.status == 'pending') {
        await sleep(1000);
        res = await dotaApiService.getInfographic(res.self);
      }
    }

    let imageUrl = res.image_url;

    if (imageUrl.indexOf('?') > -1)
      imageUrl = imageUrl.substring(0, imageUrl.indexOf('?'));

    message.channel.send({
      files: [imageUrl]
    });
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}