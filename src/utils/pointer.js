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

    this.m2Id = null;
    this.m2Pos = { x: 0, y: 0 };
    this.m2DownPos = { x: 0, y: 0 };
    this.m2IsDragging = false;
    
    this.isPinching = false;
    this.isScalingX = false;
    this.isScalingY = false;
    this.isRotating = false;
    this.tzipos = { x: 0, y: 0 }; //touch zoom initial position
    this.tzpos = { x: 0, y: 0 }; //touch zoom position
    this.tzdpos = { x: 0, y: 0 }; //touch zoom delta position
    this.tzid = 0; //touch zoom initial distance
    this.tzxid = 0; //touch zoom x initial distance
    this.tzyid = 0; //touch zoom y initial distance
    this.tz = 0; //touch zoom
    this.tzx = 0; //touch zoom x
    this.tzy = 0; //touch zoom y
    this.tdz = 0; //touch delta zoom
    this.tdzx = 0; //touch delta zoom x
    this.tdzy = 0; //touch delta zoom y
    this.tria = 0; //touch rotate initial angle
    this.tr = 0; //touch rotate
    this.tdr = 0; //touch delta rotate
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
    this.tzipos = { x: 0, y: 0 }; //touch zoom initial position
    this.tzpos = { x: 0, y: 0 }; //touch zoom position
    this.tzdpos = { x: 0, y: 0 }; //touch zoom delta position
    this.tzid = 0; //touch zoom initial distance
    this.tzxid = 0; //touch zoom x initial distance
    this.tzyid = 0; //touch zoom y initial distance
    this.tz = 0; //touch zoom
    this.tzx = 0; //touch zoom x
    this.tzy = 0; //touch zoom y
    this.tdz = 0; //touch delta zoom
    this.tdzx = 0; //touch delta zoom x
    this.tdzy = 0; //touch delta zoom y
    this.tria = 0; //touch rotate initial angle
    this.tr = 0; //touch rotate
    this.tdr = 0; //touch delta rotate
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
      const tzpos = {
        x: (this.mousePos.x + this.m2Pos.x) / 2,
        y: (this.mousePos.y + this.m2Pos.y) / 2,
      };
      const tz = distance(this.mousePos.x, this.mousePos.y, this.m2Pos.x, this.m2Pos.y);
      const tzx = Math.abs(this.mousePos.x - this.m2Pos.x);
      const tzy = Math.abs(this.mousePos.y - this.m2Pos.y);
      const a = angle(this.mousePos.x, this.mousePos.y, this.m2Pos.x, this.m2Pos.y);

      if (!this.isPinching) {
        this.isPinching = true;
        this.tzipos = tzpos;
        this.tzpos = tzpos;
        this.tzid = tz;
        this.tzxid = tzx;
        this.tzyid = tzy;
        this.tria = a;

        this.tz = 0;
        this.tzx = 0;
        this.tzy = 0;
        this.tr = 0;
      }
      this.tzdpos.x = tzpos.x - this.tzpos.x;
      this.tzdpos.y = tzpos.y - this.tzpos.y;
      this.tzpos = tzpos;

      const newtz = tz - this.tzid;
      const newtzx = tzx - this.tzxid;
      const newtzy = tzy - this.tzyid;

      this.tdz = newtz - this.tz;
      this.tdzx = newtzx - this.tzx;
      this.tdzy = newtzy - this.tzy;

      this.tz = newtz;
      this.tzx = newtzx;
      this.tzy = newtzy;

      const newtr = a - this.tria;

      this.tdr = newtr - this.tr;
      this.tr = newtr;

      if (Math.abs(this.tzx) > ZOOM_THRESHOLD) {
        this.isScalingX = true;
      }

      if (Math.abs(this.tzy) > ZOOM_THRESHOLD) {
        this.isScalingY = true;
      }

      if (Math.abs(this.tr) > ROTATE_THRESHOLD_RAD) {
        this.isRotating = true;
      }
    } else {
      this.isPinching = false;
      this.pinchAction = null;
    }

  };
};