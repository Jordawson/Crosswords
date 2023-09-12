import { scaleCanvasForHiDpi } from "./utils/canvasHelper";
import { isNumeric } from "./utils";
import Pointer from "./utils/pointer";

export const states = {
  browsing: 0,
  direction: 1,
  typingRight: 2,
  typingDown: 3,
};

export default class ParserLogic {
  constructor(canvasContainer, img, changeStateCallback, textInputNode) {
    window.parser = this;
    this.onClick = null; //gets set from the parent react component

    this.pointer = new Pointer();
    this.animationFrameRequest = null;
    
    if (!canvasContainer || this.canvas) return;
    this.canvasContainer = canvasContainer;
    this.canvas = canvasContainer.children[0];
    this.canvas.style.backgroundColor = "white";
    this.ctx = this.canvas.getContext("2d");
    this.state = states.browsing;
    this.textInputNode = textInputNode;
    this.inputLen = 0;
    
    this.crosswordImage = img;
    this.changeStateCallback = changeStateCallback;

    this.canvas.width = this.crosswordImage.width;
    this.canvas.height = this.crosswordImage.height;
    this.ctx.drawImage(this.crosswordImage, 0, 0);
    this.pixels = this.ctx.getImageData(0, 0, this.crosswordImage.width, this.crosswordImage.height);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.lines = null;
    this.parseCrossword();

    //cant get the first canvas scale to work for some reason so we time it out here a few times to make sure the canvas scales right
    setTimeout(() => scaleCanvasForHiDpi(this.canvasContainer, this.ctx), 100);
    setTimeout(() => scaleCanvasForHiDpi(this.canvasContainer, this.ctx), 500);
    setTimeout(() => scaleCanvasForHiDpi(this.canvasContainer, this.ctx), 1000);

    this.canvasTranslate = { x: 0, y: 0 };
    this.canvasScale = 1;

    this.canvasWidth = null;
    this.canvasHeight = null;

    this.canvas.onpointerdown = this.onMouseDown;
    this.canvas.onpointermove = this.onMouseMove;
    this.canvas.onpointerup = this.onMouseUp;
    this.canvas.onpointercancel = this.onMouseCancel;
    this.canvas.onpointerout = this.onMouseOut;
    this.canvas.onpointerleave = this.onMouseLeave;
    this.canvas.onmousewheel = this.onMouseWheel;
    this.canvas.addEventListener("click", this.click); //has to be the click event because otherwise the keyboard wont show up
    this.textInputNode.addEventListener("input", this.onKeyDown);
    
    this.animationFrameRequest = requestAnimationFrame(this.draw);
  }

  getPixel = (x, y) => {
    const index = (y * this.pixels.width + x) * 4;
    const r = this.pixels.data[index];
    const g = this.pixels.data[index + 1];
    const b = this.pixels.data[index + 2];
    return r + g + b < 300;
  };

  canPlaceLetter = (x, y) =>
    !this.getPixel(
      Math.round(this.crossword.x + (x + .75) * this.crossword.xDist),
      Math.round(this.crossword.y + (y + .75) * this.crossword.yDist)
    ) && x < this.crossword.xCount - 1 && y < this.crossword.yCount - 1;

