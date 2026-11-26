(function () {
  'use strict';

  function createSurfaceTexture(options) {
    var size = options.size || 512;
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = options.baseColor || '#33302b';
    ctx.fillRect(0, 0, size, size);

    for (var i = 0; i < 65; i++) {
      var x = Math.random() * size;
      var y = Math.random() * size;
      var r = 35 + Math.random() * 120;
      var g = ctx.createRadialGradient(x, y, 2, x, y, r);
      g.addColorStop(0, options.patchColor || 'rgba(85, 82, 72, 0.18)');
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    }

    var veinCount = options.veins || 18;
    for (var v = 0; v < veinCount; v++) {
      ctx.beginPath();
      var vx = Math.random() * size;
      var vy = Math.random() * size;
      ctx.moveTo(vx, vy);
      var steps = 14;
      var angle = (Math.random() - 0.5) * 1.1 + 0.65;
      for (var s = 0; s < steps; s++) {
        angle += (Math.random() - 0.5) * 0.55;
        vx += Math.cos(angle) * (size / steps);
        vy += Math.sin(angle) * (size / steps);
        ctx.lineTo(vx, vy);
      }
      ctx.strokeStyle = options.veinColor || 'rgba(135, 140, 146, 0.14)';
      ctx.lineWidth = 0.8 + Math.random() * 1.6;
      ctx.stroke();
    }

    var imgData = ctx.getImageData(0, 0, size, size);
    var data = imgData.data;
    var grain = options.grain || 12;
    for (var p = 0; p < data.length; p += 4) {
      var n = (Math.random() - 0.5) * grain;
      data[p] = Math.min(255, Math.max(0, data[p] + n));
      data[p + 1] = Math.min(255, Math.max(0, data[p + 1] + n));
      data[p + 2] = Math.min(255, Math.max(0, data[p + 2] + n));
    }
    ctx.putImageData(imgData, 0, 0);

    var tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function createCastBumpTexture() {
    var size = 256;
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);

    var img = ctx.getImageData(0, 0, size, size);
    var d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      var val = 128 + (Math.random() - 0.5) * 44;
      d[i] = d[i + 1] = d[i + 2] = val;
      d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);

    // Subtle vertical chisel/patina strokes
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    for (var k = 0; k < 120; k++) {
      ctx.beginPath();
      var sx = Math.random() * size;
      var sy = Math.random() * size;
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + (Math.random() - 0.5) * 8, sy + 12 + Math.random() * 24);
      ctx.stroke();
    }

    var tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  function createPlaqueTexture() {
    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = '#2f343b';
    ctx.fillRect(0, 0, 512, 512);

    for (var i = 0; i < 2600; i++) {
      var x = Math.random() * 512;
      var y = Math.random() * 512;
      ctx.fillStyle =
        Math.random() > 0.5
          ? 'rgba(255,255,255,0.055)'
          : 'rgba(10,12,15,0.18)';
      ctx.fillRect(x, y, 2, 2);
    }

    ctx.strokeStyle = 'rgba(218, 214, 206, 0.32)';
    ctx.lineWidth = 3;
    ctx.strokeRect(32, 36, 448, 440);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#e5e2da';
    ctx.font = '500 38px Georgia, serif';
    ctx.fillText('Володимир', 256, 174);

    ctx.font = '700 62px Georgia, serif';
    ctx.fillText('ІВАСЮК', 256, 246);

    ctx.strokeStyle = 'rgba(229, 226, 218, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(150, 290);
    ctx.lineTo(362, 290);
    ctx.stroke();

    ctx.fillStyle = 'rgba(229, 226, 218, 0.72)';
    ctx.font = '500 21px Georgia, serif';
    ctx.fillText('1949 · КІЦМАНЬ · 1979', 256, 336);

    var tex = new THREE.CanvasTexture(canvas);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function createShadowDiscTexture() {
    var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    var ctx = canvas.getContext('2d');
    var grad = ctx.createRadialGradient(128, 128, 18, 128, 128, 124);
    grad.addColorStop(0, 'rgba(16, 18, 22, 0.45)');
    grad.addColorStop(0.55, 'rgba(16, 18, 22, 0.18)');
    grad.addColorStop(1, 'rgba(16, 18, 22, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Builds a high-resolution vertex-sculpted organic mesh from height-parameterized cross sections.
   */
  function createSculptedLoft(height, ySegs, rSegs, evalFn) {
    var geo = new THREE.CylinderGeometry(1, 1, height, rSegs, ySegs, false);
    var pos = geo.attributes.position;
    var v = new THREE.Vector3();

    for (var i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      var t = Math.max(0, Math.min(1, (v.y + height * 0.5) / height)); // 0 (bottom) -> 1 (top)
      var angle = Math.atan2(v.z, v.x);
      var isCap = Math.abs(Math.hypot(v.x, v.z)) < 0.001;
      var res = evalFn(t, angle, isCap);
      if (isCap) {
        pos.setXYZ(i, res.cx || 0, v.y + (res.dy || 0), res.cz || 0);
      } else {
        pos.setXYZ(
          i,
          (res.cx || 0) + Math.cos(angle) * res.rx,
          v.y + (res.dy || 0),
          (res.cz || 0) + Math.sin(angle) * res.rz
        );
      }
    }
    geo.computeVertexNormals();
    return geo;
  }

  /**
   * Builds a realistic sculpted portrait head by displacing vertices of a high-res sphere.
   */
  function createSculptedPortraitHead(material, hairMaterial) {
    var group = new THREE.Group();

    var headGeo = new THREE.SphereGeometry(0.185, 44, 34);
    var pos = headGeo.attributes.position;
    var v = new THREE.Vector3();

    for (var i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      var nx = v.x / 0.185;
      var ny = v.y / 0.185;
      var nz = v.z / 0.185;

      // Elongate cranium slightly & taper jaw
      v.x *= 0.84;
      v.y *= 1.14;
      v.z *= 0.96;

      if (ny < -0.15) {
        var jawFactor = Math.min(1, (-ny - 0.15) / 0.85);
        v.x *= 1 - jawFactor * 0.28;
        if (nz > 0) {
          v.z += jawFactor * 0.022;
        }
      }

      // Face relief on front (+z)
      if (nz > 0.25) {
        // Cheekbones
        var cheekL = Math.exp(-Math.pow((nx - 0.42) / 0.26, 2) - Math.pow((ny + 0.06) / 0.24, 2));
        var cheekR = Math.exp(-Math.pow((nx + 0.42) / 0.26, 2) - Math.pow((ny + 0.06) / 0.24, 2));
        v.z += (cheekL + cheekR) * 0.015;

        // Brow ridge
        var brow = Math.exp(-Math.pow(nx / 0.58, 2) - Math.pow((ny - 0.24) / 0.12, 2));
        v.z += brow * 0.018;

        // Eye sockets recess
        var eyeL = Math.exp(-Math.pow((nx - 0.28) / 0.16, 2) - Math.pow((ny - 0.10) / 0.11, 2));
        var eyeR = Math.exp(-Math.pow((nx + 0.28) / 0.16, 2) - Math.pow((ny - 0.10) / 0.11, 2));
        v.z -= (eyeL + eyeR) * 0.016;

        // Nose bridge & tip
        var noseBridge = Math.exp(-Math.pow(nx / 0.13, 2) - Math.pow((ny + 0.02) / 0.26, 2));
        var noseTip = Math.exp(-Math.pow(nx / 0.12, 2) - Math.pow((ny + 0.16) / 0.11, 2));
        v.z += noseBridge * 0.028 + noseTip * 0.022;

        // Mouth & chin prominence
        var lips = Math.exp(-Math.pow(nx / 0.22, 2) - Math.pow((ny + 0.39) / 0.08, 2));
        var chin = Math.exp(-Math.pow(nx / 0.26, 2) - Math.pow((ny + 0.68) / 0.16, 2));
        v.z += lips * 0.011 + chin * 0.022;
      }

      pos.setXYZ(i, v.x, v.y, v.z);
    }
    headGeo.computeVertexNormals();
    var headMesh = new THREE.Mesh(headGeo, material);
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    group.add(headMesh);

    // Sculpted 1970s swept hair mass (parted wave sweeping across forehead + full nape locks)
    var hairMainGeo = new THREE.SphereGeometry(0.198, 36, 26);
    var hPos = hairMainGeo.attributes.position;
    for (var j = 0; j < hPos.count; j++) {
      v.fromBufferAttribute(hPos, j);
      var hx = v.x / 0.198;
      var hy = v.y / 0.198;
      var hz = v.z / 0.198;

      v.x *= 0.90;
      v.y *= 1.06;
      v.z *= 1.02;

      // Carve face opening on front-lower region
      if (hz > 0.1 && hy < 0.42) {
        v.z -= 0.065;
      }
      // Sculpted wavy hair ridges
      var waves = Math.sin(hx * 7.5 + hy * 4.0) * 0.008 + Math.cos(hz * 6.0) * 0.006;
      v.x += hx * waves;
      v.y += hy * waves;
      v.z += hz * waves;

      hPos.setXYZ(j, v.x, v.y, v.z);
    }
    hairMainGeo.computeVertexNormals();
    var hairMain = new THREE.Mesh(hairMainGeo, hairMaterial);
    hairMain.position.set(0, 0.032, -0.024);
    hairMain.castShadow = true;
    group.add(hairMain);

    // Swept front hair crest (iconic Ivasyuk parted wave)
    var crestGeo = createSculptedLoft(0.16, 12, 18, function (t, a) {
      var profile = Math.sin(t * Math.PI);
      return {
        rx: 0.135 * (0.55 + 0.45 * profile),
        rz: 0.095 * (0.5 + 0.5 * profile),
        cx: -t * 0.035,
        cz: 0.015 * Math.sin(a * 3)
      };
    });
    var crest = new THREE.Mesh(crestGeo, hairMaterial);
    crest.rotation.z = 1.25;
    crest.rotation.y = 0.25;
    crest.position.set(0.025, 0.155, 0.065);
    crest.castShadow = true;
    group.add(crest);

    // Side locks framing temples/ears
    [-1, 1].forEach(function (side) {
      var lock = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 14, 12),
        hairMaterial
      );
      lock.scale.set(0.65, 1.55, 1.1);
      lock.position.set(side * 0.142, 0.01, -0.015);
      lock.rotation.z = side * -0.14;
      lock.castShadow = true;
      group.add(lock);
    });

    return group;
  }

  /**
   * Builds a vertically cradled violin tucked along his left ribcage (exact match to Kitsman statue).
   */
  function createSculptedViolin(bodyMat, trimMat) {
    var violin = new THREE.Group();

    var shape = new THREE.Shape();
    shape.moveTo(0, -0.30);
    shape.bezierCurveTo(0.15, -0.30, 0.195, -0.19, 0.165, -0.08);
    shape.bezierCurveTo(0.13, -0.01, 0.082, 0.0, 0.088, 0.05);
    shape.bezierCurveTo(0.094, 0.10, 0.148, 0.14, 0.138, 0.22);
    shape.bezierCurveTo(0.125, 0.29, 0.06, 0.31, 0, 0.31);
    shape.bezierCurveTo(-0.06, 0.31, -0.125, 0.29, -0.138, 0.22);
    shape.bezierCurveTo(-0.148, 0.14, -0.094, 0.10, -0.088, 0.05);
    shape.bezierCurveTo(-0.082, 0.0, -0.13, -0.01, -0.165, -0.08);
    shape.bezierCurveTo(-0.195, -0.19, -0.15, -0.30, 0, -0.30);

    var bodyGeo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.068,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.016,
      bevelThickness: 0.018
    });
    bodyGeo.center();
    var bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    violin.add(bodyMesh);

    // Tailpiece & carved bridge
    var tailpiece = new THREE.Mesh(
      new THREE.BoxGeometry(0.052, 0.14, 0.022),
      trimMat
    );
    tailpiece.position.set(0, -0.16, 0.046);
    violin.add(tailpiece);

    var bridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.072, 0.016, 0.032),
      trimMat
    );
    bridge.position.set(0, -0.01, 0.052);
    violin.add(bridge);

    // Neck & fingerboard extending upward toward left hand
    var neck = new THREE.Mesh(
      new THREE.BoxGeometry(0.042, 0.34, 0.03),
      trimMat
    );
    neck.position.set(0, 0.42, 0.02);
    neck.castShadow = true;
    violin.add(neck);

    var scroll = new THREE.Mesh(
      new THREE.TorusGeometry(0.026, 0.013, 10, 18),
      trimMat
    );
    scroll.position.set(0, 0.60, 0.02);
    scroll.rotation.y = Math.PI / 2;
    violin.add(scroll);

    return violin;
  }

  function buildIvasyukStatueScene(container, fallbackEl, options) {
    options = options || {};
    var cursorFollowOnly = Boolean(options.cursorFollowOnly);
    if (typeof THREE === 'undefined') {
      if (fallbackEl) fallbackEl.hidden = false;
      return null;
    }

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
    } catch (e) {
      if (fallbackEl) fallbackEl.hidden = false;
      return null;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = 'statue-webgl-canvas';
    container.appendChild(renderer.domElement);

    var scene = new THREE.Scene();

    // Monumental camera framing fitting full 3-tier base through windswept hair cleanly
    var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 45);
    camera.position.set(0, 2.75, 10.45);
    camera.lookAt(0, 2.58, 0);

    // Sculptural Museum Lighting: strong warm-neutral key + cool rim + deep bounce contrast
    var hemiLight = new THREE.HemisphereLight(0xf3f5f8, 0x3b4048, 0.78);
    hemiLight.position.set(0, 9, 0);
    scene.add(hemiLight);

    var keyLight = new THREE.DirectionalLight(0xfff9f0, 2.1);
    keyLight.position.set(4.5, 7.8, 5.4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 24;
    keyLight.shadow.camera.left = -3.6;
    keyLight.shadow.camera.right = 3.6;
    keyLight.shadow.camera.top = 6.5;
    keyLight.shadow.camera.bottom = -1.5;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    var rimLight = new THREE.DirectionalLight(0xdce4f0, 1.55);
    rimLight.position.set(-4.8, 5.8, -3.6);
    scene.add(rimLight);

    var fillLight = new THREE.DirectionalLight(0xd6d3cc, 0.65);
    fillLight.position.set(-3.4, 2.2, 4.4);
    scene.add(fillLight);

    // Textures & Cast Bronze + Stone Materials (Default = Authentic Patinated Bronze matching reference photo!)
    var bronzeTex = createSurfaceTexture({
      baseColor: '#45403a',
      patchColor: 'rgba(92, 86, 72, 0.24)',
      veinColor: 'rgba(130, 128, 118, 0.14)',
      veins: 16,
      grain: 14
    });
    var whiteMarbleTex = createSurfaceTexture({
      baseColor: '#dedad2',
      patchColor: 'rgba(140, 145, 152, 0.18)',
      veinColor: 'rgba(85, 90, 98, 0.28)',
      veins: 26,
      grain: 9
    });
    var darkGraniteTex = createSurfaceTexture({
      baseColor: '#363b42',
      patchColor: 'rgba(22, 25, 30, 0.28)',
      veinColor: 'rgba(165, 170, 178, 0.12)',
      veins: 12,
      grain: 16
    });
    var stepStoneTex = createSurfaceTexture({
      baseColor: '#8d9096',
      patchColor: 'rgba(72, 76, 82, 0.22)',
      veinColor: 'rgba(210, 212, 216, 0.12)',
      veins: 12,
      grain: 14
    });
    var castBumpTex = createCastBumpTexture();
    var plaqueTex = createPlaqueTexture();

    var statueMat = new THREE.MeshStandardMaterial({
      color: 0x524c44,
      map: bronzeTex,
      bumpMap: castBumpTex,
      bumpScale: 0.012,
      roughness: 0.44,
      metalness: 0.62
    });

    var accentMat = new THREE.MeshStandardMaterial({
      color: 0x423d36,
      map: bronzeTex,
      bumpMap: castBumpTex,
      bumpScale: 0.014,
      roughness: 0.48,
      metalness: 0.56
    });

    var violinBodyMat = new THREE.MeshStandardMaterial({
      color: 0x62574a,
      map: bronzeTex,
      bumpMap: castBumpTex,
      bumpScale: 0.01,
      roughness: 0.38,
      metalness: 0.66
    });

    var violinTrimMat = new THREE.MeshStandardMaterial({
      color: 0x2c2925,
      roughness: 0.42,
      metalness: 0.52
    });

    var pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x474c54,
      map: darkGraniteTex,
      roughness: 0.58,
      metalness: 0.12
    });

    var stepsMat = new THREE.MeshStandardMaterial({
      color: 0x9fa3a9,
      map: stepStoneTex,
      roughness: 0.72,
      metalness: 0.05
    });

    var plaqueMat = new THREE.MeshStandardMaterial({
      map: plaqueTex,
      roughness: 0.46,
      metalness: 0.15
    });

    var monumentRoot = new THREE.Group();
    scene.add(monumentRoot);

    // Ground ambient shadow disc
    var shadowDisc = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 4.2),
      new THREE.MeshBasicMaterial({
        map: createShadowDiscTexture(),
        transparent: true,
        opacity: 0.9,
        depthWrite: false
      })
    );
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.position.y = -0.01;
    monumentRoot.add(shadowDisc);

    // --- 1. Heavy 3-Tiered Stone Base Platform ---
    var step1 = new THREE.Mesh(
      new THREE.CylinderGeometry(1.66, 1.72, 0.16, 8),
      stepsMat
    );
    step1.position.y = 0.08;
    step1.rotation.y = Math.PI / 8;
    step1.receiveShadow = true;
    step1.castShadow = true;
    monumentRoot.add(step1);

    var step2 = new THREE.Mesh(
      new THREE.CylinderGeometry(1.36, 1.42, 0.16, 8),
      stepsMat
    );
    step2.position.y = 0.24;
    step2.rotation.y = Math.PI / 8;
    step2.receiveShadow = true;
    step2.castShadow = true;
    monumentRoot.add(step2);

    var step3 = new THREE.Mesh(
      new THREE.CylinderGeometry(1.06, 1.12, 0.14, 32),
      stepsMat
    );
    step3.position.y = 0.39;
    step3.receiveShadow = true;
    step3.castShadow = true;
    monumentRoot.add(step3);

    // --- 2. Massive Tapered Granite Pedestal ---
    var pedGeo = new THREE.CylinderGeometry(0.64, 0.88, 1.54, 4);
    pedGeo.rotateY(Math.PI / 4);
    var pedestal = new THREE.Mesh(pedGeo, pedestalMat);
    pedestal.position.y = 1.23;
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    monumentRoot.add(pedestal);

    var pedCap = new THREE.Mesh(
      new THREE.BoxGeometry(0.98, 0.09, 0.98),
      pedestalMat
    );
    pedCap.position.y = 2.04;
    pedCap.castShadow = true;
    pedCap.receiveShadow = true;
    monumentRoot.add(pedCap);

    var plaqueMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.78, 1.08),
      plaqueMat
    );
    plaqueMesh.position.set(0, 1.24, 0.545);
    plaqueMesh.rotation.x = -0.109;
    monumentRoot.add(plaqueMesh);

    // --- 3. Sculpted Heroic Bronze Figure of Volodymyr Ivasyuk (scaled up for massive weight) ---
    var figure = new THREE.Group();
    figure.position.y = 2.08;
    figure.scale.setScalar(1.24);
    monumentRoot.add(figure);

    // Heavy Bronze Sculpted Plinth Disc under feet
    var footPlinth = new THREE.Mesh(
      createSculptedLoft(0.11, 6, 28, function (t, a) {
        var r = 0.44 - t * 0.04 + Math.sin(a * 5) * 0.014;
        return { rx: r, rz: r * 0.88 };
      }),
      accentMat
    );
    footPlinth.position.y = 0.055;
    footPlinth.castShadow = true;
    footPlinth.receiveShadow = true;
    figure.add(footPlinth);

    // Sculpted Heavy Shoes
    function makeShoe(x, z, rotY) {
      var shoe = new THREE.Mesh(
        createSculptedLoft(0.095, 8, 18, function (t, a) {
          var w = 0.082 * (1 - t * 0.16);
          var l = 0.165 * (1 - t * 0.12);
          return { rx: w, rz: l, cz: 0.045 * (1 - t * 0.3) };
        }),
        accentMat
      );
      shoe.position.set(x, 0.135, z);
      shoe.rotation.y = rotY;
      shoe.castShadow = true;
      return shoe;
    }
    figure.add(makeShoe(-0.145, 0.02, -0.06));
    figure.add(makeShoe(0.148, 0.05, 0.09));

    // Sculpted Heavy Trousers & Legs (viewer's left = his right leg with distinct bent knee fold!)
    var legRightGeo = createSculptedLoft(1.04, 24, 24, function (t, a) {
      var baseR = 0.108 + Math.sin(t * Math.PI * 0.85) * 0.022 + t * 0.032;
      // Knee fold crease around t = 0.46
      var kneeFold = Math.exp(-Math.pow((t - 0.46) / 0.09, 2)) * 0.018;
      var crease = Math.sin(a * 4) * 0.008;
      // Slight forward bend at the knee
      var cz = Math.exp(-Math.pow((t - 0.46) / 0.22, 2)) * 0.038;
      return {
        rx: baseR + crease,
        rz: baseR * 1.08 + kneeFold + crease,
        cz: cz
      };
    });
    var legRight = new THREE.Mesh(legRightGeo, statueMat);
    legRight.position.set(-0.142, 0.67, 0.015);
    legRight.castShadow = true;
    legRight.receiveShadow = true;
    figure.add(legRight);

    var legLeftGeo = createSculptedLoft(1.04, 24, 24, function (t, a) {
      var baseR = 0.106 + Math.sin(t * Math.PI * 0.85) * 0.018 + t * 0.034;
      var crease = Math.sin(a * 3 + 0.8) * 0.007;
      return {
        rx: baseR + crease,
        rz: baseR * 1.06 + crease
      };
    });
    var legLeft = new THREE.Mesh(legLeftGeo, statueMat);
    legLeft.position.set(0.142, 0.67, 0.022);
    legLeft.castShadow = true;
    legLeft.receiveShadow = true;
    figure.add(legLeft);

    // Sculpted Hips & Buttoned Suit Vest Torso
    var torsoGeo = createSculptedLoft(0.92, 24, 28, function (t, a) {
      var waist = 1 - 0.16 * Math.exp(-Math.pow((t - 0.36) / 0.22, 2));
      var chestExpand = 0.78 + 0.34 * Math.pow(t, 0.75);
      var rx = 0.265 * chestExpand * waist;
      var rz = 0.175 * chestExpand * waist;
      if (t > 0.88) {
        var neckTaper = 1 - (t - 0.88) / 0.12 * 0.45;
        rx *= neckTaper;
        rz *= neckTaper;
      }
      return { rx: rx, rz: rz };
    });
    var torso = new THREE.Mesh(torsoGeo, accentMat);
    torso.position.set(0, 1.54, 0.01);
    torso.castShadow = true;
    torso.receiveShadow = true;
    figure.add(torso);

    // Carved Vest Buttons & Bow Tie (метелик) matching reference photo
    for (var b = 0; b < 4; b++) {
      var btn = new THREE.Mesh(
        new THREE.SphereGeometry(0.014, 10, 8),
        statueMat
      );
      btn.position.set(0, 1.54 + b * 0.082, 0.188 - b * 0.004);
      figure.add(btn);
    }

    var bowTie = new THREE.Group();
    bowTie.position.set(0, 1.90, 0.155);
    [-1, 1].forEach(function (side) {
      var wing = new THREE.Mesh(
        new THREE.ConeGeometry(0.032, 0.068, 6),
        statueMat
      );
      wing.rotation.z = side * Math.PI / 2;
      wing.scale.set(0.75, 1, 0.45);
      wing.position.x = side * 0.034;
      bowTie.add(wing);
    });
    var knot = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 10, 8),
      statueMat
    );
    bowTie.add(knot);
    figure.add(bowTie);

    // Sculpted Open Jacket + Sweeping Back Coat Mantle with Deep Drapery Folds
    var coatGeo = createSculptedLoft(1.16, 28, 36, function (t, a) {
      // Open front gap around angle = PI/2 (+Z front face)
      var frontAngle = Math.sin(a); // +1 at front (+z), -1 at back (-z)
      var flair = 1 + (1 - t) * 0.24;
      var shoulderBroad = 0.84 + 0.30 * Math.pow(t, 1.3);
      var rx = 0.295 * shoulderBroad * flair;
      var rz = 0.215 * shoulderBroad * flair;

      // Sculpt vertical bronze coat-tail folds on sides & back
      var folds = frontAngle < 0.35 ? Math.sin(a * 7 + t * 2.0) * 0.018 * (1 - t * 0.5) : 0;

      // Tuck in open chest gap at the front (+z)
      if (frontAngle > 0.55) {
        var gap = (frontAngle - 0.55) / 0.45;
        rz -= gap * 0.08;
      }

      // Taper collar smoothly at very top
      if (t > 0.90) {
        var topCap = 1 - ((t - 0.90) / 0.10) * 0.35;
        rx *= topCap;
        rz *= topCap;
      }

      return { rx: rx + folds, rz: rz + folds * 0.8, cz: -0.022 };
    });
    var coatMesh = new THREE.Mesh(coatGeo, statueMat);
    coatMesh.position.set(0, 1.42, 0.0);
    coatMesh.castShadow = true;
    coatMesh.receiveShadow = true;
    figure.add(coatMesh);

    // Sculpted Jacket Front Panels + Broad Notched Lapels (right front hangs long; left folds back behind violin)
    function makeLapelPanel(side, lengthY) {
      var shape = new THREE.Shape();
      shape.moveTo(0, -lengthY);
      shape.bezierCurveTo(0.14, -lengthY, 0.19, -lengthY * 0.5, 0.19, 0.22);
      shape.lineTo(0.08, 0.42);
      shape.lineTo(0.0, 0.30);
      shape.lineTo(0.03, 0.10);
      shape.lineTo(0, -lengthY);

      var geo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.048,
        bevelEnabled: true,
        bevelSegments: 3,
        bevelSize: 0.012,
        bevelThickness: 0.014
      });
      var mesh = new THREE.Mesh(geo, statueMat);
      mesh.scale.x = side;
      mesh.position.set(side * 0.065, 1.54, 0.145);
      mesh.rotation.y = side * -0.26;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    }
    // Viewer's left (-1): straight long tailored right coat front
    figure.add(makeLapelPanel(-1, 0.52));
    // Viewer's right (+1): shorter open upper lapel behind the violin & raised hand
    figure.add(makeLapelPanel(1, 0.34));

    // Sculpted Shoulder Pads blending coat seamlessly into sleeves
    [-1, 1].forEach(function (side) {
      var cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.115, 16, 12),
        statueMat
      );
      cap.scale.set(1.05, 0.85, 0.95);
      cap.position.set(side * 0.30, 1.91, -0.01);
      cap.castShadow = true;
      figure.add(cap);
    });

    // Helper for seamless curved anatomical sleeve tubes
    function createCurvedSleeve(points, radiusStart, radiusEnd) {
      var curve = new THREE.CatmullRomCurve3(points);
      var tubeGeo = new THREE.TubeGeometry(curve, 26, 1, 18, false);
      var pos = tubeGeo.attributes.position;
      var norm = tubeGeo.attributes.normal;
      var uv = tubeGeo.attributes.uv;
      var p = new THREE.Vector3();
      var n = new THREE.Vector3();
      for (var i = 0; i < pos.count; i++) {
        var u = Math.max(0, Math.min(1, uv.getX(i)));
        var vAngle = uv.getY(i) * Math.PI * 2;
        var r =
          radiusStart +
          (radiusEnd - radiusStart) * u +
          Math.sin(u * 22 + vAngle) * 0.004;
        var center = curve.getPointAt(u);
        p.fromBufferAttribute(pos, i);
        n.subVectors(p, center);
        var len = n.length() || 1;
        n.multiplyScalar(r / len);
        p.copy(center).add(n);
        pos.setXYZ(i, p.x, p.y, p.z);
        if (norm) {
          n.normalize();
          norm.setXYZ(i, n.x, n.y, n.z);
        }
      }
      tubeGeo.computeVertexNormals();
      var mesh = new THREE.Mesh(tubeGeo, statueMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    }

    // --- Right Arm (viewer's left: seamless relaxed hang beside right thigh) ---
    var armRMesh = createCurvedSleeve(
      [
        new THREE.Vector3(-0.31, 1.92, -0.01),
        new THREE.Vector3(-0.36, 1.66, -0.01),
        new THREE.Vector3(-0.38, 1.42, 0.03),
        new THREE.Vector3(-0.36, 1.18, 0.07)
      ],
      0.098,
      0.068
    );
    figure.add(armRMesh);

    var handR = new THREE.Group();
    handR.position.set(-0.355, 1.13, 0.075);
    var palmR = new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 10), statueMat);
    palmR.scale.set(0.65, 1.25, 0.85);
    handR.add(palmR);
    for (var fR = 0; fR < 4; fR++) {
      var fingerR = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.010, 0.075, 8),
        statueMat
      );
      fingerR.position.set(0.006, -0.065, -0.022 + fR * 0.016);
      fingerR.rotation.z = 0.14;
      handR.add(fingerR);
    }
    figure.add(handR);

    // --- Left Arm (viewer's right: seamless elbow curve raising hand to heart/violin neck!) ---
    var armLMesh = createCurvedSleeve(
      [
        new THREE.Vector3(0.31, 1.92, -0.01),
        new THREE.Vector3(0.38, 1.66, 0.02),
        new THREE.Vector3(0.35, 1.50, 0.14),
        new THREE.Vector3(0.18, 1.72, 0.23)
      ],
      0.098,
      0.066
    );
    figure.add(armLMesh);

    // Sculpted Left Hand resting tenderly above violin shoulder/lapel
    var handL = new THREE.Group();
    handL.position.set(0.145, 1.765, 0.245);
    handL.rotation.set(0.24, -0.25, 0.42);
    var palmL = new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 10), statueMat);
    palmL.scale.set(1.08, 0.72, 0.62);
    handL.add(palmL);
    for (var fL = 0; fL < 4; fL++) {
      var fingerL = new THREE.Mesh(
        new THREE.CylinderGeometry(0.011, 0.009, 0.078, 8),
        statueMat
      );
      fingerL.rotation.z = Math.PI / 2 - 0.18 + fL * 0.08;
      fingerL.position.set(-0.055, 0.018 - fL * 0.016, 0.01);
      handL.add(fingerL);
    }
    figure.add(handL);

    // --- Violin Cradled Vertically Along Left Waist/Chest ---
    var violin = createSculptedViolin(violinBodyMat, violinTrimMat);
    violin.scale.set(0.92, 0.92, 0.74);
    violin.position.set(0.155, 1.37, 0.215);
    violin.rotation.set(0.08, 0.28, 0.05);
    figure.add(violin);

    // --- Neck & High-Res Portrait Head ---
    var neck = new THREE.Mesh(
      createSculptedLoft(0.19, 10, 20, function (t) {
        return { rx: 0.082 - t * 0.006, rz: 0.086 - t * 0.005 };
      }),
      statueMat
    );
    neck.position.set(0, 2.02, 0.02);
    neck.castShadow = true;
    figure.add(neck);

    var head = createSculptedPortraitHead(statueMat, accentMat);
    head.position.set(0, 2.22, 0.032);
    // Subtle heroic gaze slightly toward viewer's right (matching photo!)
    head.rotation.y = 0.24;
    head.rotation.x = 0.06;
    figure.add(head);

    // --- 4. Floating Dust Motes around the Monument ---
    var particleCount = 42;
    var particlePositions = new Float32Array(particleCount * 3);
    var particleSeeds = [];
    for (var i = 0; i < particleCount; i++) {
      var ang = Math.random() * Math.PI * 2;
      var rad = 1.2 + Math.random() * 1.5;
      var py = 0.4 + Math.random() * 4.5;
      particlePositions[i * 3] = Math.cos(ang) * rad;
      particlePositions[i * 3 + 1] = py;
      particlePositions[i * 3 + 2] = Math.sin(ang) * rad;
      particleSeeds.push({
        angle: ang,
        radius: rad,
        y: py,
        speed: 0.1 + Math.random() * 0.2
      });
    }
    var particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(particlePositions, 3)
    );
    var particlesMat = new THREE.PointsMaterial({
      color: 0x454a52,
      size: 0.042,
      transparent: true,
      opacity: 0.36
    });
    var particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // --- Interactive Drag + Scroll Physics ---
    var FRONT_YAW = -0.14;
    var state = {
      scrollProgress: 0,
      targetRotY: FRONT_YAW,
      currentRotY: FRONT_YAW,
      targetScale: 1,
      currentScale: 1,
      targetOpacity: 1,
      currentOpacity: 1,
      dragYaw: FRONT_YAW,
      pointerTiltX: 0,
      pointerTiltY: 0,
      isDragging: false,
      scrolledSinceDrag: false,
      lastPointerX: 0,
      isHidden: false,
      finish: 'bronze'
    };

    function setFinish(mode) {
      state.finish = mode === 'marble' ? 'marble' : 'bronze';
      if (state.finish === 'marble') {
        statueMat.color.setHex(0xe5e2da);
        statueMat.map = whiteMarbleTex;
        statueMat.roughness = 0.38;
        statueMat.metalness = 0.06;

        accentMat.color.setHex(0xcbc6bd);
        accentMat.map = whiteMarbleTex;
        accentMat.roughness = 0.44;
        accentMat.metalness = 0.08;

        violinBodyMat.color.setHex(0xb8b2a8);
        violinBodyMat.map = whiteMarbleTex;
        violinBodyMat.metalness = 0.12;
        violinTrimMat.color.setHex(0x41464e);
      } else {
        statueMat.color.setHex(0x524c44);
        statueMat.map = bronzeTex;
        statueMat.roughness = 0.44;
        statueMat.metalness = 0.62;

        accentMat.color.setHex(0x423d36);
        accentMat.map = bronzeTex;
        accentMat.roughness = 0.48;
        accentMat.metalness = 0.56;

        violinBodyMat.color.setHex(0x62574a);
        violinBodyMat.map = bronzeTex;
        violinBodyMat.metalness = 0.66;
        violinTrimMat.color.setHex(0x2c2925);
      }
      statueMat.needsUpdate = true;
      accentMat.needsUpdate = true;
      violinBodyMat.needsUpdate = true;
    }

    function updateResize() {
      var rect = container.getBoundingClientRect();
      var w = Math.max(rect.width, 100);
      var h = Math.max(rect.height, 100);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      var narrowBoost = w < 480 ? 1.18 : 1.0;
      camera.position.set(0, 2.75, 10.45 * narrowBoost);
      camera.lookAt(0, 2.58, 0);
      camera.updateProjectionMatrix();
    }

    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(updateResize);
      ro.observe(container);
    }
    window.addEventListener('resize', updateResize);
    updateResize();

    var dom = renderer.domElement;
    if (cursorFollowOnly) {
      dom.style.cursor = 'default';
      window.addEventListener(
        'mousemove',
        function (e) {
          var rect = container.getBoundingClientRect();
          var cx = rect.left + rect.width / 2;
          var cy = rect.top + rect.height / 2;
          var nx = (e.clientX - cx) / Math.max(window.innerWidth * 0.5, 1);
          var ny = (e.clientY - cy) / Math.max(window.innerHeight * 0.5, 1);
          state.pointerTiltY = Math.max(-0.22, Math.min(0.22, nx * 0.22));
          state.pointerTiltX = Math.max(-0.06, Math.min(0.06, ny * 0.05));
        },
        { passive: true }
      );
    } else {
      dom.addEventListener('pointerdown', function (e) {
        if (state.scrollProgress > 0.35) return;
        state.isDragging = true;
        state.scrolledSinceDrag = false;
        state.lastPointerX = e.clientX;
        dom.setPointerCapture(e.pointerId);
        dom.style.cursor = 'grabbing';
      });

      dom.addEventListener('pointermove', function (e) {
        if (state.isDragging && typeof e.buttons === 'number' && (e.buttons & 1) === 0) {
          endDrag();
        }
        var rect = container.getBoundingClientRect();
        var nx = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
        var ny = ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1;
        state.pointerTiltY = nx * 0.16;
        state.pointerTiltX = ny * 0.04;

        if (state.isDragging) {
          var dx = e.clientX - state.lastPointerX;
          state.lastPointerX = e.clientX;
          state.dragYaw += dx * 0.011;
        }
      });

      function endDrag() {
        state.isDragging = false;
        dom.style.cursor = 'grab';
      }
      dom.addEventListener('pointerup', endDrag);
      dom.addEventListener('pointercancel', endDrag);
      dom.addEventListener('lostpointercapture', endDrag);
      window.addEventListener('pointerup', endDrag);
      window.addEventListener('mouseup', endDrag);
      window.addEventListener('blur', endDrag);
      dom.addEventListener('pointerleave', function () {
        state.pointerTiltX = 0;
        state.pointerTiltY = 0;
        endDrag();
      });
    }

    function setScrollProgress(p) {
      if (cursorFollowOnly) return;
      var clamped = Math.min(1, Math.max(0, p));
      state.scrollProgress = clamped;
      if (clamped > 0.12) {
        state.scrolledSinceDrag = true;
      }
      if (clamped > 0.45 && !state.isDragging) {
        state.dragYaw = FRONT_YAW;
      }
      state.targetRotY = state.dragYaw + clamped * Math.PI * 2;
      var scaleFactor = 1 - Math.pow(clamped, 1.25);
      state.targetScale = Math.max(0.001, scaleFactor);
      var fadeProgress = Math.max(0, (clamped - 0.22) / 0.78);
      state.targetOpacity = Math.min(
        1,
        Math.max(0, 1 - Math.pow(fadeProgress, 1.35))
      );
    }

    var clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);

      var elapsed = clock.getElapsedTime();
      var p = state.scrollProgress;

      if (state.scrolledSinceDrag && !state.isDragging) {
        state.dragYaw += (FRONT_YAW - state.dragYaw) * 0.18;
        if (Math.abs(state.dragYaw - FRONT_YAW) < 0.004) {
          state.dragYaw = FRONT_YAW;
        }
      }

      state.targetRotY =
        state.dragYaw +
        (1 - p) * state.pointerTiltY +
        p * Math.PI * 2 +
        (1 - p) * Math.sin(elapsed * 0.45) * 0.05;

      var rotLerp = p < 0.08 && state.scrolledSinceDrag ? 0.18 : 0.12;
      state.currentRotY += (state.targetRotY - state.currentRotY) * rotLerp;
      state.currentScale += (state.targetScale - state.currentScale) * 0.12;
      state.currentOpacity += (state.targetOpacity - state.currentOpacity) * 0.13;

      var nearlyGone = state.currentOpacity < 0.012 && p > 0.96;
      if (nearlyGone) {
        if (!state.isHidden) {
          state.isHidden = true;
          state.dragYaw = FRONT_YAW;
          container.style.opacity = '0';
          container.style.visibility = 'hidden';
        }
        return;
      } else if (state.isHidden) {
        state.isHidden = false;
        state.dragYaw = FRONT_YAW;
        state.targetRotY =
          FRONT_YAW +
          (1 - p) * state.pointerTiltY +
          p * Math.PI * 2 +
          (1 - p) * Math.sin(elapsed * 0.45) * 0.05;
        state.currentRotY = state.targetRotY;
        container.style.visibility = 'visible';
      }

      monumentRoot.rotation.y = state.currentRotY;
      monumentRoot.rotation.x = (1 - p) * state.pointerTiltX;
      monumentRoot.scale.setScalar(state.currentScale);
      monumentRoot.position.y = (1 - state.currentScale) * 2.58 + p * 0.25;

      var posArr = particlesGeo.attributes.position.array;
      for (var i = 0; i < particleCount; i++) {
        var seed = particleSeeds[i];
        var a = seed.angle + elapsed * seed.speed + p * 2.0;
        var r = seed.radius * (0.45 + 0.55 * state.currentScale);
        posArr[i * 3] = Math.cos(a) * r;
        posArr[i * 3 + 1] = seed.y + Math.sin(elapsed * 0.8 + i) * 0.08;
        posArr[i * 3 + 2] = Math.sin(a) * r;
      }
      particlesGeo.attributes.position.needsUpdate = true;
      particlesMat.opacity = 0.36 * state.currentOpacity;

      container.style.opacity = state.currentOpacity.toFixed(3);
      renderer.render(scene, camera);
    }

    animate();

    return {
      setScrollProgress: setScrollProgress,
      setFinish: setFinish
    };
  }

  window.initIvasyukStatue = buildIvasyukStatueScene;
})();
