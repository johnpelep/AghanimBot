const axios = require('axios');
const { aghanimApiUrl } = require('../config');

module.exports = {
  name: 'invite',
  async execute(message, args) {
    if (!args.length)
      return message.reply('waray mo man dap ginbutang kun sino an iginvite');

    let profileUrl = args.shift();

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
      return message.reply(errorMessage);
    }

    return message.channel.send(
      `*Aghanim the Popular welcomes you,* ***${res.personaName}***`
    );
  },
};