  parseCrossword = () => {
    this.lines = [];
    const lenCount = {};
    const linesByY = {};
    const linesByX = {};
    const div = this.pixels.height / 500;
    console.log(div);
    let startPos = null;
    let len;

    const pushNewLine = (x1, y1, x2, y2, collection) => {
      if (len > div*5) {
        const lenr = Math.round(len/div);
        const rpos = Math.round(startPos/div);
        const newLine = {
          len: len,
          lenr: lenr,
          x1: x1,
          x2: x2,
          y1: y1,
          y2: y2,
          rpos: rpos,
        };
        this.lines.push(newLine);
        if (!collection[rpos]) collection[rpos] = [];
        collection[rpos].push(newLine);
        if (lenCount[lenr]) lenCount[lenr]++;
        else lenCount[lenr] = 1;
      }
    };

    let x;
    let y;
    for (x = 0; x < this.pixels.width; x++) {
      for (y = 0; y < this.pixels.height; y++) {
        if (this.getPixel(x, y)) {
          if (!startPos) startPos = y;
        } else {
          if (startPos) {
            len = y - startPos;
            pushNewLine(x, y, x, startPos, linesByY);
            startPos = null;
          }
        }
      }
      startPos = null;
    }
    
    for (y = 0; y < this.pixels.height; y++) {
      for (x = 0; x < this.pixels.width; x++) {
        if (this.getPixel(x, y)) {
          if (!startPos) startPos = x;
        } else {
          if (startPos) {
            len = x - startPos;
            pushNewLine(x, y, startPos, y, linesByX);
            startPos = null;
          }
        }
      }
      startPos = null;
    }

    this.passed = [];
    this.linesToDraw = [];

    const kloop = (collection, isX) => k => {
      let dist = null;
      let sigma = 5;
      let lastPos = null;
      let failed = false;
      let count = 0;
      let start = null;
      let pos;

      collection[k].forEach(l => {
        pos = isX ? l.x1 : l.y1;
        if (!start) start = pos;
        if (lastPos && lastPos < pos - 1) {
          count ++;
          const dif = pos - lastPos;
          if (dist) {
            if (Math.abs(dif - dist) > sigma) {
              failed = true;
            }
          } else {
            dist = dif;
          }
        }
        lastPos = pos;
      });
      
      if (!failed && dist && count > 5) {
        this.passed.push({ index: k, dist: dist, start: start, end: pos, count: (pos-start) / dist, isX: isX });
        this.linesToDraw.push(...collection[k]);
      }
    };

    Object.keys(linesByY).forEach(kloop(linesByY, true));
    Object.keys(linesByX).forEach(kloop(linesByX, false));

    let wp = null;
    let hp = null;
    let maxWidth = 0;
    let maxHeight = 0;

    this.passed.forEach(p => {

      let len = p.end - p.start;
      if (p.isX) {
        if (maxWidth < len) {
          maxWidth = len;
          wp = p;
        }
      } else {
        if (maxHeight < len) {
          maxHeight = len;
          hp = p;
        }
      }
    });

    this.crossword = {
      x: wp.start,
      y: hp.start,
      xCount: Math.ceil(wp.count),
      yCount: Math.ceil(hp.count),
      width: wp.end - wp.start,
      height: hp.end - hp.start,
      xDist: (wp.end - wp.start) / (Math.ceil(wp.count) - 1),
      yDist: (hp.end - hp.start) / (Math.ceil(hp.count) - 1),
      selected: {},
      lastSelected: [],
      letters: [],
    };

    for (let x = 0; x < this.crossword.xCount; x++) {
      this.crossword.letters[x] = [];

      for (let y = 0; y < this.crossword.yCount; y++) {
        this.crossword.letters[x][y] = "";
      }
    }

    //console.log(this.lines, lenCount, this.passed);
  };

