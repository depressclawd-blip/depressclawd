/**
 * Solana wallet gate — connect + optional sign before boot
 * Uses injected provider (Phantom, etc.) via window.solana
 */

const SIGN_MESSAGE = 'Sign to verify human access. DepressClawd.'

function getProvider() {
  if (typeof window === 'undefined') return null
  return window.solana ?? window.phantom?.solana ?? null
}

function shortenAddress(pubkey) {
  if (!pubkey) return ''
  const s = typeof pubkey === 'string' ? pubkey : pubkey.toString()
  return s.slice(0, 4) + '...' + s.slice(-4)
}

export function getWalletPublicKey() {
  const provider = getProvider()
  const pubkey = provider?.publicKey
  return pubkey ? pubkey.toString() : ''
}

export function initWalletGate({ onConnected, logoutButtonId }) {
  const gate = document.getElementById('wallet-gate')
  const loader = document.getElementById('loader')
  const app = document.getElementById('app')
  const btnConnect = document.getElementById('btn-connect-wallet')
  const btnTryAgain = document.getElementById('btn-try-again')
  const errorBlock = document.getElementById('wallet-error-block')
  const errorTitle = document.getElementById('wallet-error-title')
  const errorMsg = document.getElementById('wallet-error-msg')
  const noWalletHint = document.getElementById('wallet-no-wallet')
  const walletAddressEl = document.getElementById('wallet-address')

  function showError(title, message) {
    if (errorTitle) errorTitle.textContent = title
    if (errorMsg) errorMsg.textContent = message
    if (errorBlock) errorBlock.classList.remove('hidden')
  }

  function hideError() {
    if (errorBlock) errorBlock.classList.add('hidden')
  }

  function setNoWallet(show) {
    if (noWalletHint) noWalletHint.classList.toggle('hidden', !show)
  }

  async function connectAndVerify() {
    const provider = getProvider()
    hideError()
    setNoWallet(false)

    if (!provider) {
      setNoWallet(true)
      return
    }

    try {
      const resp = await provider.connect()
      const pubkey = resp.publicKey ?? provider.publicKey
      const walletText = pubkey ? 'WALLET: ' + shortenAddress(pubkey) : 'WALLET: —'
      if (walletAddressEl) walletAddressEl.textContent = walletText
      const appWallet = document.getElementById('dashboard-wallet-address')
      if (appWallet) appWallet.textContent = walletText

      // Optional: request signature for "human verification"
      try {
        const msg = new TextEncoder().encode(SIGN_MESSAGE)
        await provider.signMessage(msg, 'utf8')
      } catch (e) {
        if (e.message?.toLowerCase().includes('reject') || e.message?.toLowerCase().includes('cancel') || e.code === 4001) {
          showError('SIGNATURE CANCELLED', 'You cancelled the signature request.')
          return
        }
        throw e
      }

      // Success: hide gate, show loader, run boot
      if (gate) gate.classList.add('hidden')
      if (loader) loader.classList.remove('hidden')
      onConnected()
    } catch (err) {
      const msg = err?.message || String(err)
      if (msg.toLowerCase().includes('cancel') || msg.toLowerCase().includes('reject') || err?.code === 4001) {
        showError('SIGNATURE CANCELLED', 'You cancelled the signature request.')
      } else {
        showError('CONNECTION FAILED', msg.slice(0, 80))
      }
    }
  }

  if (btnConnect) {
    btnConnect.addEventListener('click', connectAndVerify)
  }
  if (btnTryAgain) {
    btnTryAgain.addEventListener('click', () => {
      hideError()
      connectAndVerify()
    })
  }

  function logout() {
    const provider = getProvider()
    if (provider?.disconnect) provider.disconnect()
    if (gate) gate.classList.remove('hidden')
    if (loader) loader.classList.add('hidden')
    if (app) {
      app.classList.add('app-hidden')
      app.classList.remove('app-visible')
    }
    const walletText = 'WALLET: —'
    if (walletAddressEl) walletAddressEl.textContent = walletText
    const appWallet = document.getElementById('dashboard-wallet-address')
    if (appWallet) appWallet.textContent = walletText
  }

  const btnLogout = logoutButtonId ? document.getElementById(logoutButtonId) : null
  if (btnLogout) btnLogout.addEventListener('click', logout)
}
