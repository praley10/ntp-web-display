document.addEventListener('DOMContentLoaded', () => {
    // A list of common IANA time zones for the dropdowns
    const timeZoneList = [
        "America/New_York", "America/Chicago", "America/Los_Angeles", "Europe/London", 
        "Europe/Paris", "Europe/Moscow", "Asia/Tokyo", "Asia/Shanghai", "Asia/Dubai", 
        "Australia/Sydney"
    ];

    // Get references to all the DOM elements we'll be updating
    const timeZoneGrid = document.getElementById('time-zone-grid');
    
    // Server Detail Elements
    const detailStratum = document.getElementById('detail-stratum');
    const detailRefId = document.getElementById('detail-refid');
    const detailRootDelay = document.getElementById('detail-rootdelay');
    const detailPrecision = document.getElementById('detail-precision');

    // This will hold the master Date object from the server
    let serverBaseTime = null;

    // --- Functions ---

    /**
     * Creates the 5 dynamic rows with dropdown selectors and appends them to the grid.
     */
    function createDynamicRows() {
        // Create static rows first in the correct order
        const utcRow = document.createElement('div');
        utcRow.className = 'time-zone-row static';
        utcRow.innerHTML = `<label>UTC</label><span class="time-display" id="tz-time-utc">...</span>`;
        timeZoneGrid.appendChild(utcRow);
        
        const denverRow = document.createElement('div');
        denverRow.className = 'time-zone-row static';
        denverRow.innerHTML = `<label>America/Denver</label><span class="time-display" id="tz-time-denver">...</span>`;
        timeZoneGrid.appendChild(denverRow);

        // Now create the 5 dynamic rows
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
            
            // Set a default, unique value for each dropdown to avoid repetition
            select.value = timeZoneList[i - 1];
            
            // When a dropdown value changes, re-render all the times
            select.addEventListener('change', displayAllTimes);

            const timeDisplay = document.createElement('span');
            timeDisplay.className = 'time-display';
            timeDisplay.id = `tz-time-${i}`;
            timeDisplay.textContent = '...';

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
     * Fetches the master time and server details from the server.
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
                
                // Update the server details panel
                detailStratum.textContent = data.stratum;
                detailRefId.textContent = data.refId;
                // Root Delay is in seconds, convert to milliseconds for display
                detailRootDelay.textContent = (data.rootDelay * 1000).toFixed(4);
                detailPrecision.textContent = data.precision;
                
                // Refresh all time zone displays with the new time
                displayAllTimes();
            })
            .catch(error => {
                console.error('Error fetching NTP data:', error);
                // Display an error in one of the fields to notify the user
                detailStratum.textContent = "Error";
            });
    }

    // --- Initialization ---

    createDynamicRows();      // Build the HTML structure
    fetchMasterTime();        // Initial fetch to populate data immediately
    setInterval(fetchMasterTime, 5000); // Set up the refresh loop
});
