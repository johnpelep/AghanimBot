const axios = require('axios');
const { aghanimApiUrl } = require('../config');

module.exports = {
  name: 'invite',
  async execute(message, args) {
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

    if (res.errors && res.errors.steamId && res.errors.steamId.length) {
      return message.channel.reply(res.errors.steamId[0]);
    }

    return message.channel.send(
      `*Aghanim the Popular welcomes you,* ***${res.personaName}***`
    );
  },
};
