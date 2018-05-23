# Chess

This was a challenge to see if I can create a Chess game using P5.js and have it connected to Firebase to set up matches.

Using p5 ended up being a mistake because due to lag the project came to a close. I later rewrote the chess part of it in JavaFX to see a completed game.


Completed:
- Pieces were almost completely functional.
- Selection and movement of pieces.
- Animated piece movement.
- Killed pieces shown on the side.
- Creating an account that is connected to Firebase.
- Account password encrypted using AES-256 (CryptoJs).
- Logging into your account that can be remembered using cookies.
- A self-made UI framework built on p5.

Mistakes:
- Clicking on pieces was handled by color shading as opposed to an actual grid system. This would sometimes completely break movement. (Fixed in JavaFX version)
- Remembering an account was done by keeping the account in cookies and trying to log in on reload. Mistake because this should have been done using sessions.
- Encryption key was generated and stored for each individual account in Firebase. This is not very secure and can be intercepted quite easily. 

Incomplete:
- Realtime Chess matches.
- En passant.
- Check/Checkmate was never created.
