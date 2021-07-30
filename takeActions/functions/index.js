const functions = require("firebase-functions");
const admin = require('firebase-admin');
const express = require('express');

admin.initializeApp();

const app = express();
const db = admin.firestore()

app.put('/', async (req, res) => {

    let data = req.body;
    console.log(JSON.stringify({ data }))

    let status = data.status;
    let request_id = data.request_id;

    let requestDocs = (await db.collection('donation_request')
        .where('request_id', '==', request_id)
        .get()).docs;

    let requestKey = requestDocs[0].id;

    await db.collection('donation_request')
        .doc(requestKey)
        .update({
            status
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
})

exports.takeActions = functions.https.onRequest(app);