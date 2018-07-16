const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const uuid = require("uuid/v1");
const jwt = require('jsonwebtoken');
var admin = require("firebase-admin");

var serviceAccount = JSON.parse(process.env.NODE_FIREBASE);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fb-hack-2edfe.firebaseio.com"
});


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const fbApi = axios.create({
  baseUrl: process.env.NODE_GRAPH_API,
})

const getTokenEndpoint = (authorization_code) => `https://graph.accountkit.com/v1.1/access_token?grant_type=authorization_code&code=${authorization_code}&access_token=AA|79059249606625|6212912c76cbcde2e03c7732aaee609a`

const account_kit_api_version = 'v1.1';
const app_id = process.env.NODE_FB_APP_ID;
const app_secret = process.env.NODE_FB_APP_SECRET;
const me_endpoint_base_url = 'https://graph.accountkit.com/v1.1/me';
const token_exchange_base_url = 'https://graph.accountkit.com/v1.1/access_token'; 

const Querystring  = require('querystring');


app.get("/me", async (req, res) => {
  try {
    const code = req.headers['x-access-token'];
    const app_access_token = ['AA', app_id, app_secret].join('|');
    const params = {
      grant_type: 'authorization_code',
      code: code,
      access_token: app_access_token
    };
    const token_exchange_url = token_exchange_base_url + '?' + Querystring.stringify(params);
    const { data: { access_token }} = await axios.get(token_exchange_url);
    const me_endpoint_url = me_endpoint_base_url + '?access_token=' + access_token;
    const { data: { email, id }} = await axios.get(me_endpoint_url);
    const token = jwt.sign({ email, id }, app_secret);
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
});

app.get("/csrf", (req, res) => {
  res.json({ csrf: uuid() });
  console.log(csrf)
});
// protected routes


app.use((req, res, next) => {
  try {
    const code = req.headers['authorization'];
    const result = jwt.verify(code, app_secret)
    req.user = result
    next();
  } catch(error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const db = admin.firestore();
const usersCollectionRef = db.collection('users');

app.get('/profile', async (req, res) => {
  const getDoc = await usersCollectionRef.doc(req.user.id).get();
  if (!getDoc.exists) {
    const setDoc = await usersCollectionRef.doc(req.user.id).set({ meetups: [] });
    res.json({ meetups: [] });
  } else {
    res.json(getDoc.data());
  }
});

const rallyPointCollectionRef = db.collection('rallypoint');

app.get('/rallypoint', async (req, res) => {
  const getDoc = await rallyPointCollectionRef.doc(req.query.id).get();
  if (!getDoc.exists) {
    res.json({ empty: true });
  } else {
    res.json(getDoc.data());
  }
});

app.post('/rallypoint', async (req, res) => {
  const { lng, lat, id } = req.body;
  const setDoc = await rallyPointCollectionRef.doc(id).set({ lng, lat });
  res.json({ lng, lat });
});


const endpoint = (lon, lat) =>
  `https://api.meetup.com/find/upcoming_events?&sign=true&photo-host=public&lon=${lon}&lat=${lat}&key=${process.env.NODE_APP_KEY}`;

app.post("/meetups", async (req, res) => {
  const { lon, lat } = req.body;
  try {
    const result = await axios.get(endpoint(lon, lat));
    res.json(result.data);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json(error.data);
  }
});




const PORT = process.env.NODE_PORT || 3000

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
