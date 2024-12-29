let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(playlist) {
    currFolder = playlist;
    const playlistPath = `songs/${playlist}/songs/`;
    const response = await fetch(`songs/${playlist}/info.json`);
    const playlistInfo = await response.json();

    songs = playlistInfo.songs; // Assuming `songs` is an array in the JSON

    // Show all the songs in the playlist
    const songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li>
                                <img class="invert" width="34" src="img/music.svg" alt="">
                                <div class="info">
                                    <div>${song.replaceAll("%20", " ")}</div>
                                    <div>${playlistInfo.artist || "Unknown Artist"}</div>
                                </div>
                                <div class="playnow">
                                    <span>Play Now</span>
                                    <img class="invert" src="img/play.svg" alt="">
                                </div>
                            </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelectorAll(".songList li")).forEach((e, index) => {
        e.addEventListener("click", () => {
            playMusic(`${playlistPath}${songs[index]}`);
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track.split("/").pop());
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    const response = await fetch("songs/");
    const albumsHTML = await response.text();
    const div = document.createElement("div");
    div.innerHTML = albumsHTML;
    const playlists = Array.from(div.getElementsByTagName("a"));

    const cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    for (const playlist of playlists) {
        if (playlist.href.includes("/songs/") && !playlist.href.includes(".htaccess")) {
            const folder = playlist.href.split("/").slice(-2)[0];
            const infoResponse = await fetch(`songs/${folder}/info.json`);
            const info = await infoResponse.json();

            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                            stroke-linejoin="round" />
                    </svg>
                </div>
                <img src="songs/${folder}/cover.jpg" alt="">
                <h2>${info.title}</h2>
                <p>${info.description}</p>
            </div>`;
        }
    }

    // Load the playlist whenever a card is clicked
    Array.from(document.querySelectorAll(".card")).forEach((card) => {
        card.addEventListener("click", async () => {
            songs = await getSongs(card.dataset.folder);
            playMusic(`songs/${card.dataset.folder}/songs/${songs[0]}`);
        });
    });
}

async function main() {
    // Display all the albums on the page
    await displayAlbums();

    // Attach event listeners for playback controls
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
    });

    // Add event listener for the seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = `${percent}%`;
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });
}

main();
