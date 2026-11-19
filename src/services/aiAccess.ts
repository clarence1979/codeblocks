/*
 * How Code Blocks gets to use OpenAI.
 *
 * 1. From teachingtools.dev (preferred). The shared eduai-connect script asks the
 *    teachingtools.dev desktop (when opened inside it) or its key bridge (when opened
 *    on its own at *.teachingtools.dev) for a short-lived pass. The real key never
 *    reaches this page: requests go to the teachingtools.dev relay, which adds the
 *    school key on the server.
 * 2. The user's own OpenAI key, typed into a box. Used when the page is not
 *    connected to teachingtools.dev (for example opened from a USB stick). It is
 *    checked with OpenAI before use, kept only in this browser, and never shown.
 *
 * The page never displays a key; it only shows a green dot when AI is ready.
 */

type EduState = {
  status: 'loading' | 'ready' | 'signed-out';
  user: { username: string } | null;
  keys: Record<string, string>;
  source: 'desktop' | 'bridge' | null;
  message: string;
};

type EduApi = {
  getState: () => EduState;
  subscribe: (fn: (s: EduState) => void) => () => void;
  getKey: (name: string) => string;
  inIframe: () => boolean;
  openSignIn: () => void;
  connect: () => Promise<EduState>;
};

declare global {
  interface Window {
    EduAI?: EduApi;
  }
}

export type AiMode = 'checking' | 'school' | 'own' | 'none';
export type OwnKeyStatus = 'none' | 'checking' | 'valid' | 'invalid' | 'unreachable';

export interface AiState {
  mode: AiMode;
  ownKey: OwnKeyStatus;
  ownKeyMessage: string;
  schoolUser: string;
  inDesktop: boolean;
  onTeachingTools: boolean;
}

const OWN_KEY_STORAGE = 'codecraft_openai_key';

// A key that worked this session even if the browser refused to save it.
let ownKeyMemory = '';

function readOwnKey(): string {
  try {
    return localStorage.getItem(OWN_KEY_STORAGE) || ownKeyMemory;
  } catch {
    return ownKeyMemory;
  }
}

function edu(): EduApi | undefined {
  return typeof window !== 'undefined' ? window.EduAI : undefined;
}

const TT_ORIGIN = /^https:\/\/([a-z0-9-]+\.)*teachingtools\.dev$|^https:\/\/eduai-desktop\.netlify\.app$/;

/** True when this page is shown inside the teachingtools.dev desktop (not some other site's frame). */
function computeInDesktop(): boolean {
  let framed = false;
  try {
    framed = window.self !== window.top;
  } catch {
    framed = true;
  }
  if (!framed) return false;
  try {
    const ancestors = (location as Location & { ancestorOrigins?: DOMStringList }).ancestorOrigins;
    if (ancestors && ancestors.length) return TT_ORIGIN.test(ancestors[0]);
    if (document.referrer) return TT_ORIGIN.test(new URL(document.referrer).origin);
  } catch {
    /* fall through */
  }
  return false;
}

let state: AiState = {
  mode: 'checking',
  ownKey: readOwnKey() ? 'checking' : 'none',
  ownKeyMessage: '',
  schoolUser: '',
  inDesktop: computeInDesktop(),
  onTeachingTools: typeof location !== 'undefined' && /(^|\.)teachingtools\.dev$/.test(location.hostname),
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => {
    try {
      l();
    } catch {
      /* ignore */
    }
  });
}

function schoolReady(): boolean {
  const e = edu();
  if (!e) return false;
  const s = e.getState();
  return s.status === 'ready' && !!s.keys.OPENAI_API_KEY;
}

function schoolChecking(): boolean {
  const e = edu();
  return !!e && e.getState().status === 'loading';
}

function recompute() {
  const e = edu();
  const school = schoolReady();
  let mode: AiMode;
  if (school) mode = 'school';
  else if (state.ownKey === 'valid') mode = 'own';
  else if (schoolChecking() || state.ownKey === 'checking') mode = 'checking';
  else mode = 'none';
  state = {
    ...state,
    mode,
    schoolUser: school && e ? e.getState().user?.username || '' : '',
  };
  emit();
}

