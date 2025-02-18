const API_URL = 'https://pixelit.onrender.com/api';
const token = localStorage.getItem('token');

// Redirect to login if token is missing
if (!token) {
    window.location.href = 'index.html';
}
// Fetch and update a specific table
async function fetchAndUpdateTable(endpoint, tableId) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch data for endpoint: ${endpoint}`);
        }

        const items = await response.json();
        updateTable(tableId, items, endpoint);
    } catch (error) {
        console.error(`Error fetching data from ${endpoint}:`, error);
    }
}

// Update a table with fetched data
function updateTable(tableId, items, endpoint) {
    const tableElement = document.getElementById(tableId);
    if (!tableElement) {
        console.error(`Table with ID '${tableId}' not found.`);
        return;
    }

    const tableBody = tableElement.querySelector('tbody');
    tableBody.innerHTML = items.map((item, index) => {
        const { _id, photo, media, link, ...fields } = item;

        const fieldCells = Object.entries(fields)
            .map(([key, value]) => `<td>${value || "-"}</td>`)
            .join('');

        const photoCell = photo ? `<td><img src="${photo}" width="50" height="50"></td>` : '';
        const mediaCell = media ? `<td><video width="80" height="80" controls><source src="${media}" type="video/mp4"></video></td>` : '';

        // Show link only for club games
        const linkCell = (endpoint === 'clubGames' && link) ? `<td><a href="${link}" target="_blank">Play Now</a></td>` : '';

        return `
            <tr>
                <td>${index + 1}</td>
                ${fieldCells}
                ${photoCell}
                ${mediaCell}
                ${linkCell}
                <td>
                    <button onclick="deleteItem('${endpoint}', '${_id}')">Delete</button>
                </td>
            </tr>`;
    }).join('');
}
// Delete an item
async function deleteItem(endpoint, id) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
        const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            throw new Error('Failed to delete item');
        }

        fetchAndUpdateTable(endpoint, `${endpoint}-table`); // Refresh table
    } catch (error) {
        console.error(`Error deleting item from ${endpoint}:`, error);
    }
}

function handleMembersTable() {
    const form = document.getElementById('add-members-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            try {
                const response = await fetch(`${API_URL}/members`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Failed to add member');
                }

                form.reset();
                fetchAndUpdateTable('members', 'members-table');
            } catch (error) {
                console.error('Error adding member:', error);
            }
        });
    }

    fetchAndUpdateTable('members', 'members-table');
}

function handleCoordinatorsTable() {
    const form = document.getElementById('add-coordinators-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            try {
                const response = await fetch(`${API_URL}/coordinators`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Failed to add coordinator');
                }

                form.reset();
                fetchAndUpdateTable('coordinators', 'coordinators-table');
            } catch (error) {
                console.error('Error adding coordinator:', error);
            }
        });
    }

    fetchAndUpdateTable('coordinators', 'coordinators-table');
}

function handleContactsTable() {
    const form = document.getElementById('add-contacts-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            try {
                const response = await fetch(`${API_URL}/contacts`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Failed to add contact');
                }

                form.reset();
                fetchAndUpdateTable('contacts', 'contacts-table');
            } catch (error) {
                console.error('Error adding contact:', error);
            }
        });
    }

    fetchAndUpdateTable('contacts', 'contacts-table');
}

function handleUpcomingEventsTable() {
    const form = document.getElementById('add-events-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            try {
                const response = await fetch(`${API_URL}/upcomingEvents`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Failed to add event');
                }

                form.reset();
                fetchAndUpdateTable('upcomingEvents', 'upcomingEvents-table');
            } catch (error) {
                console.error('Error adding event:', error);
            }
        });
    }

    fetchAndUpdateTable('upcomingEvents', 'upcomingEvents-table');
}

function handleClubGamesTable() {
    const form = document.getElementById('add-games-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            try {
                const response = await fetch(`${API_URL}/clubGames`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Failed to add game');
                }

                form.reset();
                fetchAndUpdateTable('clubGames', 'clubGames-table');
            } catch (error) {
                console.error('Error adding game:', error);
            }
        });
    }

    fetchAndUpdateTable('clubGames', 'clubGames-table');
}

document.addEventListener('DOMContentLoaded', () => {
    handleMembersTable();
    handleCoordinatorsTable();
    handleContactsTable();
    handleUpcomingEventsTable();
    handleClubGamesTable();

    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });
    }
});