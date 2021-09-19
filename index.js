const fs = require('fs');
const Discord = require('discord.js');
const { token, appId } = require('./config');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

//https://stackoverflow.com/a/8207708
Date.prototype.getTimeInPh = () => {
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
};

client.once('ready', () => {
  console.log('Ready!');
});

client.on('message', async (message) => {
  if (message.author.bot && message.author.id != appId) return; // ignore message from other bots

  let args = message.content.trim().split(/ +/);
  const commandName = args.shift().toLowerCase().slice(0, -1); // remove !

  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);

  try {
    if (commandName == 'hindaw') args = message.content.slice(8);
    await command.execute(message, args);
  } catch (error) {
    console.error(error);

    const embedMessage = {
      color: 0x0099ff,
      title: 'Noooooo! Oh well',
      footer: {
        text: 'nagka-error hehe. try nala utro hehehe',
      },
    };

    return message.reply({ embed: embedMessage });
  }
});

client.login(token);
