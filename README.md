# Crossword Parser!

The Buffalo news used to just upload images of their crosswords, they were not interactive at all.
I had a friend that used to do Buffalo news crosswords a lot, but he used to just screenshot them and draw on the image on his iPad with his finger.
This was a successful attempt at letting that friend play the Buffalo News crosswords.

## Usage:

Press Upload Image below to pick an image on your hard drive of a crossword (grab something from google images)

Or press Use Test Image to load in a test image that works, pulled from google images.

Once the image loads, drag the screen to move the image around, and then use the mouse wheel (or pinch to zoom) to zoom in and out.

Click anywhere on a grid square in the crosswords to set your cursor to type, and then click again if you want to change the direction you are typing in!

## Notes:

The detection of the crossword grid is very rudimentary and was not improved upon much after it was proven to work with crosswords from the Buffalo News.

This isn't exactly the cleanest code because it was a one off project made for a specific purpose, but it solves a fun project in a cool way while linking a few technologies together.

This solution uses a pointer library that I made myself a while back (util/pointer.js), because I was curious about making one.
I have no plans on releasing it, but I do prefer how it works over other libraries I have found.

The Buffalo News eventually made an app to play their crosswords... or so I've heard...

## Running Locally

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.
