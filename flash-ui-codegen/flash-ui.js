#!/usr/bin/env node
const path = require('path');
const os = require('os');
const fs = require('fs');
const readline = require('readline');

// Check dependencies before importing
const SKILL_DIR = __dirname;
const NODE_MODULES = path.join(SKILL_DIR, 'node_modules');

if (!fs.existsSync(NODE_MODULES)) {
  console.error('\n❌ Dependencies not installed!');
  console.error('\nRun these commands:');
  console.error(`  cd ${SKILL_DIR}`);
  console.error('  npm install');
  console.error('  npx playwright install chromium\n');
  process.exit(1);
}

// Check if playwright is installed
try {
  require.resolve('playwright');
} catch (e) {
  console.error('\n❌ Playwright not found!');
  console.error('\nRun these commands:');
  console.error(`  cd ${SKILL_DIR}`);
  console.error('  npm install');
  console.error('  npx playwright install chromium\n');
  process.exit(1);
}

const { chromium } = require('playwright');

// Check if Chromium browser is installed (cross-platform)
function getPlaywrightCacheDir() {
  const platform = process.platform;
  if (platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright');
  } else if (platform === 'win32') {
    return path.join(os.homedir(), 'AppData', 'Local', 'ms-playwright');
  } else {
    return path.join(os.homedir(), '.cache', 'ms-playwright');
  }
}

const playwrightCacheDir = getPlaywrightCacheDir();
const chromiumExists = fs.existsSync(playwrightCacheDir) &&
  fs.readdirSync(playwrightCacheDir).some(f => f.startsWith('chromium'));

if (!chromiumExists) {
  console.error('\n❌ Playwright Chromium browser not installed!');
  console.error('\nRun this command:');
  console.error('  npx playwright install chromium\n');
  process.exit(1);
}

const SESSION_DIR = path.join(os.homedir(), '.claude', 'flash-ui-chrome-profile');

// Remove lock file if it exists (prevents "profile in use" errors)
const lockFile = path.join(SESSION_DIR, 'SingletonLock');
if (fs.existsSync(lockFile)) {
  try {
    fs.unlinkSync(lockFile);
    console.error('Removed stale lock file');
  } catch (e) {
    console.error('Could not remove lock file:', e.message);
  }
}

function askQuestion(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
  return new Promise(resolve => rl.question(query, ans => { rl.close(); resolve(ans); }));
}

