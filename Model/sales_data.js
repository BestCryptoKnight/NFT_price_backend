var {dburl} = require('../config');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(dburl, {sslValidate: false, useNewUrlParser: true, useUnifiedTopology: true});

var SalesSchema = new Schema({
    slug: String,
    data: {
        type: Object,
        default: {}
    },
    PlainDate: String,
    created: Date,
});

var SalesModel = mongoose.model('sales_data', SalesSchema, 'sales_data');
module.exports = SalesModel;
