let currentSong = new Audio();
let playButton = document.getElementById("play");

async function getsongs() {
  try {
    let response = await fetch("http://127.0.0.1:3000/songs/");
    let htmlText = await response.text();
    let div = document.createElement("div");
    div.innerHTML = htmlText;

    let songs = [];
    let as = div.getElementsByTagName("a");
    for (let element of as) {
      if (element.href.endsWith(".mp3")) {
        let songPath = element.href.split("songs/")[1];
        songs.push(songPath);
      }
    }
    return songs;
  } catch (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
}

function playMusic(track) {
  currentSong.src = "/songs/" + track;
  currentSong.play();
  playButton.src = "pause.svg";
  document.querySelector(".songinfo").innerHTML=""
  document.querySelector(".songtimee").innerHTML=""
}

async function main() {
  let songs = await getsongs();
  if (!songs.length) {
    console.error("No songs found!");
    return;
  }

  let songUl = document.querySelector(".songList ul");
  songs.forEach(song => {
    songUl.innerHTML += `
      <li>
        <img class="invert" src="music.svg" alt="Music Icon" />
        <div class="info">
          <div>${song.replace(/%20/, " ")}</div>
          <div>Unknown Artist</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="play.svg" alt="Play Icon" />
        </div>
      </li>`;
  });

  // Add event listeners to list items
  Array.from(songUl.getElementsByTagName("li")).forEach((li, index) => {
    li.addEventListener("click", () => {
      playMusic(songs[index]);
    });
  });

  // Add play/pause functionality
  
  playButton.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      playButton.src = "pause.svg";
    } else {
      currentSong.pause();
      playButton.src = "play.svg";
    }
  });

  // Update seekbar and duration
  currentSong.addEventListener("timeupdate", () => {
    console.log(
      `Duration: ${currentSong.duration}, Current Time: ${currentSong.currentTime}`
    );
  });
}

main();
