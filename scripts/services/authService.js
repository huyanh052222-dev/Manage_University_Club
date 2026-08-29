import { supabase } from "../supabase/supabase.js";

export const loginAdmin = async ({ username, password }) => {
    const normalizedUsername = String(username ?? "")
        .trim()
        .toLowerCase();

    if (!normalizedUsername || !password) {
        return {
            ok: false,
            message: "Vui lòng nhập email và mật khẩu.",
        };
    }

    const { error: signInError } =
        await supabase.auth.signInWithPassword({
            email: normalizedUsername,
            password,
        });

    if (signInError) {
        return {
            ok: false,
            message: "Email hoặc mật khẩu chưa đúng.",
        };
    }

    const { data: isAdmin, error: adminError } =
        await supabase.rpc("is_admin");

    if (adminError || !isAdmin) {
        await supabase.auth.signOut();

        return {
            ok: false,
            message: "Tài khoản không có quyền quản trị.",
        };
    }

    return { ok: true };
};

export const isAdminAuthenticated = async () => {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return false;
    }

    const { data: isAdmin, error } =
        await supabase.rpc("is_admin");

    if (error || !isAdmin) {
        return false;
    }

    return true;
};

export const logoutAdmin = async () => {
    await supabase.auth.signOut();
};