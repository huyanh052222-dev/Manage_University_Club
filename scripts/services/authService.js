import { supabase } from "../supabase/supabase.js";

const ADMIN_SESSION_KEY = "cafe-horizon-admin-session";

export const loginAdmin = async ({ username, password }) => {
    const normalizedUsername = String(username ?? "")
        .trim()
        .toLowerCase();

    if (!normalizedUsername || !password) {
        return { ok: false, message: "Vui lòng nhập email và mật khẩu." };
    }

    let signInError;
    try {
        ({ error: signInError } = await supabase.auth.signInWithPassword({
            email: normalizedUsername,
            password,
        }));
    } catch {
        return { ok: false, message: "Không thể kết nối Supabase. Vui lòng thử lại." };
    }

    if (signInError) {
        return { ok: false, message: "Email hoặc mật khẩu chưa đúng." };
    }

    let isAdmin;
    let adminError;
    try {
        ({ data: isAdmin, error: adminError } = await supabase.rpc("is_admin"));
    } catch {
        await supabase.auth.signOut();
        return { ok: false, message: "Không thể kiểm tra quyền tài khoản." };
    }
    if (adminError || !isAdmin) {
        await supabase.auth.signOut();
        return { ok: false, message: "Tài khoản không có quyền quản trị." };
    }

    window.sessionStorage.setItem(
        ADMIN_SESSION_KEY,
        JSON.stringify({
            username: normalizedUsername,
            signedInAt: new Date().toISOString(),
        }),
    );

    return { ok: true };
};

export const isAdminAuthenticated = () => {
    try {
        const session = JSON.parse(window.sessionStorage.getItem(ADMIN_SESSION_KEY));
        return Boolean(session?.username);
    } catch {
        return false;
    }
};

export const logoutAdmin = async () => {
    window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
    await supabase.auth.signOut();
};
