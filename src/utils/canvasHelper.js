
//call this passing in the node to a div that is sized how you want the canvas sized
//the div can only have one child element which is a canvas
export const scaleCanvasForHiDpi = (canvasContainer, ctx) => {
  var dpr = window.devicePixelRatio || 1;
  var rect = canvasContainer.getBoundingClientRect();
  canvasContainer.children[0].width = rect.width * dpr;
  canvasContainer.children[0].height = rect.height * dpr;
  ctx.scale(dpr, dpr);
};
