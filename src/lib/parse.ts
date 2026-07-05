import Parse from 'parse'

// Back4App credentials — set these in .env (copy from .env.example).
// Find them in the Back4App dashboard under App Settings > Security & Keys.
const APP_ID = import.meta.env.VITE_PARSE_APP_ID as string | undefined
const JS_KEY = import.meta.env.VITE_PARSE_JS_KEY as string | undefined
const SERVER_URL =
  (import.meta.env.VITE_PARSE_SERVER_URL as string | undefined) ||
  'https://parseapi.back4app.com/'

// True once real keys are present. Pages use this to fall back to a demo
// mode (mock data, disabled auth) instead of crashing when Back4App isn't
// wired up yet.
export const isBackendConfigured = Boolean(APP_ID && JS_KEY)

if (isBackendConfigured) {
  Parse.initialize(APP_ID as string, JS_KEY as string)
  Parse.serverURL = SERVER_URL
} else {
  // eslint-disable-next-line no-console
  console.warn(
    '[Together] Back4App is not connected yet. Add VITE_PARSE_APP_ID and ' +
      'VITE_PARSE_JS_KEY to a .env file (see .env.example) to enable real ' +
      'authentication and data.'
  )
}


export default Parse
