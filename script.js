const songsDiv = document.getElementById("songs");
const audio = document.getElementById("audio");
const cover = document.getElementById("cover");
const title = document.getElementById("title");
const artist = document.getElementById("artist");
const playBtn = document.getElementById("playBtn");
const searchInput = document.getElementById("searchInput");
const lyricsPanel = document.getElementById("lyricsPanel");
const lyricsContent = document.getElementById("lyricsContent");
const bgLayer = document.getElementById("bg-layer");

// Hero Elements
const heroImg = document.getElementById("hero-img");
const heroTitle = document.getElementById("hero-title");

let isPlaying = false;
let heroTrack = null;

window.onload = () => {
  loadHero("The Weeknd");
  fetchSongs("Top Hits");
};

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    fetchSongs(searchInput.value);
    loadHero(searchInput.value); // Update hero contextually?
  }
});

function focusSearch() { searchInput.focus(); }
function showHome() {
  loadHero("The Weeknd");
  fetchSongs("Top Hits");
}
function toggleLyrics() { lyricsPanel.classList.toggle("collapsed"); }

// HERO LOGIC
async function loadHero(query) {
  // Fetch one item for hero
  const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=1&media=music&entity=song`);
  const data = await res.json();
  if (data.results.length > 0) {
    const song = data.results[0];
    heroTrack = song;
    heroTitle.innerText = song.artistName;
    // Use high res artwork
    const art = song.artworkUrl100.replace('100x100bb', '1000x1000bb');
    heroImg.src = art;
    updateBackground(art);
  }
}

function playHero() {
  if (heroTrack) {
    const art = heroTrack.artworkUrl100.replace('100x100bb', '600x600bb');
    playSong(heroTrack, art);
  }
}


// SONG GRID
async function fetchSongs(query) {
  songsDiv.innerHTML = "Loading...";
  const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=20&media=music&entity=song`);
  const data = await res.json();
  songsDiv.innerHTML = "";

  data.results.forEach((song, i) => {
    if (!song.previewUrl) return;
    const art = song.artworkUrl100.replace('100x100bb', '600x600bb');

    const card = document.createElement("div");
    card.className = "card";
    card.style.animation = `fadeIn 0.5s ease backwards ${i * 0.05}s`;

    card.innerHTML = `
         <div class="card-img-wrapper">
           <img src="${art}" loading="lazy">
           <div class="play-btn"><i class="fa-solid fa-play"></i></div>
         </div>
         <h4>${song.trackName}</h4>
         <p>${song.artistName}</p>
        `;
    card.onclick = () => playSong(song, art);
    songsDiv.appendChild(card);
  });
}

function updateBackground(url) {
  bgLayer.style.backgroundImage = `radial-gradient(circle at 50% 50%, rgba(0,0,0,0.6), #000), url(${url})`;
  bgLayer.style.backgroundSize = "cover";
  bgLayer.style.filter = "blur(60px) brightness(0.5)";
}

// PLAYER & LYRICS
function playSong(song, artUrl) {
  audio.src = song.previewUrl;
  audio.play();
  isPlaying = true;
  updatePlayBtnIcon();

  cover.src = artUrl;
  title.innerText = song.trackName;
  artist.innerText = song.artistName;
  updateBackground(artUrl);

  fetchLyrics(song.artistName, song.trackName);
  lyricsPanel.classList.remove("collapsed");
}

function togglePlay() {
  if (!audio.src) return;
  if (audio.paused) {
    audio.play();
    isPlaying = true;
  } else {
    audio.pause();
    isPlaying = false;
  }
  updatePlayBtnIcon();
}

function updatePlayBtnIcon() {
  playBtn.innerHTML = isPlaying ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
}

async function fetchLyrics(artistName, songTitle) {
  lyricsContent.innerText = "Finding lyrics...";
  try {
    let url = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artistName)}&track_name=${encodeURIComponent(songTitle)}`;
    let res = await fetch(url);
    if (!res.ok) {
      const cleanArtist = artistName.split(/[&,]/)[0].trim();
      const cleanTitle = songTitle.replace(/\(.*\)/g, "").replace(/\[.*\]/g, "").split('-')[0].trim();
      url = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(cleanArtist)}&track_name=${encodeURIComponent(cleanTitle)}`;
      res = await fetch(url);
    }
    const data = await res.json();

    if (data.plainLyrics) lyricsContent.innerText = data.plainLyrics;
    else if (data.syncedLyrics) lyricsContent.innerText = data.syncedLyrics.replace(/\[.*?\]/g, "");
    else lyricsContent.innerText = "No lyrics available.";
  } catch (e) {
    lyricsContent.innerText = "Lyrics not found.";
  }
}
