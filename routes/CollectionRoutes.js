const express = require('express');
const route = express.Router();
var useragent = require('express-useragent');

route.use(useragent.express());

var Collections = require('../Model/collections');
var Auth = require('../Modules/Auth');

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
                    $limit: 50
                }], (err, result) => {
                res.send({
                    error: false,
                    data: result,
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
                res.send({
                    error: false,
                    data: result,
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

route.get('/getTodayTopCollections', function (req, res) {

    Auth.Validate(req, res, function () {
        var Sort = {"data.stats.one_day_volume": -1};

        Collections.aggregate([
            {
                $sort: Sort
            },
            {
                $limit: 9
            }], (err, result) => {
            res.send({
                error: false,
                data: result,
            });
        })

    });
});

module.exports = route