const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { default: axios } = require('axios');
const { aghanimApiUrl } = require('../config');
const NUMBER_OF_PLAYERS_PER_PAGE = 5;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lodilist')
    .setDescription('Lodi List!'),
  async execute(message, args) {
    // get accounts from api
    let accounts = await axios
      .get(encodeURI(`${aghanimApiUrl}/api/players?syncType=1`))
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
    accounts.sort((a, b) => b.rankTier - a.rankTier);

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
    const embedMessages = []
    const embedMessage = new EmbedBuilder()
      .setTitle('*Who will make Aghanim as proud as a new father?*')
      .addFields(
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
      );

    let trophy = {};
    let rank = tier > 0 ? tier * NUMBER_OF_PLAYERS_PER_PAGE - 4 : 1;
    for (let i = 0; i < accounts.length; i++) {
      let account = accounts[i];

      const fields = createEmbeddedMessageFields(account, rank);

      // append fields to embed message fields
      embedMessage.addFields(fields)

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
        embedMessage.setThumbnail(trophy.imageUrl);

        // set color
        embedMessage.setColor('#' + trophy.color)

        // send message
        const embedMessageJson = embedMessage.toJSON();
        const cloneEmbedMessage = structuredClone(embedMessageJson);
        embedMessages.push(cloneEmbedMessage);

        // reset fields
        embedMessage.setFields(
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
        )
      }

      rank++;
    }

    message.channel.send({ embeds: embedMessages });
  },
};

function getTier(args) {
  let tier = 0;

  if (args && args.length) {
    const arg = args.shift().toLowerCase().replace('-', '').replace('tier', '');
    tier = !isNaN(arg) ? Number(arg) : 0;
  }

  return tier; // 0 is all, 1 is best tier, etc..
}

async function getTrophies(tier) {
  let trophies = [
    {
      type: 'battlepoint6',
      color: '151515',
      imageUrl:
        'https://static.wikia.nocookie.net/dota2_gamepedia/images/2/2f/Trophy_battlepoint6.png/revision/latest/scale-to-width-down/120?cb=20150910031457',
    },
    {
      type: 'battlepoint5',
      color: 'F08205',
      imageUrl:
        'https://static.wikia.nocookie.net/dota2_gamepedia/images/1/1f/Trophy_battlepoint5.png/revision/latest/scale-to-width-down/120?cb=20150910031452',
    },
    {
      type: 'battlepoint4',
      color: 'EDE2A0',
      imageUrl:
        'https://static.wikia.nocookie.net/dota2_gamepedia/images/9/96/Trophy_battlepoint4.png/revision/latest/scale-to-width-down/120?cb=20150910031447',
    },
    {
      type: 'battlepoint3',
      color: 'CDC5AD',
      imageUrl:
        'https://static.wikia.nocookie.net/dota2_gamepedia/images/1/11/Trophy_battlepoint3.png/revision/latest/scale-to-width-down/120?cb=20150910031439',
    },
    {
      type: 'battlepoint2',
      color: 'A6A4A3',
      imageUrl:
        'https://static.wikia.nocookie.net/dota2_gamepedia/images/4/4a/Trophy_battlepoint2.png/revision/latest/scale-to-width-down/120?cb=20150910031408',
    },
    {
      type: 'battlepoint1',
      color: '775645',
      imageUrl:
        'https://static.wikia.nocookie.net/dota2_gamepedia/images/3/33/Trophy_battlepoint1.png/revision/latest/scale-to-width-down/120?cb=20150910031405',
    },
  ];

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
      value: Number(rank).toString(),
      inline: true,
    },
    {
      name: '\u200b',
      value: account.personaName,
      inline: true,
    },
    {
      name: '\u200b',
      value: account.rank.medalName,
      inline: true,
    },
  ];

  return fields;
}
