function renderItem(title, artist, id, duration) {
  return `<div class="song-list-item">
                  <img src='https://i3.ytimg.com/vi/${id}/mqdefault.jpg' alt="thumbnail" class="thumbnail" loading="lazy">
                  <div class="song-info">
                    <div class="song-name">
                      <h3>${title}</h3>
                      <p>${artist}</p>
                    </div>
                    <div class="song-duration">
                      <button onclick="changePosUp(this)" class="cursorup">
                        <svg width="32px" height="32px" viewBox="0 0 490 490" xmlns="http://www.w3.org/2000/svg">
                          <use xlink:href="#upsvg"></use>
                        </svg>
                      </button>
                      <button onclick="changePosDown(this)" class="cursordown">
                        <svg width="32px" height="32px" viewBox="0 0 490 490" xmlns="http://www.w3.org/2000/svg">
                          <use xlink:href="#downsvg"></use>
                        </svg>
                      </button>
                      <button onclick="deleteSong(this)" class="cursordel">
                        <svg width="32px" height="32px" xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 30 30">
                          <use xlink:href="#deletesvg"></use>
                        </svg>
                      </button>
                      <span>${duration}</span>
                    </div>
                  </div>
                </div>`
}

function renderItemToSwap(title, artist, image, duration) {
  return `
                  <img src='${image}' class="thumbnail" alt="thumbnail" loading="lazy">
                  <div class="song-info">
                    <div class="song-name">
                      <h3>${title}</h3>
                      <p>${artist}</p>
                    </div>
                    <div class="song-duration">
                      <button onclick="changePosUp(this)" class="cursorup">
                        <svg width="32px" height="32px" viewBox="0 0 490 490" xmlns="http://www.w3.org/2000/svg">
                          <use xlink:href="#upsvg"></use>
                        </svg>
                      </button>
                      <button onclick="changePosDown(this)" class="cursordown">
                        <svg width="32px" height="32px" viewBox="0 0 490 490" xmlns="http://www.w3.org/2000/svg">
                          <use xlink:href="#downsvg"></use>
                        </svg>
                      </button>
                      <button onclick="deleteSong(this)" class="cursordel">
                        <svg width="32px" height="32px" xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 30 30">
                          <use xlink:href="#deletesvg"></use>
                        </svg>
                      </button>
                      <span>${duration}</span>
                    </div>
                  </div>
                `
}

const apiKeyList = ["AIzaSyAvPUsjjqCxjx9ZlIZh-EcdiBAFbJOeoO0", "AIzaSyAKkNJJh2kbSgl31RObQuuEaS_6oRzT30Q", "AIzaSyB56E3cgBh0TMpNi5WQJT9AMFtChFIeEIo"];
var apiKey = apiKeyList[0];
var listVid = [];
var player;

// var bg = document.getElementsByClassName('bg')[0];
var musicPlayer = $('.player');
var prev = $('.prev-button');
var next = $('.next-button');
var repeat = $('.loop');
var form = document.getElementsByClassName('form')[0];
var newPlaylistId = document.getElementsByClassName('input')[0];
var ok = document.getElementsByClassName('ok')[0];
var body = document.getElementsByTagName('body')[0];

var tag = document.createElement('script');
var btn = $('.play-button');
var btn2 = document.getElementById('btn2');
var icon = document.getElementById('icon');
var icon2 = document.getElementById('icon2');
var para = document.getElementById('title');

var posVid;
var loopStatus = 0;
var shuffleStatus = false;

//Request Playlist Item
const getPlayListItems = async playlistID => {
  var token;
  var resultArr = [];
  const result = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
    params: {
      part: 'snippet',
      maxResults: 50,
      playlistId: playlistID,
      key: apiKey
    }
  })
  //Get NextPage Token
  token = result.data.nextPageToken;
  resultArr.push(result.data);
  while (token) {
    let result = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
      params: {
        part: 'snippet',
        maxResults: 50,
        playlistId: playlistID,
        key: apiKey,
        pageToken: token
      }
    })
    token = result.data.nextPageToken;
    resultArr.push(result.data);
  }
  // console.log(resultArr.items);
  return resultArr;
};


