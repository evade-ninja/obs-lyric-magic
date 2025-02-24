const mindcontrol = new BroadcastChannel('obs-lyrics');

/*

Sample Song Object

{
   "title": "Song Title",
   "lyrics": ""
}


*/

var songs = [];
var selected_song = 0;

var lyrics = [];
var index = -1;

function loadHymn() {

   let song = $("#song-selector").val();
   $("#song-title").html(songs[song].title);
   $("#song").show();

   words = songs[song].lyrics.split("\n");
   //alert(lyrics.length);
   index = -1

   lyrics = [songs[song].title];

   for (let x = 0; x < words.length; x) {
      if (words[x].startsWith("###")) {
         lyrics.push(words[x].replace("###", ""));
         x++;
      } else {
         lyrics.push(words[x] + "<br>" + words[x + 1]);
         x += 2;
      }
   }

   mindcontrol.postMessage({ 'action': 'load', 'lyrics': lyrics });

   $("#lindex").html(index + "/" + lyrics.length);
   $("#preview").html(lyrics[0]);
}

function unload(){
   lyrics = [];
   index = -1;
   $("#song").hide();
}

function deleteSong() {
   songs.splice(selected_song, 1);
   localStorage.setItem("songs", JSON.stringify(songs));
   populateSongLists();
}

function save(){
   songs[selected_song].title = $("#title").val()
   songs[selected_song].lyrics = $("#words").val()
   localStorage.setItem("songs", JSON.stringify(songs));
   populateSongLists();
   $("#edit_hymns").val(selected_song);
}

/* function load() {
   var x = $("#slots").val();
   var s = JSON.parse(localStorage.getItem(x));
   if (s) {
      $("#title").val(s.title);
      $("#words").val(s.lyrics);
      ingest();
   } else {
      $("#title").val("");
      $("#words").val("");
   }
} */

function sendLyric() {
   if (index == -1) {
      mindcontrol.postMessage({ 'action': 'update_title', 'text': lyrics[0] });
      mindcontrol.postMessage({ 'action': 'show' });
      index = 0;
      //index++;
      $("#lindex").html(index + "/" + lyrics.length);
      $("#preview").html(lyrics[1]);
      return;
   }

   if (index == lyrics.length) {
      //time to hide!
      mindcontrol.postMessage({ 'action': 'hide' });
      return;
   }
   if (index + 1 >= lyrics.length) {
      $("#preview").html("&nbsp;");
   } else {
      $("#preview").html(lyrics[index + 2]);
   }
   index++;
   mindcontrol.postMessage({ 'action': 'update_title', 'text': lyrics[index] });
   $("#lindex").html(index + "/" + lyrics.length);

}

function sendLyricBack() {
   if (index > lyrics.length) {
      index = lyrics.length;
      mindcontrol.postMessage({ 'action': 'update_title', 'text': lyrics[index] });
      mindcontrol.postMessage({ 'action': 'show' });
      $("#lindex").html(index + "/" + lyrics.length);
      $("#preview").html("&nbsp;");
      return;
   }

   if (index <= -1) {
      //time to hide!
      mindcontrol.postMessage({ 'action': 'hide' });
      $("#preview").html(lyrics[0]);
      return;
   }

   $("#preview").html(lyrics[index]);

   index--;
   mindcontrol.postMessage({ 'action': 'update_title', 'text': lyrics[index] });
   $("#lindex").html(index + "/" + lyrics.length);
}

function loadSlots() {
/*
   $("#slots").html("");
   for (let x = 1; x < 11; x++) {

      var s = JSON.parse(localStorage.getItem("Song" + x));
      if (s) {
         $("#slots").append(new Option(s.title, "Song" + x));
      } else {
         $("#slots").append(new Option(x + " - Empty", "Song" + x));
      }

   }
      */
   songs = JSON.parse(localStorage.getItem("songs"));
   if(!songs){
      songs = [];
   }
   populateSongLists();
}

function next_line() {
   if (index > lyrics.length) {
      //do nothing
   } else {
      index++;
      $("#lindex").html(index + "/" + lyrics.length);
      $("#preview").html(lyrics[index]);
   }
}

