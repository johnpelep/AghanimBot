const { key, resolveVanityUrl, getPlayerSummaryUrl } = require('../config');
const fetch = require('node-fetch');
const accountService = require('../services/accountService');

module.exports = {
    name: 'kick',
    async execute(message, args) {
        const profileUrl = args.shift();

        if (profileUrl.indexOf('steamcommunity.com/') == -1)
            return message.reply('Invalid steam profile url');

        // remove last slash
        if (profileUrl.endsWith('/'))
            profileUrl = profileUrl.slice(-1);

        // split url and get last item
        const steamUrlSplit = profileUrl.split('/');
        let steamId64 = steamUrlSplit[steamUrlSplit.length -1];

        //check if link is custom url
        if (profileUrl.indexOf('steamcommunity.com/id/') > -1) {

            // get steamId64
            const res = await fetch(`${resolveVanityUrl}?key=${key}&vanityurl=${steamId64}`).then(response => response.json());
            
            if (res.response.success == 1) {
                steamId64 = res.response.steamid;
            }
        }
       
        // check if steam id is valid
        const res = await fetch(`${getPlayerSummaryUrl}?key=${key}&steamids=${steamId64}`).then(response => response.json());
        const players = res.response.players;

        if (!players.length)
            return message.reply('Steam user not found');

        const personaName = players[0].personaname;
        const result = await accountService.deleteAccount({ steamId64: steamId64 });

        if (result.deletedCount)
            return message.channel.send(`*I, I admit nothing but my sadness that you're gone,* ***${personaName}***`);
    }
}

// Source: https://stackoverflow.com/questions/23259260/convert-64-bit-steam-id-to-32-bit-account-id#:~:text=To%20convert%20a%2064%20bit,from%20the%2064%20bit%20id.
function steamID64toSteamID32 (steamID64) {
    return (Number(steamID64.substr(-16,16)) - 6561197960265728).toString();
}