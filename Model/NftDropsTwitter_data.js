var {dburl} = require('../config');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(dburl, {sslValidate: false, useNewUrlParser: true, useUnifiedTopology: true});

var NftDropsSchema = new Schema({
    twitterUsername: {
        type: String,
        default: ""
    },
    data: {
        type: Object,
        default: {}
    },
    active: {
        type: Boolean,
        default: true
    },
    LastUpdate: Date,
    created: Date,
});

var NftDropsModel = mongoose.model('NftDrops_Twitter_stats', NftDropsSchema, 'NftDrops_Twitter_stats');
module.exports = NftDropsModel;
