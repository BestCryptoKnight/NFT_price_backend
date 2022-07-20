const express = require('express');
const route = express.Router();
var useragent = require('express-useragent');
route.use(useragent.express());

var NftDropsStatsData = require('../Model/NftDropsTwitter_data');
var Auth = require('../Modules/Auth');
const NFTDropsSocial = require('../Model/NftDropsSocial');

route.post('/getTwitterData', function (req, res) {
    Auth.NftDropsValidate(req, res, function () {
        var TwitterUsername = [];
        //var TwitterUsername = req.body.twitterUsername;

        if (req.body.twitterUsername != undefined && Array.isArray(req.body.twitterUsername)) {
            (async () => {
                for await (var [Lineindex, obj] of req.body.twitterUsername.entries()) {
                    var TUsername = "";
                    if (obj != "" && obj != null && obj != undefined) {
                        if (obj.match(/https?:\/\/(www\.)?twitter\.com\/(#!\/)?@?([^\/]*)/) != null) {
                            TUsername = obj.match(/https?:\/\/(www\.)?twitter\.com\/(#!\/)?@?([^\/]*)/)[3];
                        } else if (obj.match(/https?:\/\/(www\.)?mobile.twitter\.com\/(#!\/)?@?([^\/]*)/) != null) {
                            TUsername = obj.match(/https?:\/\/(www\.)?mobile.twitter\.com\/(#!\/)?@?([^\/]*)/)[3]
                        } else {
                            TUsername = obj;
                        }
                        TwitterUsername.push(TUsername);
                    }
                }
                if (TwitterUsername.length != 0) {

                    NFTDropsSocial.aggregate([
                        {
                            $match: {
                                "data.username": {$in: TwitterUsername},
                                type: "Twitter"
                            }
                        },
                        {
                            $sort: {
                                "data.username": 1,
                                PlainDate: 1
                            }
                        },
                        {
                            $group: {
                                _id: "$data.username",
                                data: {
                                    $push: {date: "$PlainDate", follower: "$data.public_metrics.followers_count"}
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                username: "$_id",
                                data: "$data"
                            }
                        }], (err, result) => {
                        res.send({
                            error: false,
                            response: result
                        });
                    })
                } else {
                    res.send({
                        error: true,
                        message: "Twitter UserNames are required"
                    });
                }
            })();
        } else {
            res.send({
                error: true,
                message: "Twitter UserNames are required and should be an Array"
            });
        }

    });
});

module.exports = route