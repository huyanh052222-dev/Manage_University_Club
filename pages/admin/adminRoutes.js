const isLocalStaticServer = ["localhost", "127.0.0.1"].includes(window.location.hostname);

export const adminLoginUrl = isLocalStaticServer ? "./login.html" : "/admin";
export const adminDashboardUrl = isLocalStaticServer ? "./admin.html" : "/admin/dashboard";
