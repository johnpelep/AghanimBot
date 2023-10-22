const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { aghanimApiUrl } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Invite')
    .addStringOption(option => option
      .setName('steam-profile-url')
      .setDescription('Steam Profile URL')
      .setRequired(true)),
  async execute(interaction) {
    let profileUrl = interaction.options.getString('steam-profile-url');

    if (!profileUrl)
      return interaction.reply('waray mo man dap ginbutang kun sino an iginvite');

    if (profileUrl.endsWith('/')) profileUrl = profileUrl.slice(0, -1);

    const steamId = profileUrl.split('/').pop();

    const res = await axios
      .post(`${aghanimApiUrl}/api/players/invite/${steamId}`)
      .then((response) => response.data)
      .catch((err) => {
        if (err.response && err.response.status == 400)
          return err.response.data;
        throw err;
      });

    if (res.errors) {
      let errorMessage = '';
      if (res.errors.steamID64 && res.errors.steamID64.length)
        errorMessage = res.errors.steamID64[0];
      else if (res.errors.customID && res.errors.customID.length)
        errorMessage = res.errors.customID[0];
      return interaction.reply(errorMessage);
    }

    return interaction.channel.send(
      `*Aghanim the Popular welcomes you,* ***${res.personaName}***`
    );
  },
};
