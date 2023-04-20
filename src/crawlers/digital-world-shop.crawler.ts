import { logger } from '@/utilities/logger.utility';
import slugify from 'slugify';
import { randomInt } from '@/helpers/random';
import { BaseCrawler } from '.';
import { connectDatabase } from '@/database';
import { Category } from '@/models/category.model';
import { Product } from '@/models/product.model';

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
    await page.close();
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
    await page.close();
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
        category: category._id,
        price: Number(productPrice.replace(/[\.\, VND]/g, '').replace(/..$/, '')),
        countInStock: randomInt(10, 99),
        rating: randomInt(1, 5),
        description: productDescription,
        createdBy: '643b50fb2c1d9aefade9fa6a',
    };
    logger.info('Crawled product details: %o', product);
    await page.close();
    return product;
};

(async () => {
    let browser;
    try {
        await connectDatabase();
        await Product.deleteMany({});
        await Category.deleteMany({});
        browser = await BaseCrawler.getBrowser();
        const scrapeCategoriesUrl = 'https://digital-world-2.myshopify.com/';
        const categories = await scrapeCategories(browser, scrapeCategoriesUrl);

        for (const category of categories) {
            const createdCategory = await Category.create({ name: category.name });
            logger.info('createdCategory: %o', createdCategory);
            const productLinks = await scrapeProductLinks(browser, category.link);
            for (const productLink of productLinks) {
                const product = await scrapeProductDetails(browser, createdCategory, productLink);
                const existingProduct = await Product.findOne({ name: product.name }).lean();
                if (!existingProduct) {
                    const createdProduct = await Product.create(product);
                    logger.info('createdProduct: %o', createdProduct);
                }
            }
        }

        await browser.close();
    } catch (error) {
        logger.error('Error: %s', error.message);
    } finally {
        await browser.close();
    }
})();
