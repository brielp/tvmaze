// based on a query input, request shows from TV api
async function searchShows(query) {
	const res = await axios.get('https://api.tvmaze.com/search/shows', { params: { q: query } });

	const shows = res.data.reduce((accum, next, i) => {
		accum.push({
			id      : next.show.id,
			name    : next.show.name,
			summary : next.show.summary,
			image   : next.show.image ? next.show.image.medium : 'https://tinyurl.com/tv-missing'
		});
		return accum;
	}, []);

	return shows;
}

/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */
function populateShows(shows) {
	const $showsList = $('#shows-list');
	$showsList.empty();

	for (let show of shows) {
		let $item = $(
			`<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
         <div class="card" data-show-id="${show.id}">
          <img class="card-img-top" src="${show.image}">
           <div class="card-body">
             <h5 class="card-title">${show.name}</h5>
             <p class="card-text">${show.summary}</p>
             <button class="btn btn-primary" id="episodes">Episodes</button>
           </div>
         </div>
       </div>
      `
		);

		$showsList.append($item);
	}
}

/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$('#search-form').on('submit', async function handleSearch(evt) {
	evt.preventDefault();

	let query = $('#search-query').val();
	if (!query) return;

	$('#episodes-area').hide();

	let shows = await searchShows(query);

	populateShows(shows);
});

/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */

async function getEpisodes(id) {
	const episodes = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);

	const episodeArr = episodes.data.reduce((accum, next) => {
		accum.push({
			id     : next.id,
			name   : next.name,
			season : next.season,
			number : next.number
		});
		return accum;
	}, []);

	return episodeArr;
}

// append episodes to the episodes section
function populateEpisodes(episodes) {
	const $episodesList = $('#episodes-list');
	$episodesList.empty();

	for (let episode of episodes) {
		let item = `<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>`;
		$episodesList.append(item);
	}

	$('#episodes-area').show();
}

// Listen for a click on the Episodes button
$('#shows-list').on('click', '#episodes', async function handleEpisodeClick(e) {
	let id = e.target.closest('.card').dataset.showId;
	let arr = await getEpisodes(id);
	populateEpisodes(arr);
});
