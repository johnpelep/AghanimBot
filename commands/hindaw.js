const Discord = require('discord.js');
const accountService = require('../services/accountService');
const dotaApiService = require('../services/dotaApiService');
const accountHelper = require('../helpers/accountHelper');

module.exports = {
  name: 'hindaw',
  description: 'Hindaw!',
  async execute(message, args) {
    if (!args.length) 
      return message.reply('no name specified');

    const personaName = args.shift();

    const account = await accountService.getAccount({ personaName: personaName });

    if (!account) 
      return message.reply('account not found');

    account = await accountHelper.syncAccount(account);

    let res = await dotaApiService.createInfographic(account);

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