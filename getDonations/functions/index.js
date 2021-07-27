const functions = require("firebase-functions");
const admin = require('firebase-admin');
const express = require('express');
const GeohashDistance = require('geohash-distance');

admin.initializeApp();

const app = express();
const db = admin.firestore();


app.get('/:user_id', async (req, res) => {

    let userID = req.params.user_id;
    console.log(JSON.stringify({ userID }))

    let userDocs = (await db.collection('user')
        .where('user_id', '==', userID)
        .get()).docs || null;

    if (userDocs == null) {
        return res.status(400).send({
            'message': 'user not found'
        })
    }

    let userData = userDocs[0].data();
    let userGeoHash = userData.geohash || null;
    let range = userData.range || null;

    if (userGeoHash == null) {
        return res.status(400).send({
            'message': 'location not found'
        })
    }

    if (range == null || range == 0) {
        return res.status(400).send({
            'message': 'range not found'
        })
    }

    let donationDocs = (await db.collection('donation')
        .where('status', '==', 'OPEN')
        .get()).docs;

    let donation_data = [];

    let promiseArr = donationDocs.map(donation => {

        let donationData = donation.data();

        let created_at = donationData.created_at;
        let description = donationData.description;
        let address = donationData.address;
        let plate_left_count = donationData.plate_left_count;
        let phone = donationData.phone;
        let name = donationData.name;
        let status = donationData.status;
        let images_url = donationData.images_url;
        let geohash = donationData.geohash;

        let distance = parseInt(GeohashDistance.inKm(userGeoHash, geohash) * 1000);

        let donation_id = donation.id;

        if (distance <= range) {
            donation_data.push({
                created_at,
                description,
                address,
                plate_left_count,
                name,
                status,
                phone,
                images_url,
                distance,
                donation_id
            })

        }
    })

    Promise.all(promiseArr)
        .then(result => {
            console.log(JSON.stringify({ donation_data }));
            console.log(JSON.stringify({ result }));
            return res.status(200).send(donation_data);
        })
        .catch(error => {
            console.error(JSON.stringify({ error }));
            return res.status(500).send({
                'message': error.message
            })
        })

})

exports.getDonations = functions.https.onRequest(app);