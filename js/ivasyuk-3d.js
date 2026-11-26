(function () {
  'use strict';

  function initIvasyukLiving3D() {
    var container = document.getElementById('ivasyuk-3d-stage');
    if (!container || typeof THREE === 'undefined') return;

    var rect = container.getBoundingClientRect();
    var width = Math.max(rect.width, 280);
    var height = Math.max(rect.height, 280);

    // 1. Scene, Camera, Renderer
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    camera.position.set(0, 0.35, 6.2);

    var renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace || 'srgb';
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);
    renderer.domElement.className = 'ivasyuk-canvas';

    // 2. Lighting (Warm Gallery Spotlight + Marble Rim)
    var ambientLight = new THREE.AmbientLight(0xf2efe9, 1.25);
    scene.add(ambientLight);

    var keyLight = new THREE.DirectionalLight(0xfff6e5, 2.2);
    keyLight.position.set(3.2, 4.5, 4.0);
    scene.add(keyLight);

    var fillLight = new THREE.DirectionalLight(0xdde5ed, 1.4);
    fillLight.position.set(-3.5, 2.0, 3.0);
    scene.add(fillLight);

    var backRimLight = new THREE.DirectionalLight(0xcbc4b5, 1.8);
    backRimLight.position.set(0, -2.5, -2.5);
    scene.add(backRimLight);

    // 3. Materials
    var bronzeMat = new THREE.MeshStandardMaterial({
      color: 0x4d463d,
      roughness: 0.42,
      metalness: 0.64
    });

    var bronzeAccentMat = new THREE.MeshStandardMaterial({
      color: 0x6e6354,
      roughness: 0.36,
      metalness: 0.72
    });

    var goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0x8a7b64,
      roughness: 0.32,
      metalness: 0.8
    });

    var marbleBackdropMat = new THREE.MeshStandardMaterial({
      color: 0xe8e5de,
      roughness: 0.55,
      metalness: 0.08
    });

    // 4. Composition Root
    var composition = new THREE.Group();
    scene.add(composition);

    // 4a. Sculpted Oval Gallery Plaque
    var frameCurve = new THREE.EllipseCurve(0, 0, 1.62, 2.15, 0, 2 * Math.PI, false, 0);
    var framePoints = frameCurve.getPoints(48);
    var frameShape = new THREE.Shape(framePoints);
    var frameGeo = new THREE.ExtrudeGeometry(frameShape, {
      depth: 0.18,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.08,
      bevelThickness: 0.08
    });
    frameGeo.center();
    var frameMesh = new THREE.Mesh(frameGeo, marbleBackdropMat);
    frameMesh.position.z = -0.15;
    composition.add(frameMesh);

    // 4b. Bronze Inner Moulding
    var innerCurve = new THREE.EllipseCurve(0, 0, 1.48, 2.0, 0, 2 * Math.PI, false, 0);
    var innerPoints = innerCurve.getPoints(48);
    var innerShape = new THREE.Shape(innerPoints);
    var innerGeo = new THREE.ExtrudeGeometry(innerShape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.03,
      bevelThickness: 0.03
    });
    innerGeo.center();
    var innerMesh = new THREE.Mesh(innerGeo, goldTrimMat);
    innerMesh.position.z = -0.06;
    composition.add(innerMesh);

    // 4c. Sculpted Figure of Volodymyr Ivasyuk (Bas-Relief Bust)
    var bustGroup = new THREE.Group();
    composition.add(bustGroup);

    // Torso / Suit
    var torsoGeo = new THREE.CylinderGeometry(0.55, 0.72, 1.15, 18);
    torsoGeo.scale(1, 1, 0.45);
    var torsoMesh = new THREE.Mesh(torsoGeo, bronzeMat);
    torsoMesh.position.set(-0.06, -0.65, 0.08);
    bustGroup.add(torsoMesh);

    // Lapels & Collar
    var lapelL = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.65, 0.08),
      bronzeAccentMat
    );
    lapelL.position.set(-0.24, -0.48, 0.22);
    lapelL.rotation.z = -0.18;
    bustGroup.add(lapelL);

    var lapelR = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.65, 0.08),
      bronzeAccentMat
    );
    lapelR.position.set(0.12, -0.48, 0.22);
    lapelR.rotation.z = 0.18;
    bustGroup.add(lapelR);

    // Bow tie
    var bowGeo = new THREE.ConeGeometry(0.11, 0.22, 5);
    var bowL = new THREE.Mesh(bowGeo, goldTrimMat);
    bowL.rotation.z = Math.PI / 2;
    bowL.position.set(-0.11, -0.15, 0.24);
    bustGroup.add(bowL);

    var bowR = new THREE.Mesh(bowGeo, goldTrimMat);
    bowR.rotation.z = -Math.PI / 2;
    bowR.position.set(-0.01, -0.15, 0.24);
    bustGroup.add(bowR);

    // Neck
    var neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.24, 0.32, 14),
      bronzeMat
    );
    neck.position.set(-0.06, 0.02, 0.1);
    bustGroup.add(neck);

    // Head
    var headGeo = new THREE.SphereGeometry(0.36, 24, 20);
    headGeo.scale(0.85, 1.15, 0.88);
    var head = new THREE.Mesh(headGeo, bronzeAccentMat);
    head.position.set(-0.06, 0.44, 0.18);
    head.rotation.y = -0.08;
    bustGroup.add(head);

    // Hair Style (Volodymyr Ivasyuk's signature romantic parted waves)
    var hairGeo = new THREE.SphereGeometry(0.39, 20, 16);
    hairGeo.scale(0.94, 1.05, 0.95);
    var hair = new THREE.Mesh(hairGeo, bronzeMat);
    hair.position.set(-0.08, 0.58, 0.16);
    hair.rotation.z = -0.12;
    bustGroup.add(hair);

    var hairWave = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.26, 0.45, 10),
      bronzeMat
    );
    hairWave.position.set(-0.25, 0.52, 0.28);
    hairWave.rotation.set(0.1, 0.15, -0.65);
    bustGroup.add(hairWave);

    // 4d. Sculpted Violin Resting at Heart
    var violinGroup = new THREE.Group();
    violinGroup.position.set(0.34, -0.38, 0.28);
    violinGroup.rotation.set(0.12, -0.18, 0.32);
    composition.add(violinGroup);

    // Lower bout
    var boutLower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.09, 20),
      bronzeAccentMat
    );
    boutLower.scale.set(1.0, 1.0, 0.48);
    boutLower.rotation.x = Math.PI / 2;
    violinGroup.add(boutLower);

    // Waist
    var boutMid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.17, 0.085, 18),
      goldTrimMat
    );
    boutMid.scale.set(0.9, 1.0, 0.45);
    boutMid.rotation.x = Math.PI / 2;
    boutMid.position.y = 0.28;
    violinGroup.add(boutMid);

    // Upper bout
    var boutUpper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.21, 0.21, 0.085, 20),
      bronzeAccentMat
    );
    boutUpper.scale.set(0.95, 1.0, 0.46);
    boutUpper.rotation.x = Math.PI / 2;
    boutUpper.position.y = 0.54;
    violinGroup.add(boutUpper);

    // Fingerboard & Neck
    var vNeck = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, 0.62, 0.04),
      goldTrimMat
    );
    vNeck.position.set(0, 0.88, 0.04);
    violinGroup.add(vNeck);

    // Scroll
    var vScroll = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 12, 10),
      bronzeMat
    );
    vScroll.position.set(0, 1.22, 0.04);
    violinGroup.add(vScroll);

    // Violin Bow
    var bowStick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 1.6, 8),
      goldTrimMat
    );
    bowStick.position.set(-0.22, 0.35, 0.08);
    bowStick.rotation.set(0.05, 0, -0.38);
    violinGroup.add(bowStick);

    // 4e. Engraved Bronze Plaque at Bottom of Frame
    var plaqueGeo = new THREE.BoxGeometry(1.68, 0.28, 0.06);
    var plaqueMesh = new THREE.Mesh(plaqueGeo, goldTrimMat);
    plaqueMesh.position.set(0, -1.58, 0.06);
    composition.add(plaqueMesh);

    // 5. Ambient Micro-Sparkle Particles («Музичні іскри спадщини»)
    var particleCount = 38;
    var particleGeo = new THREE.BufferGeometry();
    var particlePos = new Float32Array(particleCount * 3);
    var particleSeeds = [];

    for (var i = 0; i < particleCount; i++) {
      var angle = Math.random() * Math.PI * 2;
      var radius = 1.35 + Math.random() * 1.45;
      var py = -1.6 + Math.random() * 3.4;
      particlePos[i * 3] = Math.cos(angle) * radius;
      particlePos[i * 3 + 1] = py;
      particlePos[i * 3 + 2] = Math.sin(angle) * 0.45;
      particleSeeds.push({
        angle: angle,
        radius: radius,
        y: py,
        speed: 0.15 + Math.random() * 0.35
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    var particleMat = new THREE.PointsMaterial({
      color: 0x8a7b64,
      size: 0.042,
      transparent: true,
      opacity: 0.45
    });
    var particles = new THREE.Points(particleGeo, particleMat);
    composition.add(particles);

    // 6. Subtle Cursor Reaction (NO DRAG, Pure Smooth Tilt Parallax)
    var state = {
      targetTiltX: 0,
      targetTiltY: 0,
      targetTiltZ: 0,
      currentTiltX: 0,
      currentTiltY: 0,
      currentTiltZ: 0
    };

    function onMouseMove(e) {
      var r = container.getBoundingClientRect();
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      var nx = (e.clientX - cx) / (window.innerWidth * 0.5);
      var ny = (e.clientY - cy) / (window.innerHeight * 0.5);

      state.targetTiltY = Math.max(-0.24, Math.min(0.24, nx * 0.22));
      state.targetTiltX = Math.max(-0.16, Math.min(0.16, -ny * 0.15));
      state.targetTiltZ = state.targetTiltY * 0.14;
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    function onResize() {
      var r = container.getBoundingClientRect();
      var w = Math.max(r.width, 280);
      var h = Math.max(r.height, 280);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      var narrow = w < 540 ? 1.25 : 1.0;
      camera.position.z = 6.2 * narrow;
      camera.updateProjectionMatrix();
    }

    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(onResize);
      ro.observe(container);
    }
    window.addEventListener('resize', onResize);
    onResize();

    // 7. Ambient Breathing Animation Loop
    var clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      var elapsed = clock.getElapsedTime();

      // Smooth lerp to mouse cursor position
      state.currentTiltY += (state.targetTiltY - state.currentTiltY) * 0.055;
      state.currentTiltX += (state.targetTiltX - state.currentTiltX) * 0.055;
      state.currentTiltZ += (state.targetTiltZ - state.currentTiltZ) * 0.055;

      // Organic gentle floating breathe
      var breathe = Math.sin(elapsed * 0.85) * 0.04;
      composition.position.y = breathe;
      composition.rotation.y = state.currentTiltY + Math.sin(elapsed * 0.4) * 0.015;
      composition.rotation.x = state.currentTiltX;
      composition.rotation.z = state.currentTiltZ + Math.cos(elapsed * 0.5) * 0.008;

      // Drift micro-particles
      var pos = particleGeo.attributes.position.array;
      for (var p = 0; p < particleCount; p++) {
        var s = particleSeeds[p];
        var a = s.angle + elapsed * s.speed * 0.35;
        pos[p * 3] = Math.cos(a) * s.radius;
        pos[p * 3 + 1] = s.y + Math.sin(elapsed * 0.6 + p) * 0.05;
        pos[p * 3 + 2] = Math.sin(a) * 0.45;
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }

    animate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIvasyukLiving3D);
  } else {
    initIvasyukLiving3D();
  }
})();