  draw = () => {
    this.animationFrameRequest = requestAnimationFrame(this.draw);

    const { ctx, canvas } = this;

    if (this.canvasWidth != canvas.offsetWidth || this.canvasHeight != canvas.offsetHeight) {
      scaleCanvasForHiDpi(this.canvasContainer, ctx);
      
      this.canvasWidth = canvas.offsetWidth;
      this.canvasHeight = canvas.offsetHeight;
    }
    
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.save();
    ctx.scale(this.canvasScale, this.canvasScale);
    ctx.translate(this.canvasTranslate.x, this.canvasTranslate.y);
    ctx.strokeStyle = "black";

    ctx.beginPath();
    if (this.crosswordImage?.complete) {
      ctx.drawImage(this.crosswordImage, 0, 0);
    }

    // this.lines.forEach(l => {
    //  if(l.len>window.min && l.len<window.max){ 
    //   ctx.moveTo(l.x1, l.y1);
    //   ctx.lineTo(l.x2, l.y2);
    // }
    // });
    
    // this.linesToDraw.forEach(l => {
    //   ctx.moveTo(l.x1, l.y1);
    //   ctx.lineTo(l.x2, l.y2);
    // });

    if (this.state === states.typingDown || this.state === states.typingRight) {
      let startX = this.crossword.x;
      if (this.state === states.typingDown) startX += this.crossword.selected.x * this.crossword.xDist;
      let startY = this.crossword.y;
      if (this.state === states.typingRight) startY += this.crossword.selected.y * this.crossword.yDist;
      ctx.fillStyle = "#82cfff33";
      ctx.fillRect(startX,
                   startY,
                   this.state === states.typingDown ? this.crossword.xDist : this.crossword.width,
                   this.state === states.typingRight ? this.crossword.yDist : this.crossword.height);
          
      startX = (this.crossword.selected.x) * this.crossword.xDist + this.crossword.x;
      startY = (this.crossword.selected.y) * this.crossword.yDist + this.crossword.y;
      ctx.fillStyle = "#82cfff77";
      ctx.fillRect(startX, startY, this.crossword.xDist, this.crossword.yDist);
    }

    // for (let i = 0; i < this.crossword.xCount; i++) {
    //   ctx.moveTo(this.crossword.x + i * this.crossword.xDist, this.crossword.y);
    //   ctx.lineTo(this.crossword.x + i * this.crossword.xDist, this.crossword.y + this.crossword.height);
    // }
    
    // for (let i = 0; i < this.crossword.yCount; i++) {
    //   ctx.moveTo(this.crossword.x, this.crossword.y + i * this.crossword.yDist);
    //   ctx.lineTo(this.crossword.x + this.crossword.width, this.crossword.y + i * this.crossword.yDist);
    // }

    ctx.fillStyle = "black";
    ctx.font = `${this.crossword.yDist * .7}px Arial`;
    for (let x = 0; x < this.crossword.xCount - 1; x++) {
      for (let y = 0; y < this.crossword.yCount - 1; y++) {
        ctx.fillText(this.crossword.letters[x][y], this.crossword.x + (x + .4) * this.crossword.xDist, this.crossword.y + (y + .85) * this.crossword.yDist);
      }
    }
    
    ctx.stroke();

    ctx.restore();
  };
  
  screenToWorldPos = ({ x, y }) => ({
    x: (x / this.canvasScale) - this.canvasTranslate.x,
    y: (y / this.canvasScale) - this.canvasTranslate.y,
  });

  worldToScreenPos = ({ x, y }) => ({
    x: (x + this.canvasTranslate.x) * this.canvasScale,
    y: (y + this.canvasTranslate.y) * this.canvasScale,
  });

  changeState = state => {
    this.state = state;
    if (this.state === states.typingDown || this.state === states.typingRight) {
      this.textInputNode.style.display = "block";
      this.inputLen = 0;
      this.crossword.lastSelected = [{ x: this.crossword.selected.x, y: this.crossword.selected.y }];
      this.textInputNode.focus();
      this.textInputNode.click();
    } else {
      this.textInputNode.style.display = "none";
    }
    
    // if (this.changeStateCallback) {
    //   if (state === states.direction) setTimeout(() => this.changeStateCallback(state), 100);
    //   else this.changeStateCallback(state);
    // }
  };

  zoom = (pos, amount) => {
    const worldScalePos = this.screenToWorldPos(pos);
    if (isNumeric(amount)) this.canvasScale *= amount;
    const newWorldScalePos = this.screenToWorldPos(pos);
    this.canvasTranslate.x += newWorldScalePos.x - worldScalePos.x;
    this.canvasTranslate.y += newWorldScalePos.y - worldScalePos.y;
  };

  onMouseDown = e => {
    this.pointer.updateMouse(e, "down");
  };

