const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents');
const decode2fa = require('./decode2fa');
const bypass2fa = require('./bypass2fa');
puppeteer.use(StealthPlugin());

function randomDelay(min, max) {
    return new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));
}

const scrap = async (id, password,code_2fa, proxy) => {
    try {
        if(!id || !password) return;

        // Realistic random user agent
        const userAgent = new UserAgent({ deviceCategory: 'desktop' }).toString();

        let browser, page;
        if (proxy) {
            // proxy is in the format: http://username:password@host:port
            // Remove protocol if present
            let proxyString = proxy.trim();
            if (proxyString.startsWith("http://")) {
                proxyString = proxyString.slice(7);
            } else if (proxyString.startsWith("https://")) {
                proxyString = proxyString.slice(8);
            }
            // Split into auth and host:port
            let [auth, hostPort] = proxyString.split("@");
            let [username, proxyPassword] = auth.split(":");
            let [host, port] = hostPort.split(":");
            console.log("Using proxy:", { host, port, username });
            browser = await puppeteer.launch({
                headless: false,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    `--proxy-server=${host}:${port}`
                ]
            });
            page = await browser.newPage();
            page.on('error', err => console.log('Page error:', err));
            page.on('requestfailed', request => console.log('Request failed:', request.url(), request.failure()));
            if (username && proxyPassword) {
                await page.authenticate({ username, password: proxyPassword });
            }
        } else {
            browser = await puppeteer.launch({ headless: false });
            page = await browser.newPage();
        }

        // Set realistic user agent
        await page.setUserAgent(userAgent);

        // Human-like viewport
        await page.setViewport({
            width: Math.floor(Math.random() * 200) + 1200, // 1200-1400px
            height: Math.floor(Math.random() * 200) + 700  // 700-900px
        });

        // Deep fingerprint spoofing (as much as possible)
        await page.evaluateOnNewDocument(() => {
            // Languages, platform, hardware
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
            Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
            Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 4 });
            Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });

            // Webdriver
            Object.defineProperty(navigator, 'webdriver', { get: () => false });

            // Plugins & mimeTypes
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
            Object.defineProperty(navigator, 'mimeTypes', { get: () => [1, 2, 3] });

            // window.chrome spoof
            window.chrome = { runtime: {} };

            // WebGL spoof
            const getParameter = WebGLRenderingContext.prototype.getParameter;
            WebGLRenderingContext.prototype.getParameter = function(parameter) {
                // Spoof vendor and renderer
                if (parameter === 37445) return 'Intel Inc.'; // UNMASKED_VENDOR_WEBGL
                if (parameter === 37446) return 'Intel Iris OpenGL Engine'; // UNMASKED_RENDERER_WEBGL
                return getParameter.call(this, parameter);
            };

            // Canvas spoof (simple noise)
            const toDataURL = HTMLCanvasElement.prototype.toDataURL;
            HTMLCanvasElement.prototype.toDataURL = function() {
                const context = this.getContext('2d');
                context.fillStyle = 'rgba(0,0,0,0.01)';
                context.fillRect(0, 0, 1, 1);
                return toDataURL.apply(this, arguments);
            };

            // Eval & Function.prototype.toString spoof
            window.eval = new Proxy(window.eval, {
                apply(target, ctx, args) {
                    if (args[0] && typeof args[0] === 'string' && args[0].indexOf('webdriver') > -1) {
                        return false;
                    }
                    return Reflect.apply(...arguments);
                }
            });
            const oldToString = Function.prototype.toString;
            Function.prototype.toString = function() {
                if (this === window.eval) return 'function eval() { [native code] }';
                return oldToString.apply(this, arguments);
            };
        });

        // Human-like delay before navigation
        await randomDelay(1000, 3000);

        await page.goto("https://www.facebook.com", { waitUntil: "domcontentloaded" });

        // Human-like scroll
        await page.evaluate(() => window.scrollBy(0, Math.floor(Math.random() * 200)));

        // Mouse movement simulate
        await page.mouse.move(
            Math.floor(Math.random() * 300) + 500,
            Math.floor(Math.random() * 100) + 300,
            { steps: 25 }
        );
        await randomDelay(500, 1500);

        // Wait a bit before typing
        await randomDelay(1000, 2000);

        const emailField = await page.$("#email");
        const passwordField = await page.$("#pass");
        if (!emailField || !passwordField) {
            console.log("Login fields not found. The page may not have loaded correctly.");
            await browser.close();
            return;
        }

        // Focus, type, blur with human-like delays
        await emailField.focus();
        await randomDelay(300, 800);
        await emailField.type(String(id), { delay: Math.floor(Math.random() * 100) + 50 });
        await emailField.evaluate(e => e.blur());
        await randomDelay(500, 1200);

        await passwordField.focus();
        await randomDelay(300, 800);
        await passwordField.type(String(password), { delay: Math.floor(Math.random() * 100) + 50 });
        await passwordField.evaluate(e => e.blur());
        await randomDelay(500, 1200);

        await page.click("button[type='submit']");
        await page.waitForNavigation({ waitUntil: "domcontentloaded" });

        const code = await decode2fa(code_2fa)
        console.log("2fa code",code)

        // Check if the user is logged in another device
        // Try to detect the message by checking both innerText and textContent, and also by querying for the span directly
        const isLoggedInAnotherDevice = await page.evaluate(() => {
            // Check for the span with the exact text
            const span = Array.from(document.querySelectorAll("span")).find(
                el => el.textContent && el.textContent.trim() === "Check your notifications on another device"
            );
            if (span) return true;
            // Fallback: check innerText and textContent of body
            const text = document.body.innerText || document.body.textContent || "";
            return text.includes("Check your notifications on another device");
        });

        console.log("isLoggedInAnotherDevice",isLoggedInAnotherDevice)
        await page.waitForNavigation({ waitUntil: "domcontentloaded" });
        // click try another way
        if(isLoggedInAnotherDevice){
            await bypass2fa(page, code)
        }
        const errorText = await page.evaluate(() => {
            return document.body.innerText.includes("The password that you've entered is incorrect");
        });
        if (errorText) {
            console.log("Error message found: The password that you've entered is incorrect");
        } else {
            console.log("Error message not found");
        }

        // await browser.close();
    } catch (error) {
        console.log(error)
    }    
}

module.exports = scrap;
