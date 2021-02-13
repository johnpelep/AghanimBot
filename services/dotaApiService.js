const axios = require('axios');
const { key, getPlayerSummaryUrl, getMatchesUrl, resolveVanityUrl, bannerBearImageUrl: bannerBearUrl, bannerBearApiKey, bannerBearAccountUrl } = require('../config');

module.exports = {
  async getPlayerSummary(accounts) {
    const res = await axios.get(buildUrl(accounts)).then(response => response).catch(err => { throw err });
    return res.data.response.players;
  },
  async getMatches(steamId32, limit) {
    const LOBBY_TYPE = 7; // ranked
    const SORT_BY = "match_id";
    const res = await axios.get(`${getMatchesUrl.replace('{account_id}', steamId32)}?limit=${limit}&lobby_type=${LOBBY_TYPE}&sort=${SORT_BY}`).then(response => response).catch(err => { throw err });
    return res.data;
  },
  async resolveVanityUrl(vanityUrl) {
    const res = await axios.get(`${resolveVanityUrl}?key=${key}&vanityurl=${vanityUrl}`).then(response => response).catch(err => { throw err });
    return res.data;
  },
  async createInfographic(account) {
    const body = buildBannerBearBody(account);
    const res = await axios.post(bannerBearUrl, body, { headers: { 'Authorization': `Bearer ${bannerBearApiKey}` } }).then(response => response).catch(err => { throw err });
    return res.data;
  },
  async getInfographic(url) {
    const res = await axios.get(url, { headers: { 'Authorization': `Bearer ${bannerBearApiKey}` } }).then(response => response).catch(err => { throw err });
    return res.data;
  },
  async getBannerbearAccount() {
    const res = await axios.get(bannerBearAccountUrl, { headers: { 'Authorization': `Bearer ${bannerBearApiKey}` } }).then(response => response).catch(err => { throw err });
    return res.data;
  }
}

function buildUrl(accounts) {
  const steamIds = [];

  for (let i = 0; i < accounts.length; i++) {
    steamIds.push(accounts[i].steamId64);
  }

  return `${getPlayerSummaryUrl}?key=${key}&steamids=${steamIds.join(',')}`
}

function buildBannerBearBody(account) {
  const record = account.record;
  return {
    template: "3g8zka5YaGM5EJXBYm",
    modifications: [
      {
        name: "avatar",
        image_url: account.avatar
      },
      {
        name: "personaName",
        text: account.personaName
      },
      {
        name: "winCount",
        text: record.winCount
      },
      {
        name: "lossCount",
        text: record.lossCount
      },
      {
        name: "winRate",
        text: (record.winCount * 100 / (record.winCount + record.lossCount)).toFixed(2) + '%'
      },
      {
        name: "matchCount",
        text: record.winCount + record.lossCount
      }
    ],
    webhook_url: null,
    transparent: false,
    metadata: null
  }
}