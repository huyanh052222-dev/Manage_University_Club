const ADMIN_SESSION_KEY = "cafe-horizon-admin-session";

export const ADMIN_DEMO_ACCOUNT = Object.freeze({
  username: "admin",
  password: "123456",
  displayName: "Quản trị viên",
});

export const loginAdmin = ({ username, password }) => {
  const normalizedUsername = String(username ?? "").trim().toLowerCase();

  if (normalizedUsername !== ADMIN_DEMO_ACCOUNT.username || password !== ADMIN_DEMO_ACCOUNT.password) {
    return { ok: false, message: "Tài khoản hoặc mật khẩu chưa đúng." };
  }

  window.sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
    username: ADMIN_DEMO_ACCOUNT.username,
    signedInAt: new Date().toISOString(),
  }));

  return { ok: true };
};

export const isAdminAuthenticated = () => {
  try {
    const session = JSON.parse(window.sessionStorage.getItem(ADMIN_SESSION_KEY));
    return session?.username === ADMIN_DEMO_ACCOUNT.username;
  } catch {
    return false;
  }
};

export const logoutAdmin = () => {
  window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
};
