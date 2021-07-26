const functions = require("firebase-functions");
const admin = require('firebase-admin');
const express = require('express');

admin.initializeApp();

const app = express();

app.post('/', async (req, res) => {

    let data = req.body;
    console.log(JSON.stringify({ data }))

    let phone = data.phone;
    let name = data.name;
    let address = data.address;
    let type = data.userType;
    let location = data.location;
    let deviceToken = data.deviceToken;
    let user_id = data.userID;
    let range = 3000;

    let created_at = admin.firestore.Timestamp.now();

    const db = admin.firestore();

    let userData = {
        address,
        created_at,
        deviceToken,
        location,
        name,
        phone,
        range,
        type: userType,
        user_id
    }

    console.log(JSON.stringify({ userData }));

    await db.collection('user').add(userData)
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

exports.addUser = functions.https.onRequest(app);