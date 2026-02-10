/**
 * BIOS-style typewriter boot sequence for loader
 */

const BOOT_LINES = [
  'DEPRESSCLAWD SYSTEM v0.1',
  '',
  '[  OK  ] Initializing core...',
  '[  OK  ] Loading memory modules',
  '[  OK  ] Mounting filesystem',
  '[  OK  ] Starting network stack',
  '[  OK  ] Authenticating user',
  '',
  '>> Boot sequence complete.',
  '>> Welcome to the void.',
  '',
]

const CHAR_DELAY = 35
const LINE_DELAY = 120
const AFTER_LAST_DELAY = 800

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function typeChar(el, char) {
  el.textContent += char
}

export async function runBootSequence() {
  const output = document.getElementById('loader-output')
  const loader = document.getElementById('loader')
  const app = document.getElementById('app')

  if (!output || !loader || !app) return

  const beforeAudio = new Audio('/before.mp3')
  beforeAudio.loop = true
  beforeAudio.play().catch(() => {})

  output.textContent = ''

  for (let i = 0; i < BOOT_LINES.length; i++) {
    const line = BOOT_LINES[i]
    for (let j = 0; j < line.length; j++) {
      typeChar(output, line[j])
      await sleep(CHAR_DELAY)
    }
    if (i < BOOT_LINES.length - 1) {
      typeChar(output, '\n')
    }
    await sleep(LINE_DELAY)
  }

  await sleep(AFTER_LAST_DELAY)

  beforeAudio.pause()
  beforeAudio.currentTime = 0

  const afterAudio = new Audio('/after.mp3')
  afterAudio.play().catch(() => {})

  loader.classList.add('hidden')
  app.classList.remove('app-hidden')
  app.classList.add('app-visible')
}
