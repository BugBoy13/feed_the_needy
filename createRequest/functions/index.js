const functions = require("firebase-functions");
const admin = require('firebase-admin');
const express = require('express');
const Geohash = require('ngeohash');
const axios = require('axios');

admin.initializeApp();

const app = express();
const db = admin.firestore();

app.post('/', async (req, res) => {

    let data = req.body;
    console.log(JSON.stringify({ data }))

    let user_id = data.user_id;
    let plate_count = data.plate_count;
    let description = data.description;
    let donation_id = data.donation_id;

    let userDocs = (await db.collection('user')
        .where('user_id', '==', user_id)
        .get()).docs || null;

    if (userDocs == null) {
        return res.status(400).send({
            'message': 'user not found'
        })
    }

    let userData = userDocs[0].data();

    let address = userData.address;
    let created_at = admin.firestore.Timestamp.now();
    let location = userData.location;
    let geohash = Geohash.encode(location.getLatitude(), location.getLongitude());
    let name = userData.name;
    let phone = userData.phone;

    let request_id = db.collection('donation_request').doc().id;
    let status = 'PENDING';

    let requestData = {
        address,
        created_at,
        description,
        donation_id,
        geohash,
        name,
        phone,
        plate_count,
        request_id,
        status,
        user_id
    }

    console.log(JSON.stringify({ requestData }));

    await db.collection('donation_request').add(requestData)
        .then(async result => {

            // TODO: Send push notification here
            // TODO: Change Request Count on Donation

            console.log(JSON.stringify({ result }));

            await axios.get(`/myRequests/${user_id}`)
                .then(result => {

                    console.log(JSON.stringify({ result }));
                    return res.status(200).send({
                        'message': 'OK',
                        'requests': result
                    })
                })
                .catch(error => {
                    console.error(JSON.stringify({ error }));
                    return res.status(500).send({
                        'message': error.message
                    })
                })

        })
        .catch(error => {
            console.error(JSON.stringify({ error }));
            return res.status(500).send({
                'message': error.message
            })
        })


})

exports.createRequest = functions.https.onRequest(app);