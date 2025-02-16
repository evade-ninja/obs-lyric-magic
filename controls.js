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

function ingest() {
   words = $("#words").val().split("\n");
   //alert(lyrics.length);
   index = -1

   lyrics = [$("#title").val()];

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

function deleteSong() {
   var s = $("#slots").val();
   localStorage.removeItem(s);

   loadSlots();
   $("#slots").val(s);
   load();

}

function save() {
   //console.log($("#slots").val());

   var lyr = $("#words").val();

   lyr = lyr.replace(/\n\n\s*/g, "\n");
   lyr = lyr.replace(/\r\n\r\n\s*/g, "\n");
   lyr = lyr.replace(/#/g, "");
   lyr = lyr.trim();

   /*
   Chorus blocks are now repeated
   //find the chorus block

   var choruspos = -1;
   choruspos = lyr.indexOf("[Chorus]");
   if(choruspos > -1){
      //we have a chorus!
      var chorus = /\[Chorus\](.*?)\d/s.exec(lyr);
      console.log(chorus[1]);

      var verses = [];

      for(let i = 3; i < 10; i++){
         var vpos = lyr.indexOf("" + i);
         if(vpos > 0){
            lyr = lyr.replace("" + i, chorus[1].trim() + "\n" + i);
         }
      }

      lyr = lyr + chorus[1];
   }
   */
   lyr = lyr.replaceAll("[Chorus]\n", "");
   lyr = lyr.trim();
   //console.log(lyr);
   //return;

   var l2 = [];
   l2 = lyr.split("\n");
   var wds = [];
   //lines = 0;
   for (var i = 0; i < l2.length; i++) {
      //console.log("Line" + i);
      let item = l2[i];
      if (item.length > 40) {
         //split into two

         //find the , or ; in the middle of the line
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

         //console.log("Line: " + i + " " + l2[i]);
         //lines++;
         wds.push(item.slice(0, knife));
         wds.push(item.slice(knife, item.length));
         //lines++;
         //console.log(l2[i+1]);
         /*if(i + 1 < l2.length && (l2[i+1].match(/^\d/)) && (lines%2 > 0)){
            console.log("next line is new verse and is odd");
            wds.push("###1" + item.slice(knife,item.length));		 
         }
         else{
            //lines++;					
            wds.push(item.slice(knife,item.length));
         }*/

      } else {
         //otherwise keep as is
         //lines++;
         //console.log("Intact Line: " + i + " " + l2[i]);

         wds.push(item);
         /*if((i+1 < l2.length) && (l2[i+1].match(/^\d/)) &&  (lines%2 > 0)){
            console.log("next line is new verse and is odd");
            wds.push("###2" + item.slice(knife,item.length));
         }
         else if((i+1 == l2.length) && (lines%2 > 0)){
            wds.push("###3" + item.slice(knife,item.length));
         }
         else
         {
            wds.push(item);
         }*/
      }
   }
   var singles = 0;
   for (var x = 0; x < wds.length; x++) {
      console.log(x + "/" + wds[x] + " " + (x + 1 + singles) % 2);
      if (((x + 1 < wds.length) && (wds[x + 1].match(/^\d/)) && ((x + 1 + singles) % 2 > 0)) || (((x + 1 + singles) % 2 > 0) && (x + 1 == wds.length))) {
         //this line is odd
         wds[x] = "###" + wds[x];
         singles++;
      }
   }

   $("#words").val(wds.join("\n"));




   var s = $("#slots").val();

   localStorage.setItem($("#slots").val(), JSON.stringify({ 'title': $("#title").val(), 'lyrics': $("#words").val() }));

   loadSlots();
   $("#slots").val(s);
   ingest();

}

function load() {
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
}

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

   $("#slots").html("");
   for (let x = 1; x < 11; x++) {

      var s = JSON.parse(localStorage.getItem("Song" + x));
      if (s) {
         $("#slots").append(new Option(s.title, "Song" + x));
      } else {
         $("#slots").append(new Option(x + " - Empty", "Song" + x));
      }

   }
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

function processLyrics(){
   var lyr = $("#words").val();

   // Remove Weird Whitespaces

   lyr = lyr.replace(/\n\n\s*/g, "\n");
   lyr = lyr.replace(/\r\n\r\n\s*/g, "\n");
   lyr = lyr.replace(/#/g, "");
   lyr = lyr.trim();



   
}

function populateSongLists(){
   $("#edit_hymns").html("");
   $("#song-selector").html("");

   for(let i = 0; i < songs.length; i++){
      $("#edit_hymns").append(new Option(songs[i].title, i));
      $("#song-selector").append(new Option(songs[i].title, i));
   }
}

function editSong(song){
   $("#edit_hymn_panel").show();
   $("#title").val(songs[song].title);
   $("#words").val(songs[song].lyrics);
}

function newSong(){
   selected_song = songs.push(
      {
         "title":"New Hymn",
         "lyrics":""
      }) - 1;
   populateSongLists();
   editSong(selected_song);
}