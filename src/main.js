const searchInput = document.getElementById("searchInput");
const showFavsBtn = document.getElementById("showFavs");
const home = document.querySelector(".home");
const results = document.getElementById("results");
let isFavoritesView = false;


const API_KEY = "7676cc6e804b48e8909d178e064fbc97"; //	RAWG API key (replace with your own if needed)
let lastGames = []; //	Store last search results for easy navigation back from details view

async function searchGames() {
	const query = searchInput.value.trim();
	console.log("searchGames running");

	if (!query) {
		isFavoritesView = false; //	Reset favorites view flag when performing a new search
		alert("Please enter a game name");
		return; //		If input is empty, show alert and exit function
	}

	home.classList.add("search-mode");

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

searchInput.addEventListener("keypress", (e) => { //	Detect Enter key press in search input to trigger search
	console.log("tecla:", e.key);

	if (e.key === "Enter") {
		console.log("ENTER detected");
		searchGames();
	}
});

function displayGames(games) { //	Display list of games in results section
	results.innerHTML = "";

	let html = "";

	games.forEach(game => { //	For each game, create a card with image, name, rating, release date, and a remove button if in favorites view
		html += `
      <div class="game-card" data-id="${game.id}">
        <img src="${game.background_image || 'https://via.placeholder.com/200'}" />
        <h3>${game.name}</h3>
        <p>⭐ ${game.rating}</p>
        <p>📅 ${game.released}</p>
								${isFavoritesView ? `<div class="remove-container">
      <button class="remove-btn" data-id="${game.id}">❌ Remove</button> 
      </div>` : ""}
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

	const removeButtons = document.querySelectorAll(".remove-btn");

	removeButtons.forEach(btn => {
		btn.addEventListener("click", (e) => {
			e.stopPropagation(); //	Prevent card click event when clicking remove button

			const id = btn.getAttribute("data-id");
			removeFromFavorites(id);
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

	const detail = document.getElementById("gameDetail");

	// Hide results and home sections when showing details
	results.style.display = "none";

	// Show details section and populate with game info and trailer
	detail.style.display = "flex";

	detail.innerHTML = `
    <div class="game-detail">
      <h2>${game.name}</h2>

      <img src="${game.background_image}" />

      <p><strong>Rating:</strong> ${game.rating}</p>
      <p><strong>Released:</strong> ${game.released}</p>

      <p>${game.description_raw?.slice(0, 300)}...</p>

      ${videoId
			? `<iframe width="100%" height="300" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`
			: "<p>No trailer found</p>"
		}

      <button id="favBtn">❤️ Add to Favorites</button>
      <button id="backBtn">⬅ Back</button>
    </div>
  `;

	document.getElementById("backBtn").addEventListener("click", () => {
		detail.innerHTML = "";
		detail.style.display = "none"; //	Hide details section
		results.style.display = "grid"; //	Show results section again
	});
	document.getElementById("favBtn").addEventListener("click", () => {
		addToFavorites(game); // Add to favorites function (to be implemented)
	});
}

showFavsBtn.addEventListener("click", showFavorites);

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
	const detail = document.getElementById("gameDetail");

	isFavoritesView = true; //	Set flag to indicate we are in favorites view

	detail.innerHTML = ""; //	Clear any existing details content
	detail.style.display = "none"; //	Hide details section if it was open
	results.style.display = "grid"; //	Show results section to display favorites

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

function removeFromFavorites(id) { //	Remove game from favorites by ID
	let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

	favorites = favorites.filter(game => game.id != id);

	localStorage.setItem("favorites", JSON.stringify(favorites));

	showFavorites(); // recargar vista
}