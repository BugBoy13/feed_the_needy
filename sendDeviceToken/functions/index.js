const functions = require("firebase-functions");
const admin = require('firebase-admin');
const express = require('express');

admin.initializeApp();

const app = express();
const db = admin.firestore()

app.post('/', async (req, res) => {

    let data = req.body;
    console.log(JSON.stringify({ data }))

    let device_token = data.device_token;
    let user_id = data.user_id;

    let userDocs = (await db.collection('user')
        .where('user_id', '==', user_id)
        .get()).docs;

    let userKey = userDocs[0].id;

    await db.collection('user')
        .doc(userKey)
        .update({
            device_token
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

exports.sendDeviceToken = functions.https.onRequest(app);