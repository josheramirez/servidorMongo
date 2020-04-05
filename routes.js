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

// router.get('/data.html', function(req, res) {
//     res.render('data.html');
// });

router.get('/', function (req, res) {
    res.send('Hello World!');
  });

  router.get('/civilian.html', (req, res) => {
    res.render('civilian.html', {
        userId: req.query.userId
    });
});

router.get('/cop.html', (req, res) => {
    res.render('cop.html', {
        userId: req.query.userId
    });
});

router.get('/cops/info', async (req, res) => {

    // console.log("en cops/info");
    const userId = req.query.userId // extract userId from query params
    // console.log("en cops/info userId "+userId);
    const copDetails = await dbOperations.fetchCopDetails(userId);
    // console.log("en cops/info copDetails"+copDetails);
    res.json({
        copDetails: copDetails
    });
});

router.get('/user.html', (req, res) => {
    res.render('user.html', {
        latitude : Number(req.query.lat),
        longitude : Number(req.query.lng),
        userId: req.query.userId
    });
});


module.exports = router;