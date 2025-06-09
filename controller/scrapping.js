const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents');
puppeteer.use(StealthPlugin());

function randomDelay(min, max) {
    return new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));
}

const scrap = async (id, password, proxy) => {
    try {
        if(!id || !password) return;

        // Realistic random user agent
        const userAgent = new UserAgent({ deviceCategory: 'desktop' }).toString();

        let browser, page;
        if (proxy) {
            const [host, port, username, proxyPassword] = proxy.trim().split(":").map(s => s.trim());
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

        // Override navigator properties for more human-like fingerprint
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
            Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
            Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 4 });
            Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
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
