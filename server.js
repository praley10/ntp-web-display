// server.js

const express = require('express');
const Sntp = require('@hapi/sntp'); // <-- Use the official @hapi/sntp package
const path = require('path');

const app = express();
const port = 3000;

const ntpServer = 'ntp.raleys.us';

app.use(express.static(path.join(__dirname, 'public')));

// Make the route handler async to use await
app.get('/ntp-data', async (req, res) => {
    try {
        // The API usage is nearly identical
        const timeDetails = await Sntp.time({ host: ntpServer, resolve: true });

        // Map the fields from the sntp response to our consistent API format
        res.json({
            serverTime: new Date(timeDetails.t).toISOString(),
            stratum: timeDetails.stratum,
            refId: timeDetails.id,
            rootDelay: timeDetails.d, // 'd' is Root Delay in seconds
            rootDispersion: timeDetails.e, // 'e' is Root Dispersion in seconds
            leapIndicator: timeDetails.li,
            poll: timeDetails.poll,
            precision: timeDetails.precision
        });

    } catch (err) {
        console.error(`Error querying NTP server: ${err.message}`);
        return res.status(500).json({ error: 'Failed to get NTP time' });
    }
});

app.listen(port, () => {
    console.log(`NTP proxy server listening at http://localhost:${port}`);
});