function prev_line() {
   if (index < 0) {
      //do nothing
   } else if (index == 0) {
      index = -1;
      $("#lindex").html(index + "/" + lyrics.length);
      $("#preview").html(lyrics[0]);
   } else {
      index--;
      $("#lindex").html(index + "/" + lyrics.length);
      $("#preview").html(lyrics[index]);
   }
}

function send_next() {
   mindcontrol.postMessage({ 'action': 'next' });
   //next_line();
}

function send_prev() {
   mindcontrol.postMessage({ 'action': 'prev' });
   //prev_line();
}

function clearStorage() {
   localStorage.clear();
}

function closeManage(){
   $("#manage").hide();
   $("#edit").hide();
}

function processLyrics(){
   var lyr = $("#words").val();

   // Remove Weird Whitespaces

   lyr = lyr.replace(/\n\n\s*/g, "\n");
   lyr = lyr.replace(/\r\n\r\n\s*/g, "\n");
   lyr = lyr.replace(/#/g, "");
   lyr = lyr.replace(/(\d\.)\n/gm, "$1 ");
   lyr = lyr.trim();

   var l2 = [];
   l2 = lyr.split("\n");
   var wds = [];
   //lines = 0;
   for (var i = 0; i < l2.length; i++) {
      //console.log("Line" + i);
      let item = l2[i];
      if (item.length > 40) {
         // line is too long - split into two

         //find the , or ; in the middle of the line to split it
         var cpos = item.indexOf(",", (item.length / 2) - 3);
         var semipos = item.indexOf(";", (item.length / 2) - 6);
         var spos = item.indexOf(" ", (item.length / 2) - 3);

         var knife = item.length;
         if (semipos > 0 && semipos < item.length * 0.75) {
            knife = semipos + 1;
         } else if (cpos > 0 && cpos < item.lengthc * 0.75) {
            knife = cpos + 1;
         } else {
            knife = spos;
         }
         wds.push(item.slice(0, knife));
         wds.push(item.slice(knife, item.length));
      } else {
         // line is fine - keep as is
         wds.push(item);
      }
   }

   // Look for "sinlges" by checking to see if the following line starts with a number
   var singles = 0;
   for (var x = 0; x < wds.length; x++) {
      console.log(x + "/" + wds[x] + " " + (x + 1 + singles) % 2);
      if (((x + 1 < wds.length) && (wds[x + 1].match(/^\d/)) && ((x + 1 + singles) % 2 > 0)) || (((x + 1 + singles) % 2 > 0) && (x + 1 == wds.length))) {
         //this line is odd
         wds[x] = "###" + wds[x];
         singles++;
      }
   }
   
   // Put the processed array into the textarea
   $("#words").val(wds.join("\n"));
}

function populateSongLists(){
   $("#edit_hymns").html("");
   $("#song-selector").html("");

   for(let i = 0; i < songs.length; i++){
      $("#edit_hymns").append(new Option(songs[i].title, i));
      $("#song-selector").append(new Option(songs[i].title, i));
   }
}

function editSong(){
   $("#edit").show();
   selected_song = parseInt($("#edit_hymns").val());
   $("#title").val(songs[selected_song].title);
   $("#words").val(songs[selected_song].lyrics);
}

function newSong(){
   selected_song = songs.push(
      {
         "title":"New Hymn",
         "lyrics":""
      }) - 1;
   populateSongLists();
   $("#edit_hymns").val(selected_song);
   $("#edit").show();
   editSong();
}

function moveUp(){
   selected_song = parseInt($("#edit_hymns").val());
   if(selected_song > 0){
      let s = songs[selected_song];
      songs.splice(selected_song, 1);
      songs.splice(selected_song-1, 0, s);
      populateSongLists();
      selected_song -= 1;
      $("#edit_hymns").val(selected_song);
      localStorage.setItem("songs", JSON.stringify(songs));
   }
}

function moveDown() {
   selected_song = parseInt($("#edit_hymns").val());
   if (selected_song < songs.length) {
      let s = songs[selected_song];
      songs.splice(selected_song, 1);

      if(selected_song+1 == songs.length){
         songs.push(s);
      }else{
         songs.splice(selected_song + 1, 0, s);
      }
      selected_song = selected_song + 1;
      populateSongLists();
      localStorage.setItem("songs", JSON.stringify(songs));
   }
   $("#edit_hymns").val(selected_song);
}