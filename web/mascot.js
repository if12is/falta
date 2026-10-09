import * as THREE from "./vendor/three.module.js";
import { createTypeBlock } from "../extension/typeblock.js";

function mountMascots() {
  var stages = document.querySelectorAll("[data-mascot]");
  if (!stages.length) return;
  var mounted = false;

  stages.forEach(function (stage) {
    var holder = stage.querySelector(".mascot-stage");
    if (!holder) return;
    var canvas = holder.querySelector("canvas");
    if (!canvas) return;
    if (createTypeBlock(THREE, canvas, stage)) mounted = true;
  });

  if (!mounted) return;

  var tilt = document.getElementById("tilt-permit");
  var orientation = window.DeviceOrientationEvent;
  if (tilt && orientation && typeof orientation.requestPermission === "function") {
    tilt.hidden = false;
    tilt.addEventListener("click", function () {
      orientation.requestPermission().then(function (state) {
        if (state === "granted") tilt.hidden = true;
      }).catch(function () {});
    });
  }
}

mountMascots();
