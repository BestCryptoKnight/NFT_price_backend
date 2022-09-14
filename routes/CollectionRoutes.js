const express = require('express');
const route = express.Router();
var useragent = require('express-useragent');

route.use(useragent.express());

var Collections = require('../Model/collections');
var Nft = require('../Model/nft');
const Social = require('../Model/social');
const Sales = require('../Model/sales_data');
var Auth = require('../Modules/Auth');
var FN = require('../Modules/general');

/*Nft.aggregate([{
    $group: {
        _id: "$data.collection.slug"
    }
}], function (err, nft_result) {

    console.log(nft_result);
})*/

route.get('/getCollections/:range', function (req, res) {

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
                        "data.slug": {$not: {$regex: "^untitled-collection.*"}}
                    }
                },
                {
                    $limit: 50
                }], (err, result) => {
                var resp = [];

                if (result != undefined) {


                    (async function () {
                        for await (const [index, obj] of result.entries()) {
                            //console.log(obj);
                            //delete obj.data.stats;
                            delete obj.data.payment_tokens;
                            delete obj.data.primary_asset_contracts;
                            delete obj.data.fees;
                            delete obj.data.display_data;
                            // expected output: 1
                            obj.data.image_url = FN.GetHighResolutionURI(obj.data.image_url);

                            await resp.push(obj);
                        }
                        res.send({
                            error: false,
                            data: resp,
                        });
                    })();
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

route.get('/getPageLinkSlugs/:range', function (req, res) {

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
                        "data.slug": {$not: {$regex: "^untitled-collection.*"}}
                    }
                },
                {
                    $project: {
                        _id: 0,
                        Slug: "$data.slug",
                        Name: "$data.name",
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
            });
        } else {
            res.send({
                error: true,
                message: "range Params is required value should be ('1d','7d','30d')"
            });
        }
    });
});

route.get('/getCollections-sitemap', function (req, res) {
    Auth.Validate(req, res, function () {
        Collections.aggregate([
            {
                $sort: {"data.stats.one_day_volume": -1}
            },
            {
                $match: {
                    "data.slug": {$not: {$regex: "^untitled-collection.*"}}
                }
            },
            {
                $limit: 500
            },
            {
                $project: {
                    _id: 0,
                    slug: "$data.slug"
                }
            },
            {
                $group: {
                    _id: null,
                    slugs: {$addToSet: "$slug"}
                }
            },
            {
                $project: {
                    _id: 0,
                    slugs: "$slugs"
                }
            },
        ], (err, result) => {

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
        });

    });
});

route.get('/getCollectionDetail/:slug', function (req, res) {

    Auth.Validate(req, res, function () {
        var Sort = {};
        var SlugFilter = req.params.slug;

        if (SlugFilter != undefined) {

            Collections.aggregate([
                {
                    $match: {
                        "data.slug": SlugFilter
                    }
                }], (err, result) => {


                Nft.aggregate([{
                    $match: {
                        "data.collection.slug": SlugFilter
                    }
                }, {
                    $sort: {
                        "data.last_sale.total_price": -1
                    }
                }, {
                    $limit: 1
                }], function (err, nft_result) {

                    if (result !== undefined && result.length !== 0) {
                        delete result[0].data.payment_tokens;
                        delete result[0].data.primary_asset_contracts;
                        delete result[0].data.fees;
                        delete result[0].data.display_data;

                        result[0].data.image_url = FN.GetHighResolutionURI(result[0].data.image_url);

                        res.send({
                            error: false,
                            data: result,
                            latestsale: (nft_result.length != 0) ? nft_result[0].data.last_sale : null
                        });
                    } else {
                        res.send({
                            error: true,
                            data: [],
                            latestsale: null
                        });
                    }
                })
            })
        } else {
            res.send({
                error: true,
                message: "range Params is required value should be ('1d','7d','30d')"
            });
        }
    });
});

