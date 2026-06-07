const STANDALONE_SUPABASE_URL = 'https://qfitpwdrswvnbmzvkoyd.supabase.co';
const STANDALONE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaXRwd2Ryc3d2bmJtenZrb3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTc4NTIsImV4cCI6MjA3NjkzMzg1Mn0.owLaj3VrcyR7_LW9xMwOTTFQupbDKlvAlVwYtbidiNE';

function isTrustedOrigin(origin: string): boolean {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    return (
      url.hostname === 'teachingtools.dev' ||
      url.hostname.endsWith('.teachingtools.dev') ||
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1'
    );
  } catch {
    return false;
  }
}

export interface AuthUser {
  username: string;
  isAdmin: boolean;
  openaiApiKey: string;
}

export interface IframeAuthData {
  username: string;
  isAdmin: boolean;
  authToken: string;
  OPENAI_API_KEY: string;
  CLAUDE_API_KEY?: string;
  GEMINI_API_KEY?: string;
  REPLICATE_API_KEY?: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

export function isInIframe(): boolean {
  return window.parent !== window;
}

export async function validateAuthToken(
  token: string,
  supabaseUrl: string,
  supabaseAnonKey: string
): Promise<{ username: string; isAdmin: boolean } | null> {
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/auth_tokens?token=eq.${token}&expires_at=gt.${new Date().toISOString()}&select=username,is_admin,expires_at`,
      {
        headers: {
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json',
        }
      }
    );

    const tokens = await response.json();

    if (tokens && tokens.length > 0) {
      return {
        username: tokens[0].username,
        isAdmin: tokens[0].is_admin,
      };
    }

    return null;
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}

export async function attemptAutoLogin(): Promise<AuthUser | null> {
  if (!isInIframe()) {
    return null;
  }

  return new Promise((resolve) => {
    window.parent.postMessage({ type: 'REQUEST_API_VALUES' }, '*');

    const handleMessage = async (event: MessageEvent) => {
      if (!isTrustedOrigin(event.origin)) return;
      if (event.data.type === 'API_VALUES_RESPONSE') {
        window.removeEventListener('message', handleMessage);

        const data: IframeAuthData = event.data.data;
        const { authToken, SUPABASE_URL, SUPABASE_ANON_KEY, username, isAdmin, OPENAI_API_KEY } = data;

        if (authToken && SUPABASE_URL && SUPABASE_ANON_KEY) {
          const validatedUser = await validateAuthToken(authToken, SUPABASE_URL, SUPABASE_ANON_KEY);

          if (validatedUser) {
            const authUser: AuthUser = {
              username: validatedUser.username,
              isAdmin: validatedUser.isAdmin,
              openaiApiKey: OPENAI_API_KEY || '',
            };

            // Store in session storage (cleared when tab closes)
            sessionStorage.setItem('auth_user', JSON.stringify(authUser));

            resolve(authUser);
            return;
          }
        }

        resolve(null);
      }
    };

    window.addEventListener('message', handleMessage);

    // Timeout after 2 seconds
    setTimeout(() => {
      window.removeEventListener('message', handleMessage);
      resolve(null);
    }, 2000);
  });
}

export async function loginWithCredentials(
  username: string,
  password: string
): Promise<AuthUser | null> {
  try {
    // Authenticate against users_login table
    const loginResponse = await fetch(
      `${STANDALONE_SUPABASE_URL}/rest/v1/users_login?username=eq.${encodeURIComponent(username)}&password=eq.${encodeURIComponent(password)}&select=username,is_admin`,
      {
        headers: {
          'apikey': STANDALONE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        }
      }
    );

    const users = await loginResponse.json();

    if (!users || users.length === 0) {
      return null;
    }

    const user = users[0];

    // Fetch OpenAI API key from secrets table
    const secretsResponse = await fetch(
      `${STANDALONE_SUPABASE_URL}/rest/v1/secrets?key_name=eq.OPENAI_API_KEY&select=key_value`,
      {
        headers: {
          'apikey': STANDALONE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        }
      }
    );

    const secrets = await secretsResponse.json();
    const openaiApiKey = secrets && secrets.length > 0 ? secrets[0].key_value : '';

    const authUser: AuthUser = {
      username: user.username,
      isAdmin: user.is_admin || false,
      openaiApiKey,
    };

    // Store in session storage (cleared when tab closes)
    sessionStorage.setItem('auth_user', JSON.stringify(authUser));

    return authUser;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

export function getStoredUser(): AuthUser | null {
  try {
    const stored = sessionStorage.getItem('auth_user');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading stored user:', error);
  }
  return null;
}

export function logout(): void {
  sessionStorage.removeItem('auth_user');
  localStorage.clear();
}
