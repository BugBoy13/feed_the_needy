const functions = require("firebase-functions");
const admin = require('firebase-admin');
const express = require('express');

admin.initializeApp();

const app = express();
const db = admin.firestore();

app.get('/:donation_id', async (req, res) => {

    let donationID = req.params.donation_id;
    console.log(JSON.stringify({ donationID }))

    let requestsDocs = (await db.collection('donation_request')
        .where('donation_id', '==', donationID)
        .get()).docs;

    let request_data = [];

    let promiseArr = requestsDocs.map(request => {

        let requestData = request.data();

        let created_at = requestData.created_at;
        let plate_count = requestData.plate_count;
        let phone = requestData.phone;
        let name = requestData.name;
        let address = requestData.address;
        let status = requestData.status;
        let user_id = requestData.user_id;

        let request_id = request.id;

        request_data.push({
            created_at,
            plate_count,
            phone,
            name,
            address,
            status,
            user_id,
            request_id
        })

    })

    Promise.all(promiseArr)
        .then(result => {
            console.log(JSON.stringify({ request_data }));
            console.log(JSON.stringify({ result }));
            return res.status(200).send(request_data);
        })
        .catch(error => {
            console.error(JSON.stringify({ error }));
            return res.status(500).send({
                'message': error.message
            })
        })

})

exports.myDonations = functions.https.onRequest(app);