// Add a subtle parallax effect on the background image depending on mouse movement
document.addEventListener('mousemove', (e) => {
  const bg = document.querySelector('.bg-container');
  if(bg) {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      bg.style.transform = `translate(${x * 15}px, ${y * 15}px) scale(1.02)`;
  }
});

// Adding 3d tilt effect to the glass card for a premium dynamic feel
const card = document.querySelector('.glass-card');
if (card) {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
        card.style.transition = 'transform 0.5s ease';
    });

    card.addEventListener('mouseenter', () => {
        card.style.transition = 'none';
    });
}

// --- THREE.JS OVERLAY INTEGRATION ---
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Group to hold our image planes
const imageGroup = new THREE.Group();
scene.add(imageGroup);

const textureLoader = new THREE.TextureLoader();

function createTexturedPlane(imagePath, defaultScale = 1) {
    const group = new THREE.Group();
    textureLoader.load(imagePath, (texture) => {
        // Calculate aspect ratio from loaded image
        const aspect = texture.image.width / texture.image.height;
        const geometry = new THREE.PlaneGeometry(aspect, 1);
        const material = new THREE.MeshBasicMaterial({ 
            map: texture, 
            transparent: true,
            side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.scale.setScalar(defaultScale);
        group.add(mesh);
    });
    return group;
}

// --- ALIGNMENT CONFIGURATION ---

const ALIGN = {
    table: { x: 0, y: -3, z: -5, scale: 5.0 },
    leftChair: { x: -4, y: -4.0, z: -7, scale: 4 },
    rightChair: { x: 4, y: -4.0, z: -7, scale: 4 }
};

// 1. Central Table
const table = createTexturedPlane('/Central-table.png', ALIGN.table.scale);
table.position.set(ALIGN.table.x, ALIGN.table.y, ALIGN.table.z);
imageGroup.add(table);

// 2. Left Chair
const leftChair = createTexturedPlane('/Left-chair.png', ALIGN.leftChair.scale);
leftChair.position.set(ALIGN.leftChair.x, ALIGN.leftChair.y, ALIGN.leftChair.z);
imageGroup.add(leftChair);

// 3. Right Chair
const rightChair = createTexturedPlane('/Right-chair.jpg', ALIGN.rightChair.scale);
rightChair.position.set(ALIGN.rightChair.x, ALIGN.rightChair.y, ALIGN.rightChair.z);
imageGroup.add(rightChair);

// --- NEW THREE.JS MOTION LAYERS ---
// Motion 1 - Ambient Floating Particle Field
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 120;
const posArray = new Float32Array(particlesCount * 3);
const seedsArray = new Float32Array(particlesCount);
const originYArray = new Float32Array(particlesCount);

for(let i = 0; i < particlesCount; i++) {
    posArray[i*3] = (Math.random() - 0.5) * 20; // x: [-10, 10]
    posArray[i*3+1] = (Math.random() - 0.5) * 12; // y: [-6, 6]
    posArray[i*3+2] = (Math.random() - 0.5) * 10 - 3; // z: [-8, 2]
    
    seedsArray[i] = Math.random() * 100;
    originYArray[i] = posArray[i*3+1];
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
particlesGeometry.setAttribute('seed', new THREE.BufferAttribute(seedsArray, 1));
particlesGeometry.setAttribute('originY', new THREE.BufferAttribute(originYArray, 1));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.03,
    color: '#ff6b00',
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// Motion 2 - Volumetric Light Cone
const coneGeometry = new THREE.CylinderGeometry(0, 3, 10, 32, 1, true);
const coneMaterial = new THREE.MeshBasicMaterial({
    color: '#ffaa00',
    transparent: true,
    opacity: 0.04,
    side: THREE.BackSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});

const cone = new THREE.Mesh(coneGeometry, coneMaterial);
cone.position.set(0, 6, -4);
cone.rotation.x = Math.PI;
scene.add(cone);

// Motion 3 - Orbiting Ring
const ringGeometry = new THREE.TorusGeometry(1.6, 0.004, 8, 200);
const ringMaterial = new THREE.MeshBasicMaterial({
    color: '#ff6b00',
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending
});

const ring = new THREE.Mesh(ringGeometry, ringMaterial);
ring.position.set(0, -2.5, -5);
scene.add(ring);

gsap.to(ringMaterial, { opacity: 0.35, duration: 3, delay: 2.5, ease: "power2.out" });

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Render loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    
    // Animate Particles
    if (typeof particles !== 'undefined') {
        const positions = particles.geometry.attributes.position.array;
        const origins = particles.geometry.attributes.originY.array;
        const seeds = particles.geometry.attributes.seed.array;
        
        for(let i = 0; i < particlesCount; i++) {
            positions[i*3+1] = origins[i] + Math.sin(time * 0.4 + seeds[i]) * 0.3;
        }
        particles.geometry.attributes.position.needsUpdate = true;
        particles.rotation.y += 0.0008;
    }
    
    // Animate Cone
    if (typeof coneMaterial !== 'undefined' && typeof cone !== 'undefined') {
        coneMaterial.opacity = 0.04 + Math.sin(time * 0.6) * 0.015;
        cone.rotation.y += 0.0003;
    }
    
    // Animate Ring
    if (typeof ring !== 'undefined') {
        ring.rotation.x = Math.PI / 2 + Math.sin(time * 0.2) * 0.08;
        ring.rotation.z += 0.002;
    }

    renderer.render(scene, camera);
}
animate();

// --- GSAP Animations ---

// Wait slightly for textures to begin loading before starting intro
setTimeout(() => {
    // 1. INTRO MOTION (Slide and tilt, no continuous idle)
    // Table rises
    gsap.fromTo(table.position, { y: -5 }, { y: ALIGN.table.y, duration: 2, ease: "power3.out" });
    
    // Left chair slides in from left, tilted back, settling to face camera
    gsap.fromTo(leftChair.position, { x: -6, z: -2 }, { x: ALIGN.leftChair.x, z: ALIGN.leftChair.z, duration: 1.8, ease: "power3.out", delay: 0.2 });
    gsap.fromTo(leftChair.rotation, { y: Math.PI / 4, z: -0.1 }, { y: 0, z: 0, duration: 1.8, ease: "power3.out", delay: 0.2 });
    
    // Right chair slides in from right, tilted back
    gsap.fromTo(rightChair.position, { x: 6, z: -2 }, { x: ALIGN.rightChair.x, z: ALIGN.rightChair.z, duration: 1.8, ease: "power3.out", delay: 0.3 });
    gsap.fromTo(rightChair.rotation, { y: -Math.PI / 4, z: 0.1 }, { y: 0, z: 0, duration: 1.8, ease: "power3.out", delay: 0.3 });

}, 100);

// 2. SCRUB ON SCROLL MOTION
// When scrolling down, push elements away/apart for depth parallax
const tlScroll = gsap.timeline({
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1
    }
});

// Create deep parallax as user scrolls down the spacer
tlScroll.to(table.position, { y: ALIGN.table.y - 1, z: -3 }, 0);
tlScroll.to(leftChair.position, { x: ALIGN.leftChair.x - 1, y: ALIGN.leftChair.y + 0.5, z: 2 }, 0);
tlScroll.to(rightChair.position, { x: ALIGN.rightChair.x + 1, y: ALIGN.rightChair.y + 0.5, z: 2 }, 0);
tlScroll.to(camera.position, { z: 7 }, 0);

// 3. Integrate with the existing mousemove for extra parallax
document.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    
    // Move the entire 3D group slightly based on mouse
    gsap.to(imageGroup.position, {
        x: x * 0.4,
        y: -y * 0.4,
        duration: 1.5,
        ease: "power2.out"
    });
    
    // Slight rotation for depth feel
    gsap.to(imageGroup.rotation, {
        x: y * 0.05,
        y: x * 0.05,
        duration: 1.5,
        ease: "power2.out"
    });
});

// --- UI & Scroll Behaviors ---

// Navbar scroll behavior
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.navbar');
  if (nav) {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
});

// GSAP scroll-reveal for panels and menu items
gsap.utils.toArray('.glass-panel').forEach((panel) => {
  gsap.fromTo(panel,
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: panel,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    }
  );
});

gsap.utils.toArray('.menu-item').forEach((item, i) => {
  gsap.fromTo(item,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      delay: i * 0.12,
      scrollTrigger: {
        trigger: item,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    }
  );
});
