const { getMatchesUrl, connectionString } = require('../config');
const fetch = require('node-fetch');
const MongoClient = require('mongodb').MongoClient;

module.exports = {
    async syncAccount(account) {
        const dateToday = new Date();
	    const firstDayOfMonth = new Date(dateToday.getFullYear(), dateToday.getMonth(), 1).getTime();
        account.lastSync = Number(account.lastSync ?? firstDayOfMonth);
        const limit = calcLimit(lastSync);
        const matches = await getMatches(account.steamId32, limit);
        const record = calcRecord(matches, account);
        const client = new MongoClient(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

        try {
            await client.connect();

            const database = client.db("aghanimDB");
            const collection = database.collection('accounts');
            const filter = { steamId32: account.steamId32 }; 
            const updateDoc = {
                $set: {
                  matchCount: record.matchCount,
                  winCount: record.winCount,
                  lossCount: record.lossCount,
                  streakCount: record.streakCount,
                  isWinStreak: record.isWinStreak
                },
              };

            await collection.updateOne(filter, updateDoc);
        } finally {
            await client.close();
        }
    },
    async addAcount(account) {
        const client = new MongoClient(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

        try {
            await client.connect();

            const database = client.db("aghanimDB");
            const collection = database.collection('accounts');

            await collection.insertOne(account);
        } finally {
            await client.close();
        }
    },
    async updateAccount(account) {

    },
    async getAccountAndUpdate(filter, updateDoc) {
        const client = new MongoClient(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        let account = null;

        try {
            await client.connect();

            const database = client.db("aghanimDB");
            const collection = database.collection('accounts');

            account = await collection.findOneAndUpdate(filter, updateDoc);
        } finally {
            await client.close();
        }

        return account;
    },
    async getAccounts() {
        const client = new MongoClient(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        let accounts = [];

        try {
            await client.connect();

            const database = client.db("aghanimDB");
            const collection = database.collection('accounts');
            const accountsCursor = await collection.find();

            await accountsCursor.forEach(a => accounts.push(a));
        } finally {
            await client.close();
        }

        return accounts;
    },
    async deleteAccount(filter) {
        const client = new MongoClient(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        let result = {};

        try {
            await client.connect();

            const database = client.db("aghanimDB");
            const collection = database.collection('accounts');

            result = await collection.deleteOne(filter);
        } finally {
            await client.close();
        }

        return result;
    }
} 

async function getMatches(accountId, limit) {
    const LOBBY_TYPE = 7; // ranked
    const SORT_BY = "match_id";
	return await fetch(`${getMatchesUrl.replace('{account_id}', accountId)}?limit=${limit}&lobby_type=${LOBBY_TYPE}&sort=${SORT_BY}`).then(response => response.json());
}

function calcLimit(lastSync) {
    const ABOVE_AVG_GAMES_PER_DAY = 20;
    const lastSyncDate = new Date(lastSync);
    return (new Date().getDate() - lastSyncDate.getDate() + 1) * ABOVE_AVG_GAMES_PER_DAY;
}

function calcRecord(matches, account) {
    let winCount = 0;
    let lossCount = 0;
    let streakCount = 0;
    let isWinStreak = false;
	let isStreakEnd = false;

	if (matches.length) {
		for (let j = 0; j < matches.length; j++) {
			let match = matches[j];

			if (match.lobby_type == 7) {
				let isWinner = (match.player_slot < 128 && match.radiant_win) || (match.player_slot > 127 && !match.radiant_win);

				if (j == 0 && isWinner)
					isWinStreak = true;
	
				if (isWinner == isWinStreak && !isStreakEnd)
                    streakCount++;
				else
					isStreakEnd = true;
	
				if (isWinner)
                    winCount++;
				else
					lossCount++;
			}
		}
	}

	return {
        matchCount: winCount + lossCount,
        winCount: winCount,
        lossCount: lossCount,
        streakCount: streakCount,
        isWinStreak: isWinStreak
    };
}