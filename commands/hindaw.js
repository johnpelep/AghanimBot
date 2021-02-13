const Discord = require('discord.js');
const accountService = require('../services/accountService');
const dotaApiService = require('../services/dotaApiService');

module.exports = {
  name: 'hindaw',
  description: 'Hindaw!',
  async execute(message, args) {
    // if (!args.length) return message.reply('no name specified');

    // const personaName = args.shift();

    // const account = await accountService.getAccount({ personaName: personaName });

    // if (!account) return message.reply('account not found');

    // let res = await dotaApiService.createInfographic(account);

    // if (res.status.toLowerCase() == 'pending') {
    //     while (res.status == 'pending') {
    //         await sleep(1000);
    //         res = await dotaApiService.getInfographic(res.self);
    //     }
    // } 

    // let imageUrl = res.image_url;

    // if (imageUrl.indexOf('?') > -1)
    //     imageUrl = imageUrl.substring(0, imageUrl.indexOf('?'));

    const messageAttachment = new Discord.MessageAttachment('https://images.bannerbear.com/requests/images/002/313/939/original/963e1761888a256eefe568c38eed5afeac79c72f.png');

    message.channel.send({
      files: ['https://images.bannerbear.com/requests/images/002/313/939/original/963e1761888a256eefe568c38eed5afeac79c72f.png?size=2048']
    });
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}