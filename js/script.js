document.addEventListener("DOMContentLoaded", () => {
    main();
});

class MusicPlayer {
    constructor() {
        this.currentSong = new Audio();
        this.songs = [];
        this.currFolder = '';
        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById("play").addEventListener("click", () => {
            if (this.currentSong.paused) {
                this.currentSong.play();
                document.getElementById("play").src = "pause.svg";
            } else {
                this.currentSong.pause();
                document.getElementById("play").src = "play.svg";
            }
        });

        this.currentSong.addEventListener("timeupdate", () => {
            document.querySelector(".songtime").innerHTML = `${this.secondsToMinutesSeconds(this.currentSong.currentTime)} / ${this.secondsToMinutesSeconds(this.currentSong.duration)}`;
            document.querySelector(".circle").style.left = (this.currentSong.currentTime / this.currentSong.duration) * 100 + "%";
        });

        document.querySelector(".seekbar").addEventListener("click", (e) => {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
            document.querySelector(".circle").style.left = percent + "%";
            this.currentSong.currentTime = (percent / 100) * this.currentSong.duration;
        });
    }

    secondsToMinutesSeconds(seconds) {
        if (isNaN(seconds) || seconds < 0) {
            return "00:00";
        }

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');

        return `${formattedMinutes}:${formattedSeconds}`;
    }

    async getSongs(folder) {
        this.currFolder = folder;
        console.log(`/${folder}/`);
        let response = await fetch(folder).then(res => res.text());
        let div = document.createElement("div");
        div.innerHTML = response;
        let as = div.getElementsByTagName("a");

        this.songs = Array.from(as).filter(element => element.href.endsWith(".mp3")).map(element => element.href.split(`/${folder}/`)[1]);

        this.displaySongs();
        this.attachSongListeners();

        return this.songs;
    }

    displaySongs() {
        let songUL = document.querySelector(".songList ul");
        songUL.innerHTML = this.songs.map(song => `
            <li>
                <img class="invert" width="34" src="img/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>Harry</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>`
        ).join('');
    }

    attachSongListeners() {
        Array.from(document.querySelectorAll(".songList li")).forEach(e => {
            e.addEventListener("click", () => {
                this.playMusic(e.querySelector(".info").firstElementChild.textContent.trim());
            });
        });
    }

    playMusic(track, pause = false) {
        console.log("Track:", track);
        console.log("Current Folder:", this.currFolder);
        this.currentSong.src = `/${this.currFolder}/` + track;
        console.log("Current Song Source:", this.currentSong.src);
        if (!pause) {
            this.currentSong.play();
            document.getElementById("play").src = "pause.svg";
        }
        document.querySelector(".songinfo").textContent = decodeURI(track);
        document.querySelector(".songtime").textContent = "00:00 / 00:00";
    }

    async displayAlbums() {
        console.log("displaying albums");
        let response = await fetch("/songs/").then(res => res.text());
        let div = document.createElement("div");
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a");
        let cardContainer = document.querySelector(".cardContainer");

        Array.from(anchors).filter(e => e.href.includes("/songs") && !e.href.includes(".htaccess")).forEach(async e => {
            let folder = e.href.split("/").slice(-2)[0];
            let response = await fetch(`/songs/${folder}/info.json`).then(res => res.json());
            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`;
        });

        this.attachAlbumListeners();
    }

    attachAlbumListeners() {
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async (item) => {
                console.log("Fetching Songs");
                this.songs = await this.getSongs(`songs/${item.currentTarget.dataset.folder}`);
                this.playMusic(this.songs[0]);
            });
        });
    }
}

async function main() {
    const musicPlayer = new MusicPlayer();
    await musicPlayer.getSongs("/songs/fav");
    musicPlayer.playMusic(musicPlayer.songs[0], true);
    await musicPlayer.displayAlbums();
}
