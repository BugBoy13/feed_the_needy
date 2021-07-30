const functions = require("firebase-functions");
const admin = require('firebase-admin');
const express = require('express');

admin.initializeApp();

const app = express();
const db = admin.firestore();

app.get('/:user_id', async (req, res) => {

    let userID = req.params.user_id;
    console.log(JSON.stringify({ userID }))

    let requestsDocs = (await db.collection('donation_request')
        .where('user_id', '==', userID)
        .get()).docs;

    let request_data = [];

    let promiseArr = requestsDocs.map(async request => {

        let requestData = request.data();

        let donation_id = requestData.donation_id;

        let donationDocs = (await db.collection('donation')
            .where('donation_id', '==', donation_id)
            .get()).docs || null;

        if (donationDocs == null) {
            continue
        }

        let donation_data = donationDocs[0].data();
        let location = donation_data.location;
        let address = donation_data.address;
        let name = donation_data.name;
        let phone = donation_data.phone;

        let created_at = requestData.created_at;
        let plate_count = requestData.plate_count;
        let description = requestData.description;
        let request_id = requestData.request_id;

        request_data.push({
            address,
            name,
            phone,
            created_at,
            status,
            plate_count,
            description,
            location,
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

exports.myRequests = functions.https.onRequest(app);