const functions = require("firebase-functions");
const admin = require('firebase-admin');
const express = require('express');
const axios = require('axios');

admin.initializeApp();

const app = express();
const db = admin.firestore()

app.put('/', async (req, res) => {

    let data = req.body;
    console.log(JSON.stringify({ data }))

    let request_id = data.request_id;
    let plate_count = data.plate_count;

    let requestDocs = (await db.collection('donation_request')
        .where('request_id', '==', request_id)
        .get()).docs;

    let requestData = requestDocs[0].data();
    let requestKey = requestDocs[0].id;
    let donation_id = requestData.donation_id;
    let prev_plate_count = requestData.plate_count;

    let donationDocs = (await db.collection('donation')
        .where('request_id', '==', donation_id)
        .get()).docs;

    let donationData = donationDocs[0].data()
    let donationKey = donationDocs[0].id;
    let plate_left_count = donationData.plate_left_count;

    if (plate_count == prev_plate_count) {
        return res.status(400).send({
            'message': 'plate count is same'
        })
    }

    if (plate_count < prev_plate_count) {

        await db.collection('donation_request')
            .doc(requestKey)
            .update({
                plate_count
            })

        await db.collection('donation')
            .doc(donationKey)
            .update({
                'plate_left_count': prev_plate_count - plate_count + plate_left_count
            })
            .then(result => {
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

    }

    if (plate_count > prev_plate_count) {

        if (plate_count > plate_left_count) {
            return res.status(400).send({
                'message': 'plates not available'
            })
        }
        else {
            await db.collection('donation_request')
                .doc(requestKey)
                .update({
                    plate_count
                })

            await db.collection('donation')
                .doc(donationKey)
                .update({
                    'plate_left_count': plate_left_count - plate_count + prev_plate_count
                })
                .then(result => {
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
        }
    }
})

exports.changeQuantity = functions.https.onRequest(app);