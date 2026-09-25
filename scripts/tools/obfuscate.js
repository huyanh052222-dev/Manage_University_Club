/**
 * Obfuscate & Encrypt Build Tool
 * Công cụ tự động quét, mã hóa và làm rối mã nguồn JavaScript của dự án
 * sử dụng javascript-obfuscator với thuật toán RC4 & Base64, Control Flow Flattening,
 * Dead Code Injection và Debug Protection.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import JavaScriptObfuscator from "javascript-obfuscator";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../../");

// Cấu hình mã hóa làm rối cao cấp (High Security Obfuscation)
const OBFUSCATION_CONFIG = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.3,
  debugProtection: true,
  debugProtectionInterval: 2500,
  disableConsoleOutput: true,
  identifierNamesGenerator: "hexadecimal",
  log: false,
  numbersToExpressions: true,
  renameGlobals: false,
  selfDefending: true,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 5,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayEncoding: ["rc4", "base64"],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayThreshold: 0.8,
  target: "browser",
  transformObjectKeys: true,
  unicodeEscapeSequence: false,
};

// Cấu hình riêng cho securityGuard để tránh xung đột với cơ chế detection
const SECURITY_GUARD_CONFIG = {
  ...OBFUSCATION_CONFIG,
  debugProtection: false, // securityGuard đã có debugger trap riêng
  disableConsoleOutput: false, // Để securityGuard tự quản lý console
};

/**
 * Đọc toàn bộ file trong thư mục đệ quy
 */
function getAllJsFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;

  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!["node_modules", ".git", "dist", "build"].includes(file)) {
        getAllJsFiles(fullPath, arrayOfFiles);
      }
    } else if (file.endsWith(".js") && !file.endsWith(".min.js")) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

/**
 * Mã hóa 1 file cụ thể
 */
function obfuscateFile(sourcePath, targetPath, options = OBFUSCATION_CONFIG) {
  try {
    const rawCode = fs.readFileSync(sourcePath, "utf8");
    const isSecurityGuard = sourcePath.includes("securityGuard.js");
    const chosenOptions = isSecurityGuard ? SECURITY_GUARD_CONFIG : options;

    const obfuscationResult = JavaScriptObfuscator.obfuscate(rawCode, chosenOptions);
    const obfuscatedCode = obfuscationResult.getObfuscatedCode();

    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(targetPath, obfuscatedCode, "utf8");
    const relSource = path.relative(PROJECT_ROOT, sourcePath);
    const relTarget = path.relative(PROJECT_ROOT, targetPath);
    console.log(`  [OK] ${relSource} -> ${relTarget} (${(rawCode.length / 1024).toFixed(1)}KB -> ${(obfuscatedCode.length / 1024).toFixed(1)}KB)`);
  } catch (error) {
    console.error(`  [LỖI] Không thể mã hóa file ${sourcePath}:`, error.message);
  }
}

/**
 * Chạy toàn bộ tiến trình mã hóa
 */
function runObfuscation() {
  console.log("=========================================================");
  console.log(" Khởi động tiến trình Obfuscate & Encrypt JavaScript...");
  console.log(" Thuật toán: Hex mangling + RC4/Base64 String Encryption");
  console.log("=========================================================");

  // 1. Mã hóa riêng file securityGuard.js thành securityGuard.min.js
  const securityGuardSource = path.join(PROJECT_ROOT, "scripts/security/securityGuard.js");
  const securityGuardTarget = path.join(PROJECT_ROOT, "scripts/security/securityGuard.min.js");
  if (fs.existsSync(securityGuardSource)) {
    console.log("\n1. Mã hóa mô-đun an ninh securityGuard.js:");
    obfuscateFile(securityGuardSource, securityGuardTarget);
  }

  // 2. Mã hóa toàn bộ mã nguồn sang thư mục build/obfuscated
  const outputDir = path.join(PROJECT_ROOT, "dist/scripts");
  console.log(`\n2. Mã hóa toàn bộ scripts dự án sang: dist/scripts:`);

  const scriptsDir = path.join(PROJECT_ROOT, "scripts");
  const jsFiles = getAllJsFiles(scriptsDir).filter(
    (file) => !file.includes("/tools/") && !file.endsWith(".min.js"),
  );

  jsFiles.forEach((file) => {
    const relPath = path.relative(scriptsDir, file);
    const targetPath = path.join(outputDir, relPath);
    obfuscateFile(file, targetPath);
  });

  // 3. Mã hóa scripts trong pages/
  const pagesDir = path.join(PROJECT_ROOT, "pages");
  const pageJsFiles = getAllJsFiles(pagesDir);
  console.log(`\n3. Mã hóa scripts các trang con (pages/):`);
  pageJsFiles.forEach((file) => {
    const relPath = path.relative(pagesDir, file);
    const targetPath = path.join(PROJECT_ROOT, "dist/pages", relPath);
    obfuscateFile(file, targetPath);
  });

  console.log("\n=========================================================");
  console.log(" [HOÀN TẤT] Toàn bộ mã nguồn đã được mã hóa làm rối!");
  console.log(" Bản mã hóa độc lập: scripts/security/securityGuard.min.js");
  console.log(" Toàn bộ bản phân phối: dist/");
  console.log("=========================================================");
}

runObfuscation();
