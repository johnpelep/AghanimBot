const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const { token, appId } = require('./config');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

client.once(Events.ClientReady, () => {
  console.log('Ready!');
});

// client.on(Events.MessageCreate, async (message) => {
//   console.log(message)
//   if (message.author.bot && message.author.id != appId) return; // ignore message from other bots

//   let args = message.content.trim().split(/ +/);
//   const commandName = args.shift().toLowerCase().slice(0, -1); // remove !

//   if (!client.commands.has(commandName)) return;

//   const command = client.commands.get(commandName);

//   try {
//     if (commandName == 'hindaw') args = message.content.slice(8);
//     await command.execute(message, args);
//   } catch (error) {
//     console.error(error);

//     const embedMessage = {
//       color: 0x0099ff,
//       title: 'Noooooo! Oh well',
//       footer: {
//         text: 'nagka-error hehe. try nala utro hehehe',
//       },
//     };

//     return message.reply({ embed: embedMessage });
//   }
// });

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
});

client.login(token);
