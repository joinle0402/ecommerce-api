import { logger } from '@/utilities/logger.utility';
import slugify from 'slugify';
import { randomInt } from '@/helpers/random';
import { BaseCrawler } from '.';

const scrapeCategories = async (browser, url: string) => {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    logger.info('Navigating to %s', url);
    logger.info('Crawling category list...');
    const categories = await page.$$eval('.allcol-element', liElements =>
        liElements.map(liElement => {
            const categoryName = liElement.querySelector('.collection-name')?.textContent?.trim() || '';
            const categoryLink = liElement.querySelector('a')?.href || '';
            return {
                name: categoryName.replace(/ \([0-9]+\)/gi, ''),
                link: categoryLink,
            };
        })
    );
    logger.info('Crawled category list: %o', categories);
    return categories;
};

const scrapeProductLinks = async (browser, url: string) => {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    logger.info('Navigating to %s', url);
    logger.info('Crawling product links...');
    const productLinks = await page.$$eval('#collection-product-grid > div', (productElements: HTMLElement[]) => {
        return productElements.map(productElement => productElement.querySelector('a')?.href);
    });
    logger.info('Crawled product links: %o', productLinks);
    return productLinks;
};

const scrapeProductDetails = async (browser, category, url: string) => {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    logger.info('Navigating to %s', url);
    logger.info('Crawling product details...');
    const productName = await page.$eval('.wrapper-breadcrumb h3', element => element.textContent);
    const productPrice = await page.$eval('.product-single__price .money', element => element.textContent);
    const productDescription = await page.$eval('#tabs-information .tab-panel.active', element => element.innerText);
    const productImage = await page.$eval('#ProductPhotoImg', element => element.src);
    const product = {
        name: productName,
        slug: slugify(productName, { lower: true, trim: true }),
        image: productImage,
        category: category.name,
        price: productPrice,
        countInStock: randomInt(10, 99),
        rating: randomInt(1, 5),
        description: productDescription,
        createdBy: '643b50fb2c1d9aefade9fa6a',
    };
    logger.info('Crawled product details: %o', product);
    return product;
};

(async () => {
    const browser = await BaseCrawler.getBrowser();
    const scrapeCategoriesUrl = 'https://digital-world-2.myshopify.com/';
    const categories = await scrapeCategories(browser, scrapeCategoriesUrl);

    for (const category of categories) {
        const productLinks = await scrapeProductLinks(browser, category.link);
        for (const productLink of productLinks) {
            await scrapeProductDetails(browser, category, productLink);
        }
    }

    await browser.close();
})();
