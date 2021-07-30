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

    let user_id = data.user_id;
    let range = data.range;

    let user_docs = (await db.collection('user')
        .where('user_id', '==', user_id)
        .get()).docs;

    if (user_docs == null) {
        return res.status(400).send({
            'message': 'user not found'
        })
    }

    let user_key = user_docs[0].id;

    await db.collection('user')
        .doc(user_key)
        .update({
            range
        })
        .then(async result => {
            console.log(JSON.stringify({ result }));

            await axios.get(`/getDonations`)  // TODO: Add base url here
                .then(result => {

                    return res.status(200).send({
                        'message': 'OK',
                        'donations': result
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

exports.changeRange = functions.https.onRequest(app);