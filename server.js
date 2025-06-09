// server.js

const express = require('express');
const NtpClient = require('node-ntp-client'); // <-- Switched to the new library
const path = require('path');

const app = express();
const port = 3000;

// Configure the new NTP client
const ntpClient = new NtpClient("ntp.raleys.us", 123, { timeout: 5000 });

app.use(express.static(path.join(__dirname, 'public')));

app.get('/ntp-data', (req, res) => {
    ntpClient.getNetworkTime((err, date, details) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to get NTP time' });
        }

        // Send the full details object to the frontend
        res.json({
            serverTime: date.toISOString(), // Keep this for the time displays
            stratum: details.stratum,
            refId: details.refId,
            rootDelay: details.rootDelay,
            rootDispersion: details.rootDispersion,
            leapIndicator: details.leapIndicator,
            poll: details.poll,
            precision: details.precision
        });
    });
});

app.listen(port, () => {
    console.log(`NTP proxy server listening at http://localhost:${port}`);
});
