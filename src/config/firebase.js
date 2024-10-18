// src/config/firebase.js
const admin = require('firebase-admin');
const axios = require('axios');
require('dotenv').config();

const serviceAccount = require('../secrets/admin-firebasesdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;