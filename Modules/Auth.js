var {API_KEY} = require('../config');

exports.Validate = function (req, res, callback) {
    ApiKey = req.headers['x-api-key'];
    if (ApiKey == API_KEY) {
        callback();
    } else {
        res.send({
            error: true,
            "message": "Api Key is not Valid"
        })
    }
}