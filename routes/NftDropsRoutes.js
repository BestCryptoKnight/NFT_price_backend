const express = require('express');
const route = express.Router();
var useragent = require('express-useragent');
const moment = require('moment');
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
                                    $push: {
                                        date: "$PlainDate",
                                        follower: "$data.public_metrics.followers_count",
                                        Trending: "$Trending"
                                    }
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                username: "$_id",
                                data: 1
                            }
                        }], (err, result) => {
                        if (result !== undefined && result.length !== 0) {
                            (async () => {
                                for await (var [index, obj] of result.entries()) {
                                    for await (var [Innerindex, Innerobj] of obj.data.entries()) {
                                        Innerobj.Fulldate = Innerobj.date;
                                        Innerobj.date = moment(new Date(Innerobj.date)).format('DD/MM');
                                        Innerobj.IsTrending = (Innerobj.Trending !== undefined) ? Innerobj.Trending.IsTrending : false;
                                        delete Innerobj.Trending;


                                    }
                                }
                                res.send({
                                    error: false,
                                    response: result
                                });
                            })();
                        } else {
                            res.send({
                                error: false,
                                response: result
                            });
                        }


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

route.post('/getDiscordData', function (req, res) {
    Auth.NftDropsValidate(req, res, function () {
        var DiscordUsername = [];
        //var DiscordUsername = req.body.discordUsername;

        if (req.body.discordUsername != undefined && Array.isArray(req.body.discordUsername)) {
            (async () => {
                for await (var [Lineindex, obj] of req.body.discordUsername.entries()) {
                    if (obj != "" && obj != null && obj != undefined) {
                        DiscordUserName = obj.substring(obj.lastIndexOf('/') + 1);
                        DiscordUsername.push(DiscordUserName);
                    }
                }
                if (DiscordUsername.length != 0) {
                    NFTDropsSocial.aggregate([
                        {
                            $match: {
                                "data.code": {$in: DiscordUsername},
                                type: "Discord"
                            }
                        },
                        {
                            $sort: {
                                "data.code": 1,
                                PlainDate: 1
                            }
                        },
                        {
                            $group: {
                                _id: "$data.code",
                                data: {
                                    $push: {
                                        date: "$PlainDate",
                                        follower: "$data.approximate_member_count",
                                        Trending: "$Trending"
                                    }
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                username: "$_id",
                                data: 1,
                            }
                        }], (err, result) => {
                        if (result !== undefined && result.length !== 0) {
                            (async () => {
                                for await (var [index, obj] of result.entries()) {
                                    for await (var [Innerindex, Innerobj] of obj.data.entries()) {
                                        Innerobj.Fulldate = Innerobj.date;
                                        Innerobj.date = moment(new Date(Innerobj.date)).format('DD/MM');
                                        Innerobj.IsTrending = (Innerobj.Trending !== undefined) ? Innerobj.Trending.IsTrending : false;
                                        delete Innerobj.Trending;
                                    }
                                }
                                res.send({
                                    error: false,
                                    response: result
                                });
                            })();
                        } else {
                            res.send({
                                error: false,
                                response: result
                            });
                        }


                    })
                } else {
                    res.send({
                        error: true,
                        message: "Discord UserNames are required"
                    });
                }
            })();
        } else {
            res.send({
                error: true,
                message: "Discord UserNames are required and should be an Array"
            });
        }

    });
});

module.exports = route