// 💻 The students' real screens, for every check and preview script (Roger, 26 Nov 2026: "when testing chromebooks bear in mind that
// students chromebooks are the following", with Chrome's DevTools devices "Chromebook Normal Mode" and "Chromebook Full screen").
//   • CHROMEBOOK      = Chromebook Normal Mode: 1366 × 640, pixel ratio 1 (the browser's tabs and address bar and the shelf take the rest)
//   • CHROMEBOOK_FULL = Chromebook Full screen: 1366 × 768, pixel ratio 1 (🎓 class mode, exams, recall checkpoints, ⛶ full screen)
//   • PHONE           = 390 × 844 (iPhone-like), touch
// Both Chromebooks say they are ChromeOS (Mozilla/5.0 (X11; CrOS x86_64 …), desktop, no touch), so pages that look at the device
// (the 🎤 microphone help, ⚠️ Report a problem, the exam's 💻 Chromebook check) behave as on the students' machines.
// Usage: import { CHROMEBOOK, CHROMEBOOK_FULL, PHONE, contextOptions } from '../devices.mjs';
//        const ctx = await browser.newContext({ ...contextOptions(CHROMEBOOK, browser), locale: 'en-GB' });
// A picture for Roger may be sharper (scale: 2): the page is laid out exactly the same, only drawn with more pixels.
export const CHROMEBOOK = { name: 'chromebook', label: 'Chromebook', width: 1366, height: 640, chromeos: true };
export const CHROMEBOOK_FULL = { name: 'chromebook-full', label: 'Chromebook full screen', width: 1366, height: 768, chromeos: true };
export const PHONE = { name: 'phone', label: 'phone', width: 390, height: 844, phone: true };
export const CHROMEBOOKS = [CHROMEBOOK, CHROMEBOOK_FULL];

// ChromeOS's own user agent, with the Chrome version of the browser that runs the check
export function chromeosUA(version = '130.0.0.0') {
  const v = String(version).match(/\d+(\.\d+)*/)?.[0] || '130.0.0.0';
  return `Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${v} Safari/537.36`;
}

// Playwright's newContext options for a device; browser (optional) gives the real Chrome version; scale only sharpens a picture
export function contextOptions(dev, browser, { scale } = {}) {
  const o = { viewport: { width: dev.width, height: dev.height }, deviceScaleFactor: scale || 1 };
  if (dev.chromeos) Object.assign(o, { userAgent: chromeosUA(browser && browser.version ? browser.version() : undefined), isMobile: false, hasTouch: false });
  if (dev.phone) Object.assign(o, { isMobile: true, hasTouch: true });
  return o;
}
