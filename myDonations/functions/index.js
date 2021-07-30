const functions = require("firebase-functions");
const admin = require('firebase-admin');
const express = require('express');

admin.initializeApp();

const app = express();
const db = admin.firestore();

app.get('/:user_id', async (req, res) => {

    let userID = req.params.user_id;
    console.log(JSON.stringify({ userID }))

    let donationDocs = (await db.collection('donation')
        .where('user_id', '==', user_id)
        .get()).docs;

    let donation_data = [];

    let promiseArr = donationDocs.map(donation => {

        let donationData = donation.data();

        let created_at = donationData.created_at;
        let status = donationData.status;
        let plate_count = donationData.plate_count;
        let plate_left_count = donationData.plate_left_count;
        let request_count = donationData.request_count;

        let donation_id = donationData.donation_id;

        donation_data.push({
            created_at,
            status,
            plate_count,
            plate_left_count,
            request_count,
            donation_id
        })

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

exports.myDonations = functions.https.onRequest(app);