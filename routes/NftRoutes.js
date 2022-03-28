const express = require('express');
const route = express.Router();
var useragent = require('express-useragent');

route.use(useragent.express());

var Nft = require('../Model/nft');
var Auth = require('../Modules/Auth');

route.get('/getNft', function (req, res) {

    Auth.Validate(req, res, function () {
        const AllowedArr = ["1d", "7d", "30d"];
        var Sort = {};
        var rangeFilter = req.params.range;

        if (rangeFilter != undefined && AllowedArr.includes(rangeFilter)) {
            if (rangeFilter == "1d") {
                Sort = { "data.stats.one_day_volume": -1 };
            } else if (rangeFilter == "7d") {
                Sort = { "data.stats.seven_day_volume": -1 };
            } else if (rangeFilter == "30d") {
                Sort = { "data.stats.thirty_day_volume": -1 };
            }

            Collections.aggregate([
                {
                    $sort: Sort
                },
                {
                    $match: {
                        "data.slug": { $not: { $regex: "^untitled-collection.*" } },
                    
                    }
                },
                {
                    $limit: 50
                }], (err, result) => {

                    if (result != undefined) {
                        res.send({
                            error: false,
                            data: result,
                        });
                    } else {
                        res.send({
                            error: true,
                            message: "No Data Found",
                            data: []
                        });
                    }
                })
        } else {
            res.send({
                error: true,
                message: "range Params is required value should be ('1d','7d','30d')"
            });
        }
    });
});

route.get('/getNftRecent/:slug', function (req, res) {

    Auth.Validate(req, res, function () {
        var Sort = { "data.last_sale.event_timestamp": -1 };
        var SlugFilter = req.params.slug;
        var dateTime = new Date();
        dateTime.setDate(dateTime.getDate()-30);
        console.log(dateTime);

        if (SlugFilter != undefined) {

            Nft.aggregate([

                {
                    $sort: Sort
                },
                {
                    $match: {
                        "data.collection.slug": SlugFilter    
                    }
                }

            ], (err, result) => {
                console.log(result);
                res.send({
                    error: false,
                    data: result,
                });
            })
        } else {
            res.send({
                error: true,
                message: "some error occured"
            });
        }
    });
});

// "data.last_sale.event_timestamp": {$gte: {dateTime}}

route.get('/getNftTopSelling/:slug', function (req, res) {

    Auth.Validate(req, res, function () {
        var Sort = { "data.last_sale.total_price": -1 };
        var SlugFilter = req.params.slug;

        if (SlugFilter != undefined) {

            Nft.aggregate([

                {
                    $sort: Sort
                },
                {
                    $match: {
                        "data.collection.slug": SlugFilter,
                    }
                }

            ], (err, result) => {
                res.send({
                    error: false,
                    data: result,
                });
            })
        } else {
            res.send({
                error: true,
                message: "some error occured"
            });
        }
    });
});

module.exports = route