async function generateWithFlashUI(prompt) {
  console.error('Launching Chrome...');

  const context = await chromium.launchPersistentContext(SESSION_DIR, {
    headless: false,
    channel: 'chrome',
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-infobars',
      '--disable-extensions'
    ],
    ignoreDefaultArgs: ['--enable-automation']
  });

  const page = await context.newPage();

  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  // Flag to prevent input filling after initial submission
  let inputPhaseComplete = false;

  try {
    console.error('Opening Flash UI...');
    await page.goto('https://aistudio.google.com/apps/bundled/flash_ui');
    await page.waitForLoadState('networkidle');
    console.error('Waiting for page to fully load...');
    await page.waitForTimeout(8000);

    // Check login - wait a bit longer and check multiple times
    let needsLogin = page.url().includes('accounts.google.com');
    if (!needsLogin) {
      // Double check by looking for login button on page
      needsLogin = await page.evaluate(() => {
        return document.body.innerText.includes('Sign in') &&
               !document.body.innerText.includes('Sign out');
      });
    }

    if (needsLogin) {
      console.error('\n>>> LOGIN REQUIRED <<<');
      console.error('Please login in the browser window, then press ENTER here.');
      await askQuestion('Press ENTER after logging in...');
      // Wait longer for session to save
      await page.waitForTimeout(3000);
      // Navigate again to ensure we're on the right page
      await page.goto('https://aistudio.google.com/apps/bundled/flash_ui');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
    }

    // Inject Claude button
    const injectButton = async () => {
      try {
        await page.evaluate(() => {
          const existing = document.getElementById('claude-control');
          if (existing) existing.remove();

          const container = document.createElement('div');
          container.id = 'claude-control';
          container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:2147483647;font-family:system-ui;';

          const style = document.createElement('style');
          style.textContent = '#claude-status{background:#1a1a2e;color:#00d4aa;padding:10px 20px;border-radius:8px 8px 0 0;font-size:13px;text-align:center;border:2px solid #00d4aa;border-bottom:none}#claude-done-btn{width:100%;background:linear-gradient(135deg,#00d4aa,#00a896);color:#000;border:none;padding:16px 32px;border-radius:0 0 12px 12px;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 4px 20px rgba(0,212,170,0.5)}';
          container.appendChild(style);

          const status = document.createElement('div');
          status.id = 'claude-status';
          status.textContent = '🤖 Claude - Click when ready';
          container.appendChild(status);

          const btn = document.createElement('button');
          btn.id = 'claude-done-btn';
          btn.textContent = '✓ SEND TO CLAUDE';
          btn.onclick = () => {
            window.__claudeReady = true;
            status.textContent = '✓ Extracting...';
            status.style.background = '#00d4aa';
            status.style.color = '#000';
            btn.disabled = true;
            btn.style.opacity = '0.5';
          };
          container.appendChild(btn);

          document.body.appendChild(container);
          window.__claudeReady = false;
        });
      } catch (e) {
        console.error('Button error:', e.message);
      }
    };

    await injectButton();

    // DO NOT click Launch button - that's for deploying, not for prompt input
    // The main prompt input is at the bottom of the preview area

    // Step 2: Find and fill the main prompt input
    console.error('Looking for main prompt input...');

    // Debug: Check for iframes and dump structure
    const pageInfo = await page.evaluate(() => {
      const info = {
        iframes: [],
        allInputs: [],
        bottomElements: []
      };

      // Check for iframes
      document.querySelectorAll('iframe').forEach(iframe => {
        info.iframes.push({
          src: iframe.src,
          id: iframe.id,
          className: iframe.className
        });
      });

      // Get ALL inputs on page
      document.querySelectorAll('input, textarea').forEach(el => {
        const rect = el.getBoundingClientRect();
        info.allInputs.push({
          tag: el.tagName,
          type: el.type,
          placeholder: el.placeholder,
          visible: rect.width > 0 && rect.height > 0,
          rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) }
        });
      });

      // Get elements in bottom 200px of screen
      const viewportHeight = window.innerHeight;
      document.querySelectorAll('*').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.y > viewportHeight - 200 && rect.width > 100 && rect.height > 20 && rect.height < 100) {
          info.bottomElements.push({
            tag: el.tagName,
            className: (el.className || '').substring(0, 50),
            text: (el.innerText || '').substring(0, 30),
            rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) }
          });
        }
      });

      return info;
    });
    console.error('Page info:', JSON.stringify(pageInfo, null, 2));

    // Take screenshot
    await page.screenshot({ path: '/tmp/flash-ui-debug.png' });
    console.error('Screenshot saved to /tmp/flash-ui-debug.png');

    // Check if input phase is still active
    if (inputPhaseComplete) {
      console.error('Input phase already complete, skipping fill');
    } else {
      // The prompt input is inside an iframe - we need to access it
      // First, try to find and interact with the iframe content
      let filled = { success: false };

      // Get all frames
      const frames = page.frames();
      console.error(`Found ${frames.length} frames`);

      for (const frame of frames) {
        try {
          const frameUrl = frame.url();
          // Skip about:blank and bscframe
          if (frameUrl.includes('about:') || frameUrl.includes('bscframe')) continue;

          console.error(`Checking frame: ${frameUrl.substring(0, 50)}...`);

          // Look specifically for the floating-input-container input (the main prompt)
          const inputFound = await frame.evaluate((promptText) => {
            // First priority: find input inside floating-input-container
            const floatingInput = document.querySelector('.floating-input-container input[type="text"]');
            if (floatingInput) {
              floatingInput.focus();
              floatingInput.value = promptText;
              floatingInput.dispatchEvent(new Event('input', { bubbles: true }));
              floatingInput.dispatchEvent(new Event('change', { bubbles: true }));
              return { success: true, type: 'floating-input', tag: 'INPUT' };
            }

            // Second priority: find input inside input-wrapper
            const wrapperInput = document.querySelector('.input-wrapper input[type="text"]');
            if (wrapperInput) {
              wrapperInput.focus();
              wrapperInput.value = promptText;
              wrapperInput.dispatchEvent(new Event('input', { bubbles: true }));
              wrapperInput.dispatchEvent(new Event('change', { bubbles: true }));
              return { success: true, type: 'wrapper-input', tag: 'INPUT' };
            }

            // Fallback: any text input not in sidebar
            const inputs = document.querySelectorAll('input[type="text"]');
            for (const input of inputs) {
              const rect = input.getBoundingClientRect();
              const placeholder = input.placeholder || '';
              // Skip sidebar
              if (placeholder.includes('Make changes')) continue;
              if (rect.width > 100) {
                input.focus();
                input.value = promptText;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                return { success: true, type: 'fallback-input', tag: 'INPUT' };
              }
            }

            return { success: false };
          }, prompt);

          if (inputFound.success) {
            console.error(`Found input: ${inputFound.type}`);
            filled = { success: true, type: inputFound.type };
            break;
          }
        } catch (e) {
          // Frame might be cross-origin or inaccessible
          console.error(`Frame error: ${e.message.substring(0, 50)}`);
        }
      }

      // If iframe approach failed, try main page - look for input in the RIGHT panel (x > 500)
      if (!filled.success) {
        const mainInput = await page.evaluate((promptText) => {
          // Look for visible textarea that's NOT the sidebar
          const textareas = document.querySelectorAll('textarea, input:not([type="file"]):not([type="hidden"]):not([type="search"])');
          for (const ta of textareas) {
            const rect = ta.getBoundingClientRect();
            const placeholder = ta.placeholder || '';
            // Skip the sidebar (has "Make changes" placeholder or is on the left side x < 500)
            if (placeholder.includes('Make changes') || placeholder.includes('add new features')) continue;
            if (rect.x < 500) continue;
            if (rect.width > 100 && rect.height > 10) {
              ta.focus();
              if (ta.value !== undefined) {
                ta.value = promptText;
              } else {
                ta.textContent = promptText;
              }
              ta.dispatchEvent(new Event('input', { bubbles: true }));
              return { success: true, type: 'main-input', x: rect.x };
            }
          }
          return { success: false };
        }, prompt);

        if (mainInput.success) {
          console.error(`Found main input at x:${mainInput.x}`);
          filled = mainInput;
        }
      }

      // Last resort: click on the preview area and paste
      if (!filled.success) {
        console.error('Trying click-and-paste fallback...');
        // Click in the center-bottom area of the right panel
        const viewport = page.viewportSize();
        const x = viewport.width * 0.65;
        const y = viewport.height * 0.85;
        await page.mouse.click(x, y);
        await page.waitForTimeout(300);
        await page.evaluate((text) => navigator.clipboard.writeText(text), prompt);
        await page.keyboard.press('Meta+a');
        await page.keyboard.press('Meta+v');
        filled = { success: true, type: 'click-paste-fallback' };
      }

      console.error('Fill result:', JSON.stringify(filled));

      if (filled.success) {
        console.error('Prompt pasted successfully');
        await page.waitForTimeout(500);
        // Submit with Enter
        console.error('Submitting prompt with Enter...');
        await page.keyboard.press('Enter');
      } else {
        console.error('');
        console.error('>>> COULD NOT AUTO-FILL <<<');
        console.error('Please paste the prompt manually and press Enter');
        console.error('Prompt saved to: /tmp/website-redesign-prompt.txt');
        console.error('');
      }
    }

    // Mark input phase as complete now
    inputPhaseComplete = true;

    await page.waitForTimeout(5000);

    // Close any deploy modal that might appear
    await page.evaluate(() => {
      const closeButtons = document.querySelectorAll('[aria-label="Close"], button');
      for (const btn of closeButtons) {
        if (btn.innerText === '×' || btn.getAttribute('aria-label') === 'Close') {
          btn.click();
          break;
        }
      }
    });

    await injectButton();

    console.error('');
    console.error('════════════════════════════════════════════════════════════════');
    console.error('  FLASH UI IS GENERATING');
    console.error('');
    console.error('  → Wait for generation to complete');
    console.error('  → Use chat to iterate/refine');
    console.error('  → Click green "SEND TO CLAUDE" when satisfied');
    console.error('════════════════════════════════════════════════════════════════');
    console.error('');

    // Poll for user click
    let ready = false;
    let pollCount = 0;

    while (!ready && pollCount < 600) {
      await page.waitForTimeout(1000);
      try {
        const exists = await page.evaluate(() => !!document.getElementById('claude-control'));
        if (!exists) await injectButton();
        ready = await page.evaluate(() => window.__claudeReady === true);
      } catch (e) {}
      pollCount++;
      if (pollCount % 60 === 0) console.error(`Waiting... (${pollCount/60} min)`);
    }

    console.error('Extracting code...');

    // Click Code tab
    console.error('Switching to Code tab...');
    await page.evaluate(() => {
      const tabs = document.querySelectorAll('button, [role="tab"]');
      for (const tab of tabs) {
        if (tab.innerText.trim() === 'Code') {
          tab.click();
          break;
        }
      }
    });
    await page.waitForTimeout(3000);

    // Screenshot after clicking Code
    await page.screenshot({ path: '/tmp/flash-ui-code-tab.png' });

    // Get file list
    const fileList = await page.evaluate(() => {
      const files = [];
      const text = document.body.innerText;
      const matches = text.match(/[a-zA-Z][a-zA-Z0-9_-]*\.(tsx?|css|jsx?|html|json)/gi);
      if (matches) {
        matches.forEach(m => {
          if (!files.includes(m)) files.push(m);
        });
      }
      return files;
    });

    console.error(`Found ${fileList.length} files: ${fileList.join(', ')}`);

    // Extract code from each file
    const filesContent = {};

    for (const fileName of fileList) {
      try {
        // Click on file
        await page.evaluate((name) => {
          const elements = document.querySelectorAll('*');
          for (const el of elements) {
            if (el.innerText?.trim() === name) {
              el.click();
              break;
            }
          }
        }, fileName);

        await page.waitForTimeout(1000);

        // Get code content
        const code = await page.evaluate(() => {
          // Look for code editor content
          const editor = document.querySelector('.cm-content, .monaco-editor, pre code, .view-lines');
          if (editor) return editor.innerText;

          // Try getting numbered lines
          const lines = document.querySelectorAll('.cm-line, .view-line');
          if (lines.length > 0) {
            return Array.from(lines).map(l => l.textContent).join('\n');
          }
          return null;
        });

        if (code && code.length > 50) {
          filesContent[fileName] = code;
          console.error(`  ✓ ${fileName} (${code.length} chars)`);
        }
      } catch (e) {
        console.error(`  ✗ ${fileName}: ${e.message}`);
      }
    }

    const result = {
      files: filesContent,
      fileList: fileList,
      fullText: await page.evaluate(() => document.body.innerText)
    };

    await page.screenshot({ path: '/tmp/flash-ui-result.png', fullPage: true });
    console.error('Screenshot: /tmp/flash-ui-result.png');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('ERROR:', error.message);
    await askQuestion('Press ENTER to close...');
  } finally {
    await context.close();
  }
}

const prompt = process.argv[2];
if (!prompt) {
  console.error('Usage: node flash-ui.js "PROMPT"');
  process.exit(1);
}

generateWithFlashUI(prompt);
