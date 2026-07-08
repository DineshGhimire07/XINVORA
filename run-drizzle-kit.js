// run-drizzle-kit.js — Mocks TTY, answers prompts, and generates keypress events for readline
Object.defineProperty(process.stdin, 'isTTY', { value: true, configurable: true });
Object.defineProperty(process.stdout, 'isTTY', { value: true, configurable: true });
process.stdin.setRawMode = () => {};

// Intercept process.stdout.write to detect prompts and trigger Enter keystrokes
let timer;
const oldWrite = process.stdout.write;
process.stdout.write = function (chunk, encoding, callback) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    // Send Enter keystroke to both standard data listeners and readline/keypress listeners
    try {
      process.stdin.emit("data", Buffer.from("\n"));
    } catch (e) {}
    try {
      process.stdin.emit("keypress", "\r", { name: "return" });
    } catch (e) {}
    try {
      process.stdin.emit("keypress", "\n", { name: "enter" });
    } catch (e) {}
  }, 400); // 400ms delay after stdout becomes silent
  return oldWrite.apply(this, arguments);
};

// Run drizzle-kit CLI
require("./node_modules/drizzle-kit/bin.cjs");
