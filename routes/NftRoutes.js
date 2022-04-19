const express = require('express');
const route = express.Router();
var useragent = require('express-useragent');

route.use(useragent.express());

const Nft = require('../Model/nft');
var Auth = require('../Modules/Auth');
const Collections = require("../Model/collections");

route.get('/getNft', function (req, res) {

    Auth.Validate(req, res, function () {
        const AllowedArr = ["1d", "7d", "30d"];
        var Sort = {};
        var rangeFilter = req.params.range;

        if (rangeFilter != undefined && AllowedArr.includes(rangeFilter)) {
            if (rangeFilter == "1d") {
                Sort = {"data.stats.one_day_volume": -1};
            } else if (rangeFilter == "7d") {
                Sort = {"data.stats.seven_day_volume": -1};
            } else if (rangeFilter == "30d") {
                Sort = {"data.stats.thirty_day_volume": -1};
            }

            Collections.aggregate([
                {
                    $sort: Sort
                },
                {
                    $match: {
                        "data.slug": {$not: {$regex: "^untitled-collection.*"}},

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
        var Sort = {"data.last_sale.event_timestamp": -1};
        var SlugFilter = req.params.slug;
        var dateTime = new Date();
        dateTime.setDate(dateTime.getDate() - 30);
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
                }, {
                    $limit: 9
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

// "data.last_sale.event_timestamp": {$gte: {dateTime}}

route.get('/getNftTopSelling/:slug', function (req, res) {

    Auth.Validate(req, res, function () {
        var SlugFilter = req.params.slug;

        if (SlugFilter != undefined) {

            Nft.aggregate([
                {
                    $sort: {"data.last_sale.total_price": -1}
                },
                {
                    $match: {
                        "data.collection.slug": SlugFilter,
                    }
                },
                {
                    $limit: 12
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

route.get('/getTraits/:slug', function (req, res) {

    var SlugFilter = req.params.slug;

    Auth.Validate(req, res, function () {
        Nft.aggregate([
            {
                $match: {
                    "data.collection.slug": SlugFilter,
                }
            },
            {
                $project: {
                    _id: 0,
                    traits: "$data.traits"
                }
            },
            {
                $unwind: "$traits"
            },
            {
                $group: {
                    _id: "$traits.trait_type",
                    //value: {$push: "$traits.value"}
                    value: {$addToSet: "$traits.value"}
                }
            },
            {
                $project: {
                    _id: 0,
                    Type: "$_id",
                    value: "$value"
                }
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

    });
});

route.get('/get-cheaper-and-expensive-nft/:slug', function (req, res) {

    Auth.Validate(req, res, function () {
        var Sort = {};
        var SlugFilter = req.params.slug;

        if (SlugFilter != undefined) {


            Nft.aggregate([
                {
                    $match: {
                        "data.collection.slug": SlugFilter
                    }
                },
                {
                    $addFields: {
                        "data.last_sale.total_price_decimal": {$toDecimal: "$data.last_sale.total_price"},
                    }
                },
                {
                    $sort: {
                        "data.last_sale.total_price_decial": -1
                    }
                },
                {
                    $limit: 1
                }], function (err, nft_Highest_Price) {

                Nft.aggregate([
                    {
                        $match: {
                            "data.collection.slug": SlugFilter,
                            "data.last_sale": {
                                $ne: null
                            }
                        }
                    },
                    {
                        $addFields: {
                            "data.last_sale.total_price_decimal": {$toDecimal: "$data.last_sale.total_price"},
                        }
                    },
                    {
                        $sort: {
                            "data.last_sale.total_price_decimal": 1
                        }
                    },
                    {
                        $limit: 1
                    }], function (err, nft_Lowest_Price) {

                    console.log(nft_Highest_Price[0].data.last_sale.total_price);
                    //Median = (nft_Highest_Price[0].last_sale.total_price + nft_Lowest_Price[0].last_sale.total_price) / 2;

                    res.send({
                        error: false,
                        nft_Highest_Price: nft_Highest_Price,
                        nft_Lowest_Price: nft_Lowest_Price,
                        //Median: Median
                        // data: result,
                        // latestsale: (nft_result.length != 0) ? nft_result[0].data.last_sale : null
                    });

                });
            });

        } else {
            res.send({
                error: true,
                message: "range Params is required value should be ('1d','7d','30d')"
            });
        }
    });
});

module.exports = route