const getVideosItems = async ID => {
  var resultArr = [];
  let a = ID;
  while (a.length) {
    let listToReq = a.splice(0, 50)
    const result = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
      params: {
        part: 'contentDetails,snippet',
        id: listToReq.toString(),
        key: apiKey
      }
    })
    result.data.items.forEach(item =>
      resultArr.push(item)
    )
  }
  return resultArr;
};

const getVideoItems = async ID => {
  const result = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
    params: {
      part: 'contentDetails,snippet',
      id: ID,
      key: apiKey
    }
  })
  return result;
};

function showActiveSong() {
  $('.song-list-item').removeClass('active')
  $('.song-name:contains(' + $('#song-title').text() + ')').parent().parent().addClass('active')
}


var listID = []
// * Get Title, id, artist, duration 
//! GET DEFAULT PLAYLIST
var listIndex = -2
getPlayListItems("PLcWSuvkriTXaYcO0HyyH9-OFxr-QIH_wA")
  .then(data => {
    data.forEach(item => {
      item.items.forEach((i) => {
        listID.push(i.snippet.resourceId.videoId)
      });
    });
    posVid = 0
    getVideosItems(listID).then(data => {
      data.forEach(i => {
        listVid.push({ title: i.snippet.title, idVid: i.id, artist: i.snippet.channelTitle, duration: YTDurationToSeconds(i.contentDetails.duration) })
        if (data.length == listVid.length) {
          $('.loading').remove()
          listVid.forEach(i => {
            $('.song-list').append(renderItem(i.title, i.artist, i.idVid, i.duration))
            setOnClickSong()
            checkPrivate();
          })
        }
      })
    }).catch(err => {
      console.log(err)
    });

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  })
  .catch(err => {
    console.log(err)
    // changeAPIKey(apiKeyList[1], err);
  });


//! RAMDOM POSVID
// Math.floor(Math.random() * listVid.length);

//* convert YT api to hh:mm:ss
function YTDurationToSeconds(duration) {
  var reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
  var hours = 0, minutes = 0, seconds = 0, totalseconds;

  if (reptms.test(duration)) {
    var matches = reptms.exec(duration);
    if (matches[1]) hours = Number(matches[1]);
    if (matches[2]) minutes = Number(matches[2]);
    if (matches[3]) seconds = Number(matches[3]);
    var totalseconds = hours * 3600 + minutes * 60 + seconds;
    if (seconds < 3600) {
      return new Date(totalseconds * 1000).toISOString().substring(14, 19)
    } else {
      return new Date(totalseconds * 1000).toISOString().substring(11, 16)
    }
  }
}

function changeAPIKey(newKey, err) {
  console.log(err)
  if (err.response.data.error.errors[0].reason == "dailyLimitExceeded") {
    apiKey = newKey;
    getPlayListItems("PL7ZciLEZ0K4j9_7OFeuAJIs9LBcoEj_he")
      .then(data => {
        data.forEach(item => {
          item.items.forEach(i => {
            listVid.push({ title: i.snippet.title, idVid: i.snippet.resourceId.videoId })
          });

          posVid = 0
          checkPrivate();
          tag.src = "https://www.youtube.com/iframe_api";
          var firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        });
      })
      .catch(err => {
        changeAPIKey(apiKeyList[2], err);
      });


  }
}

//*get suggest youtube
function getSearchSuggest(input) {
  $.getJSON('https://api.allorigins.win/get?url=' + encodeURIComponent('http://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=' + input), function (data) {
    getListSuggest(data.contents)
  });
};


//* setvolume 
$('.volume').on('input', function () {
  player.setVolume(this.value)
  var value = (this.value - this.min) / (this.max - this.min) * 100
  this.style.background = 'linear-gradient(to right, #ff2152 0%, #ff2152 ' + value + '%, #fff ' + value + '%, white 100%)'
})

var onChangeTime = false


//* set time play
$('.current-playing-time').on('input', function () {
  onChangeTime = true
  var value = (this.value - this.min) / (this.max - this.min) * 100
  this.style.background = 'linear-gradient(to right, #ff2152 0%, #ff2152 ' + value + '%, #fff ' + value + '%, white 100%)'
})

