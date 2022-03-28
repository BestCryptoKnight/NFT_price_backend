const express = require('express');
const route = express.Router();
var useragent = require('express-useragent');

route.use(useragent.express());

const Nft = require('../Model/nft');
var Auth = require('../Modules/Auth');

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

module.exports = route