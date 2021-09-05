const { default: axios } = require('axios');
const { aghanimApiUrl } = require('../config');

module.exports = {
  name: 'kick',
  async execute(message, args) {
    // check if there is argument
    if (!args.length)
      return message.reply('waray mo man dap ginbutang kun sino an igkick');

    const personaName = args.shift();

    axios
      .delete(encodeURI(`${aghanimApiUrl}/api/players/kick/${personaName}`))
      .then(() =>
        message.channel.send(
          `*I, I admit nothing but my sadness that you're gone,* ***${personaName}***`
        )
      )
      .catch((err) => {
        if (err.response && err.response.status == 404)
          return message.reply(
            `waray man dap sa listahan si **${personaName}**`
          );
        throw err;
      });
  },
};
