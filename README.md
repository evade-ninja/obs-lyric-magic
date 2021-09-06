# obs-lyric-magic
When you can't find what you want, write your own.

After looking around for a plugin to display hymn lyrics on screen and coming up with nothing that exactly met my needs and was somewhat simple, I wrote obs-lyric-magic.

I borrowed a lot of inspiration from https://github.com/noeal-dac/Animated-Lower-Thirds - particularly their use of a BroadcastChannel to communicate between a separate control panel and the overlay.

# How to Use Lyric Magic
Add the control panel (controls.html) as a dock, and add the browser source (browser.html) to a scene. Select a song slot, enter a title, paste the lyrics and click save.

Use the PREVIOUS / ADVANCE buttons to move through the lyrics. The first "lyric" is the song title (represented by -1). Once you've advanced through all of the lyrics, they will disappear from the output. If you want to start over, click the LOAD button to start over.

Lines that start with \#\#\# will be sent by itsself, instead of two lines being sent.
If you need more slots, you can edit controls.html and modify the loadSlots function to increase the number of slots.