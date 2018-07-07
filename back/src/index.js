const micro = require('micro');
const axios = require('axios');
const microCors = require('micro-cors')
const uuid = require('uuid/v1')
const cors = microCors({ allowMethods: ['POST', 'GET'] })

const endpoint = (lon, lat) => `https://api.meetup.com/find/upcoming_events?&sign=true&photo-host=public&lon=${lon}&lat=${lat}&key=${process.env.NODE_APP_KEY}`;

const server = micro(cors(async (req, res) => {
    if (req.method === 'POST') {
        const {lon, lat} = await micro.json(req)
        try {
            const result = await axios.get(endpoint(lon, lat));
            micro.send(res, result.status, result.data);
        } catch (error) {
            micro.send(res, error.status, error.data);
        }
    } else if (req.method === 'GET') {
        micro.send(res, 200, {csrf: uuid()})
    } else {
        micro.send(res, 300, 'unsoported method')
    }

}));

server.listen(3000);