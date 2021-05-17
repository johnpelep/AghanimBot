const fs = require('fs');
const Discord = require('discord.js');
const { token } = require('./config');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once('ready', () => {
  console.log('Ready!');
});

client.on('message', async (message) => {
  if (message.author.bot) return;

  let args = message.content.trim().split(/ +/);
  const commandName = args.shift().toLowerCase().slice(0, -1); //remove !

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
