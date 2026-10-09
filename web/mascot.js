(function () {
  var stages = document.querySelectorAll("[data-mascot]");
  if (!stages.length) return;

  var motion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function reduced() {
    return motion.matches;
  }

  function clamp(n) {
    return Math.max(-1, Math.min(1, n));
  }

  stages.forEach(function (stage) {
    var block = stage.querySelector(".mascot-block");
    if (!block) return;
    var pointing = false;
    var nx = 0.82;
    var ny = -0.34;

    function render() {
      if (reduced()) {
        block.style.transform = "";
        stage.style.removeProperty("--lean");
        return;
      }
      var ry = nx * 32;
      var rx = ny * -18;
      block.style.transform = "rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
      stage.style.setProperty("--lean", nx.toFixed(3));
    }

    stage.addEventListener("pointermove", function (event) {
      var rect = stage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      nx = clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2);
      ny = clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2);
      pointing = true;
      render();
    });

    stage.addEventListener("pointerleave", function () {
      pointing = false;
      nx = 0.82;
      ny = -0.34;
      render();
    });

    stage.addEventListener("pointercancel", function () {
      pointing = false;
      nx = 0.82;
      ny = -0.34;
      render();
    });

    window.addEventListener("deviceorientation", function (event) {
      if (pointing || reduced() || event.gamma == null) return;
      nx = clamp(event.gamma / 26 + 0.45);
      ny = clamp(((event.beta == null ? 48 : event.beta) - 48) / 26);
      render();
    });

    render();
  });

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

  if (typeof motion.addEventListener === "function") {
    motion.addEventListener("change", function () {
      stages.forEach(function (stage) {
        var block = stage.querySelector(".mascot-block");
        if (!block) return;
        if (reduced()) {
          block.style.transform = "";
          stage.style.removeProperty("--lean");
        }
      });
    });
  }
})();
