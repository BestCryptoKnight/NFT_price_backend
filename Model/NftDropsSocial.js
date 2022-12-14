var {dburl} = require('../config');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(dburl, {sslValidate: false, useNewUrlParser: true, useUnifiedTopology: true});

var SocialSchema = new Schema({
    type: String,
    data: {
        type: Object,
        default: {}
    },
    Trending: {
        type: Object,
        default: {}
    },
    PlainDate: String,
    created: Date,
});

var SocialModel = mongoose.model('nftdrops_social_stats', SocialSchema);
module.exports = SocialModel;
