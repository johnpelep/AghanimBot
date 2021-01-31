const accountService = require('../services/accountService');
const accountHelper = require('../helpers/accountHelper');
const dotaApiService = require('../services/dotaApiService');

module.exports = {
    name: 'invite',
    async execute(message, args) {
        let profileUrl = args.shift();

        if (profileUrl.indexOf('steamcommunity.com/') == -1)
            return message.reply('Invalid steam profile url');

        // remove last slash
        if (profileUrl.endsWith('/'))
            profileUrl = profileUrl.slice(0, -1);

        // split url and get last item
        const steamUrlSplit = profileUrl.split('/');
        let steamId64 = steamUrlSplit[steamUrlSplit.length -1];

        //check if link is custom url
        if (profileUrl.indexOf('steamcommunity.com/id/') > -1) {

            // get steamId64
            const res = dotaApiService.resolveVanityUrl(steamId64);
            
            if (res.response.success == 1) {
                steamId64 = res.response.steamid;
            }
        }
       
        // check if steam id is valid
        const res = await dotaApiService.getPlayerSummary([ { steamId64: steamId64 } ]);
        const players = res.response.players;

        if (!players.length)
            return message.reply('Steam user not found');

        // check if account is already in collection
        const personaName = players[0].personaname;
        let account = await accountService.getAccountAndUpdate({ steamId64: steamId64 }, { $set: { "personaName": personaName } });
        
        if (account.value) {
            await accountHelper.syncAccount(account.value);
            return message.channel.send(`Nakalista ka na dap, **${personaName}**`);
        }

        // calc steamId32 from steamId64
        const steamId32 = steamID64toSteamID32(steamId64);

        // create account document
        account = {
            "personaName": personaName,
            "steamId64": steamId64,
            "steamId32": steamId32
        };
            
        await accountService.addAcount(account);

        await accountHelper.syncAccount(account);

        return message.channel.send(`*Aghanim the Popular welcomes you,* ***${personaName}***`);
    }
}

// Source: https://stackoverflow.com/questions/23259260/convert-64-bit-steam-id-to-32-bit-account-id#:~:text=To%20convert%20a%2064%20bit,from%20the%2064%20bit%20id.
function steamID64toSteamID32 (steamID64) {
    return (Number(steamID64.substr(-16,16)) - 6561197960265728).toString();
}