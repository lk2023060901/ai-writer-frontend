interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

interface LoginPayload {
  account: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface Tokens {
  access_token: string;
  refresh_token: string;
}

const users: MockUser[] = [
  {
    id: 'demo-user',
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'demo123',
  },
];

const tokenStore = new Map<string, string>();

const createToken = () =>
  (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2));

const createTokens = (userId: string): Tokens => {
  const access = `mock-access-${createToken()}`;
  const refresh = `mock-refresh-${createToken()}`;
  tokenStore.set(access, userId);
  tokenStore.set(refresh, userId);
  return {
    access_token: access,
    refresh_token: refresh,
  };
};

const findUserByAccount = (account: string): MockUser | undefined => {
  const normalized = account.trim().toLowerCase();
  return users.find(
    (user) =>
      user.email.toLowerCase() === normalized ||
      user.name.toLowerCase() === normalized
  );
};

export const mockAuthStore = {
  login({ account, password }: LoginPayload) {
    const user = findUserByAccount(account);
    if (!user || user.password !== password) {
      return null;
    }
    return {
      user,
      tokens: createTokens(user.id),
    };
  },

  register(payload: RegisterPayload) {
    const existing = users.find((user) => user.email.toLowerCase() === payload.email.toLowerCase());
    if (existing) {
      return { error: 'EMAIL_EXISTS' } as const;
    }

    const id = `mock-user-${createToken()}`;
    const newUser: MockUser = {
      id,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    };
    users.push(newUser);
    return { user: newUser } as const;
  },

  getUserByToken(token: string | null | undefined) {
    if (!token) return null;
    const userId = tokenStore.get(token);
    if (!userId) return null;
    return users.find((user) => user.id === userId) ?? null;
  },

  listUsers() {
    return users.map(({ password: _password, ...rest }) => rest);
  },

  createTokens,
};
