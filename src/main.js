const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const results = document.getElementById("results");
const showFavsBtn = document.getElementById("showFavs");

const API_KEY = "7676cc6e804b48e8909d178e064fbc97"; //	RAWG API key (replace with your own if needed)
let lastGames = []; //	Store last search results for easy navigation back from details view

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
		lastGames = data.results;
		displayGames(lastGames);
	} catch (error) {
		console.error("Error:", error);
	}
}

searchBtn.addEventListener("click", searchGames); //	Search on button click
showFavsBtn.addEventListener("click", showFavorites); //	Show favorites on button click

searchInput.addEventListener("keypress", (e) => {
	if (e.key === "Enter") {
		searchGames();
	}
});

function displayGames(games) { //	Display list of games in results section
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

async function showGameDetails(game) { // Display detailed info about the game
	const videoId = await getTrailer(game.name); //	Get YouTube trailer ID for the game

	results.innerHTML = ` 
    <div class="game-detail"> 
      <h2>${game.name}</h2>
      <img src="${game.background_image}" />
      <p><strong>Rating:</strong> ${game.rating}</p>
      <p><strong>Released:</strong> ${game.released}</p>
      <p>${game.description_raw?.slice(0, 300)}...</p>

						${videoId  //	If trailer found, embed it; otherwise show message
			? `<iframe width="100%" height="300" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`
			: "<p>No trailer found</p>"
		}

						<button id="favBtn">❤️ Add to Favorites</button>
      <button id="backBtn">⬅ Back</button>
    </div>
  `;

	document.getElementById("backBtn").addEventListener("click", () => {
		displayGames(lastGames); //come back to the last search results
	});
	document.getElementById("favBtn").addEventListener("click", () => {
		addToFavorites(game); // Add to favorites function (to be implemented)
	});
}

function addToFavorites(game) {
	let favorites = JSON.parse(localStorage.getItem("favorites")) || []; //	Get existing favorites or initialize empty array

	const exists = favorites.some(fav => fav.id === game.id); //	Check if game is already in favorites
	if (!exists) {  //	If not, add to favorites
		favorites.push(game); //	Update localStorage
		localStorage.setItem("favorites", JSON.stringify(favorites));
		alert("Added to favorites ❤️"); //		Provide feedback to user
	} else {
		alert("Already in favorites"); //		If already in favorites, inform user
	}
}

function showFavorites() {
	const favorites = JSON.parse(localStorage.getItem("favorites")) || []; //	Get favorites from localStorage

	if (favorites.length === 0) { //	If no favorites, show message
		results.innerHTML = "<p>No favorites yet</p>";
		return; // Exit function if no favorites
	}
	displayGames(favorites); //	Display favorites using the same function as search results
}

async function getTrailer(gameName) {
	const YOUTUBE_KEY = "AIzaSyC5TqTqZ3huUbDHZgPybQwxN_yXj0NS5FE"; //	YouTube API key (replace with your own if needed)

	const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${gameName} trailer&type=video&key=${YOUTUBE_KEY}`;

	try {
		const response = await fetch(url);
		const data = await response.json();

		return data.items[0]?.id?.videoId;
	} catch (error) {
		console.error("Error:", error);
	}
}