$('.current-playing-time').change(function () {
  var valueChange = player.getDuration() * this.value / 10 / 100
  onChangeTime = false
  player.seekTo(valueChange)
});

//! cách này hơi ngu nhưng phải dùng vì nếu dùng youtube API thì ngốn quota vcl =)), search 100 bài hết mẹ quota của ngày
function getIdVideoBySearch(query) {
  $('.suggestItem').remove()
  spaceKeyDown()
  $.getJSON('https://api.allorigins.win/get?url=' + encodeURIComponent('https://www.youtube.com/results?search_query=' + query), function (data) {
    var index = data.contents.toString()
    var indexIndexOf = index.indexOf('/watch?v=') + 9
    var result = index.slice(indexIndexOf, indexIndexOf + 11)
    addVideoBySearch(result)
  });
}

// { title: "MONO - 'Quên Anh Đi' (Exclusive Performance Video)", idVid: "wwPYl5YizXg", artist: "Mono Official", duration: "04:13" }
var listVid = []

function onYouTubeIframeAPIReady() {
  //wait listVid
  if (listVid.length) {
    player = new YT.Player('player', {
      height: '0',
      width: '0',
      videoId: listVid[posVid].idVid,
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      },
      playerVars: {
        'autohide': 0,
        'cc_load_policy': 0,
        'controls': 1,
        'disablekb': 1,
        'iv_load_policy': 3,
        'modestbranding': 1,
        'rel': 0,
        'showinfo': 0,
        'autoplay': 1,
        'm': 0

      }
    });
  } else {
    setTimeout(onYouTubeIframeAPIReady, 250);
    // onYouTubeIframeAPIReady()
  }
}

function onPlayerReady(event) {
  player.setPlaybackQuality("small");
  $('#song-title').text(listVid[posVid].title);
  $('#song-artist').text(listVid[posVid].artist)
  $("#album-cover-image").attr("src", `https://i3.ytimg.com/vi/${listVid[posVid].idVid}/mqdefault.jpg`);
  //* status playing when ready
  // playButton(player.getPlayerState() !== 5);

  setInterval(function () {
    showActiveSong()
    if (player.getPlayerState() == 0) {
      nextVideo();
      playButton(true);
    }
    if (!onChangeTime) {
      var currentTime = (player.getCurrentTime() / player.getDuration()) * 100
      $('.current-playing-time').val(currentTime * 10)
      $('.current-playing-time').css('background', 'linear-gradient(to right, #ff2152 0%, #ff2152 ' + currentTime + '%, #fff ' + currentTime + '%, white 100%)');
    }
  }, 100);
}

function playButton(play) {
  if (play) {
    $('.waves').removeClass('hide')
    $('#iconPlay').attr("xlink:href", "#pausebutton");
  } else {
    $('.waves').addClass('hide')
    $('#iconPlay').attr("xlink:href", "#playbutton");
  }
}

function changeStatusPlay() {

  if (player.getPlayerState() == 1 || player.getPlayerState() == 3) {
    pauseVideo();
    playButton(false);
  } else if (player.getPlayerState() != 0) {
    playVideo();
    playButton(true);

  }
}

function onPlayerStateChange(event) {
  if (event.data === 0) {
    playButton(false);
  }
}

function playVideo() {
  player.playVideo();
}

function pauseVideo() {
  player.pauseVideo();
}

function stopVideo() {
  player.stopVideo();
}

//previous song
function prevSong() {
  playButton(false);
  stopVideo();
  if (posVid - 1 < 0) {
    posVid = listVid.length - 1;
  } else {
    posVid -= 1;
    // $('.song-list-item').eq($('.song-list-item.active').index() - 1).click()
  }
  checkPrivateBack();
  var id = listVid[posVid].idVid;
  player.loadVideoById({ videoId: id });
  $('#song-title').text(listVid[posVid].title);
  $("#album-cover-image").attr("src", `https://i3.ytimg.com/vi/${id}/mqdefault.jpg`);
  showActiveSong()
  playButton(true);
}

