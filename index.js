// DOM Elements & QuerySelector
const querySelector = (selector) => document.querySelector(selector);

const indexEl = {
	searchIn: querySelector('.search__input'),
	searchBtn: querySelector('.search__button'),
	movieDisplayEl: querySelector('.movies__display')
}

const watchlistEl = {
	display: querySelector('.watchlist__display')
}

const globalDisplay = querySelector('.main__display')

// Variables
const url = 'https://www.omdbapi.com/'
const key = 'YOURAPI :P';
let myWatchList = JSON.parse(localStorage.getItem('myWatchList')) || [];
const plusHtml = `
	<i class='movie-card__subheader-watchlist__button fa-solid fa-circle-plus'></i>
	<h3 class='movie-card__subheader-watchlist__title'>Watchlist</h3>`
const minusHtml = `
	<i class='movie-card__subheader-watchlist__button fa-solid fa-circle-minus'></i>
	<h3 class='movie-card__subheader-watchlist__title'>Remove</h3>`

// Asynchronous Functions
async function getMoviesImbdId() {
    try {
        const searchQuery = indexEl.searchIn.value;
        const res = await fetch(`${url}?apikey=${key}&s=${searchQuery}`);
        const data = await res.json();

        if (Array.isArray(data.Search)) {
            const idArray = data.Search.map((movie) => movie.imdbID);
            globalDisplay.innerHTML = '';
            idArray.forEach((id) => getMovieDetailsByID(id));
        } else {
            alert('Search failed, please try again.');
        }
    } catch (error) {
        console.log(error);
    }
}

async function getMovieDetailsByID(imbdID) {
    try {
        const res = await fetch(`${url}?apikey=${key}&i=${imbdID}`);
        const movieDetails = await res.json();
        const isInWatchlist = !myWatchList.includes(imbdID);
        const plusOrMinusHtml = isInWatchlist ? plusHtml : minusHtml;
        const faviconType = isInWatchlist ? 'plus' : 'minus';
        createMovieCardHtml(movieDetails, faviconType, plusOrMinusHtml);
    } catch (error) {
        alert('Error in getMovieDetailsByID:', error);
    }
}

// Function Declarations
function createMovieCardHtml(movie, faviconType, plusOrMinusHtml) {
    const html = `
		<div class='movie-card__container flex'>
			<img class='movie-card__img' src='${movie.Poster}'>
			<div class='movie-card__details'>
				<div class='movie-card__header flex'>
					<h1 class='movie-card__header-title'>${movie.Title}</h1>
					<h2 class='movie-card__header-ratings'>⭐ ${movie.imdbRating}</h2>
				</div>
				<div class='movie-card__subheader flex'>
					<h3 class='movie-card__subheader-runtime'>${movie.Runtime}</h3>
					<h3 class='movie-card__subheader-genre'>${movie.Genre}</h3>
					<div class='movie-card__subheader-watchlist type-${faviconType} flex' 
						data-id='${movie.imdbID}'>
						${plusOrMinusHtml}
					</div>
				</div>
				<p class='movie-card__plot'>${movie.Plot}</p>
			</div>
		</div>
		<hr>
	`;
    globalDisplay.innerHTML += html;
}

function watchlistAdd(movieId) {
    !myWatchList.includes(movieId) && myWatchList.push(movieId);
    localStorage.setItem('myWatchList', JSON.stringify(myWatchList));
}

function watchlistSubtrach(movieId) {
	myWatchList = myWatchList.filter(id => id !== movieId);
	localStorage.setItem('myWatchList', JSON.stringify(myWatchList))
	if (querySelector('.watchlist__display')) {
		globalDisplay.innerHTML = ''
		displayWatchlist()
	}

	if (watchlistEl.display && myWatchList.length == 0) {
		watchlistEl.display.innerHTML = `
			<div class="empty-watchlist__container">
				<h3 class="empty-watchlist__title">
					Your watchlist is looking a little empty...
				</h3>
				<div class="empty-watchlist__add flex">
					<h3><a href="./index.html">Let's add some movies!</a></h3>
				</div>
			</div>`
	}
	watchListDisplay
}

function watchlistChange(clickedEl) {
    const isMinus = clickedEl.classList.contains('type-minus');
    clickedEl.classList.toggle('type-minus', !isMinus);
    clickedEl.classList.toggle('type-plus', isMinus);
    clickedEl.innerHTML = isMinus?plusHtml:minusHtml;
}

function displayWatchlist() {
	myWatchList.forEach(item => {
		getMovieDetailsByID(item)
	})
}

function watchListDisplay() {
	if (watchlistEl.display && myWatchList.length > 0) {
		watchlistEl.display.innerHTML = '';
		displayWatchlist();
	} else if (watchlistEl.display && myWatchList.length == 0) {
		watchlistEl.display.innerHTML = `
			<div class="empty-watchlist__container">
				<h3 class="empty-watchlist__title">
					Your watchlist is looking a little empty...
				</h3>
				<div class="empty-watchlist__add flex">
					<h3><a href="./index.html">Let's add some movies!</a></h3>
				</div>
			</div>`
	}
}

// Event Listeners
querySelector('.search__button')?.addEventListener('click', getMoviesImbdId);
querySelector('.search__input')?.addEventListener('keydown', e => e.key === 'Enter' && getMoviesImbdId());
document.addEventListener('DOMContentLoaded',watchListDisplay)
document.addEventListener('click', function(e) {
    const parentEl = e.target.parentElement;
    const dataId = parentEl.getAttribute('data-id');
    if (parentEl.classList.contains('type-plus')) watchlistAdd(dataId)
    if (parentEl.classList.contains('type-minus')) watchlistSubtrach(dataId)
	if (parentEl.classList.contains('movie-card__subheader-watchlist') && querySelector('.index')) watchlistChange(parentEl)
});