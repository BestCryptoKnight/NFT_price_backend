var {dburl} = require('../config');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(dburl, {sslValidate: false, useNewUrlParser: true, useUnifiedTopology: true});

var NftSchema = new Schema({
    data: {
        type: Object,
        default: {}
    },
    active: {
        type: Boolean,
        default: true
    },
    //created: new Date()
});

var NftModel = mongoose.model('nfts', NftSchema, 'nfts');

module.exports = NftModel;