/** Ask OpenAI whether a key works, without spending anything. */
async function checkKeyWithOpenAI(key: string): Promise<'valid' | 'invalid' | 'unreachable'> {
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (res.ok) return 'valid';
    if (res.status === 401 || res.status === 403) return 'invalid';
    return 'unreachable';
  } catch {
    return 'unreachable';
  }
}

async function verifyStoredKey() {
  const key = readOwnKey();
  if (!key) {
    state = { ...state, ownKey: 'none', ownKeyMessage: '' };
    recompute();
    return;
  }
  state = { ...state, ownKey: 'checking', ownKeyMessage: '' };
  recompute();
  const result = await checkKeyWithOpenAI(key);
  state = {
    ...state,
    ownKey: result,
    ownKeyMessage:
      result === 'invalid'
        ? 'OpenAI did not accept the saved key. Enter a new one.'
        : result === 'unreachable'
          ? "Can't reach OpenAI to check your key. Check the internet connection."
          : '',
  };
  recompute();
}

let started = false;

export const aiAccess = {
  getState(): AiState {
    return state;
  },

  subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },

  /** Start watching teachingtools.dev and check any saved key. Safe to call more than once. */
  start() {
    if (started) return;
    started = true;
    const e = edu();
    if (e) e.subscribe(() => recompute());
    recompute();
    void verifyStoredKey();
  },

  /** The key to send with an OpenAI request: the teachingtools.dev pass placeholder, or the user's own key. */
  keyForRequest(): string {
    if (schoolReady()) return edu()!.getKey('OPENAI_API_KEY');
    if (state.ownKey === 'valid') return readOwnKey();
    return '';
  },

  /** Check a key with OpenAI and keep it only if it works. Returns a message for the user when it doesn't. */
  async useOwnKey(raw: string): Promise<{ ok: boolean; message: string }> {
    const key = raw.trim();
    if (!key) return { ok: false, message: 'Paste your OpenAI API key first.' };
    if (!/^sk-[A-Za-z0-9_\-]{20,}$/.test(key)) {
      return { ok: false, message: 'That doesn’t look like an OpenAI key. OpenAI keys start with "sk-".' };
    }
    state = { ...state, ownKey: 'checking', ownKeyMessage: '' };
    recompute();
    const result = await checkKeyWithOpenAI(key);
    if (result === 'valid') {
      try {
        localStorage.setItem(OWN_KEY_STORAGE, key);
      } catch {
        /* storage blocked: the key still works until the page closes */
      }
      ownKeyMemory = key;
      state = { ...state, ownKey: 'valid', ownKeyMessage: '' };
      recompute();
      return { ok: true, message: '' };
    }
    const message =
      result === 'invalid'
        ? 'OpenAI did not accept that key. Check it and try again.'
        : "Can't reach OpenAI to check the key. Check the internet connection and try again.";
    // A rejected new key leaves any earlier working key in place.
    const previous = readOwnKey();
    state = { ...state, ownKey: previous ? 'checking' : 'none', ownKeyMessage: message };
    recompute();
    if (previous) {
      const again = await checkKeyWithOpenAI(previous);
      state = { ...state, ownKey: again === 'valid' ? 'valid' : 'none', ownKeyMessage: message };
      recompute();
    }
    return { ok: false, message };
  },

  forgetOwnKey() {
    try {
      localStorage.removeItem(OWN_KEY_STORAGE);
    } catch {
      /* ignore */
    }
    ownKeyMemory = '';
    state = { ...state, ownKey: 'none', ownKeyMessage: '' };
    recompute();
  },

  openSignIn() {
    edu()?.openSignIn();
  },

  statusText(): string {
    switch (state.mode) {
      case 'school':
        return `AI ready through teachingtools.dev${state.schoolUser ? ` (${state.schoolUser})` : ''}`;
      case 'own':
        return 'AI ready with your own OpenAI key';
      case 'checking':
        return 'Checking for AI access…';
      default:
        return state.inDesktop
          ? 'AI is not set up for your teachingtools.dev account. You can enter your own OpenAI key.'
          : 'AI needs a key: sign in at teachingtools.dev, or enter your own OpenAI key.';
    }
  },
};
