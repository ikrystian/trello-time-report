// Canvas animation inspired by cline.bot
document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('teamCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Set canvas dimensions to match display size
  function resizeCanvas() {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }
  }
  
  // Resize on load
  resizeCanvas();
  
  // Resize on window resize
  window.addEventListener('resize', resizeCanvas);
  
  // Particle system
  const particles = [];
  const particleCount = 100;
  const colors = ['#9f58fa', '#4B96DC', '#4BD48E', '#ffffff'];
  
  // Create particles
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: Math.random() * 2 - 1,
      speedY: Math.random() * 2 - 1,
      opacity: Math.random() * 0.5 + 0.3
    });
  }
  
  // Connection lines
  function drawConnections() {
    const maxDistance = 150;
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance) {
          const opacity = (1 - distance / maxDistance) * 0.2;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(159, 88, 250, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }
  
  // Gradient background
  function drawBackground() {
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, width / 2
    );
    gradient.addColorStop(0, 'rgba(75, 150, 220, 0.1)');
    gradient.addColorStop(1, 'rgba(159, 88, 250, 0.05)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  
  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    drawBackground();
    
    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      
      // Update position
      p.x += p.speedX;
      p.y += p.speedY;
      
      // Bounce off edges
      if (p.x < 0 || p.x > width) p.speedX *= -1;
      if (p.y < 0 || p.y > height) p.speedY *= -1;
      
      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    
    // Draw connections
    drawConnections();
    
    // Add floating text elements
    drawFloatingElements();
    
    requestAnimationFrame(animate);
  }
  
  // Floating text/code elements
  const codeElements = [
    { text: "function collaborate() {", x: width * 0.2, y: height * 0.3, size: 14, color: "#ffffff", opacity: 0.7, speedX: 0.2, speedY: 0.1 },
    { text: "  return teamwork.enhance();", x: width * 0.25, y: height * 0.35, size: 14, color: "#4BD48E", opacity: 0.7, speedX: 0.15, speedY: 0.12 },
    { text: "}", x: width * 0.2, y: height * 0.4, size: 14, color: "#ffffff", opacity: 0.7, speedX: 0.2, speedY: 0.1 },
    { text: "class Innovation {", x: width * 0.6, y: height * 0.6, size: 14, color: "#ffffff", opacity: 0.7, speedX: -0.1, speedY: 0.15 },
    { text: "  build() { /* ... */ }", x: width * 0.65, y: height * 0.65, size: 14, color: "#4B96DC", opacity: 0.7, speedX: -0.12, speedY: 0.14 },
    { text: "}", x: width * 0.6, y: height * 0.7, size: 14, color: "#ffffff", opacity: 0.7, speedX: -0.1, speedY: 0.15 }
  ];
  
  function drawFloatingElements() {
    ctx.font = "bold 14px monospace";
    ctx.textBaseline = "middle";
    
    for (let i = 0; i < codeElements.length; i++) {
      const element = codeElements[i];
      
      // Update position
      element.x += element.speedX;
      element.y += element.speedY;
      
      // Bounce off edges
      if (element.x < 0 || element.x > width - 200) element.speedX *= -1;
      if (element.y < 0 || element.y > height - 20) element.speedY *= -1;
      
      // Draw text
      ctx.fillStyle = element.color;
      ctx.globalAlpha = element.opacity;
      ctx.fillText(element.text, element.x, element.y);
      ctx.globalAlpha = 1;
    }
  }
  
  // Start animation
  animate();
});
