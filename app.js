var express = require('express');
const {PORT} = require('./config');
var app = express();
const CollectionsRoutes = require('./routes/CollectionRoutes');
const NftsRoutes = require('./routes/NftRoutes');
const cors = require('cors');
const request = require('request');

app.use(cors({origin: '*'}));

app.get('/', function (req, res) {
    res.send(res.statusCode.toString());
});

app.get('/healthcheck', function (req, res) {
    res.send(res.statusCode.toString());
});

app.get('/get-eth-stats', function (req, res) {
    request('http://ec2-54-89-245-85.compute-1.amazonaws.com:8081/getEthValue', function (error, response, body) {
        if (response.statusCode == 200)
            res.send({success: true, data: JSON.parse(body)});
        else
            res.send({success: false, message: "Api Data Not Found"});
    });
});

app.use('/collection', CollectionsRoutes);
app.use('/nft', NftsRoutes);

app.listen(PORT, () => console.log(`Cron Jobs server currently running on port ${PORT}`));