//* SKIP BUTTON
function nextSong() {
  playButton(false);
  stopVideo();
  if (posVid + 1 == listVid.length) {
    posVid = 0;
  } else {
    posVid += 1;
  }
  checkPrivate();
  var id = listVid[posVid].idVid;
  player.loadVideoById({ videoId: id });
  $('#song-title').text(listVid[posVid].title);
  $("#album-cover-image").attr("src", `https://i3.ytimg.com/vi/${id}/mqdefault.jpg`);
  showActiveSong()
  playButton(true);
}

function playMusicById(id) {
  player.loadVideoById(id);
}

// on Song end
function nextVideo() {
  if (loopStatus == 2) {
    player.loadVideoById({ videoId: listVid[posVid].idVid });
  } else {
    if (shuffleStatus) {
      posVid = Math.floor(Math.random() * listVid.length);
    }
    stopVideo();
    if ($('.song-list-item.active').index() + 1 == listVid.length) {
      // posVid = 0;
      $('.song-list-item').eq(0).click()
    } else {
      // posVid += 1;
      $('.song-list-item').eq($('.song-list-item.active').index() + 1).click()
      checkPrivate();
      showActiveSong()
      playButton(true);
    }

  }
}
function shuffle() {
  if (!shuffleStatus) {
    $('.shuffleBtn').attr("xlink:href", "#shuffle-active");
    shuffleStatus = true;
  } else {
    $('.shuffleBtn').attr("xlink:href", "#shuffle");
    shuffleStatus = false;
  }
}

//Repeat
function loopVideo() {
  if (loopStatus == 0) {
    $('#loopBtn').attr("xlink:href", "#loop-active");
    loopStatus = 1;
  } else if (loopStatus == 1) {
    $('#loopBtn').attr("xlink:href", "#loop-active-song");
    loopStatus = 2;
  }
  else {
    $('#loopBtn').attr("xlink:href", "#loop");
    loopStatus = 0;
  }
}

//Check private or deleted video
function checkPrivate() {
  if (listVid[posVid].title == "Private video" || listVid[posVid].title == "Deleted video") {
    if (posVid == listVid.length - 1) {
      posVid = 0;
    } else {
      posVid += 1;
    }
    checkPrivate();
  }
};

function checkPrivateBack() {
  if (listVid[posVid].title == "Private video" || listVid[posVid].title == "Deleted video") {
    if (posVid == 0) {
      posVid = listVid.length - 1;
    } else {
      posVid -= 1;
    }
    checkPrivateBack();
  }
};

//on New Playlist
function changePlaylistId() {
  var newId = newPlaylistId.value;
  if (newId == "") {
    return;
  }

  listVid = [];
  btn.style.display = "none";
  prev.style.display = "none";
  next.style.display = "none";
  btn2.style.display = "none";
  repeat.style.display = "none";
  $('#song-title').text("Loading...");

  getPlayListItems(newId)
    .then(data => {
      data.forEach(item => {
        item.items.forEach(i => listVid.push({ title: i.snippet.title, idVid: i.snippet.resourceId.videoId }));
      });
      posVid = 0
      checkPrivate();
      btn.show()
      prev.show()
      next.show()
      btn2.show()
      repeat.show()
      $('#song-title').text(listVid[posVid].title);
      player.loadVideoById({ videoId: listVid[posVid].idVid });
      playButton(true);
    });

}


//* AUTO complete

function renderSuggest(item) {
  $('#search').val().length
  return `<div class="suggestItem"><strong>${item.slice(0, $('#search').val().length)}</strong>${item.slice($('#search').val().length)}<input type="hidden" value="${item}"></div>`
}


// $("#search").input(function () {
//   getSearchSuggest(this.val)
// });

$('#search').on('input', function (e) {
  $('#search').val() ? getSearchSuggest($('#search').val()) : $('.suggestItem').remove()

});

$('#search').on('click', function (e) {
  document.onkeydown = null
});

function getListSuggest(data) {
  var ListSuggest = JSON.parse(data)[1]
  autocomplete(document.getElementById("search"), ListSuggest);
}

