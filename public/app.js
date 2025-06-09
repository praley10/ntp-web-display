document.addEventListener('DOMContentLoaded', () => {
    // A list of common IANA time zones for the dropdowns
    const timeZoneList = [
        "America/New_York", "America/Chicago", "America/Los_Angeles", "Europe/London", 
        "Europe/Paris", "Europe/Moscow", "Asia/Tokyo", "Asia/Shanghai", "Asia/Dubai", 
        "Australia/Sydney"
    ];

    const sourceTimeElem = document.getElementById('source-time-display');
    const timeZoneGrid = document.getElementById('time-zone-grid');

    // This will hold the master Date object from the server
    let serverBaseTime = null;

    // --- Functions ---

    /**
     * Populates the 5 dropdown selectors with time zone options.
     */
    function createDynamicRows() {
        for (let i = 1; i <= 5; i++) {
            const row = document.createElement('div');
            row.className = 'time-zone-row';

            const select = document.createElement('select');
            select.id = `tz-select-${i}`;
            
            timeZoneList.forEach(tz => {
                const option = document.createElement('option');
                option.value = tz;
                option.textContent = tz.replace(/_/g, ' ');
                select.appendChild(option);
            });
            
            // Set a default, unique value for each dropdown
            select.value = timeZoneList[i - 1];
            
            select.addEventListener('change', displayAllTimes);

            const timeDisplay = document.createElement('span');
            timeDisplay.className = 'time-display';
            timeDisplay.id = `tz-time-${i}`;

            row.appendChild(select);
            row.appendChild(timeDisplay);
            timeZoneGrid.appendChild(row);
        }
    }

    /**
     * Takes a Date object and a time zone, and returns a formatted string.
     * @param {Date} dateObject - The master Date object.
     * @param {string} timeZone - The IANA time zone name.
     * @returns {string} - The formatted time string.
     */
    function formatTime(dateObject, timeZone) {
        if (!dateObject) return '...';
        return dateObject.toLocaleString('en-US', {
            timeZone: timeZone,
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    }

    /**
     * Updates the time display for all 7 time zones based on the serverBaseTime.
     */
    function displayAllTimes() {
        if (!serverBaseTime) return;

        // Update static displays
        document.getElementById('tz-time-utc').textContent = formatTime(serverBaseTime, 'UTC');
        document.getElementById('tz-time-denver').textContent = formatTime(serverBaseTime, 'America/Denver');

        // Update dynamic displays based on dropdown selections
        for (let i = 1; i <= 5; i++) {
            const selectedTz = document.getElementById(`tz-select-${i}`).value;
            document.getElementById(`tz-time-${i}`).textContent = formatTime(serverBaseTime, selectedTz);
        }
    }

    /**
     * Fetches the master time from the server.
     */
    function fetchMasterTime() {
        fetch('/ntp-data')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                // Create a new Date object from the server's ISO string
                serverBaseTime = new Date(data.serverTime);
                
                // Update the main source time display once
                sourceTimeElem.textContent = serverBaseTime.toISOString();
                
                // Refresh all time zone displays with the new time
                displayAllTimes();
            })
            .catch(error => {
                console.error('Error fetching NTP data:', error);
                sourceTimeElem.textContent = 'Error fetching data';
            });
    }

    // --- Initialization ---

    createDynamicRows();
    fetchMasterTime(); // Initial fetch
    setInterval(fetchMasterTime, 5000); // Fetch new time every 5 seconds
});
