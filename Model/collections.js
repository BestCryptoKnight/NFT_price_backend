var {dburl} = require('../config');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(dburl, {sslValidate: false, useNewUrlParser: true, useUnifiedTopology: true});

var CollectionsSchema = new Schema({
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

var CollectionsModel = mongoose.model('nft_collection', CollectionsSchema);

module.exports = CollectionsModel;
