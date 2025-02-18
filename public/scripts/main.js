document.addEventListener("DOMContentLoaded", async () => {
    async function fetchData(endpoint, elementId) {
        try {
            const response = await fetch(`/api/${endpoint}`);
            const data = await response.json();
            document.getElementById(elementId).innerHTML = 
                data.map(item => `<li>${item.title || item.name}</li>`).join("");
        } catch (error) {
            console.error(`Failed to load ${endpoint}`, error);
        }
    }

    fetchData("members", "members-list");
    fetchData("events", "events-list");
    fetchData("games", "games-list");
    fetchData("clubinfo", "contact-info");
});