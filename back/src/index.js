const micro = require('micro');
const axios = require('axios');
const microCors = require('micro-cors')
const cors = microCors({ allowMethods: ['POST'] })

const endpoint = (lon, lat) => `https://api.meetup.com/find/upcoming_events?&sign=true&photo-host=public&lon=${lon}&lat=${lat}&key=${process.env.NODE_APP_KEY}`;

const server = micro(cors(async (req, res) => {
    console.log(process.env.NODE_APP_KEY);
    const {lon, lat} = await micro.json(req)
    try {
        const result = await axios.get(endpoint(lon, lat));
        micro.send(res, result.status, result.data);
    } catch (error) {
        micro.send(res, error.status, error.data);
    }

}));

server.listen(3000);