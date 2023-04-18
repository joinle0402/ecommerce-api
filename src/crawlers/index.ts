import puppeteer, { Browser } from 'puppeteer';

export class BaseCrawler {
    private static instance: Browser;

    public static async getBrowser() {
        if (!BaseCrawler.instance) {
            BaseCrawler.instance = await BaseCrawler.setupBrowser();
        }

        return BaseCrawler.instance;
    }

    private static async setupBrowser() {
        return await puppeteer.launch({
            headless: false,
            slowMo: 250,
            userDataDir: './src/crawlers/cache/resource',
            executablePath: '/usr/bin/chromium-browser',
            args: ['--start-maximized'],
        });
    }
}
