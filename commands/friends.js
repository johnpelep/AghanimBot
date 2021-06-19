const { default: axios } = require('axios');
const { aghanimApiUrl } = require('../config');
const NUMBER_OF_PLAYERS_PER_PAGE = 6;

module.exports = {
  name: 'friends',
  description: 'Friends!',
  async execute(message, args) {
    // get status argument
    const status = args.length
      ? args.shift().toLowerCase().replace('-', '')
      : '';

    // get syncType based on status
    const syncType = status == 'busog' || status == 'gutom' ? 1 : 2;

    // get accounts from api
    let accounts = await axios
      .get(encodeURI(`${aghanimApiUrl}/players?syncType=${syncType}`))
      .then((response) => response.data)
      .catch((err) => {
        if (err.response && err.response.status == 404) return [];
        throw err;
      });

    // check if accounts found
    if (!accounts.length)
      return message.reply(`waray pa man sulod an listahan`);

    accounts = filterAccounts(accounts, status);

    if (!accounts.length) {
      embedMessage.footer = {
        text: 'No records found',
      };

      return message.channel.send({ embed: embedMessage });
    }

    // create embedded message
    const embedMessage = initEmbedMessage(status);

    // iterate accounts
    for (let i = 0; i < accounts.length; i++) {
      let account = accounts[i];

      // create fields for each account
      const fields = createMessageFields(account, status);

      // append fields to embed message fields
      embedMessage.embed.fields.push.apply(embedMessage.embed.fields, fields);

      if (
        (i + 1) % NUMBER_OF_PLAYERS_PER_PAGE == 0 ||
        i == accounts.length - 1
      ) {
        // set thumbnail
        // embedMessage.embed.thumbnail.url = trophy.imageUrl;

        // send message
        message.channel.send(embedMessage);

        // reset fields
        embedMessage.embed.fields = initFields(status);
      }
    }
  },
};

function filterAccounts(accounts, status) {
  if (status == 'busog' || status == 'gutom') {
    // filter accounts with proper streak
    accounts = accounts.filter(
      (a) =>
        a.record &&
        a.record.streakCount > 1 &&
        a.record.isWinStreak == (status == 'busog')
    );

    // sort accounts by streak count descending
    accounts.sort((a, b) => {
      if (a.record.streakCount > b.record.streakCount) return -1;
      else return 1;
    });
  } else {
    // filter accounts by status
    const ingamePlayers = accounts.filter((a) => a.status.game != undefined);
    const onlinePlayers = accounts.filter(
      (a) => a.status.personaState > 0 && a.status.game == undefined
    );
    const offlinePlayers = accounts.filter(
      (a) => a.status.personaState == 0 && a.status.lastLogOff != undefined
    );
    const offlinePlayersNotFriend = accounts.filter(
      (a) => a.status.personaState == 0 && a.status.lastLogOff == undefined
    );

    // sort ingame and online accounts by status
    ingamePlayers.sort((a, b) => a.status.personaState - b.status.personaState);
    onlinePlayers.sort((a, b) => a.status.personaState - b.status.personaState);

    //sort offline accounts by lastLogOff descending
    offlinePlayers.sort((a, b) => b.status.lastLogOff - a.status.lastLogOff);

    //soft offline not friend accounts by personaName
    offlinePlayersNotFriend.sort((a, b) =>
      a.personaName.localeCompare(b.status.personaName)
    );

    switch (status) {
      case 'active':
        accounts = ingamePlayers.concat(onlinePlayers);
        break;
      case 'passive':
        accounts = offlinePlayers.concat(offlinePlayersNotFriend);
        break;
      default:
        accounts = ingamePlayers
          .concat(onlinePlayers)
          .concat(offlinePlayers)
          .concat(offlinePlayersNotFriend);
    }
  }

  return accounts;
}

function initEmbedMessage(status) {
  let title = '';
  let thumbnailUrl = '';
  let color = 0;

  if (status == 'busog' || status == 'gutom') {
    if (status == 'busog') {
      title = '*Ah hahahaha, you are the best, simply the best*';
      thumbnailUrl =
        'https://static.wikia.nocookie.net/dota2_gamepedia/images/6/6b/Dotalevel_icon99.png/revision/latest?cb=20150910042750';
      color = 0x89ff89;
    } else {
      title = '*Bock bock bock, that is what you sound like!*';
      thumbnailUrl =
        'https://static.wikia.nocookie.net/dota2_gamepedia/images/8/8f/Dotalevel_icon00.png/revision/latest?cb=20150910041818';
      color = 0xff4534;
    }
  } else {
    title = 'Friends, let us skirmish!';
    thumbnailUrl =
      'https://static.wikia.nocookie.net/dota2_gamepedia/images/c/cf/Dotalevel_icon02.png/revision/latest?cb=20150910041829';
    color = 0x0099ff;
  }

  const embedMessage = {
    embed: {
      title: title,
      // thumbnail: {
      //   url: thumbnailUrl,
      // },
      color: color,
      fields: initFields(status),
    },
  };

  return embedMessage;
}

function initFields(status) {
  let fields = [];

  if (status == 'busog' || status == 'gutom') {
    fields = [
      {
        name: '\u200b',
        value: '**Streak**',
        inline: true,
      },
      {
        name: '\u200b',
        value: '**Name**',
        inline: true,
      },
      {
        name: '\u200b',
        value: '**Record**',
        inline: true,
      },
    ];
  } else {
    fields = [
      {
        name: '\u200b',
        value: '**Status**',
        inline: true,
      },
      {
        name: '\u200b',
        value: '**Name**',
        inline: true,
      },
      {
        name: '\u200b',
        value: '**Last Log Off**',
        inline: true,
      },
    ];
  }

  return fields;
}

function createMessageFields(account, status) {
  let fields = [];

  if (status == 'busog' || status == 'gutom')
    fields = createAppetiteMessageFields(account);
  else fields = createActivityMessageFields(account);

  return fields;
}

function createActivityMessageFields(account) {
  const status = account.status;
  const lastLogOff = status.lastLogOff
    ? new Date(status.lastLogOff * 1000)
    : new Date();

  const fields = [
    {
      name: '\u200b',
      value: status.game ? `Playing ${status.game}` : status.userStatus,
      inline: true,
    },
    {
      name: '\u200b',
      value: account.personaName,
      inline: true,
    },
    {
      name: '\u200b',
      value:
        status.userStatus == 'Offline' && status.lastLogOff
          ? `${lastLogOff.toLocaleDateString()} ${lastLogOff.toLocaleTimeString()}`
          : '-',
      inline: true,
    },
  ];

  return fields;
}

function createAppetiteMessageFields(account) {
  const record = account.record;

  const fields = [
    {
      name: '\u200b',
      value: record.streakCount,
      inline: true,
    },
    {
      name: '\u200b',
      value: account.personaName,
      inline: true,
    },
    {
      name: '\u200b',
      value: `Total: ${record.winCount + record.lossCount}\nW/L: ${
        record.winCount
      }/${record.lossCount}`,
      inline: true,
    },
  ];

  return fields;
}
