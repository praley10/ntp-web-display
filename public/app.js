document.addEventListener('DOMContentLoaded', () => {
    const serverTimeElem = document.getElementById('server-time');
    const localTimeElem = document.getElementById('local-time');
    const timeDiffElem = document.getElementById('time-diff');

    function updateTime() {
        // Fetch data from our Node.js server
        fetch('/ntp-data')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const serverTime = new Date(data.serverTime);
                const localTime = new Date();
                const difference = localTime - serverTime;

                serverTimeElem.textContent = serverTime.toLocaleString();
                localTimeElem.textContent = localTime.toLocaleString();
                timeDiffElem.textContent = `${difference} ms`;
            })
            .catch(error => {
                console.error('Error fetching NTP data:', error);
                serverTimeElem.textContent = 'Error fetching data';
                localTimeElem.textContent = 'N/A';
                timeDiffElem.textContent = 'N/A';
            });
    }

    // Update the time every 5 seconds
    setInterval(updateTime, 5000);

    // Initial call to display time immediately
    updateTime();
});