function autocomplete(inp, arr) {
  $('.suggestItem').remove()
  arr.forEach(item => {
    $('#autocomplete-list').append(renderSuggest(item))
  })
  var currentFocus;
  currentFocus = -1;

  inp.addEventListener("keydown", function (e) {
    if (e.keyCode == 40) {
      currentFocus++;
      addActive(currentFocus);
    } else if (e.keyCode == 38) {
      currentFocus--;
      addActive(currentFocus);
    }
  });

  $(".suggestItem").click(function () {
    $('#search').val($(this).text())
    $('#search').focus()
    currentFocus = -1
  });

  function addActive(x) {
    removeActive()
    $('#search').val($(".suggestItem").eq(x).text())
    $(".suggestItem").eq(x).addClass('autocomplete-active');
  }

  function removeActive(x) {
    $(".suggestItem").removeClass('autocomplete-active');
  }

  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
    $('.suggestItem').remove()
    spaceKeyDown()
  });
}

function addVideoBySearch(id) {
  $('.suggestItem').remove()
  console.log(id)
  getVideoItems(id).then(data => {
    data.data.items.forEach((i, index) => {
      var title = i.snippet.title
      var artist = i.snippet.channelTitle
      var duration = YTDurationToSeconds(i.contentDetails.duration)
      listVid.unshift({ title: title, idVid: id, artist: artist, duration: duration })
      $('.song-list').append(renderItem(title, artist, id, duration))
      //TODO: scroll to this song
      showActiveSong()
      setOnClickSong()
    })
  }).catch(err => {
    console.log(err)
  });
}

//* onclick on someone song
function setOnClickSong() {
  $(".song-list-item").prop("onclick", null).off("click");
  $(".song-list-item").on("click", function () {
    var songTitle = $(this).children('div').children('div').children('h3').text()
    posVid = $(this).index()
    // console.log(listVid.find(({ title }) => title === songTitle))
    playByClick(listVid.find(({ title }) => title === songTitle))
  });
  $('.song-duration').on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
  });
}

function playByClick(data) {
  playMusicById(data.idVid)
  $('#song-title').text(data.title);
  $('#song-artist').text(data.artist)
  $("#album-cover-image").attr("src", `https://i3.ytimg.com/vi/${data.idVid}/mqdefault.jpg`);
  showActiveSong()
  setOnClickSong()
  playButton(true);
}

function swapUpDOMListVid(clickedPos, clickedList) {
  //! phải thay đổi từng element không bị dính onclick khi swap html

  var tempArtist = $('.' + clickedList).children().eq(clickedPos).children('div').children('div').children('p').text() // artist 1
  var tempTitle = $('.' + clickedList).children().eq(clickedPos).children('div').children('div').children('h3').text() // title 1
  var tempDuration = $('.' + clickedList).children().eq(clickedPos).children('div').children('div').children('span').text() // duration
  var tempImg = $('.' + clickedList).children().eq(clickedPos).children('img').attr('src') //source 2

  var tempPreArtist = $('.' + clickedList).children().eq(clickedPos - 1).children('div').children('div').children('p').text() // artist 2
  var tempPreTitle = $('.' + clickedList).children().eq(clickedPos - 1).children('div').children('div').children('h3').text() // title 2
  var tempPreDuration = $('.' + clickedList).children().eq(clickedPos - 1).children('div').children('div').children('span').text() // duration 2
  var tempPreImg = $('.' + clickedList).children().eq(clickedPos - 1).children('img').attr('src')

  $('.' + clickedList).children().eq(clickedPos - 1).children('div').children('div').children('p').text(tempArtist)
  $('.' + clickedList).children().eq(clickedPos - 1).children('div').children('div').children('h3').text(tempTitle)
  $('.' + clickedList).children().eq(clickedPos - 1).children('div').children('div').children('span').text(tempDuration)
  $('.' + clickedList).children().eq(clickedPos - 1).children('img').attr('src', tempImg)

  $('.' + clickedList).children().eq(clickedPos).children('div').children('div').children('p').text(tempPreArtist)
  $('.' + clickedList).children().eq(clickedPos).children('div').children('div').children('h3').text(tempPreTitle)
  $('.' + clickedList).children().eq(clickedPos).children('div').children('div').children('span').text(tempPreDuration)
  $('.' + clickedList).children().eq(clickedPos).children('img').attr('src', tempPreImg)


}


