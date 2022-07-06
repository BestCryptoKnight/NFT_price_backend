require('dotenv').config();

const {ENV} = process.env;
exports.API_KEY = process.env.X_API_KEY;
exports.API_KEY_NFT_DROPS = process.env.X_API_KEY_NFT_DROPS;

exports.PORT = process.env.PORT;
var DATABASEUSERNAME = "user1", DATABASEPASSWORD = "wroiSRXQ1GXySQ9S", DATABASEHOST, DATABASENAME;

if (ENV == "PRODUCTION") {
    DATABASEHOST = "cluster0.qtfwl.mongodb.net";
    DATABASENAME = "nft-stats";
} else if (ENV == "LOCAL") {
    DATABASEHOST = "cluster0.qtfwl.mongodb.net";
    DATABASENAME = "nft-stats";
}

exports.CONFIG = {
    CRON: "on",
    OPENSEA_API_KEY: process.env.OPENSEA_API_KEY
}

exports.dburl = `mongodb+srv://${DATABASEUSERNAME}:${DATABASEPASSWORD}@${DATABASEHOST}/${DATABASENAME}?retryWrites=true&w=majority`;

//API Key
//6b1eae10-73c8-4e3d-a336-008f56e4f883
