var express = require('express');
const {PORT} = require('./config');
var app = express();
const CollectionsRoutes = require('./routes/CollectionRoutes');
const NftsRoutes = require('./routes/NftRoutes');
const cors = require('cors');

app.use(cors({origin: '*'}));

app.get('/', function (req, res) {
    res.send(res.statusCode.toString());
});

app.get('/healthcheck', function (req, res) {
    res.send(res.statusCode.toString());
});

app.use('/collection', CollectionsRoutes);
app.use('/nft', NftsRoutes);

app.listen(PORT, () => console.log(`Cron Jobs server currently running on port ${PORT}`));
