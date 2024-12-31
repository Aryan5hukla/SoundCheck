let currFolder ;
let currentSong = new Audio ;
let songs ;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(1, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

function updateArtist() {
    let namecard = currentSong.src.replaceAll("%20"," ").replace(".mp3","").replaceAll("X","·").split("/").slice(-1)[0]
    // console.log(namecard.split("-")[0])
    // console.log(namecard.split("-")[1])
    document.querySelector("#theSong").innerHTML = `${namecard.split("-")[0]}`
    document.querySelector("#ArtistName").innerHTML = `${namecard.split("-")[1]}`
}
async function getSongs(folder) {

    currFolder = folder
    let a = await fetch(`/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response ;
    // console.log(response)
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.replace(/\\/g ,"/").endsWith(".mp3")){
            // console.log(element.href.split(`/${folder}/`)[1])
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // Extract all the song from the playlist folder and displaying properly
    // to populate songs in playlist
    let SongUl = document.querySelector(".playlist")
    SongUl.innerHTML = ""
    for (const song of songs) {
        let daudio = new Audio
        daudio.src = `/${currFolder}/` + song
        // console.log(totalDuration)

        // Wait for the metadata to load
        const totalDuration = await new Promise((resolve) => {
            daudio.addEventListener("loadedmetadata", () => {
                resolve(secondsToMinutesSeconds(daudio.duration));
            });
        });
        SongUl.innerHTML = SongUl.innerHTML +   `
                                                    <div class="song">
                                                        <ul class="Name">
                                                            <li id="song-add">${song.replaceAll("%20"," ").replace(".mp3","").split("-")[0]}</li> 
                                                            <li class="timing">${totalDuration}</li>
                                                        </ul>
                                                        <div class="Artist">${song.replaceAll("%20"," ").replace(".mp3","").split("-")[1].replaceAll("X","·")}</div>
                                                    </div>
                                                `
    }

    //attach a event listener to each song


    Array.from(document.querySelectorAll(".song")).forEach( e=> {

        let display = document.querySelector(".displaycard")
        // let link = e.querySelector("#song-add").innerHTML
        let songName = e.querySelector("#song-add").innerHTML
        let artist = e.querySelector(".Artist").innerHTML
        let link = songName + "-" + artist
        link = link.replaceAll(" ","%20").replaceAll("·","X") + ".mp3"
        // console.log(artist);
        e.addEventListener("click" , element => {
            playMusic(link)
            play.src = "/image/pause.svg"
            display.querySelector(".Name").innerHTML = songName
            display.querySelector(".Artist").innerHTML = artist

        })
    })
    return songs
}

async function displayAlbums() {
    let a = await fetch(`/playlist/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response ;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".main")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/playlist") && !e.href.includes(".htaccess")){
            let folder = e.href.split("/").slice(-2)[0]
            //metadata of folder
            let a = await fetch(`/playlist/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                <div class="img">
                    <img width="200px" src="/playlist/${folder}/cover.png" alt="MyMix2024">
                </div>
                <div class="txt"><p>${response.title}</p></div>
            </div>`
        }
    }

    //load songs from the playlist
    // adding event listener to cards 
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item =>{
            // console.log(item.currentTarget.dataset)
            songs = await getSongs(`playlist/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
            updateArtist()
            play.src = "/image/pause.svg" 
            document.querySelector(".side-bar").style.left = "0.5%"
        })
    })
}

const playMusic = (track , pause = false) => {
    // let audio = new Audio("/Playlist/" + track)
    currentSong.src = `/${currFolder}/` + track
    if (!pause){
        currentSong.play()
    }
    updateSongHighlight()
    PlayLoop()
    updateArtist()
}

function PlayLoop() {
    
    currentSong.addEventListener("timeupdate",()=> {
        
        // console.log(currentSong.duration)
        // console.log(currentSong.currentTime)
        if (currentSong.currentTime >= currentSong.duration - 0.1) {
            // console.log("Song ended");
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
            // Play the next song if within bounds
            if (index >= 0 && index < songs.length - 1) {
                playMusic(songs[index + 1]);
            } 
            // else {
            //     console.log("End of playlist or invalid index");
            // }
        }
    })
    
}

function updateSongHighlight() {
    // Get the current song name from the src
    let currentSongName = currentSong.src.split("/").slice(-1)[0]
        .replaceAll("%20", " ")
        .replace(".mp3", "");

    // Get all song elements
    const songElements = document.querySelectorAll(".song");

    // Loop through each song element
    songElements.forEach((element) => {
        // Get song name and artist from the element
        const songName = element.querySelector("#song-add").innerHTML;
        const artist = element.querySelector(".Artist").innerHTML.replaceAll("·","X");
        const fullSongName = `${songName}-${artist}`;
        // Compare with current playing song
        if (currentSongName === fullSongName) {
            element.classList.add("bg");
        } else {
            element.classList.remove("bg");
        }
    });
}

async function main() {
    
    await getSongs("playlist/MyMix2024")
    playMusic(songs[0] , true)
    

    //Displaying all the folder in the playlist
    displayAlbums()
    
    // adding event listener to play pause and previous
    play.addEventListener("click" , ()=> {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "/Image/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "/Image/play.svg"
        }
    })
    
    currentSong.addEventListener("timeupdate", ()=> {
        // console.log(currentSong.currentTime , currentSong.duration)
        document.querySelector(".current-time").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}`
        document.querySelector(".end-time").innerHTML = `${secondsToMinutesSeconds(currentSong.duration)}`

        document.querySelector(".knob").style.left = (((currentSong.currentTime / currentSong.duration)*100)-1) + "%"
        document.querySelector(".fill").style.width = (currentSong.currentTime / currentSong.duration)*100 + "%"
    })

    //add event listener in seekbar 
    document.querySelector(".seekbar").addEventListener("click",e => {
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100 ;
        document.querySelector(".knob").style.left = percent + "%"
        document.querySelector(".fill").style.width = percent + "%"
        currentSong.currentTime = ((currentSong.duration)*percent)/100
    })

    //Event listener for hamburger 
    document.querySelector(".ham").addEventListener("click" , () => {
        document.querySelector(".side-bar").style.left = "0.5%"
    })
    // document.querySelector(".ham").addEventListener("touchstart" , () => {
    //     document.querySelector(".side-bar").style.left = "0"
    // })

    //Event listener to search bar
    document.querySelector(".search").addEventListener("click" , () => {
        document.querySelector(".search").style.left = "20%"
    })

    //Event listener to close.svg for closeing ham
    document.querySelector(".close").addEventListener("click" , () => {
        document.querySelector(".side-bar").style.left = "-150%"
    })

    //Event listener to previous and next  
    previous.addEventListener("click" , ()=> {
        console.log("previous clicked ")
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index-1) >= 0){
            playMusic(songs[index - 1])
            updateArtist()
        }
        if (currentSong.paused) {
            play.src = "/Image/play.svg"
        }
        else {
            play.src = "/Image/pause.svg"
        }
    })
    next.addEventListener("click" , ()=> {
        currentSong.pause()
        // console.log(currentSong.src.split("/").slice(-1))
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index+1) < songs.length){
            playMusic(songs[index + 1])
            updateArtist()
        }
        if (currentSong.paused) {
            play.src = "/Image/play.svg"
        }
        else {
            play.src = "/Image/pause.svg"
        }
    })
    
    // adding event listener to volume tag 
    // document.querySelector(".volimg").addEventListener("click", () => {
    //     const rangeInput = document.querySelector(".range");
    //     if (rangeInput.style.display == "none") {
    //         rangeInput.style.display = "block";
    //     } else {
    //         rangeInput.style.display = "none";
    //     }
    // });
    
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change" , (e) => {
        // console.log(e)
        console.log("setting volume to ",e.target.value)
        currentSong.volume = parseInt(e.target.value)/100
    })
   
    document.querySelector(".volimg").addEventListener("click" , (e)=> {
        console.log(e.target.src)
        if(e.target.src.includes("volume.svg")){
            //strings are immutable
            e.target.src = e.target.src.replace("volume" , "mute")
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else {
            e.target.src = e.target.src.replace("mute","volume")
            currentSong.volume = 0.5
            document.querySelector(".range").getElementsByTagName("input")[0].value = 50
        }
    })
    
    // adding event listener to spacebar
    document.addEventListener("keydown", function(event) {
        if (event.key === " " || event.keyCode === 32) {  // Spacebar key
            console.log("Spacebar pressed");
            // Add your custom logic here (e.g., play/pause music)
            if (currentSong.paused) {
                currentSong.play()
                play.src = "/Image/pause.svg"
            }
            else {
                currentSong.pause()
                play.src = "/Image/play.svg"
            }
        }
    });
    
}

main()