# Facebook Auto Login & Scraping Tool

A Node.js-based tool for automated Facebook login and scraping, designed to mimic real user behavior as much as possible. This project uses Puppeteer, puppeteer-extra, and stealth plugins to reduce bot detection, and supports proxy rotation for each login attempt.

---

## Features
- Automated Facebook login with human-like behavior
- Proxy rotation: each login uses a different proxy
- Stealth plugin to avoid bot detection
- Random user agent, viewport, mouse movement, scroll, and typing delays
- Manual Chrome/Chromium path configuration for maximum compatibility

---

## Installation

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd facebook-auto-login
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Install Chrome/Chromium (if not already installed):**
   - Download and install [Google Chrome](https://www.google.com/chrome/) or [Chromium](https://www.chromium.org/getting-involved/download-chromium/).
   - Note the installation path. Example (Windows):
     - `C:\Program Files\Google\Chrome\Application\chrome.exe`
     - Or for Chromium: `C:\Program Files (x86)\Chromium\Application\chrome.exe`

---

## Manual Chrome/Chromium Path Setup

By default, Puppeteer may not find your Chrome/Chromium. You **must manually set the path** in the code:

Open `controller/scrapping.js` and update the browser launch section:

```js
browser = await puppeteer.launch({
  headless: false,
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', // <-- Set your path here
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    `--proxy-server=${host}:${port}`
  ]
});
```
- Use forward slashes `/` or double backslashes `\\` in the path.
- For Mac: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- For Linux: `/usr/bin/google-chrome` or `/usr/bin/chromium-browser`

---

## Proxy Setup
- Place your proxies in `proxy.txt`, one per line, in the following format:
  ```
  host:port:username:password
  ```
  Example:
  ```
  b2b-s11.liveproxies.io:7383:LV20112455-lv_us-210973:Ft8LqByJZ3B7OuDUihfk
  ```
- Each login will use a different proxy and remove it from the file after use.

---

## Usage

1. **Prepare your credentials Excel file** (see code for expected format).
2. **Start the server:**
   ```sh
   npm start
   # or
   npm run dev
   ```
3. **Open your browser and go to:**
   [http://localhost:3000](http://localhost:3000)
4. **Upload your credentials file and start the process.**

---

## Troubleshooting

- **Error: Could not find Chrome**
  - Make sure you have installed Chrome/Chromium and set the correct `executablePath` in `scrapping.js`.
- **Proxy not working or HTTP 407**
  - Double-check your proxy format and credentials.
  - Test your proxy with `curl`:
    ```sh
    curl -x http://username:password@host:port https://www.facebook.com
    ```
- **CAPTCHA or human verification**
  - Facebook may still show CAPTCHA if your proxy is low quality or reused too often.
  - Use residential/mobile proxies for best results.
- **Login fields not found**
  - Facebook may have changed their login page structure. Update selectors if needed.

---

## Advanced Tips
- You can further customize human-like behavior in `controller/scrapping.js` (mouse movement, delays, etc.).
- For large-scale use, consider using better proxies and slower batch sizes.

---

## License
This project is for educational and research purposes only. Use responsibly and at your own risk. 