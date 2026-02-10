/**
 * App windows: movable, maximize, minimize (dock icon glow when minimized)
 */

function initAppWindow(ids) {
  const win = document.getElementById(ids.window)
  const titlebar = document.getElementById(ids.titlebar)
  const btnClose = document.getElementById(ids.close)
  const btnMinimize = document.getElementById(ids.minimize)
  const btnMaximize = document.getElementById(ids.maximize)
  const dockBtn = document.getElementById(ids.dock)

  if (!win || !titlebar || !dockBtn) return

  let isMaximized = false
  let isMinimized = false
  let posX = 0
  let posY = 0
  let dragStartX = 0
  let dragStartY = 0
  let winStartX = 0
  let winStartY = 0
  let rafId = null

  function show() {
    win.setAttribute('aria-hidden', 'false')
    win.style.display = 'flex'
    isMinimized = false
    updateDockGlow(false)
    if (posX !== 0 || posY !== 0) {
      win.style.left = `${posX}px`
      win.style.top = `${posY}px`
      win.style.transform = 'none'
    } else {
      win.style.left = ''
      win.style.top = ''
      win.style.transform = 'translate(-50%, -50%)'
    }
  }

  function hide() {
    win.setAttribute('aria-hidden', 'true')
    win.style.display = 'none'
    win.style.left = ''
    win.style.top = ''
    win.style.transform = ''
    posX = 0
    posY = 0
    updateDockGlow(false)
  }

  function setMinimized(minimized) {
    isMinimized = minimized
    if (minimized) {
      win.setAttribute('aria-hidden', 'true')
      win.style.display = 'none'
      updateDockGlow(true)
    } else {
      show()
    }
  }

  function updateDockGlow(hasWindow) {
    if (dockBtn) {
      dockBtn.classList.toggle('dashboard-dock-icon--has-window', !!hasWindow)
    }
  }

  function setMaximized(max) {
    isMaximized = max
    win.classList.toggle('task-window--maximized', max)
    if (max) {
      win.style.top = '0'
      win.style.left = '0'
      win.style.right = '0'
      win.style.bottom = '0'
      win.style.transform = 'none'
    } else {
      win.style.right = ''
      win.style.bottom = ''
      if (posX !== 0 || posY !== 0) {
        win.style.top = `${posY}px`
        win.style.left = `${posX}px`
        win.style.transform = 'none'
      } else {
        win.style.top = ''
        win.style.left = ''
        win.style.transform = 'translate(-50%, -50%)'
      }
    }
  }

  function onClose() {
    hide()
    setMaximized(false)
  }

  function onMinimize() {
    setMinimized(true)
  }

  function onMaximize() {
    setMaximized(!isMaximized)
  }

  dockBtn.addEventListener('click', () => {
    if (isMinimized) {
      show()
    } else if (win.getAttribute('aria-hidden') === 'true') {
      show()
    }
    // If already visible, do nothing (or could focus the window)
  })

  btnClose.addEventListener('click', onClose)
  btnMinimize.addEventListener('click', onMinimize)
  btnMaximize.addEventListener('click', onMaximize)

  // Draggable — smooth pakai requestAnimationFrame + transform
  titlebar.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return
    if (isMaximized) return
    const rect = win.getBoundingClientRect()
    dragStartX = e.clientX
    dragStartY = e.clientY
    winStartX = rect.left
    winStartY = rect.top
    posX = winStartX
    posY = winStartY
    win.style.transform = 'none'
    win.style.left = `${posX}px`
    win.style.top = `${posY}px`

    let currentX = winStartX
    let currentY = winStartY

    function onMove(moveEvent) {
      currentX = winStartX + (moveEvent.clientX - dragStartX)
      currentY = winStartY + (moveEvent.clientY - dragStartY)
      if (rafId === null) {
        rafId = requestAnimationFrame(applyPosition)
      }
    }

    function applyPosition() {
      rafId = null
      win.style.left = `${currentX}px`
      win.style.top = `${currentY}px`
    }

    function onUp() {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      posX = currentX
      posY = currentY
    }

    document.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseup', onUp, { once: true })
  })
}

export function initTaskWindow() {
  initAppWindow({
    window: 'task-window',
    titlebar: 'task-titlebar',
    close: 'task-close',
    minimize: 'task-minimize',
    maximize: 'task-maximize',
    dock: 'dock-task',
  })
}

export function initMintWindow() {
  initAppWindow({
    window: 'mint-window',
    titlebar: 'mint-titlebar',
    close: 'mint-close',
    minimize: 'mint-minimize',
    maximize: 'mint-maximize',
    dock: 'dock-mint',
  })
}

export function initBlueprintWindow() {
  initAppWindow({
    window: 'blueprint-window',
    titlebar: 'blueprint-titlebar',
    close: 'blueprint-close',
    minimize: 'blueprint-minimize',
    maximize: 'blueprint-maximize',
    dock: 'dock-blueprint',
  })
}

export function initApplyWindow() {
  initAppWindow({
    window: 'apply-window',
    titlebar: 'apply-titlebar',
    close: 'apply-close',
    minimize: 'apply-minimize',
    maximize: 'apply-maximize',
    dock: 'dock-apply',
  })
}

export function initRoadmapWindow() {
  initAppWindow({
    window: 'roadmap-window',
    titlebar: 'roadmap-titlebar',
    close: 'roadmap-close',
    minimize: 'roadmap-minimize',
    maximize: 'roadmap-maximize',
    dock: 'dock-roadmap',
  })
}
