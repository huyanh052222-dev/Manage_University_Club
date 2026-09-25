/**
 * Security Guard & Anti-DevTools Protection Module
 * Chống mở F12, vô hiệu hóa Developer Tools, phím tắt kiểm tra mã nguồn,
 * chuột phải và kích hoạt bẫy Debugger Trap khi phát hiện DevTools.
 */

(function initSecurityGuard() {
  if (typeof window === "undefined") return;

  // Cấu hình: cho phép tạm tắt nếu có tham số bảo mật nội bộ trong sessionStorage
  if (window.sessionStorage && window.sessionStorage.getItem("__ALLOW_DEVTOOLS__") === "true") {
    console.info("%c[Security Guard] DevTools bypass mode active via sessionStorage.", "color: orange;");
    return;
  }

  let devToolsDetected = false;
  let noticeTimeout = null;

  // 1. Hiển thị thông báo nhỏ khi người dùng bấm phím bị cấm
  function showBlockedToast(message) {
    let toast = document.getElementById("security-blocked-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "security-blocked-toast";
      toast.setAttribute("role", "alert");
      toast.setAttribute("aria-live", "assertive");
      Object.assign(toast.style, {
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%) translateY(100px)",
        backgroundColor: "#1f1813",
        color: "#f6ede2",
        border: "1px solid #d97706",
        borderRadius: "10px",
        padding: "10px 18px",
        fontSize: "12px",
        fontWeight: "600",
        fontFamily: "system-ui, -apple-system, sans-serif",
        boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
        zIndex: "9999999",
        opacity: "0",
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      });
      document.body ? document.body.appendChild(toast) : document.documentElement.appendChild(toast);
    }

    toast.innerHTML = `<span style="color:#f59e0b">🛡️</span> ${message}`;
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";

    clearTimeout(noticeTimeout);
    noticeTimeout = setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(100px)";
    }, 2400);
  }

  // 2. Chặn các phím tắt mở DevTools, xem mã nguồn, lưu trang
  function handleKeyDown(event) {
    const isMac = navigator.platform ? navigator.platform.toUpperCase().indexOf("MAC") >= 0 : false;
    const ctrlOrMeta = isMac ? event.metaKey : event.ctrlKey;
    const key = event.key ? event.key.toUpperCase() : "";
    const keyCode = event.keyCode || event.which;

    // F12 (123)
    if (key === "F12" || keyCode === 123) {
      event.preventDefault();
      event.stopPropagation();
      showBlockedToast("Phím F12 đã bị vô hiệu hóa vì lý do an toàn.");
      triggerDebuggerTrap();
      return false;
    }

    // Ctrl+Shift+I / Cmd+Opt+I (Inspect)
    if (ctrlOrMeta && event.shiftKey && (key === "I" || keyCode === 73)) {
      event.preventDefault();
      event.stopPropagation();
      showBlockedToast("Tính năng Kiểm tra phần tử (Inspect) đã bị khóa.");
      triggerDebuggerTrap();
      return false;
    }

    // Ctrl+Shift+J / Cmd+Opt+J (Console)
    if (ctrlOrMeta && event.shiftKey && (key === "J" || keyCode === 74)) {
      event.preventDefault();
      event.stopPropagation();
      showBlockedToast("Cửa sổ Console đã bị khóa.");
      triggerDebuggerTrap();
      return false;
    }

    // Ctrl+Shift+C / Cmd+Opt+C (Inspect Element)
    if (ctrlOrMeta && event.shiftKey && (key === "C" || keyCode === 67)) {
      event.preventDefault();
      event.stopPropagation();
      showBlockedToast("Thao tác chọn phần tử kiểm tra đã bị khóa.");
      triggerDebuggerTrap();
      return false;
    }

    // Ctrl+U / Cmd+Opt+U (View Page Source)
    if (ctrlOrMeta && (key === "U" || keyCode === 85)) {
      event.preventDefault();
      event.stopPropagation();
      showBlockedToast("Chức năng Xem mã nguồn trang đã bị khóa.");
      triggerDebuggerTrap();
      return false;
    }

    // Ctrl+S / Cmd+S (Save Page)
    if (ctrlOrMeta && (key === "S" || keyCode === 83)) {
      event.preventDefault();
      event.stopPropagation();
      showBlockedToast("Chức năng Lưu trang đã bị khóa.");
      return false;
    }
  }

  // 3. Vô hiệu hóa chuột phải (Context Menu)
  function handleContextMenu(event) {
    // Không chặn nếu chuột phải vào input hoặc textarea cho người dùng paste text
    const targetTag = event.target ? event.target.tagName : "";
    if (targetTag === "INPUT" || targetTag === "TEXTAREA") {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    showBlockedToast("Menu chuột phải đã bị khóa trên hệ thống.");
    return false;
  }

  // 4. Màn hình cảnh báo an ninh toàn màn hình khi DevTools bị mở
  function showDevToolsWarningModal() {
    if (document.getElementById("security-devtools-modal")) return;

    const modal = document.createElement("div");
    modal.id = "security-devtools-modal";
    Object.assign(modal.style, {
      position: "fixed",
      inset: "0",
      backgroundColor: "rgba(18, 14, 11, 0.97)",
      zIndex: "99999999",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#f6ede2",
      fontFamily: "system-ui, -apple-system, sans-serif",
      textAlign: "center",
      padding: "24px",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
    });

    modal.innerHTML = `
      <div style="max-width: 460px; background: #231b15; border: 1px solid #d97706; border-radius: 16px; padding: 32px 28px; box-shadow: 0 25px 50px rgba(0,0,0,0.5);">
        <div style="font-size: 52px; line-height: 1; margin-bottom: 16px;">🛡️</div>
        <h2 style="margin: 0 0 10px; font-size: 19px; font-weight: 700; color: #f59e0b; letter-spacing: -0.01em;">CẢNH BÁO AN NINH HỆ THỐNG</h2>
        <p style="margin: 0 0 20px; font-size: 13px; color: #cbbeb1; line-height: 1.6;">
          Công cụ phát triển (DevTools / F12) đã bị khóa nhằm bảo vệ tính toàn vẹn dữ liệu của hệ thống sinh viên. Vui lòng đóng cửa sổ kiểm tra mã nguồn để tiếp tục sử dụng.
        </p>
        <div style="display: flex; gap: 10px; justify-content: center;">
          <button id="security-reload-btn" style="background: #f59e0b; color: #1a130e; border: none; padding: 9px 22px; border-radius: 9px; font-weight: 700; font-size: 12px; cursor: pointer; transition: opacity 0.2s;">
            Tải lại trang
          </button>
        </div>
      </div>
    `;

    document.body ? document.body.appendChild(modal) : document.documentElement.appendChild(modal);

    const reloadBtn = document.getElementById("security-reload-btn");
    if (reloadBtn) {
      reloadBtn.addEventListener("click", () => {
        window.location.reload();
      });
    }
  }

  // 5. Bẫy Debugger Trap (vòng lặp debugger làm đứng trình duyệt nếu mở DevTools)
  function triggerDebuggerTrap() {
    try {
      (function recursiveTrap(counter) {
        if (counter > 0) {
          (function () {}.constructor("debugger")());
          recursiveTrap(counter - 1);
        }
      })(5);
    } catch {
      // Ignored
    }
  }

  // 6. Cơ chế phát hiện DevTools mở ngầm qua Timing và Kích thước cửa sổ
  function checkDevToolsStatus() {
    // A. Đo độ trễ thực thi: khi DevTools mở, lệnh debugger làm khựng lại > 100ms
    const start = performance.now();
    try {
      (function () {}.constructor("debugger")());
    } catch {
      // Ignored
    }
    const duration = performance.now() - start;

    // B. Kiểm tra kích thước cửa sổ (khi DevTools mở kiểu dock)
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;

    if (duration > 100 || ((widthThreshold || heightThreshold) && window.outerWidth > 600)) {
      if (!devToolsDetected) {
        devToolsDetected = true;
        showDevToolsWarningModal();
      }
      triggerDebuggerTrap();
    } else {
      if (devToolsDetected && !widthThreshold && !heightThreshold) {
        // DevTools đã đóng lại
        devToolsDetected = false;
        const modal = document.getElementById("security-devtools-modal");
        if (modal) modal.remove();
      }
    }
  }

  // 7. Bảo vệ Console: làm sạch và cảnh báo
  function protectConsole() {
    if (!window.console) return;

    try {
      const banner = () => {
        console.clear();
        console.log(
          "%cSTOP!\n%cTrang web này được bảo vệ bởi cơ chế an ninh thông tin. Mọi hành vi can thiệp hoặc trích xuất dữ liệu đều bị ghi nhận.",
          "color: #ef4444; font-size: 28px; font-weight: 800; font-family: sans-serif;",
          "color: #f59e0b; font-size: 13px; font-weight: 600; line-height: 1.5;",
        );
      };

      // Hiển thị cảnh báo trong console
      banner();

      // Định kỳ kiểm tra và kích hoạt bẫy
      setInterval(checkDevToolsStatus, 1000);
    } catch {
      // Ignored
    }
  }

  // Đăng ký các sự kiện ở Capture Phase để bắt trước mọi script khác
  window.addEventListener("keydown", handleKeyDown, true);
  window.addEventListener("contextmenu", handleContextMenu, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", protectConsole);
  } else {
    protectConsole();
  }

  // Freeze module
  Object.freeze(window.__SECURITY_GUARD__ = {
    version: "1.0.0",
    status: "active",
    bypass: (key) => {
      if (key === "admin-debug-2026") {
        window.sessionStorage.setItem("__ALLOW_DEVTOOLS__", "true");
        window.location.reload();
      }
    },
  });
})();