route.get('/getTwitterData/:slug', function (req, res) {

    Auth.Validate(req, res, function () {
        var Sort = {};
        var SlugFilter = req.params.slug;

        if (SlugFilter != undefined) {

            Social.aggregate([
                {
                    $match: {

                        type: "Twitter",
                        slug: SlugFilter
                    }
                },
                {
                    $sort: {
                        PlainDate: 1
                    }
                },
                {
                    $project: {
                        _id: 0,
                        follower: "$data.public_metrics.followers_count",
                        Date: "$PlainDate"
                    }
                }
            ], (err, result) => {

                //result.latestsale = nft_result[0].data.last_sale

                res.send({
                    error: false,
                    data: result
                });


            })
        } else {
            res.send({
                error: true,
                message: "range Params is required value should be ('1d','7d','30d')"
            });
        }
    });
});

route.get('/getDiscordData/:slug', function (req, res) {

    Auth.Validate(req, res, function () {
        var Sort = {};
        var SlugFilter = req.params.slug;

        if (SlugFilter != undefined) {

            Social.aggregate([
                {
                    $match: {

                        type: "Discord",
                        slug: SlugFilter
                    }
                },
                {
                    $sort: {
                        PlainDate: 1
                    }
                },
                {
                    $project: {
                        _id: 0,
                        follower: "$data.approximate_member_count",
                        Date: "$PlainDate"
                    }
                }
            ], (err, result) => {

                //result.latestsale = nft_result[0].data.last_sale

                res.send({
                    error: false,
                    data: result
                });


            })
        } else {
            res.send({
                error: true,
                message: "range Params is required value should be ('1d','7d','30d')"
            });
        }
    });
});

route.get('/getSalesData/:slug', function (req, res) {

    Auth.Validate(req, res, function () {
        var Sort = {};
        var SlugFilter = req.params.slug;

        if (SlugFilter != undefined) {

            Sales.aggregate([
                {
                    $match: {
                        slug: SlugFilter
                    }
                },
                {
                    $sort: {
                        PlainDate: 1
                    }
                },
                {
                    $project: {
                        _id: 0,
                        price: "$data.floor_price",
                        Date: "$PlainDate"
                    }
                }], (err, result) => {

                res.send({
                    error: false,
                    data: result
                });


            })
        } else {
            res.send({
                error: true,
                message: "Slug is Required"
            });
        }
    });
});

route.get('/getTodayTopCollections', function (req, res) {

    Auth.Validate(req, res, function () {
        var Sort = {"data.stats.one_day_volume": -1};

        Collections.aggregate([
            {
                $sort: Sort
            },
            {
                $match: {
                    "data.slug": {$not: {$regex: "^untitled-collection.*"}}
                }
            },
            {
                $limit: 9
            }], (err, result) => {
            var resp = [];
            if (result != undefined) {

                (async function () {
                    for await (const [index, obj] of result.entries()) {
                        //console.log(obj);
                        delete obj.data.stats;
                        delete obj.data.payment_tokens;
                        delete obj.data.primary_asset_contracts;
                        delete obj.data.fees;
                        delete obj.data.display_data;
                        // expected output: 1
                        obj.data.image_url = FN.GetHighResolutionURI(obj.data.image_url);

                        await resp.push(obj);
                    }
                    res.send({
                        error: false,
                        data: resp,
                    });
                })();
            } else {
                res.send({
                    error: true,
                    data: [],
                });
            }


        })

    });
});

route.get('/getSevenDayTopCollections', function (req, res) {

    Auth.Validate(req, res, function () {
        var Sort = {"data.stats.seven_day_volume": -1};

        Collections.aggregate([
            {
                $sort: Sort
            },
            {
                $match: {
                    "data.slug": {$not: {$regex: "^untitled-collection.*"}}
                }
            },
            {
                $limit: 4
            }], (err, result) => {
            res.send({
                error: false,
                data: result,
            });
        })

    });
});

module.exports = route