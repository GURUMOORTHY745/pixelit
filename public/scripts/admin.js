const API_URL = 'https://pixelit.onrender.com/api';
const token = localStorage.getItem('token');

// Redirect to login if token is missing
if (!token) {
    window.location.href = 'index.html';
}
// Fetch and update a specific table
function updateTable(tableId, items, endpoint) {
    const tableElement = document.getElementById(tableId);
    if (!tableElement) {
        console.error(`Table with ID '${tableId}' not found.`);
        return;
    }

    const tableBody = tableElement.querySelector("tbody");
    tableBody.innerHTML = ""; // Clear previous rows

    if (items.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="100%">No data available</td></tr>`;
        return;
    }

    items.forEach((item, index) => {
        const { _id, photo, media, link, ...fields } = item;

        const row = document.createElement("tr");

        // Index Column
        const indexCell = document.createElement("td");
        indexCell.textContent = index + 1;
        row.appendChild(indexCell);

        // Data Fields
        Object.entries(fields).forEach(([key, value]) => {
            const cell = document.createElement("td");
            cell.textContent = value || "-";
            row.appendChild(cell);
        });

        // Photo Cell
        if (photo) {
            const photoCell = document.createElement("td");
            const img = document.createElement("img");
            img.src = photo;
            img.width = 50;
            img.height = 50;
            photoCell.appendChild(img);
            row.appendChild(photoCell);
        }

        // Media Cell
        if (media) {
            const mediaCell = document.createElement("td");
            const video = document.createElement("video");
            video.width = 80;
            video.height = 80;
            video.controls = true;
            const source = document.createElement("source");
            source.src = media;
            source.type = "video/mp4";
            video.appendChild(source);
            mediaCell.appendChild(video);
            row.appendChild(mediaCell);
        }

        // Play Link Cell (for clubGames only)
        if (endpoint === "clubGames" && link) {
            const linkCell = document.createElement("td");
            const anchor = document.createElement("a");
            anchor.href = link;
            anchor.textContent = "Play Now";
            anchor.target = "_blank";
            linkCell.appendChild(anchor);
            row.appendChild(linkCell);
        }

        // Actions Cell
        const actionsCell = document.createElement("td");

        // Edit Button
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.style.marginRight = "5px";
        editButton.onclick = () => editItem(endpoint, _id, item); // Call edit function
        actionsCell.appendChild(editButton);

        // Delete Button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => deleteItem(endpoint, _id);
        actionsCell.appendChild(deleteButton);

        row.appendChild(actionsCell);
        tableBody.appendChild(row);
    });
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
