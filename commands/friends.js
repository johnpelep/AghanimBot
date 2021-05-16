const accountService = require('../services/accountService');
const dotaApiService = require('../services/dotaApiService');
const accountHelper = require('../helpers/accountHelper');

module.exports = {
  name: 'friends',
  description: 'Friends!',
  async execute(message, args) {
    let status = '';

    if (args.length) status = args.shift().toLowerCase();

    // get player summary from steam api
    const accounts = await accountService.getAccounts();
    let players = await dotaApiService.getPlayerSummary(accounts);

    // filter players by status
    const ingamePlayers = players.filter(
      (item) => item.gameextrainfo != undefined
    );
    const onlinePlayers = players.filter(
      (item) => item.personastate > 0 && item.gameextrainfo == undefined
    );
    const offlinePlayers = players.filter(
      (item) => item.personastate == 0 && item.lastlogoff != undefined
    );
    const offlinePlayersNotFriend = players.filter(
      (item) => item.personastate == 0 && item.lastlogoff == undefined
    );

    // sort ingame and online players by status
    ingamePlayers.sort((a, b) => a.personastate - b.personastate);
    onlinePlayers.sort((a, b) => a.personastate - b.personastate);

    //sort offline players by lastlogoff
    offlinePlayers.sort((a, b) => b.lastlogoff - a.lastlogoff);

    //soft offline not friend players by personaname
    offlinePlayersNotFriend.sort((a, b) =>
      a.personaname.localeCompare(b.personaname)
    );

    switch (status) {
      case '-active':
        players = ingamePlayers.concat(onlinePlayers);
        break;
      case '-passive':
        players = offlinePlayers.concat(offlinePlayersNotFriend);
        break;
      default:
        players = ingamePlayers
          .concat(onlinePlayers)
          .concat(offlinePlayers)
          .concat(offlinePlayersNotFriend);
    }

    let fields = [
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
    ];

    let embedMessage = {
      color:
        status == '-busog'
          ? 0x89ff89
          : status == '-gutom'
          ? 0xff4534
          : 0x0099ff,
      title: 'Let us skirmish!',
    };

    // sync players info
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      let account = accounts.find((a) => a.steamId64 == player.steamid);

      if (
        account.personaName != player.personaname ||
        account.avatar != player.avatarfull
      ) {
        const updateDoc = {
          $set: {
            personaName: player.personaname,
            avatar: player.avatarfull,
          },
        };

        accountService.getAccountAndUpdate(
          { steamId64: account.steamId64 },
          updateDoc
        );
      }

      if (status == '-busog' || status == '-gutom') {
        account.personaName = player.personaname;
        account.avatar = player.avatarfull;
        account = await accountHelper.syncAccount(account);
        player.record = account.record;
      }
    }

    if (status == '-busog' || status == '-gutom') {
      // remove players with no streak
      players = players.filter((p) => p.record.streakCount > 1);

      if (status == '-busog')
        players = players.filter(
          (p) => p.record.isWinStreak && p.record.streakCount > 0
        );
      else
        players = players.filter(
          (p) => !p.record.isWinStreak && p.record.streakCount > 0
        );

      players.sort((a, b) => {
        if (a.record.streakCount > b.record.streakCount) return -1;
        else return 1;
      });
    }

    if (!players.length) {
      embedMessage.footer = {
        text: 'No records found',
      };

      return message.channel.send({ embed: embedMessage });
    }

    for (let i = 0; i < players.length; i++) {
      let player = players[i];

      if (status == '-busog' || status == '-gutom') {
        fields = buildAppetiteMessageFields(player, fields);
      } else fields = buildActivityMessageFields(player, fields);

      if ((i + 1) % 6 == 0 || i == players.length - 1) {
        embedMessage.fields = fields;
        embedMessage.footer = {
          text: `Page ${Math.ceil((i + 1) / 6)} of ${Math.ceil(
            players.length / 6
          )}`,
        };
        fields = [];
        message.channel.send({ embed: embedMessage });
        delete embedMessage.title;
      }
    }
  },
};

function buildActivityMessageFields(player, fields) {
  let status = '';

  switch (player.personastate) {
    case 0:
      status = 'Offline';
      break;
    case 1:
      status = 'Online';
      break;
    case 2:
      status = 'Busy';
      break;
    case 3:
      status = 'Away';
      break;
    case 4:
      status = 'Snooze';
      break;
    case 5:
      status = 'Looking to Trade';
      break;
    case 6:
      status = 'Looking to Play';
      break;
    default:
      status = 'Ambot daw';
  }

  // Name
  fields.push({
    name: 'Name',
    value: player.personaname,
    inline: false,
  });

  // Status
  if (player.gameextrainfo != undefined) {
    fields.push({
      name: 'Status',
      value: `Playing ${player.gameextrainfo}`,
      inline: false,
    });
  } else {
    fields.push({
      name: 'Status',
      value: status,
      inline: false,
    });
  }

  // Last Log Off
  if (status === 'Offline' && player.lastlogoff != undefined) {
    var date = new Date(player.lastlogoff * 1000);
    fields.push({
      name: 'Logged Off Since',
      value: `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`,
      inline: false,
    });
  }

  //break line
  fields.push({
    name: '\u200b',
    value: '\u200b',
    inline: false,
  });

  return fields;
}

function buildAppetiteMessageFields(player, fields) {
  const record = player.record;

  // Name
  fields.push({
    name: 'Name',
    value: player.personaname,
    inline: false,
  });

  // Win/Lose
  fields.push({
    name: 'Current Month Ranked Match',
    value: `Total: ${record.winCount + record.lossCount}\nW/L: ${
      record.winCount
    }/${record.lossCount}`,
    inline: false,
  });

  // Current Streak
  fields.push({
    name: 'Current Streak',
    value: `${record.streakCount} ${
      record.isWinStreak
        ? record.streakCount > 1
          ? 'wins'
          : 'win'
        : record.streakCount > 1
        ? 'losses'
        : 'loss'
    }`,
    inline: false,
  });

  //break line
  fields.push({
    name: '\u200b',
    value: '\u200b',
    inline: false,
  });

  return fields;
}
