const isLocalStaticServer = ["localhost", "127.0.0.1"].includes(window.location.hostname);

if (isLocalStaticServer) {
  document.querySelectorAll("[data-cafe-token]").forEach((link) => {
    link.href = `/index.html?visit=${encodeURIComponent(link.dataset.cafeToken)}`;
  });
}