  onMouseMove = e => {
    const { x, y } = this.screenToWorldPos(this.pointer.mousePos);
    this.pointer.updateMouse(e, "move");

    if (e.isPrimary && this.pointer.mouseDown && !this.pointer.isPinching) {
      this.canvasTranslate.x += this.pointer.mouseDelta.x / this.canvasScale;
      this.canvasTranslate.y += this.pointer.mouseDelta.y / this.canvasScale;
    }

    if (this.pointer.isPinching) {
      this.zoom(this.pointer.tzpos, (this.pointer.tdz + this.pointer.tz + this.pointer.tzid) / (this.pointer.tz + this.pointer.tzid));
      this.canvasTranslate.x += this.pointer.tzdpos.x / this.canvasScale;
      this.canvasTranslate.y += this.pointer.tzdpos.y / this.canvasScale;
    }
  };
  onMouseUp = e => {
    this.pointer.updateMouse(e, "up");
  };
  click = e => {
    const wasDragging = this.pointer.mouseDragging;

    const pos = this.screenToWorldPos(this.pointer.mousePos);

    if (pos.x > this.crossword.x &&
        pos.y > this.crossword.y &&
        pos.x < this.crossword.x + this.crossword.width &&
        pos.y < this.crossword.y + this.crossword.height) {
      const oldSelected = {...this.crossword.selected};
      this.crossword.selected.x = Math.floor((pos.x - this.crossword.x) / this.crossword.xDist);
      this.crossword.selected.y = Math.floor((pos.y - this.crossword.y) / this.crossword.yDist);
      if (this.canPlaceLetter(this.crossword.selected.x, this.crossword.selected.y)) {
        let newState = states.typingRight;
        if (oldSelected.x === this.crossword.selected.x && oldSelected.y === this.crossword.selected.y) {
          if (this.state === states.typingRight) newState = states.typingDown;
          else if (this.state === states.typingDown) newState = states.typingRight;
        }
  
        this.changeState(newState);
      } else {
        this.changeState(states.browsing);
      }
    }
    
  };
  onMouseWheel = e => {
    this.zoom(this.pointer.mousePos, 1 - e.deltaY/1000*.5);
    return false;
  };
  onMouseCancel = () => {};
  onMouseOut = () => {};
  onMouseLeave = () => {};
  onKeyDown = e => {
    if (this.textInputNode.value.length < this.inputLen && this.inputLen >= 0) {
      if (this.crossword.lastSelected.length) {
        //this code looks weird (popping twice), just trust me it works
        if (this.crossword.lastSelected.length > 1) {
          this.crossword.lastSelected.pop();
          this.crossword.selected = this.crossword.lastSelected.pop();
          this.crossword.letters[this.crossword.selected.x][this.crossword.selected.y] = "";
        }
      }
    } else {
      const char = this.textInputNode.value[this.textInputNode.value.length - 1].toLocaleUpperCase();
      if (this.state == states.typingRight) {
        this.crossword.letters[this.crossword.selected.x][this.crossword.selected.y] = char;
        this.crossword.selected.x++;

      }
      if (this.state == states.typingDown) {
        this.crossword.letters[this.crossword.selected.x][this.crossword.selected.y] = char;
        this.crossword.selected.y++;
      }

      let backToBrowse = false;
      while (!this.canPlaceLetter(this.crossword.selected.x, this.crossword.selected.y) && !backToBrowse) {
        if (this.state === states.typingRight) {
          this.crossword.selected.x++;
          if (this.crossword.selected.x >= this.crossword.xCount - 1) {
            this.crossword.selected.x = 0;
            this.crossword.selected.y++;
          }
          if (this.crossword.selected.y >= this.crossword.yCount - 1) backToBrowse = true;
        }
        if (this.state === states.typingDown) {
          this.crossword.selected.y++;
          if (this.crossword.selected.y >= this.crossword.yCount - 1) {
            this.crossword.selected.y = 0;
            this.crossword.selected.x++;
            if (this.crossword.selected.x >= this.crossword.xCount - 1) backToBrowse = true;
          }
        }

        if (backToBrowse) this.changeState(states.browsing);
      }
    }
    this.crossword.lastSelected.push({ x: this.crossword.selected.x, y: this.crossword.selected.y });
    
    this.inputLen = this.textInputNode.value.length;
  };

  dispose = () => {
    window.removeEventListener("resize", this.scaleCanvasForHiDpi);
    cancelAnimationFrame(this.animationFrameRequest);
  };
}
