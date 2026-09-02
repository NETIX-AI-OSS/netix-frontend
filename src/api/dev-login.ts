/**
 * Local-development sign-in. When envoy-ts-auth reports a missing or expired session
 * (ON_LOGOUT), it asks for staging credentials and stores real tokens, so `vite dev` talks to
 * the real staging APIs as a real user — no login page, no credentials in `.env`.
 *
 * It mounts a real `<form>` rather than calling `window.prompt`, because a native dialog is
 * invisible to password managers: nothing to autofill, nothing to offer to save, and the
 * typing is in cleartext. What every manager does recognise is a form carrying
 * `autocomplete="username"` / `"current-password"` fields and a submit button, followed by a
 * navigation — so this asks once, gets saved, and autofills from then on. Chromium is also
 * asked outright via `navigator.credentials.store`. `http://localhost` is a secure context,
 * so saving works there.
 *
 * The overlay imports nothing and inlines its own styles: it has to work before the app has
 * rendered, and inline styles survive app CSS that would otherwise restyle it out of sight.
 *
 * Wire it through `buildAuthConfig`: `onLogout: devLogin.open`, `onLogin: devLogin.close`.
 */

export type DevLoginPromptOptions = {
  /**
   * Typically `(u, p) => Auth.getInstance().login(u, p)`, injected so this module never
   * imports envoy-ts-auth. envoy resolves `true` on success and `false`/`undefined` on
   * failure with no detail, so anything non-`true` is reported as a bad sign-in.
   */
  login: (username: string, password: string) => Promise<unknown>
  /** Runs after a successful sign-in. Defaults to a full reload so everything that already fetched unauthenticated reruns with the token. */
  onSuccess?: () => void
}

export type DevLoginPrompt = {
  /** Mounts the sign-in overlay. Ignored while one is already open. */
  open: () => void
  /** Removes the overlay. Wired to ON_LOGIN, which envoy fires as soon as sign-in succeeds. */
  close: () => void
}

const OVERLAY_STYLE =
  'position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;' +
  'justify-content:center;padding:16px;background:rgba(15,17,21,0.55);' +
  'font:14px/1.5 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif'
const CARD_STYLE =
  'box-sizing:border-box;width:100%;max-width:320px;margin:0;padding:20px;color:#111418;' +
  'background:#fff;border-radius:10px;box-shadow:0 12px 32px rgba(0,0,0,0.28)'
const TITLE_STYLE = 'margin:0 0 16px;font-size:15px;font-weight:600'
const LABEL_STYLE = 'display:block;margin-bottom:4px;font-size:12px;font-weight:600;color:#4a5058'
const INPUT_STYLE =
  'box-sizing:border-box;width:100%;margin:0 0 12px;padding:8px 10px;font:inherit;' +
  'color:#111418;background:#fff;border:1px solid #c9ced6;border-radius:6px'
const ERROR_STYLE = 'margin:0 0 12px;font-size:12px;color:#b42318'
const BUTTON_STYLE =
  'box-sizing:border-box;width:100%;padding:9px 12px;font:inherit;font-weight:600;color:#fff;' +
  'background:#1f6feb;border:0;border-radius:6px;cursor:pointer'

/** A labelled field. `name` + `autocomplete` are what a password manager matches on — without them this is just a text box. */
const createField = (
  doc: Document,
  name: string,
  label: string,
  type: string,
  autocomplete: string,
) => {
  const id = `netix-dev-login-${name}`

  const labelEl = doc.createElement('label')
  labelEl.htmlFor = id
  labelEl.textContent = label
  labelEl.setAttribute('style', LABEL_STYLE)

  const input = doc.createElement('input')
  input.id = id
  input.name = name
  input.type = type
  input.required = true
  input.setAttribute('autocomplete', autocomplete)
  input.setAttribute('style', INPUT_STYLE)

  return { labelEl, input }
}

type PasswordCredentialCtor = new (data: { id: string; password: string }) => Credential

/**
 * Chromium's explicit "offer to save this password". Firefox and Safari do not implement it
 * and watch the submit-then-navigate pair instead, so a missing API — or a declined save — is
 * not a failure: the session is signed in either way.
 */
const storeCredential = async (id: string, password: string) => {
  const ctor = (globalThis as { PasswordCredential?: PasswordCredentialCtor }).PasswordCredential
  if (!ctor || !navigator.credentials) return
  try {
    await navigator.credentials.store(new ctor({ id, password }))
  } catch {
    // Declined or unsupported; the browser's own save heuristics still apply.
  }
}

export function createDevLoginPrompt({ login, onSuccess }: DevLoginPromptOptions): DevLoginPrompt {
  let overlay: HTMLElement | null = null

  const close = () => {
    overlay?.remove()
    overlay = null
  }

  const open = () => {
    // Reading off globalThis also covers non-DOM hosts (react-native), where `./api` is
    // importable and this factory simply has nothing to mount.
    const doc = (globalThis as { document?: Document }).document
    if (overlay || !doc?.body) return

    const host = doc.createElement('div')
    host.setAttribute('style', OVERLAY_STYLE)

    const form = doc.createElement('form')
    form.method = 'post'
    form.setAttribute('style', CARD_STYLE)

    const title = doc.createElement('h2')
    title.textContent = 'Sign in - Development Mode'
    title.setAttribute('style', TITLE_STYLE)

    const username = createField(doc, 'username', 'Username', 'text', 'username')
    const password = createField(doc, 'password', 'Password', 'password', 'current-password')

    const error = doc.createElement('p')
    error.setAttribute('role', 'alert')
    error.setAttribute('style', ERROR_STYLE)
    error.hidden = true

    const button = doc.createElement('button')
    button.type = 'submit'
    button.textContent = 'Sign in'
    button.setAttribute('style', BUTTON_STYLE)

    form.append(
      title,
      username.labelEl,
      username.input,
      password.labelEl,
      password.input,
      error,
      button,
    )
    host.append(form)

    form.addEventListener('submit', (event) => {
      // Never let the form navigate: it has no action, and a reload mid-flight would abort
      // the sign-in. The password manager keys off the submit event, not the navigation.
      event.preventDefault()
      // Read before awaiting — ON_LOGIN fires mid-flight and detaches these fields.
      const id = username.input.value
      const secret = password.input.value

      error.hidden = true
      button.disabled = true
      button.textContent = 'Signing in…'

      void (async () => {
        let result: unknown
        try {
          result = await login(id, secret)
        } catch {
          result = false
        }

        if (result !== true) {
          error.textContent =
            'Sign-in failed — check the credentials and that staging is reachable.'
          error.hidden = false
          button.disabled = false
          button.textContent = 'Sign in'
          password.input.select()
          return
        }

        await storeCredential(id, secret)
        // Unmounting the password field and then navigating is what tells a manager the
        // sign-in worked; both halves matter for the save prompt to appear.
        close()
        ;(onSuccess ?? (() => window.location.reload()))()
      })()
    })

    doc.body.append(host)
    overlay = host
    username.input.focus()
  }

  return { open, close }
}
