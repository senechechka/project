(function () {
  'use strict';

  function createPlaqueTexture() {
    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    var ctx = canvas.getContext('2d');

    // Dark polished granite background
    ctx.fillStyle = '#181a1d';
    ctx.fillRect(0, 0, 512, 256);

    // Subtle stone grain
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (var i = 0; i < 600; i++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 256, 2, 2);
    }

    // Thin border
    ctx.strokeStyle = '#7e7463';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 492, 236);

    // Engraved Ukrainian inscription
    ctx.fillStyle = '#d8d0c1';
    ctx.textAlign = 'center';
    ctx.font = '600 22px Georgia, serif';
    ctx.fillText('У ЦЬОМУ БУДИНКУ', 256, 56);
    ctx.font = '700 24px Georgia, serif';
    ctx.fillText('4.03.1949 р. НАРОДИВСЯ', 256, 94);
    ctx.font = '500 20px Georgia, serif';
    ctx.fillText('ВИДАТНИЙ УКРАЇНСЬКИЙ КОМПОЗИТОР', 256, 132);
    ctx.fillStyle = '#efe8da';
    ctx.font = '700 32px Georgia, serif';
    ctx.fillText('ВОЛОДИМИР ІВАСЮК', 256, 186);

    var tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace || 'srgb';
    return tex;
  }

  function createPortraitPlaqueTexture() {
    var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 320;
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1a1c20';
    ctx.fillRect(0, 0, 256, 320);

    ctx.strokeStyle = '#6f6658';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 240, 304);

    // Stylized engraved bust silhouette
    ctx.fillStyle = '#b9b2a4';
    ctx.beginPath();
    ctx.ellipse(128, 118, 36, 46, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair wave
    ctx.fillStyle = '#7a746a';
    ctx.beginPath();
    ctx.ellipse(122, 92, 38, 24, -0.2, Math.PI, Math.PI * 2);
    ctx.fill();

    // Shoulders
    ctx.fillStyle = '#999286';
    ctx.beginPath();
    ctx.moveTo(64, 260);
    ctx.quadraticCurveTo(78, 178, 128, 176);
    ctx.quadraticCurveTo(178, 178, 192, 260);
    ctx.closePath();
    ctx.fill();

    var tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace || 'srgb';
    return tex;
  }

  function initIvasyukLiving3D() {
    var container = document.getElementById('ivasyuk-3d-stage');
    if (!container || typeof THREE === 'undefined') return;

    var rect = container.getBoundingClientRect();
    var width = Math.max(rect.width, 280);
    var height = Math.max(rect.height, 280);

    // 1. Scene, Camera, Renderer
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 80);
    camera.position.set(1.6, 1.55, 6.6);
    camera.lookAt(0, 0.35, 0);

    var renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace || 'srgb';
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    renderer.domElement.className = 'ivasyuk-canvas';

    // 2. Natural Daylight Lighting
    var hemiLight = new THREE.HemisphereLight(0xfffdf8, 0xc9c3b8, 1.15);
    scene.add(hemiLight);

    var sunLight = new THREE.DirectionalLight(0xfff6e8, 1.85);
    sunLight.position.set(4.5, 6.5, 5.2);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 20;
    sunLight.shadow.camera.left = -4;
    sunLight.shadow.camera.right = 4;
    sunLight.shadow.camera.top = 4;
    sunLight.shadow.camera.bottom = -4;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    var fillLight = new THREE.DirectionalLight(0xdbe4ef, 0.75);
    fillLight.position.set(-4.5, 2.5, 3.0);
    scene.add(fillLight);

    // 3. Materials matching the real house in Kitsman (ivasiuk-house.jpg)
    var whitePlasterMat = new THREE.MeshStandardMaterial({
      color: 0xf1efe9,
      roughness: 0.88,
      metalness: 0.02
    });

    var brownWainscotMat = new THREE.MeshStandardMaterial({
      color: 0x4f261f,
      roughness: 0.78,
      metalness: 0.05
    });

    var brownWoodMat = new THREE.MeshStandardMaterial({
      color: 0x431e18,
      roughness: 0.72,
      metalness: 0.06
    });

    var slateRoofMat = new THREE.MeshStandardMaterial({
      color: 0x676b6e,
      roughness: 0.86,
      metalness: 0.08
    });

    var gutterMetalMat = new THREE.MeshStandardMaterial({
      color: 0xa4aab0,
      roughness: 0.35,
      metalness: 0.72
    });

    var glassMat = new THREE.MeshStandardMaterial({
      color: 0x202830,
      roughness: 0.16,
      metalness: 0.55
    });

    var stoneFoundationMat = new THREE.MeshStandardMaterial({
      color: 0x85827c,
      roughness: 0.92,
      metalness: 0.03
    });

    var fenceWoodMat = new THREE.MeshStandardMaterial({
      color: 0x8f897e,
      roughness: 0.9,
      metalness: 0.02
    });

    var foliageMat = new THREE.MeshStandardMaterial({
      color: 0x557142,
      roughness: 0.85,
      metalness: 0.02
    });

    var gardenGroundMat = new THREE.MeshStandardMaterial({
      color: 0xd9d6ce,
      roughness: 0.92,
      metalness: 0.02
    });

    // 4. Root Diorama Group
    var diorama = new THREE.Group();
    diorama.position.set(0, -0.35, 0);
    diorama.rotation.y = -0.32;
    scene.add(diorama);

    // 4a. Ground Yard Base
    var baseGeo = new THREE.CylinderGeometry(2.85, 2.95, 0.16, 48);
    var baseMesh = new THREE.Mesh(baseGeo, gardenGroundMat);
    baseMesh.position.y = -0.08;
    baseMesh.receiveShadow = true;
    diorama.add(baseMesh);

    var grassMat = new THREE.MeshStandardMaterial({
      color: 0x6f8454,
      roughness: 0.94,
      metalness: 0.0
    });
    var grassGeo = new THREE.CylinderGeometry(2.68, 2.7, 0.03, 48);
    var grassMesh = new THREE.Mesh(grassGeo, grassMat);
    grassMesh.position.y = 0.01;
    grassMesh.receiveShadow = true;
    diorama.add(grassMesh);

    // 4b. House Main Body (Whitewashed Bukovinian Mazanka)
    var houseW = 3.5;
    var houseD = 2.3;
    var wallH = 1.42;

    var plinth = new THREE.Mesh(
      new THREE.BoxGeometry(houseW + 0.06, 0.16, houseD + 0.06),
      stoneFoundationMat
    );
    plinth.position.set(-0.1, 0.08, 0);
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    diorama.add(plinth);

    var upperWall = new THREE.Mesh(
      new THREE.BoxGeometry(houseW, wallH, houseD),
      whitePlasterMat
    );
    upperWall.position.set(-0.1, 0.16 + wallH / 2, 0);
    upperWall.castShadow = true;
    upperWall.receiveShadow = true;
    diorama.add(upperWall);

    // Lower brown vertical wooden wainscot paneling
    var wainscotH = 0.48;
    var wainscot = new THREE.Mesh(
      new THREE.BoxGeometry(houseW + 0.025, wainscotH, houseD + 0.025),
      brownWainscotMat
    );
    wainscot.position.set(-0.1, 0.16 + wainscotH / 2, 0);
    wainscot.castShadow = true;
    wainscot.receiveShadow = true;
    diorama.add(wainscot);

    var battenGeo = new THREE.BoxGeometry(0.018, wainscotH + 0.01, 0.018);
    for (var bx = -1.78; bx <= 1.62; bx += 0.14) {
      var bFront = new THREE.Mesh(battenGeo, brownWoodMat);
      bFront.position.set(bx, 0.16 + wainscotH / 2, houseD / 2 + 0.016);
      diorama.add(bFront);
    }
    for (var bz = -1.08; bz <= 1.08; bz += 0.14) {
      var bRight = new THREE.Mesh(battenGeo, brownWoodMat);
      bRight.position.set(-0.1 + houseW / 2 + 0.016, 0.16 + wainscotH / 2, bz);
      diorama.add(bRight);
    }

    // 4c. Hipped Corrugated Slate Roof
    var roofGroup = new THREE.Group();
    roofGroup.position.set(-0.1, 0.16 + wallH, 0);
    diorama.add(roofGroup);

    var roofH = 1.02;
    var roofGeo = new THREE.ConeGeometry(1, roofH, 4, 1);
    roofGeo.rotateY(Math.PI / 4);
    var roofMesh = new THREE.Mesh(roofGeo, slateRoofMat);
    roofMesh.scale.set((houseW + 0.44) / Math.SQRT2, 1, (houseD + 0.46) / Math.SQRT2);
    roofMesh.position.y = roofH / 2 - 0.02;
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    roofGroup.add(roofMesh);

    var ridgeBeam = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 0.07, 0.11),
      slateRoofMat
    );
    ridgeBeam.position.set(0, roofH - 0.03, 0);
    roofGroup.add(ridgeBeam);

    // Corrugated slate ribs on front roof slope
    var ribGeo = new THREE.CylinderGeometry(0.016, 0.016, 1.38, 8);
    for (var rx = -1.35; rx <= 1.35; rx += 0.13) {
      var rib = new THREE.Mesh(ribGeo, slateRoofMat);
      rib.position.set(rx, roofH * 0.44, houseD * 0.31);
      rib.rotation.x = -0.82;
      roofGroup.add(rib);
    }

    var chimney = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.48, 0.22),
      stoneFoundationMat
    );
    chimney.position.set(-0.65, roofH * 0.85, -0.25);
    chimney.castShadow = true;
    roofGroup.add(chimney);

    // Wooden rafters under front eave
    var bracketGeo = new THREE.BoxGeometry(0.055, 0.1, 0.22);
    for (var kx = -1.55; kx <= 1.55; kx += 0.62) {
      var bracket = new THREE.Mesh(bracketGeo, brownWoodMat);
      bracket.position.set(kx, -0.05, houseD / 2 + 0.08);
      roofGroup.add(bracket);
    }

    // Galvanized rain gutter pipe
    var gutter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.038, houseW + 0.48, 14),
      gutterMetalMat
    );
    gutter.rotation.z = Math.PI / 2;
    gutter.position.set(0, -0.04, houseD / 2 + 0.22);
    roofGroup.add(gutter);

    var downspout = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.026, wallH + 0.06, 10),
      gutterMetalMat
    );
    downspout.position.set(-houseW / 2 - 0.15, -wallH / 2 - 0.02, houseD / 2 + 0.08);
    roofGroup.add(downspout);

    // 4d. Front Casement Windows
    function createWindow(xPos, yPos, zPos, rotY) {
      var winGroup = new THREE.Group();
      winGroup.position.set(xPos, yPos, zPos);
      if (rotY) winGroup.rotation.y = rotY;

      var w = 0.64;
      var h = 0.72;

      var frameTop = new THREE.Mesh(new THREE.BoxGeometry(w + 0.06, 0.05, 0.06), brownWoodMat);
      frameTop.position.y = h / 2;
      winGroup.add(frameTop);

      var frameBot = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.05, 0.09), brownWoodMat);
      frameBot.position.set(0, -h / 2, 0.015);
      winGroup.add(frameBot);

      var frameL = new THREE.Mesh(new THREE.BoxGeometry(0.05, h, 0.06), brownWoodMat);
      frameL.position.x = -w / 2;
      winGroup.add(frameL);

      var frameR = new THREE.Mesh(new THREE.BoxGeometry(0.05, h, 0.06), brownWoodMat);
      frameR.position.x = w / 2;
      winGroup.add(frameR);

      var mullion = new THREE.Mesh(new THREE.BoxGeometry(0.036, h, 0.05), brownWoodMat);
      winGroup.add(mullion);

      var transom = new THREE.Mesh(new THREE.BoxGeometry(w, 0.025, 0.045), brownWoodMat);
      transom.position.y = 0.12;
      winGroup.add(transom);

      var glass = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.04, h - 0.04), glassMat);
      glass.position.z = -0.01;
      winGroup.add(glass);

      var potMat = new THREE.MeshStandardMaterial({ color: 0x9b543a, roughness: 0.8 });
      var pot = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 0.06, 8), potMat);
      pot.position.set(0.14, -h / 2 + 0.06, 0.005);
      winGroup.add(pot);

      var plant = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), foliageMat);
      plant.position.set(0.14, -h / 2 + 0.12, 0.005);
      winGroup.add(plant);

      return winGroup;
    }

    diorama.add(createWindow(-0.72, 1.02, houseD / 2 + 0.01, 0));
    diorama.add(createWindow(0.22, 1.02, houseD / 2 + 0.01, 0));
    diorama.add(createWindow(-0.1 + houseW / 2 + 0.01, 1.02, 0.05, Math.PI / 2));

    var doorGroup = new THREE.Group();
    doorGroup.position.set(-0.1 - houseW / 2 - 0.01, 0.72, 0.25);
    doorGroup.rotation.y = -Math.PI / 2;
    var doorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.66, 1.12, 0.06), brownWoodMat);
    doorGroup.add(doorFrame);
    var doorStep = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.12, 0.34), stoneFoundationMat);
    doorStep.position.set(0, -0.64, 0.15);
    doorGroup.add(doorStep);
    diorama.add(doorGroup);

    // 4e. Memorial Plaques on the Right Front Facade
    var portraitTex = createPortraitPlaqueTexture();
    var portraitPlaque = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.32, 0.03),
      new THREE.MeshStandardMaterial({ map: portraitTex, roughness: 0.3, metalness: 0.2 })
    );
    portraitPlaque.position.set(0.84, 1.12, houseD / 2 + 0.02);
    diorama.add(portraitPlaque);

    var textTex = createPlaqueTexture();
    var textPlaque = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.26, 0.03),
      new THREE.MeshStandardMaterial({ map: textTex, roughness: 0.3, metalness: 0.2 })
    );
    textPlaque.position.set(1.24, 1.22, houseD / 2 + 0.02);
    diorama.add(textPlaque);

    // 4f. Wooden Picket Fence
    var fenceGroup = new THREE.Group();
    fenceGroup.position.set(1.58, 0, houseD / 2 + 0.15);
    fenceGroup.rotation.y = -0.35;
    diorama.add(fenceGroup);

    var railTop = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.035, 0.025), fenceWoodMat);
    railTop.position.set(0.52, 0.42, 0);
    fenceGroup.add(railTop);
    var railBot = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.035, 0.025), fenceWoodMat);
    railBot.position.set(0.52, 0.18, 0);
    fenceGroup.add(railBot);

    var picketGeo = new THREE.BoxGeometry(0.055, 0.56, 0.018);
    for (var px = 0; px <= 1.05; px += 0.095) {
      var picket = new THREE.Mesh(picketGeo, fenceWoodMat);
      picket.position.set(px, 0.28, 0.01);
      picket.castShadow = true;
      fenceGroup.add(picket);
    }

    // 4g. Grapevine Trellis & Garden Foliage
    var vinePostL = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.72, 8), fenceWoodMat);
    vinePostL.position.set(-0.55, 0.36, houseD / 2 + 0.45);
    diorama.add(vinePostL);

    var vinePostR = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.72, 8), fenceWoodMat);
    vinePostR.position.set(0.55, 0.36, houseD / 2 + 0.45);
    diorama.add(vinePostR);

    var vineClusters = [
      [-0.45, 0.52, houseD / 2 + 0.42, 0.14],
      [-0.28, 0.68, houseD / 2 + 0.38, 0.12],
      [-0.12, 0.48, houseD / 2 + 0.44, 0.15],
      [0.08, 0.62, houseD / 2 + 0.4, 0.11],
      [1.82, 0.45, 0.25, 0.28],
      [1.92, 0.85, -0.35, 0.36],
      [-1.95, 0.52, -0.45, 0.32]
    ];

    vineClusters.forEach(function (c) {
      var leaf = new THREE.Mesh(new THREE.DodecahedronGeometry(c[3], 1), foliageMat);
      leaf.position.set(c[0], c[1], c[2]);
      leaf.castShadow = true;
      diorama.add(leaf);
    });

    // 5. Subtle Cursor Parallax Reaction (NO manual drag hijack)
    var state = {
      targetY: -0.32,
      targetX: 0.02,
      currentY: -0.32,
      currentX: 0.02
    };

    function onMouseMove(e) {
      var r = container.getBoundingClientRect();
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      var nx = (e.clientX - cx) / (window.innerWidth * 0.5);
      var ny = (e.clientY - cy) / (window.innerHeight * 0.5);

      state.targetY = -0.32 + Math.max(-0.22, Math.min(0.22, nx * 0.2));
      state.targetX = 0.02 + Math.max(-0.1, Math.min(0.1, -ny * 0.09));
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    function onResize() {
      var r = container.getBoundingClientRect();
      var w = Math.max(r.width, 280);
      var h = Math.max(r.height, 280);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      var narrow = w < 540 ? 1.25 : 1.0;
      camera.position.set(1.6 * narrow, 1.55 * narrow, 6.6 * narrow);
      camera.lookAt(0, 0.35, 0);
      camera.updateProjectionMatrix();
    }

    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(onResize);
      ro.observe(container);
    }
    window.addEventListener('resize', onResize);
    onResize();

    // 6. Gentle Living Animation Loop
    var clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      var elapsed = clock.getElapsedTime();

      state.currentY += (state.targetY - state.currentY) * 0.055;
      state.currentX += (state.targetX - state.currentX) * 0.055;

      diorama.rotation.y = state.currentY + Math.sin(elapsed * 0.38) * 0.015;
      diorama.rotation.x = state.currentX;
      diorama.position.y = -0.35 + Math.sin(elapsed * 0.75) * 0.02;

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
