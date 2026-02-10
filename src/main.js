import './style.css'
import { runBootSequence } from './boot.js'
import { initWalletGate, getWalletPublicKey } from './wallet.js'
import { initTaskWindow, initMintWindow, initBlueprintWindow, initApplyWindow, initRoadmapWindow } from './task.js'
import { supabase } from './lib/supabase.js'

const clickBeep = new Audio('/beep.mp3')
document.addEventListener('click', () => {
  clickBeep.currentTime = 0
  clickBeep.play().catch(() => {})
}, { capture: true })

// Flow: wallet gate → boot → app
initWalletGate({
  onConnected() {
    runBootSequence()
  },
  logoutButtonId: 'dock-logout',
})

initTaskWindow()
initMintWindow()
initApplyWindow()
initRoadmapWindow()
initBlueprintWindow()

// Apply: isi Solana Wallet saat buka jendela Apply; handle submit minting
const dockApply = document.getElementById('dock-apply')
const applyWindow = document.getElementById('apply-window')
const applyForm = document.getElementById('apply-form')
const applyWalletInput = document.getElementById('apply-wallet')
if (dockApply && applyWalletInput) {
  dockApply.addEventListener('click', () => {
    setTimeout(() => {
      if (applyWindow?.getAttribute('aria-hidden') === 'false') {
        applyWalletInput.value = getWalletPublicKey()
      }
    }, 50)
  })
}
if (applyForm) {
  applyForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const walletInput = document.getElementById('apply-wallet')
    const xUsernameInput = document.getElementById('apply-x-username')
    const submitBtn = document.getElementById('apply-submit')
    const msgEl = document.getElementById('apply-msg')
    const wallet = walletInput?.value?.trim()
    const xUsername = xUsernameInput?.value?.trim() || null

    if (!wallet) {
      showApplyMsg(msgEl, 'Connect wallet first.', true)
      return
    }

    if (!supabase) {
      showApplyMsg(msgEl, 'Whitelist not configured. Add Supabase env.', true)
      return
    }

    submitBtn.disabled = true
    submitBtn.textContent = '[ ... ]'
    msgEl?.classList.add('apply-msg--hidden')

    const { error } = await supabase
      .from('whitelist')
      .insert({ wallet, x_username: xUsername })

    submitBtn.disabled = false
    submitBtn.textContent = '[ SUBMIT ]'

    if (error) {
      const isDuplicate = error.code === '23505'
      showApplyMsg(msgEl, isDuplicate ? 'Wallet already on whitelist.' : error.message || 'Failed to submit.', true)
      return
    }
    showApplyMsg(msgEl, 'Submitted. You\'re on the whitelist.', false)
  })
}

function showApplyMsg(el, text, isError) {
  if (!el) return
  el.textContent = text
  el.classList.remove('apply-msg--hidden', 'apply-msg--error', 'apply-msg--success')
  el.classList.add(isError ? 'apply-msg--error' : 'apply-msg--success')
}

// Blueprint: klik asset → tampilkan rarity (Common … Legendary)
document.addEventListener('click', (e) => {
  const row = e.target.closest('.blueprint-asset-row')
  if (!row) return
  const asset = row.closest('.blueprint-asset')
  if (asset) asset.classList.toggle('blueprint-asset--open')
})

// Blueprint Background: klik rarity (Common / Uncommon / …) → tampil gambar
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.blueprint-rarity-toggle-btn')
  if (!btn) return
  const li = btn.closest('.blueprint-rarity--expandable')
  const list = li?.querySelector('.blueprint-bg-list')
  if (!li || !list) return
  const expanded = li.classList.toggle('is-expanded')
  btn.setAttribute('aria-expanded', String(expanded))
  list.hidden = !expanded
})

// Dashboard top bar clock (HH:MM:SS)
function updateDashboardTime() {
  const el = document.getElementById('mac-time')
  if (!el) return
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  el.textContent = `${h}:${m}:${s}`
}
updateDashboardTime()
setInterval(updateDashboardTime, 1000)

// Reveal elements on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible')
    }
  })
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
