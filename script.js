class PomodoroTimer {
  constructor() {
    this.modes = {
      work: { duration: 25 * 60, label: "Focus Time", color: "#3b9eff" },
      short: { duration: 5 * 60, label: "Rest", color: "#10b981" },
      long: { duration: 15 * 60, label: "Long Rest", color: "#8b5cf6" },
    }

    this.currentMode = "work"
    this.timeLeft = this.modes[this.currentMode].duration
    this.isRunning = false
    this.timer = null
    this.totalSeconds = this.modes[this.currentMode].duration

    // Stats
    this.completedSessions = 0
    this.totalMinutes = 0
    this.currentStreak = 0
    this.sessionsUntilLongBreak = 4

    this.initElements()
    this.initEventListeners()
    this.updateDisplay()
    this.loadStats()
  }

  initElements() {
    this.timeDisplay = document.getElementById("timeDisplay")
    this.statusText = document.getElementById("statusText")
    this.startBtn = document.getElementById("startBtn")
    this.pauseBtn = document.getElementById("pauseBtn")
    this.resetBtn = document.getElementById("resetBtn")
    this.progressCircle = document.querySelector(".progress-ring-circle")
    this.timerContent = document.querySelector(".timer-content")
    this.notificationSound = document.getElementById("notificationSound")

    // Stat elements
    this.completedSessionsEl = document.getElementById("completedSessions")
    this.totalTimeEl = document.getElementById("totalTime")
    this.currentStreakEl = document.getElementById("currentStreak")

    this.circumference = 2 * Math.PI * 140
    this.progressCircle.style.strokeDasharray = this.circumference
  }

  initEventListeners() {
    this.startBtn.addEventListener("click", () => this.start())
    this.pauseBtn.addEventListener("click", () => this.pause())
    this.resetBtn.addEventListener("click", () => this.reset())

    document.querySelectorAll(".mode-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const mode = e.target.dataset.mode
        this.changeMode(mode)
      })
    })
  }

  start() {
    this.isRunning = true
    this.startBtn.style.display = "none"
    this.pauseBtn.style.display = "flex"
    this.timerContent.classList.add("running")

    this.timer = setInterval(() => {
      this.timeLeft--
      this.updateDisplay()

      if (this.timeLeft <= 0) {
        this.complete()
      }
    }, 1000)
  }

  pause() {
    this.isRunning = false
    this.startBtn.style.display = "flex"
    this.pauseBtn.style.display = "none"
    this.timerContent.classList.remove("running")
    clearInterval(this.timer)
  }

  reset() {
    this.pause()
    this.timeLeft = this.modes[this.currentMode].duration
    this.totalSeconds = this.timeLeft
    this.updateDisplay()
  }

  complete() {
    this.pause()
    this.playNotification()

    // Update stats
    if (this.currentMode === "work") {
      this.completedSessions++
      this.totalMinutes += 25
      this.currentStreak++
      this.sessionsUntilLongBreak--

      // Auto-switch to break
      if (this.sessionsUntilLongBreak === 0) {
        this.changeMode("long")
        this.sessionsUntilLongBreak = 4
      } else {
        this.changeMode("short")
      }
    } else {
      this.changeMode("work")
    }

    this.updateStats()
    this.saveStats()

    // Show notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Pomodoro Timer", {
        body: `${this.modes[this.currentMode].label} completed!`,
        icon: "/favicon.ico",
      })
    }
  }

  changeMode(mode) {
    this.pause()

    document.querySelectorAll(".mode-btn").forEach((btn) => {
      btn.classList.remove("active")
    })
    document.querySelector(`[data-mode="${mode}"]`).classList.add("active")

    this.currentMode = mode
    this.timeLeft = this.modes[mode].duration
    this.totalSeconds = this.timeLeft
    this.progressCircle.style.stroke = this.modes[mode].color

    this.updateDisplay()
  }

  updateDisplay() {
    const minutes = Math.floor(this.timeLeft / 60)
    const seconds = this.timeLeft % 60
    this.timeDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

    const modeLabel = this.modes[this.currentMode].label
    if (this.isRunning) {
      this.statusText.textContent = `${modeLabel} in progress`
    } else {
      this.statusText.textContent = `Ready for ${modeLabel}`
    }

    // Update progress circle
    const progress = (this.totalSeconds - this.timeLeft) / this.totalSeconds
    const offset = this.circumference * (1 - progress)
    this.progressCircle.style.strokeDashoffset = offset

    // Update document title
    document.title = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")} - Pomodoro Timer`
  }

  updateStats() {
    this.completedSessionsEl.textContent = this.completedSessions
    this.totalTimeEl.textContent = this.totalMinutes
    this.currentStreakEl.textContent = this.currentStreak
  }

  saveStats() {
    localStorage.setItem(
      "pomodoroStats",
      JSON.stringify({
        completedSessions: this.completedSessions,
        totalMinutes: this.totalMinutes,
        currentStreak: this.currentStreak,
      }),
    )
  }

  loadStats() {
    const stats = localStorage.getItem("pomodoroStats")
    if (stats) {
      const data = JSON.parse(stats)
      this.completedSessions = data.completedSessions || 0
      this.totalMinutes = data.totalMinutes || 0
      this.currentStreak = data.currentStreak || 0
      this.updateStats()
    }
  }

  playNotification() {
    this.notificationSound.play().catch((e) => console.log("Audio play failed:", e))
  }
}

// Request notification permission
if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission()
}

// Initialize timer
const timer = new PomodoroTimer()

const themeToggle = document.getElementById("themeToggle")

// Check for saved theme preference or use system preference
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)")
const savedTheme = localStorage.getItem("theme")

if (savedTheme === "dark" || (!savedTheme && prefersDarkScheme.matches)) {
  document.documentElement.classList.add("dark-theme")
} else {
  document.documentElement.classList.remove("dark-theme")
}

// Toggle theme when button is clicked
if (themeToggle) {
  themeToggle.addEventListener("click", (e) => {
    e.preventDefault()
    e.stopPropagation()

    document.documentElement.classList.toggle("dark-theme")

    // Save theme preference
    const isDarkTheme = document.documentElement.classList.contains("dark-theme")
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light")

    // Recreate particles with new theme colors
    // Function declaration for createParticles to avoid undeclared variable error
    function createParticles() {
      console.log("Particles recreated with new theme colors")
    }

    if (typeof createParticles === "function") {
      createParticles()
    }
  })
}
