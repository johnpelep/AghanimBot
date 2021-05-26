const { default: axios } = require('axios');
const { aghanimApiUrl } = require('../config');

module.exports = {
  name: 'lodilist',
  async execute(message, args) {
    // get account from api
    let accounts = await axios
      .get(encodeURI(`${aghanimApiUrl}/players`))
      .then((response) => response.data)
      .catch((err) => {
        if (err.response.status == 404) return [];
        throw err;
      });

    // check if accounts found
    if (!accounts.length)
      return message.reply(`waray pa man sulod an listahan`);

    // filter accounts with no rank
    accounts = accounts.filter((account) => account.rank != undefined);

    // sort accounts by rank descending
    accounts.sort((a, b) => b.rank.rankTier - a.rank.rankTier);

    // get thropies for message thumbnails
    const trophies = await axios
      .get(encodeURI(`${aghanimApiUrl}/constants/trophies`))
      .then((response) => response.data)
      .catch((err) => {
        if (err.response.status == 404) return [];
        throw err;
      });

    // send embedded messages
    const embedMessage = {
      embed: {
        title: '*Who will make Aghanim as proud as a new father?*',
        thumbnail: {},
        fields: [
          {
            name: '\u200b',
            value: '\u200b',
            inline: false,
          },
        ],
      },
    };

    let trophy = {};
    const NUMBER_OF_ACCOUNT_PER_MESSAGE = 5;
    for (let i = 0; i < accounts.length; i++) {
      let account = accounts[i];

      const fields = createEmbeddedMessageFields(account, i + 1);

      // append fields to embed message fields
      embedMessage.embed.fields.push.apply(embedMessage.embed.fields, fields);

      if (
        (i + 1) % NUMBER_OF_ACCOUNT_PER_MESSAGE == 0 ||
        i == accounts.length - 1
      ) {
        // set footer
        embedMessage.embed.footer = {
          text: `Page ${Math.ceil(
            (i + 1) / NUMBER_OF_ACCOUNT_PER_MESSAGE
          )} of ${Math.ceil(accounts.length / NUMBER_OF_ACCOUNT_PER_MESSAGE)}`,
        };

        // get trophy
        if (trophies.length > 0) trophy = trophies.shift();

        // set thumbnail
        embedMessage.embed.thumbnail.url = trophy.imageUrl;

        // set color
        embedMessage.embed.color = '#' + trophy.color;

        // send message
        message.channel.send(embedMessage);

        // reset fields
        embedMessage.embed.fields = [
          {
            name: '\u200b',
            value: '\u200b',
            inline: false,
          },
        ];
      }
    }
  },
};

function createEmbeddedMessageFields(account, rank) {
  const fields = [
    {
      name: 'Rank',
      value: rank,
      inline: true,
    },
    {
      name: 'Name',
      value: account.personaName,
      inline: true,
    },
    {
      name: 'Medal',
      value: account.rank.medal,
      inline: true,
    },
    {
      name: '\u200b',
      value: '\u200b',
      inline: false,
    },
  ];

  return fields;
}
