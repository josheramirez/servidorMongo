const express = require('express');
const router = express.Router();
const dbOperations = require('./db/db-operations');

router.get('/cops', async (req, res) => {
    /*
        extract the latitude and longitude info from the request query parameters.
        Then, fetch the nearest cops using MongoDB's geospatial queries and return it back to the client.
    */
    const latitude = Number(req.query.lat);
    const longitude = Number(req.query.lng);
    const nearestCops = await dbOperations.fetchNearestCops([longitude, latitude], 2000);

    res.json({
        cops: nearestCops
    });
});


router.get('/', function (req, res) {
    res.send('Hello World!');
  });


module.exports = router;