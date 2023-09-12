import React, { useRef, useCallback, useEffect, useState } from "react";
import ParserLogic, { states } from "./ParserLogic";
import Button from "./components/Button";
import { ArrowDownward, ArrowForward } from "@material-ui/icons";
import Dialog from "./components/Dialog";

function CrosswordParser() {
  const parserRef = useRef();
  const uploadRef = useRef();
  const canvasContainerRef = useRef();
  const textInputRef = useRef();

  const [imageLoded, setImageLoaded] = useState(false);
  const [state, setState] = useState(states.browsing);

  const initWithImage = (imageUrl) => {
    let img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      if (parserRef.current) parserRef.current.dispose();
      parserRef.current = new ParserLogic(canvasContainerRef.current, img, setState, textInputRef.current);
      setImageLoaded(true);
    };
  };

  const uploadRefCallback = useCallback(node => {
    uploadRef.current = node;
    if (node) {
      node.onchange = (e) => {
        var reader  = new FileReader();
        reader.readAsDataURL(node.files[0]);
        
        reader.onloadend = e => {
          initWithImage(e.target.result);
        };
      };
    }
  });

  const useTestImage = () => initWithImage("./crosswordTest1.png");

  const changeState = state => {
    parserRef.current.changeState(state); //will call callback to set state
  };

  useEffect(() => {
    return () => {
      parserRef.current?.dispose();
    }
  }, []);

  return (
    <>
      <input ref={uploadRefCallback} id="file" type="file" accept="image/*" hidden/>
      {!imageLoded && <div className="load-image-screen">
        <div className="readme">
          <h1>Crossword Parser!</h1>
          <p>
            The Buffalo news used to just upload images of their crosswords, they were not interactive at all.
            I had a friend that used to do Buffalo news crosswords a lot, but he used to just screenshot them and draw on the image on his iPad with his finger.
            This was a successful attempt at letting that friend play the Buffalo News crosswords.
          </p>
          <h2>Usage:</h2>
          <p>
            Press Upload Image below to pick an image on your hard drive of a crossword (grab something from google images)
          </p>
          <p>
            Or press Use Test Image to load in a test image that works, pulled from google images.
          </p>
          <p>
            Once the image loads, drag the screen to move the image around, and then use the mouse wheel (or pinch to zoom) to zoom in and out.
          </p>
          <p>
            Click anywhere on a grid square in the crosswords to set your cursor to type, and then click again if you want to change the direction you are typing in!
          </p>
          <h2>Notes:</h2>
          <p>
            The detection of the crossword grid is very rudimentary and was not improved upon much after it was proven to work with crosswords from the Buffalo News.
          </p>
          <p>
            This isn't exactly the cleanest code because it was a one off project made for a specific purpose, but it solves a fun project in a cool way while linking a few technologies together.
          </p>
          <p>
            This solution uses a pointer library that I made myself a while back (util/pointer.js), because I was curious about making one.
            I have no plans on releasing it, but I do prefer how it works over other libraries I have found.
          </p>
          <p>
            The Buffalo News eventually made an app to play their crosswords... or so I've heard...
          </p>
        </div>
        <div className="image-buttons">
          <Button onClick={() => uploadRef.current.click()}>Upload Image</Button>
          <Button onClick={useTestImage}>Use Test Image</Button>
        </div>
      </div>}
      <div ref={canvasContainerRef} className="parser-container" hidden={!imageLoded}>
        <canvas />
      </div>
      <input ref={textInputRef} type="text" className="show-keyboard" hidden={!imageLoded}/>
      {<Dialog
          isOpen={state === states.direction} 
          className="select-direction"
          onClose={() => changeState(states.browsing)}
        >
        <div onClick={() => changeState(states.typingDown)} className="arrow-down"><ArrowDownward/></div>
        <div onClick={() => changeState(states.typingRight)} className="arrow-right"><ArrowForward/></div>
      </Dialog>}
    </>
  );
}

export default CrosswordParser;
