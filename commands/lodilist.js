const { default: axios } = require('axios');
const { aghanimApiUrl } = require('../config');
const NUMBER_OF_PLAYERS_PER_PAGE = 5;

module.exports = {
  name: 'lodilist',
  async execute(message, args) {
    // get accounts from api
    let accounts = await axios
      .get(encodeURI(`${aghanimApiUrl}/players?syncType=2`))
      .then((response) => response.data)
      .catch((err) => {
        if (err.response && err.response.status == 404) return [];
        throw err;
      });

    // check if accounts found
    if (!accounts.length)
      return message.reply(`waray pa man sulod an listahan`);

    // filter accounts with no rank
    accounts = accounts.filter((account) => account.rank != undefined);

    // sort accounts by rank descending
    accounts.sort((a, b) => b.rank.rankTier - a.rank.rankTier);

    // get tier
    let tier = getTier(args);

    // check if tier is too far
    if (tier > Math.ceil(accounts.length / NUMBER_OF_PLAYERS_PER_PAGE)) {
      tier = Math.ceil(accounts.length / NUMBER_OF_PLAYERS_PER_PAGE);
      message.reply(`selected tier is too far... adjusting to tier ${tier}...`);
    }

    // get accounts based on tier
    accounts = getAccountsByTier(tier, accounts);

    // get thropies for message thumbnails
    const trophies = await getTrophies(tier);

    // create embedded message
    const embedMessage = {
      embed: {
        title: '*Who will make Aghanim as proud as a new father?*',
        thumbnail: {},
        fields: [
          {
            name: '\u200b',
            value: '**Rank**',
            inline: true,
          },
          {
            name: '\u200b',
            value: '**Name**',
            inline: true,
          },
          {
            name: '\u200b',
            value: '**Medal**',
            inline: true,
          },
        ],
      },
    };

    let trophy = {};
    let rank = tier > 0 ? tier * NUMBER_OF_PLAYERS_PER_PAGE - 4 : 1;
    for (let i = 0; i < accounts.length; i++) {
      let account = accounts[i];

      const fields = createEmbeddedMessageFields(account, rank);

      // append fields to embed message fields
      embedMessage.embed.fields.push.apply(embedMessage.embed.fields, fields);

      if (
        (i + 1) % NUMBER_OF_PLAYERS_PER_PAGE == 0 ||
        i == accounts.length - 1
      ) {
        // // set footer
        // embedMessage.embed.footer = {
        //   text: `Page ${Math.ceil(
        //     (i + 1) / NUMBER_OF_PLAYERS_PER_TIER
        //   )} of ${Math.ceil(accounts.length / NUMBER_OF_PLAYERS_PER_TIER)}`,
        // };

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
            value: '**Rank**',
            inline: true,
          },
          {
            name: '\u200b',
            value: '**Name**',
            inline: true,
          },
          {
            name: '\u200b',
            value: '**Medal**',
            inline: true,
          },
        ];
      }

      rank++;
    }
  },
};

function getTier(args) {
  let tier = 0;

  if (args.length) {
    const arg = args.shift().toLowerCase().replace('-', '').replace('tier', '');
    tier = !isNaN(arg) ? Number(arg) : 0;
  }

  return tier; // 0 is all, 1 is best tier
}

async function getTrophies(tier) {
  let trophies = await axios
    .get(encodeURI(`${aghanimApiUrl}/constants/trophies`))
    .then((response) => response.data)
    .catch((err) => {
      if (err.response && err.response.status == 404) return [];
      throw err;
    });

  if (tier > 0) {
    if (tier > trophies.length) {
      trophies = [trophies.pop()]; // return last trophy
    } else {
      trophies = [trophies[tier - 1]];
    }
  }

  return trophies;
}

function getAccountsByTier(tier, accounts) {
  if (tier == 0) return accounts; // 0 is all

  const slicedAccounts = accounts.slice(
    tier * NUMBER_OF_PLAYERS_PER_PAGE - NUMBER_OF_PLAYERS_PER_PAGE,
    tier * NUMBER_OF_PLAYERS_PER_PAGE
  );

  return slicedAccounts;
}

function createEmbeddedMessageFields(account, rank) {
  const fields = [
    {
      name: '\u200b',
      value: rank,
      inline: true,
    },
    {
      name: '\u200b',
      value: account.personaName,
      inline: true,
    },
    {
      name: '\u200b',
      value: account.rank.medal,
      inline: true,
    },
  ];

  return fields;
}
