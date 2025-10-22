import { useEffect } from "react";

const Particles = () => {
  useEffect(() => {
    class FloatingGeometry {
      constructor(container) {
        this.container = container
        this.particles = []
        this.particleCount = 30
        this.shapes = ["triangle", "circle", "square", "star", "hexagon"]
        this.init()
        this.animate()
      }

      init() {
        for (let i = 0; i < this.particleCount; i++) {
          this.createParticle()
        }
      }

      createParticle() {
        const particle = document.createElement("div")
        particle.className = "particle"

        const size = Math.random() * 40 + 20
        const startX = Math.random() * window.innerWidth
        const startY = window.innerHeight + 50
        const duration = Math.random() * 15 + 10
        const delay = Math.random() * 5
        const swayAmount = Math.random() * 100 + 50
        const color = this.getRandomColor()
        const shape = this.shapes[Math.floor(Math.random() * this.shapes.length)]

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        svg.setAttribute("width", size)
        svg.setAttribute("height", size)
        svg.setAttribute("viewBox", "0 0 100 100")

        // bentuk-bentuknya
        if (shape === "triangle") {
          const t = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
          t.setAttribute("points", "50,10 90,90 10,90")
          t.setAttribute("fill", color)
          t.setAttribute("opacity", "0.7")
          svg.appendChild(t)
        } else if (shape === "circle") {
          const c = document.createElementNS("http://www.w3.org/2000/svg", "circle")
          c.setAttribute("cx", "50")
          c.setAttribute("cy", "50")
          c.setAttribute("r", "40")
          c.setAttribute("fill", color)
          c.setAttribute("opacity", "0.7")
          svg.appendChild(c)
        }

        particle.appendChild(svg)
        particle.style.left = startX + "px"
        particle.style.top = startY + "px"

        const animationName = `float-${Math.random().toString(36).substr(2, 9)}`
        const keyframes = `
          @keyframes ${animationName} {
            0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
            5% { opacity: 0.6; }
            95% { opacity: 0.6; }
            100% { transform: translateY(-${window.innerHeight + 100}px) translateX(${swayAmount - 50}px) rotate(360deg); opacity: 0; }
          }
        `

        let styleSheet = document.getElementById("particle-styles")
        if (!styleSheet) {
          styleSheet = document.createElement("style")
          styleSheet.id = "particle-styles"
          document.head.appendChild(styleSheet)
        }

        styleSheet.textContent += keyframes
        particle.style.animation = `${animationName} ${duration}s linear ${delay}s infinite`

        this.container.appendChild(particle)
        this.particles.push(particle)
      }

      getRandomColor() {
        const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2"]
        return colors[Math.floor(Math.random() * colors.length)]
      }

      animate() {
        setInterval(() => {
          if (this.particles.length > this.particleCount) {
            const oldParticle = this.particles.shift()
            oldParticle.remove()
          }
        }, 1000)
      }
    }

    const container = document.getElementById("particlesContainer")
    if (container) new FloatingGeometry(container)
  }, [])

  return <div id="particlesContainer" className="absolute inset-0 -z-10 overflow-hidden" />
}

export default Particles
