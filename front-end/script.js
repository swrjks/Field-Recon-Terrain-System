// Particle background
const particlesContainer = document.getElementById('particles');
const particleCount = 50;
for (let i = 0; i < particleCount; i++) {
  const particle = document.createElement('div');
  particle.classList.add('particle');
  const size = Math.random() * 3 + 1;
  const posX = Math.random() * 100;
  const posY = Math.random() * 100;
  const duration = Math.random() * 20 + 10;
  const delay = Math.random() * 10;
  const opacity = Math.random() * 0.5 + 0.1;
  const colors = ['var(--color-neon-blue)', 'var(--color-neon-teal)', 'var(--color-neon-green)'];
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  particle.style.left = `${posX}%`;
  particle.style.top = `${posY}%`;
  particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
  particle.style.opacity = opacity;
  particle.style.background = colors[Math.floor(Math.random() * colors.length)];
  particlesContainer.appendChild(particle);
}

// Clock
function updateTime() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString();
  const dateStr = now.toLocaleDateString();
  document.getElementById('current-time').textContent = `${timeStr} | ${dateStr}`;
}
setInterval(updateTime, 1000);
updateTime();

// Globe
const globeContainer = document.getElementById('earth-globe');
if (globeContainer) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, globeContainer.clientWidth / globeContainer.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(globeContainer.clientWidth, globeContainer.clientHeight);
  globeContainer.appendChild(renderer.domElement);

  const geometry = new THREE.SphereGeometry(3, 64, 64);
  const loader = new THREE.TextureLoader();
  const material = new THREE.MeshPhongMaterial({
    map: loader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg'),
    bumpMap: loader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg'),
    bumpScale: 0.05,
    specularMap: loader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg'),
    specular: new THREE.Color('grey'),
    shininess: 5,
    emissive: 0x111111,
    emissiveIntensity: 0.3
  });
  const earth = new THREE.Mesh(geometry, material);
  scene.add(earth);

  const ringGeometry = new THREE.RingGeometry(3.2, 3.4, 64);
  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);
  function animateRing() {
    ring.rotation.z += 0.002;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(3.1, 64, 64),
    new THREE.MeshPhongMaterial({ color: 0x00a2ff, transparent: true, opacity: 0.2, shininess: 5 })
  );
  scene.add(atmosphere);

  const lights = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      map: loader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_lights_2048.jpg'),
      transparent: true,
      opacity: 0.4
    })
  );
  scene.add(lights);

  const ambientLight = new THREE.AmbientLight(0x888888);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(5, 3, 5);
  scene.add(ambientLight, directionalLight);

  const bloomLight = new THREE.PointLight(0x00f0ff, 1.5, 20);
  bloomLight.position.set(0, 0, 0);
  scene.add(bloomLight);

  function createDataBeam(position) {
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 2, 32),
      new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.4 })
    );
    beam.position.copy(position);
    beam.position.y += 1;
    scene.add(beam);
    function animateBeam() {
      beam.scale.y = 1 + 0.1 * Math.sin(Date.now() * 0.005);
      requestAnimationFrame(animateBeam);
    }
    animateBeam();
  }
  createDataBeam(new THREE.Vector3(2, 0, 0));

  camera.position.z = 7;
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;

  window.addEventListener('resize', () => {
    camera.aspect = globeContainer.clientWidth / globeContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(globeContainer.clientWidth, globeContainer.clientHeight);
  });

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}
