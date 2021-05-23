const { default: axios } = require('axios');
const { aghanimApiUrl } = require('../config');

module.exports = {
  name: 'kick',
  async execute(message, args) {
    // check if there is argument
    if (!args)
      return message.reply('waray mo man dap ginbutang kun sino an igkick');

    const personaName = args;

    // get account from api
    const accounts = await axios
      .get(`${aghanimApiUrl}/players?personaName=${personaName}`)
      .then((response) => response.data)
      .catch((err) => {
        if (err.response.status == 404) return [];
        throw err;
      });

    // check if account exist
    if (!accounts.length)
      return message.reply(`waray man dap sa listahan si **${personaName}**`);

    await axios
      .delete(`${aghanimApiUrl}/players/${accounts[0].steamId64}`)
      .then(() =>
        message.channel.send(
          `*I, I admit nothing but my sadness that you're gone,* ***${personaName}***`
        )
      )
      .catch((err) => {
        throw err;
      });
  },
};
