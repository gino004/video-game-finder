const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const results = document.getElementById("results");

const API_KEY = "7676cc6e804b48e8909d178e064fbc97";

async function searchGames() {
	const query = searchInput.value.trim();

	if (!query) {
		alert("Please enter a game name");
		return;
	}

	const url = `https://api.rawg.io/api/games?key=${API_KEY}&search=${query}`;

	try {
		const response = await fetch(url);
		const data = await response.json();

		displayGames(data.results);
	} catch (error) {
		console.error("Error:", error);
	}
}

searchBtn.addEventListener("click", searchGames);

searchInput.addEventListener("keypress", (e) => {
	if (e.key === "Enter") {
		searchGames();
	}
});

function displayGames(games) {
	results.innerHTML = "";

	let html = "";

	games.forEach(game => {
		html += `
      <div class="game-card" data-id="${game.id}">
        <img src="${game.background_image || 'https://via.placeholder.com/200'}" />
        <h3>${game.name}</h3>
        <p>⭐ ${game.rating}</p>
        <p>📅 ${game.released}</p>
      </div>
    `;
	});

	results.innerHTML = html;

	const cards = document.querySelectorAll(".game-card");

	cards.forEach(card => {
		card.addEventListener("click", () => {
			const gameId = card.getAttribute("data-id");
			getGameDetails(gameId);
		});
	});
}

async function getGameDetails(id) {
	const url = `https://api.rawg.io/api/games/${id}?key=${API_KEY}`;

	try {
		const response = await fetch(url);
		const game = await response.json();

		showGameDetails(game);
	} catch (error) {
		console.error("Error:", error);
	}
}

function showGameDetails(game) {
	results.innerHTML = `
    <div class="game-detail">
      <h2>${game.name}</h2>
      <img src="${game.background_image}" />
      <p><strong>Rating:</strong> ${game.rating}</p>
      <p><strong>Released:</strong> ${game.released}</p>
      <p>${game.description_raw?.slice(0, 300)}...</p>

      <button id="backBtn">⬅ Back</button>
    </div>
  `;

	document.getElementById("backBtn").addEventListener("click", () => {
		results.innerHTML = "";
	});
}
