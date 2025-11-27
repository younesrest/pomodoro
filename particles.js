class ParticleSystem {
  constructor() {
    this.canvas = document.getElementById("particles")
    this.ctx = this.canvas.getContext("2d")
    this.particles = []
    this.particleCount = 80
    this.connectionDistance = 150
    this.mouse = { x: null, y: null, radius: 150 }

    this.resize()
    this.init()
    this.animate()

    window.addEventListener("resize", () => this.resize())
    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.x
      this.mouse.y = e.y
    })
  }

  resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  init() {
    this.particles = []
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
      })
    }
  }

  getParticleColor() {
    const isDarkTheme = document.documentElement.classList.contains("dark-theme")
    // Light theme: #3b82f6, Dark theme: #60a5fa
    return isDarkTheme ? "rgba(96, 165, 250, 0.5)" : "rgba(59, 130, 246, 0.5)"
  }

  getConnectionColor(opacity) {
    const isDarkTheme = document.documentElement.classList.contains("dark-theme")
    // Light theme: #3b82f6, Dark theme: #60a5fa
    return isDarkTheme ? `rgba(96, 165, 250, ${opacity})` : `rgba(59, 130, 246, ${opacity})`
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.particles.forEach((particle, i) => {
      // Update position
      particle.x += particle.vx
      particle.y += particle.vy

      // Bounce off edges
      if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1
      if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1

      // Mouse interaction
      const dx = this.mouse.x - particle.x
      const dy = this.mouse.y - particle.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < this.mouse.radius) {
        const force = (this.mouse.radius - distance) / this.mouse.radius
        const angle = Math.atan2(dy, dx)
        particle.vx -= Math.cos(angle) * force * 0.2
        particle.vy -= Math.sin(angle) * force * 0.2
      }

      // Damping
      particle.vx *= 0.99
      particle.vy *= 0.99

      // Use dynamic color according to the theme
      this.ctx.beginPath()
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      this.ctx.fillStyle = this.getParticleColor()
      this.ctx.fill()

      // Draw connections
      for (let j = i + 1; j < this.particles.length; j++) {
        const other = this.particles[j]
        const dx = particle.x - other.x
        const dy = particle.y - other.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < this.connectionDistance) {
          this.ctx.beginPath()
          this.ctx.moveTo(particle.x, particle.y)
          this.ctx.lineTo(other.x, other.y)
          const opacity = (1 - distance / this.connectionDistance) * 0.3
          // Use dynamic connection color according to the theme
          this.ctx.strokeStyle = this.getConnectionColor(opacity)
          this.ctx.lineWidth = 1
          this.ctx.stroke()
        }
      }
    })

    requestAnimationFrame(() => this.animate())
  }
}

// Variable global to keep reference to the particle system
let particleSystem = null

// Function to create/recreate the particle system
function createParticles() {
  if (particleSystem) {
    // If it already exists, we only need to redraw with the new colors
    // The system is already animating and will take the new colors automatically
    return
  }
  particleSystem = new ParticleSystem()
}

// Initialize particle system
createParticles()
