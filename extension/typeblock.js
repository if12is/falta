export function createTypeBlock(THREE, canvas, stage) {
  var motion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function reduced() {
    return motion.matches;
  }

  function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }

  function ceramicTexture() {
    var size = 512;
    var paint = document.createElement("canvas");
    paint.width = size;
    paint.height = size;
    var g = paint.getContext("2d");
    g.fillStyle = "#f3eee4";
    g.fillRect(0, 0, size, size);
    var i;
    for (i = 0; i < 700; i += 1) {
      g.fillStyle = "rgba(90, 68, 48, " + (Math.random() * 0.22) + ")";
      var d = 0.6 + Math.random() * 1.3;
      g.fillRect(Math.random() * size, Math.random() * size, d, d);
    }
    var tex = new THREE.CanvasTexture(paint);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }

  function drawAin(ctx, size) {
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "#1a3058";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "600 " + Math.round(size * 0.72) + "px \"IBM Plex Sans Arabic\", \"Geeza Pro\", Tahoma, sans-serif";
    ctx.fillText("ع", size / 2, size * 0.54);
    var pixels = ctx.getImageData(0, 0, size, size).data;
    var ink = 0;
    var i;
    for (i = 3; i < pixels.length; i += 80) ink += pixels[i];
    if (ink > 80) return;
    ctx.beginPath();
    ctx.moveTo(size * 0.62, size * 0.34);
    ctx.bezierCurveTo(size * 0.78, size * 0.28, size * 0.8, size * 0.48, size * 0.62, size * 0.56);
    ctx.bezierCurveTo(size * 0.4, size * 0.66, size * 0.28, size * 0.58, size * 0.3, size * 0.42);
    ctx.bezierCurveTo(size * 0.32, size * 0.22, size * 0.5, size * 0.22, size * 0.62, size * 0.34);
    ctx.moveTo(size * 0.58, size * 0.58);
    ctx.bezierCurveTo(size * 0.7, size * 0.7, size * 0.55, size * 0.86, size * 0.36, size * 0.78);
    ctx.bezierCurveTo(size * 0.22, size * 0.72, size * 0.34, size * 0.58, size * 0.5, size * 0.6);
    ctx.fill();
  }

  function ainTexture() {
    var size = 512;
    var paint = document.createElement("canvas");
    paint.width = size;
    paint.height = size;
    var ctx = paint.getContext("2d");
    drawAin(ctx, size);
    var tex = new THREE.CanvasTexture(paint);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    return {
      tex: tex,
      refresh: function () {
        drawAin(ctx, size);
        tex.needsUpdate = true;
      }
    };
  }

  function shadowTexture() {
    var size = 128;
    var paint = document.createElement("canvas");
    paint.width = size;
    paint.height = size;
    var g = paint.getContext("2d");
    var grd = g.createRadialGradient(64, 64, 8, 64, 64, 62);
    grd.addColorStop(0, "rgba(36, 28, 22, 0.38)");
    grd.addColorStop(1, "rgba(36, 28, 22, 0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, size, size);
    var tex = new THREE.CanvasTexture(paint);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function roundedSlab(width, height, radius) {
    var shape = new THREE.Shape();
    var x = -width / 2;
    var y = -height / 2;
    shape.moveTo(x + radius, y);
    shape.lineTo(x + width - radius, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);
    shape.lineTo(x + width, y + height - radius);
    shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    shape.lineTo(x + radius, y + height);
    shape.quadraticCurveTo(x, y + height, x, y + height - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);
    return shape;
  }

  function buildCharacter(speckle, ain) {
    var width = 1.28;
    var height = 1.82;
    var depth = 0.46;
    var rig = new THREE.Group();

    var ceramic = new THREE.MeshPhysicalMaterial({
      map: speckle,
      color: 0xffffff,
      roughness: 0.46,
      metalness: 0,
      clearcoat: 0.72,
      clearcoatRoughness: 0.26,
      sheen: 0.55,
      sheenRoughness: 0.42,
      sheenColor: new THREE.Color(0xfff6ec)
    });
    var bodyGeo = new THREE.ExtrudeGeometry(roundedSlab(width, height, 0.2), {
      depth: depth,
      bevelEnabled: true,
      bevelThickness: 0.045,
      bevelSize: 0.04,
      bevelSegments: 3,
      curveSegments: 8
    });
    bodyGeo.translate(0, 0, -depth / 2);
    bodyGeo.computeBoundingBox();
    var box = bodyGeo.boundingBox;
    var frontZ = box.max.z;
    var body = new THREE.Mesh(bodyGeo, ceramic);
    rig.add(body);

    var hole = new THREE.MeshStandardMaterial({ color: 0x1a1612, roughness: 0.28, metalness: 0.05 });
    var eyeGeo = new THREE.SphereGeometry(0.07, 24, 16);
    [-0.2, 0.2].forEach(function (x) {
      var eye = new THREE.Mesh(eyeGeo, hole);
      eye.scale.z = 0.72;
      eye.position.set(x, box.max.y - 0.38, frontZ + 0.012);
      rig.add(eye);
    });

    var letter = new THREE.Mesh(
      new THREE.PlaneGeometry(0.86, 0.86),
      new THREE.MeshPhysicalMaterial({
        map: ain.tex,
        transparent: true,
        roughness: 0.4,
        metalness: 0.04,
        clearcoat: 0.15,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2
      })
    );
    letter.position.set(0, 0.02, frontZ + 0.02);
    rig.add(letter);

    var copper = new THREE.MeshPhysicalMaterial({
      color: 0xc47848,
      metalness: 0.42,
      roughness: 0.34,
      clearcoat: 0.55,
      clearcoatRoughness: 0.3
    });
    var belt = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.055, 18, 48), copper);
    belt.rotation.x = Math.PI / 2;
    belt.scale.set(0.95, 0.42, 1);
    belt.position.y = box.min.y + 0.46;
    rig.add(belt);

    var legGeo = new THREE.CapsuleGeometry(0.11, 0.18, 4, 16);
    var legL = new THREE.Mesh(legGeo, ceramic);
    legL.position.set(-0.26, box.min.y - 0.16, 0.02);
    legL.rotation.z = 0.04;
    rig.add(legL);

    var legR = new THREE.Mesh(legGeo, ceramic);
    legR.position.set(0.3, box.min.y - 0.1, 0.06);
    legR.rotation.z = -0.5;
    legR.rotation.x = 0.12;
    rig.add(legR);

    return rig;
  }

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (err) {
    return null;
  }
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var speckle = ceramicTexture();
  var ain = ainTexture();
  var shadowMap = shadowTexture();
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(28, 1, 0.1, 20);
  camera.position.set(0.12, 0.22, 5.9);
  camera.lookAt(0, 0.02, 0);

  scene.add(new THREE.AmbientLight(0xfff8f2, 0.72));
  scene.add(new THREE.HemisphereLight(0xfff6ee, 0xc4b09a, 0.55));
  var key = new THREE.DirectionalLight(0xfffaf6, 2.35);
  key.position.set(-2.6, 3.4, 4.2);
  scene.add(key);
  var fill = new THREE.DirectionalLight(0xd5e0f0, 0.75);
  fill.position.set(3.2, 1.1, 2.4);
  scene.add(fill);
  var rim = new THREE.DirectionalLight(0xe7c3a4, 0.9);
  rim.position.set(1.2, 2.2, -3.2);
  scene.add(rim);

  var rig = buildCharacter(speckle, ain);
  scene.add(rig);

  var shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.1, 0.85),
    new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.55;
  scene.add(shadow);

  var world = {
    canvas: canvas,
    renderer: renderer,
    scene: scene,
    camera: camera,
    rig: rig,
    shadow: shadow,
    rx: 0.1,
    ry: 0.42,
    rz: -0.06,
    tx: 0.1,
    ty: 0.42,
    tz: -0.06,
    pointing: false
  };

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ain.refresh(); }).catch(function () {});
  }

  function resize() {
    var width = canvas.clientWidth;
    var height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function applyTargets(x, y, z) {
    world.tx = x;
    world.ty = y;
    world.tz = z;
  }

  function restPose() {
    return { x: 0.1, y: 0.42, z: -0.06 };
  }

  function lean(event, reach, yScale, zScale) {
    if (reduced()) return;
    var rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var dx = clamp((event.clientX - cx) / Math.max(window.innerWidth * reach, 1), -1, 1);
    var dy = clamp((event.clientY - cy) / Math.max(window.innerHeight * reach, 1), -1, 1);
    world.pointing = true;
    applyTargets(0.06 + dy * -0.5, yScale + dx * 0.78, -0.04 + dx * zScale);
  }

  function onStageMove(event) {
    if (reduced()) return;
    var rect = canvas.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var dx = clamp((event.clientX - cx) / Math.max(window.innerWidth * 0.45, 1), -1, 1);
    var dy = clamp((event.clientY - cy) / Math.max(window.innerHeight * 0.45, 1), -1, 1);
    world.pointing = true;
    applyTargets(0.06 + dy * -0.48, 0.12 + dx * 0.72, -0.04 + dx * -0.14);
  }

  function onPointerMove(event) {
    lean(event, 0.42, 0.1, -0.16);
  }

  function onPointerLeave() {
    var rest = restPose();
    world.pointing = false;
    applyTargets(rest.x, rest.y, rest.z);
  }

  function onOrientation(event) {
    if (reduced() || event.gamma == null) return;
    var tiltY = clamp(event.gamma / 32, -0.7, 0.7);
    var tiltX = clamp(((event.beta == null ? 42 : event.beta) - 42) / 36, -0.4, 0.4);
    if (world.pointing) return;
    applyTargets(tiltX, tiltY, tiltY * -0.12);
  }

  if (stage) stage.addEventListener("pointermove", onStageMove);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerleave", onPointerLeave);
  window.addEventListener("deviceorientation", onOrientation);

  var last = 0;
  var running = false;

  function frame(now) {
    if (!running) return;
    var dt = last ? Math.min(48, now - last) : 16;
    last = now;
    var glide = 1 - Math.pow(0.0015, dt / 1000);
    var idle = reduced() ? 0 : now * 0.001;
    resize();
    if (reduced()) {
      var rest = restPose();
      world.rx = rest.x;
      world.ry = rest.y;
      world.rz = rest.z;
    } else {
      world.rx += (world.tx - world.rx) * glide;
      world.ry += (world.ty - world.ry) * glide;
      world.rz += (world.tz - world.rz) * glide;
    }
    world.rig.rotation.x = world.rx + Math.sin(idle * 1.3) * 0.02;
    world.rig.rotation.y = world.ry + Math.sin(idle) * 0.035;
    world.rig.rotation.z = world.rz;
    canvas.dataset.ry = world.ry.toFixed(3);
    world.rig.position.x = world.ry * 0.06;
    world.rig.position.y = Math.sin(idle * 1.4) * 0.025 - world.rx * 0.04;
    world.shadow.position.x = -world.rig.rotation.y * 0.28;
    world.shadow.material.opacity = 0.9;
    renderer.render(scene, camera);
    if (reduced()) {
      running = false;
      return;
    }
    requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    last = 0;
    requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
  }

  resize();
  start();

  if (typeof motion.addEventListener === "function") {
    motion.addEventListener("change", start);
  }

  return { start: start, stop: stop };
}
