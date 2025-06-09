const express = require('express');
const ntpClient = require('ntp-client');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/ntp-data', (req, res) => {
  // Query your NTP server
  ntpClient.getNetworkTime("ntp.raleys.us", 123, (err, date) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to get NTP time. Is the server address correct and reachable?' });
    }
    // Respond with the time in a standard format
    res.json({
      serverTime: date.toISOString(),
      serverTimestamp: date.getTime()
    });
  });
});

app.listen(port, () => {
  console.log(`NTP proxy server listening at http://localhost:${port}`);
});
