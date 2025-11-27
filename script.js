// Constants
const WORK_TIME = 25 * 60 // 25 minutes in seconds
const BREAK_TIME = 5 * 60 // 5 minutes in seconds

const MOTIVATIONAL_QUOTES = [
  "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
  "No cuentes los días, haz que los días cuenten.",
  "La disciplina es el puente entre metas y logros.",
  "Cada momento es una oportunidad para mejorar.",
  "El enfoque es tu superpoder.",
  "Pequeños pasos cada día llevan a grandes cambios.",
  "Tu única limitación eres tú mismo.",
  "La constancia vence lo que la dicha no alcanza.",
  "Hoy es el día perfecto para comenzar.",
  "El progreso, no la perfección.",
]

// State
let mode = "work"
let timeLeft = WORK_TIME
let isRunning = false
let completedPomodoros = 0
let isMusicMode = false
let isMuted = false
let timerInterval = null
let quoteInterval = null

// DOM Elements
const timeDisplay = document.getElementById("timeDisplay")
const modeText = document.getElementById("modeText")
const playPauseBtn = document.getElementById("playPauseBtn")
const resetBtn = document.getElementById("resetBtn")
const workBtn = document.getElementById("workBtn")
const breakBtn = document.getElementById("breakBtn")
const completedCount = document.getElementById("completedCount")
const progressCircle = document.getElementById("progressCircle")
const musicBtn = document.getElementById("musicBtn")
const musicBanner = document.getElementById("musicBanner")
const volumeBtn = document.getElementById("volumeBtn")
const volumeIcon = document.getElementById("volumeIcon")
const backgroundMusic = document.getElementById("backgroundMusic")
const quoteContainer = document.getElementById("quoteContainer")
const quoteText = document.getElementById("quoteText")
const bgBtn = document.getElementById("bgBtn")
const bgPicker = document.getElementById("bgPicker")
const playIcon = document.getElementById("playIcon")

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  updateDisplay()
  setupEventListeners()
})

function setupEventListeners() {
  playPauseBtn.addEventListener("click", toggleTimer)
  resetBtn.addEventListener("click", resetTimer)
  workBtn.addEventListener("click", () => switchMode("work"))
  breakBtn.addEventListener("click", () => switchMode("break"))
  musicBtn.addEventListener("click", toggleMusic)
  volumeBtn.addEventListener("click", toggleMute)
  bgBtn.addEventListener("click", toggleBackgroundPicker)

  // Background options
  document.querySelectorAll(".bg-option").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const bg = e.target.dataset.bg
      changeBackground(bg)
    })
  })
}

function toggleTimer() {
  isRunning = !isRunning

  if (isRunning) {
    startTimer()
    startQuoteRotation()
    updatePlayIcon(true)
  } else {
    stopTimer()
    stopQuoteRotation()
    updatePlayIcon(false)
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--
    updateDisplay()

    if (timeLeft <= 0) {
      handleTimerComplete()
    }
  }, 1000)
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function resetTimer() {
  stopTimer()
  isRunning = false
  timeLeft = mode === "work" ? WORK_TIME : BREAK_TIME
  updateDisplay()
  updatePlayIcon(false)
}

function handleTimerComplete() {
  stopTimer()

  if (mode === "work") {
    completedPomodoros++
    completedCount.textContent = completedPomodoros
    switchMode("break")
  } else {
    switchMode("work")
  }

  isRunning = false
  updatePlayIcon(false)
}

function switchMode(newMode) {
  mode = newMode
  timeLeft = mode === "work" ? WORK_TIME : BREAK_TIME
  isRunning = false

  // Update mode buttons
  workBtn.classList.toggle("active", mode === "work")
  breakBtn.classList.toggle("active", mode === "break")

  // Update mode text
  modeText.textContent = mode === "work" ? "Tiempo de enfoque" : "Tiempo de descanso"

  stopTimer()
  updateDisplay()
  updatePlayIcon(false)
}

function updateDisplay() {
  // Update time
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  timeDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

  // Update progress circle
  const totalTime = mode === "work" ? WORK_TIME : BREAK_TIME
  const progress = ((totalTime - timeLeft) / totalTime) * 100
  const circumference = 2 * Math.PI * 90
  const offset = circumference * (1 - progress / 100)
  progressCircle.style.strokeDashoffset = offset
}

function updatePlayIcon(playing) {
  if (playing) {
    playIcon.innerHTML = `
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
        `
  } else {
    playIcon.innerHTML = `
            <polygon points="6 3 20 12 6 21 6 3"/>
        `
  }
}

function toggleMusic() {
  isMusicMode = !isMusicMode
  musicBtn.classList.toggle("active", isMusicMode)
  musicBanner.classList.toggle("hidden", !isMusicMode)

  if (isMusicMode && isRunning) {
    backgroundMusic.play()
  } else {
    backgroundMusic.pause()
  }
}

function toggleMute() {
  isMuted = !isMuted
  backgroundMusic.muted = isMuted

  if (isMuted) {
    volumeIcon.innerHTML = `
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <line x1="23" y1="9" x2="17" y2="15"/>
            <line x1="17" y1="9" x2="23" y2="15"/>
        `
  } else {
    volumeIcon.innerHTML = `
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        `
  }
}

function startQuoteRotation() {
  showRandomQuote()
  quoteContainer.classList.remove("hidden")

  quoteInterval = setInterval(() => {
    showRandomQuote()
  }, 30000) // Every 30 seconds
}

function stopQuoteRotation() {
  if (quoteInterval) {
    clearInterval(quoteInterval)
    quoteInterval = null
  }
  quoteContainer.classList.add("hidden")
}

function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
  quoteText.textContent = `"${MOTIVATIONAL_QUOTES[randomIndex]}"`
}

function toggleBackgroundPicker() {
  bgPicker.classList.toggle("hidden")
}

function changeBackground(bgName) {
  // Remove all background classes
  document.body.className = ""
  // Add new background class
  document.body.classList.add(`bg-${bgName}`)

  // Update active state
  document.querySelectorAll(".bg-option").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.bg === bgName)
  })

  // Hide picker
  bgPicker.classList.add("hidden")
}

// Auto-play music when timer starts
setInterval(() => {
  if (isMusicMode && isRunning && backgroundMusic.paused) {
    backgroundMusic.play()
  } else if ((!isMusicMode || !isRunning) && !backgroundMusic.paused) {
    backgroundMusic.pause()
  }
}, 1000)
