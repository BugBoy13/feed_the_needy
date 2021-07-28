const functions = require("firebase-functions");
const admin = require('firebase-admin');
const express = require('express');

admin.initializeApp();

const app = express();

app.post('/', async (req, res) => {

    let data = req.body;
    console.log(JSON.stringify({ data }))

    let user_id = data.user_id;
    let plate_count = data.plate_count;
    let description = data.description;
    let images_url = data.images_url;

    let created_at = admin.firestore.Timestamp.now();
    let plate_left_count = 0;
    let request_count = 0;
    let status = 'OPEN';

    const db = admin.firestore();

    let user_data = (await db.collection('user')
        .where('user_id', '==', user_id)
        .get()).docs || null;

    if (user_data == null) {
        return res.status(400).send({
            'message': 'no user found'
        })
    }

    let geohash = user_data[0].data().geohash;

    let name = user_data[0].data().name;
    let phone = user_data[0].data().phone;

    let donationData = {
        address,
        created_at,
        description,
        geohash,
        images_url,
        name,
        phone,
        plate_count,
        plate_left_count,
        request_count,
        status,
        user_id
    }

    console.log(JSON.stringify({ donationData }));

    await db.collection('donation').add(donationData)
        .then(result => {

            // TODO: Send push notification here

            console.log(JSON.stringify({ result }));
            return res.status(200).send({
                'message': 'OK'
            })
        })
        .catch(error => {
            console.error(JSON.stringify({ error }));
            return res.status(500).send({
                'message': error.message
            })
        })


})

exports.createDonations = functions.https.onRequest(app);