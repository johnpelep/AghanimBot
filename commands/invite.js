const axios = require('axios');
const { aghanimApiUrl } = require('../config');

module.exports = {
  name: 'invite',
  async execute(message, args) {
    let profileUrl = args.shift();

    const res = await axios
      .post(`${aghanimApiUrl}/players`, { profileUrl: profileUrl })
      .then((response) => response.data)
      .catch((err) => {
        if (err.response && err.response.status == 400)
          return err.response.data;
        throw err;
      });

    if (!res.message)
      return message.channel.send(
        `*Aghanim the Popular welcomes you,* ***${res.personaName}***`
      );

    if (res.personaName)
      return message.reply(`nakalista na dap si **${res.personaName}**`);

    return message.reply(res.message);
  },
};