function swapDownDOMListVid(clickedPos, clickedList) {

  console.log(clickedList);
  var tempArtist = $('.' + clickedList).children().eq(clickedPos).children('div').children('div').children('p').text() // artist 1
  var tempTitle = $('.' + clickedList).children().eq(clickedPos).children('div').children('div').children('h3').text() // title 1
  var tempDuration = $('.' + clickedList).children().eq(clickedPos).children('div').children('div').children('span').text() // duration
  var tempImg = $('.' + clickedList).children().eq(clickedPos).children('img').attr('src') //source 2

  var tempPreArtist = $('.' + clickedList).children().eq(clickedPos + 1).children('div').children('div').children('p').text() // artist 2
  var tempPreTitle = $('.' + clickedList).children().eq(clickedPos + 1).children('div').children('div').children('h3').text() // title 2
  var tempPreDuration = $('.' + clickedList).children().eq(clickedPos + 1).children('div').children('div').children('span').text() // duration 2
  var tempPreImg = $('.' + clickedList).children().eq(clickedPos + 1).children('img').attr('src')

  console.log(tempTitle);
  $('.' + clickedList).children().eq(clickedPos + 1).children('div').children('div').children('p').text(tempArtist)
  $('.' + clickedList).children().eq(clickedPos + 1).children('div').children('div').children('h3').text(tempTitle)
  $('.' + clickedList).children().eq(clickedPos + 1).children('div').children('div').children('span').text(tempDuration)
  $('.' + clickedList).children().eq(clickedPos + 1).children('img').attr('src', tempImg)

  $('.' + clickedList).children().eq(clickedPos).children('div').children('div').children('p').text(tempPreArtist)
  $('.' + clickedList).children().eq(clickedPos).children('div').children('div').children('h3').text(tempPreTitle)
  $('.' + clickedList).children().eq(clickedPos).children('div').children('div').children('span').text(tempPreDuration)
  $('.' + clickedList).children().eq(clickedPos).children('img').attr('src', tempPreImg)

}

function swapArrayListVid(a, b) {
  var temp = listVid[a];
  listVid[a] = listVid[b];
  listVid[b] = temp;
};

function changePosUp(data) {
  //get postion of div clicked
  // $(data).parent().parent().parent().hasClass('active')
  var clickedPos = $(data).parent().parent().parent().index()
  if (clickedPos !== 0) {
    var clickedList = $(data).parent().parent().parent().parent().attr('class')
    swapUpDOMListVid(clickedPos, clickedList)
    swapArrayListVid(clickedPos, clickedPos - 1)
    if ($(data).parent().parent().parent().hasClass('active')) {
      posVid--
    }
  }
}

function changePosDown(data) {
  // var posVid = posVid + 1
  //get postion of div clicked
  var clickedPos = $(data).parent().parent().parent().index()
  if (clickedPos !== $('.' + clickedList).children().length - 1) {
    var clickedList = $(data).parent().parent().parent().parent().attr('class')
    swapDownDOMListVid(clickedPos, clickedList)
    swapArrayListVid(clickedPos, clickedPos + 1)
    if ($(data).parent().parent().parent().hasClass('active')) {
      posVid++
    }
  }
}

//* Space button to start stop song
function spaceKeyDown() {
  document.onkeydown = function (e) {
    if (e.keyCode == 32) {
      changeStatusPlay()
    }
  };
}
spaceKeyDown()

//TODO nếu như còn bài cuối thì remove hết
//TODO error with postvid when remove vid
function deleteSong(data) {
  var clickedPos = $(data).parent().parent().parent().index()
  console.log(clickedPos);
  var songTitle = $('#song-title').text()
  //check xem co dang xoa bai dang play khong
  if ($(data).parent().parent().children().children('h3').text() == songTitle) {
    // console.log($(data).parent().parent().parent().parent().children());
    $(data).parent().parent().parent().parent().children().eq(clickedPos + 1).click()
    $(data).parent().parent().parent().remove()
    removeSongInList(data)
  } else {
    $(data).parent().parent().parent().remove()
    removeSongInList(data)

  }

  // $(data).parent().parent().parent().remove()
}

function removeSongInList(data) {
  var posToRemove = listVid.indexOf(listVid.find(({ title }) => title === $(data).parent().parent().children().children('h3').text()))
  listVid.splice(posToRemove, 1);
}

//TODO fix onclick when search