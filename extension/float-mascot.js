import * as THREE from "./vendor/three.module.js";
import { createTypeBlock } from "./typeblock.js";

export function attach(canvas) {
  return createTypeBlock(THREE, canvas, canvas.parentElement);
}
