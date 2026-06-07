// Add a subtle parallax effect on the background image depending on mouse movement
document.addEventListener('mousemove', (e) => {
  const bg = document.querySelector('.bg-container');
  const x = e.clientX / window.innerWidth - 0.5;
  const y = e.clientY / window.innerHeight - 0.5;
  
  bg.style.transform = `translate(${x * 15}px, ${y * 15}px) scale(1.02)`;
});

// Adding 3d tilt effect to the glass card for a premium dynamic feel
const card = document.querySelector('.glass-card');
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
