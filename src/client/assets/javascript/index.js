// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
let store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})

		getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		const { target } = event
		// console.log(target)
		// debugger

		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
		}

		// Podracer form field
		if (target.matches('.card.podracer')) {
			handleSelectPodRacer(target)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()
	
			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate()
		}

	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
	// render starting UI
	try {
		renderAt('#race', renderRaceStartView(store.track_id))
	} catch (ex) {
		console.error('Error rendering starting UI: ' + ex)
	}

	// TODO - Get player_id and track_id from the store
	player_id = store.player_id
	track_id = store.track_id
	let raceObj = {}

	// const race = TODO - invoke the API call to create the race, then save the result
	try {
		raceObj = await createRace(player_id, track_id)
	} catch (ex) {
		console.error('Error in create_race: ' + ex)
	}
	// TODO - update the store with the race id
	// For the API to work properly, the race id should be race id - 1
	store.race_id = raceObj.ID - 1
	
	// The race has been created, now start the countdown
	// TODO - call the async function runCountdown
	await runCountdown()
	// console.log('countdown done')

	// TODO - call the async function startRace
	try {
		const raceID = await startRace(store.race_id)
	} catch(ex) {
		console.error('Error in startRace: ' + ex)
	}

	// TODO - call the async function runRace
	try{
		const raceStatus = await runRace(store.race_id)
	} catch(ex) {
		console.error('Error in runRace: ' + ex)
	}
}

async function runRace (raceID) {
	let raceStatus = await getRace(raceID)
	return new Promise(resolve => {
		// TODO - use Javascript's built in setInterval method to get race info every 500ms
		try{
			const raceLoop = setInterval(async function () {
				raceStatus = await getRace(raceID)

				if (raceStatus.status === 'in-progress') {
					renderAt('#leaderBoard', raceProgress(raceStatus.positions))
				}
				else if (raceStatus.status === 'finished') {
					console.log('race ended')
					clearInterval(raceLoop)
					renderAt('#race', resultsView(raceStatus.positions))
					resolve(raceStatus)
				}
			}, 500, store.race_id)
		} catch {
			console.error('Error in raceLoop: ' + ex)
		}
		// TODO - if the race info status property is "in-progress", update the leaderboard by calling:
		// renderAt('#leaderBoard', raceProgress(res.positions))

		//	TODO - if the race info status property is "finished", run the following:

		//	clearInterval(raceInterval) // to stop the interval from repeating
		//	renderAt('#race', resultsView(res.positions)) // to render the results view
		//	resolve(res) // resolve the promise

	})
	// remember to add error handling for the Promise
}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(250)
		let timer = 4

		return new Promise(resolve => {
			// TODO - use Javascript's built in setInterval method to count down once per second
			const countInterval = setInterval(function() {
				document.getElementById('big-numbers').innerHTML = --timer
				if (timer === 0) {
					clearInterval(countInterval)
					resolve()
				}
			}, 1000)
			// setting timer to 1/4 second for testing

			// run this DOM manipulation to decrement the countdown for the user
			//document.getElementById('big-numbers').innerHTML = --timer

			// TODO - if the countdown is done, clear the interval, resolve the promise, and return

		})
	} catch(error) {
		console.log(error);
	}
}

function handleSelectPodRacer(target) {
	// console.log("selected a pod", target.id)

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// TODO - save the selected racer to the store (DONE)
	store.player_id = target.id
}

function handleSelectTrack(target) {
	// console.log("selected a track", target.id)

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// TODO - save the selected track id to the store
	store.track_id = target.id
	
}

function handleAccelerate() {
	console.debug("accelerate")
	accelerate(parseInt(store.race_id))
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer
	// update form.css
	// li h3   and     li p
	//
	// pointer-events: none;
	//
	// otherwise if you clicked the text it would not register the <li> but the <h> or <p>

	newName = ['Bert', 'Big Bird', 'Elmo', 'Ernie', 'Oscar']

	return `
		<li class="card podracer" id="${id}">
			<h3>${newName[id - 1]}</h3>
			<p>Speed: ${top_speed}</p>
			<p>Acceleration: ${acceleration}</p>
			<p>Handling: ${handling}</p>
		</li>
	`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')
	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name } = track
	// removed		<h3>${name}</h3>
	newNames = ['Sesame Gulch', 'Da Dump', 'Snufflegarden', 'Alleyway', 'Grouchytown', "Hooper's Store"]

	return `
		<li id="${id}" class="card track">
			<h4 id="${id}">${newNames[id - 1]}</h4>
		</li>
	`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
	return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown('')}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {
	// console.log(positions)
	let userPlayer = positions.find(e => e.id === parseInt(store.player_id))
	// console.log('userPlayer: ' + userPlayer)
	userPlayer.driver_name += " (you)"

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`
	})

	return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`
}

function renderAt(element, html) {
	// console.log('element: ' + element)
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints 

function getTracks() {
	// GET request to `${SERVER}/api/tracks`
	// NEW
	return fetch(`${SERVER}/api/tracks`, {
		method: 'GET',
		...defaultFetchOpts(),
	})
	.then(res => res.json())
	.catch(err => console.log("Problem with getTracks request::", err))
}

function getRacers() {
	// GET request to `${SERVER}/api/cars`
	// NEW
	return fetch(`${SERVER}/api/cars`, {
		method: 'GET',
		...defaultFetchOpts(),
	})
	.then(res => res.json())
	.catch(err => console.log("Problem with getRacers request::", err))
}

function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }
	
	return fetch(`${SERVER}/api/races`, {
		method: 'POST',
		...defaultFetchOpts(),
		dataType: 'jsonp',
		body: JSON.stringify(body)
	})
	.then(res => res.json())
	.catch(err => console.log("Problem with createRace request::", err))
}

function getRace(id) {
	// (NEW!!)
	// GET request to `${SERVER}/api/races/${id}`
	return fetch(`${SERVER}/api/races/${id}`, {
		method: 'GET',
		...defaultFetchOpts(),
	})
	.then(res => res.json())
	.catch(err => console.log("Problem with getRace request::", err))
}

function startRace(id) {
	// console.log(`fetching: ${SERVER}/api/races/${id}/start`)
	return fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
	.catch(err => console.log("Problem with startRace request::", err))
}

function accelerate(id) {
	// POST request to `${SERVER}/api/races/${id}/accelerate`
	// options parameter provided as defaultFetchOpts
	// no body or datatype needed for this request
	return fetch(`${SERVER}/api/races/${id}/accelerate`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
	.catch(err => console.log("Problem with accelerate request::", err))
}
