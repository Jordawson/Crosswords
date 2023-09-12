import { distance, angle } from "./index";

export const DRAG_THRESHOLD = 10;
export const ZOOM_THRESHOLD = 30;
export const ROTATE_THRESHOLD_RAD = 0.03;

export default class Pointer {
  constructor() {
    this.hasMouse = false;
    this.mouseInWindow = false;

    this.mouseDown = false;
    this.mouseDragging = false;
    this.mousePos = { x: 0, y: 0 };
    this.mouseDownPos = { x: 0, y: 0 };
    this.mouseDelta = { x: 0, y: 0 };

    this.resetMultiTouchVars();
  }

  resetMultiTouchVars = () => {
    this.m2Id = null;
    this.m2Pos = { x: 0, y: 0 };
    this.m2DownPos = { x: 0, y: 0 };
    this.m2IsDragging = false;
    
    this.isPinching = false;
    this.isScalingX = false;
    this.isScalingY = false;
    this.isRotating = false;
    this.touchZoomInitialPos = { x: 0, y: 0 };
    this.touchZoomPos = { x: 0, y: 0 };
    this.touchZoomDeltaPos = { x: 0, y: 0 };
    this.touchZoomInitialDistance = 0;
    this.touchZoomXInitialDistance = 0;
    this.touchZoomYInitialDistance = 0;
    this.touchZoom = 0;
    this.touchZoomX = 0;
    this.touchZoomY = 0;
    this.touchDeltaZoom = 0;
    this.touchDeltaZoomX = 0;
    this.touchDeltaZoomY = 0;
    this.touchRotateInitialAngle = 0;
    this.touchRotate = 0;
    this.touchDeltaRotate = 0;
  };

  updateMouse = (e, event) => {
    if (e.isPrimary) {
      if (event === "leave") {
        this.mouseInWindow = false;
        return;
      }

      this.mouseDelta.x = e.offsetX - this.mousePos.x;
      this.mouseDelta.y = e.offsetY - this.mousePos.y;
      this.mousePos.x = e.offsetX;
      this.mousePos.y = e.offsetY;

      if (event === "down") {
        this.mouseDown = true;
        this.mouseDownPos.x = e.offsetX;
        this.mouseDownPos.y = e.offsetY;
      }

      if (event === "move") {
        if (this.mouseDown && distance(this.mouseDownPos.x, this.mouseDownPos.y, this.mousePos.x, this.mousePos.y) > DRAG_THRESHOLD) {
          this.mouseDragging = true;
        }
        this.mouseInWindow = true;
      }

      if (event === "up") {
        this.mouseDown = false;
        this.mouseDragging = false;
        this.resetMultiTouchVars();
      }
    } else {
      if (this.m2Id === null) this.m2Id = e.pointerId;
      if (this.m2Id !== e.pointerId) return;

      this.m2Pos.x = e.offsetX;
      this.m2Pos.y = e.offsetY;

      if (event === "down") {
        this.m2DownPos.x = e.offsetX;
        this.m2DownPos.y = e.offsetY;
      }

      if (event === "move") {
        if (distance(this.m2DownPos.x, this.m2DownPos.y, this.m2Pos.x, this.m2Pos.y) > DRAG_THRESHOLD) {
          this.m2Dragging = true;
        }
      }

      if (event === "up") this.resetMultiTouchVars();
    }

    if ((this.mouseDragging || this.m2Dragging) && this.m2Id) {
      const touchZoomPos = {
        x: (this.mousePos.x + this.m2Pos.x) / 2,
        y: (this.mousePos.y + this.m2Pos.y) / 2,
      };
      const touchZoom = distance(this.mousePos.x, this.mousePos.y, this.m2Pos.x, this.m2Pos.y);
      const touchZoomX = Math.abs(this.mousePos.x - this.m2Pos.x);
      const touchZoomY = Math.abs(this.mousePos.y - this.m2Pos.y);
      const a = angle(this.mousePos.x, this.mousePos.y, this.m2Pos.x, this.m2Pos.y);

      if (!this.isPinching) {
        this.isPinching = true;
        this.touchZoomInitialPos = touchZoomPos;
        this.touchZoomPos = touchZoomPos;
        this.touchZoomInitialDistance = touchZoom;
        this.touchZoomXInitialDistance = touchZoomX;
        this.touchZoomYInitialDistance = touchZoomY;
        this.touchRotateInitialAngle = a;

        this.touchZoom = 0;
        this.touchZoomX = 0;
        this.touchZoomY = 0;
        this.touchRotate = 0;
      }
      this.touchZoomDeltaPos.x = touchZoomPos.x - this.touchZoomPos.x;
      this.touchZoomDeltaPos.y = touchZoomPos.y - this.touchZoomPos.y;
      this.touchZoomPos = touchZoomPos;

      const newtz = touchZoom - this.touchZoomInitialDistance;
      const newtzx = touchZoomX - this.touchZoomXInitialDistance;
      const newtzy = touchZoomY - this.touchZoomYInitialDistance;

      this.touchDeltaZoom = newtz - this.touchZoom;
      this.touchDeltaZoomX = newtzx - this.touchZoomX;
      this.touchDeltaZoomY = newtzy - this.touchZoomY;

      this.touchZoom = newtz;
      this.touchZoomX = newtzx;
      this.touchZoomY = newtzy;

      const newtr = a - this.touchRotateInitialAngle;

      this.touchDeltaRotate = newtr - this.touchRotate;
      this.touchRotate = newtr;

      if (Math.abs(this.touchZoomX) > ZOOM_THRESHOLD) {
        this.isScalingX = true;
      }

      if (Math.abs(this.touchZoomY) > ZOOM_THRESHOLD) {
        this.isScalingY = true;
      }

      if (Math.abs(this.touchRotate) > ROTATE_THRESHOLD_RAD) {
        this.isRotating = true;
      }
    } else {
      this.isPinching = false;
      this.pinchAction = null;
    }
  };
};