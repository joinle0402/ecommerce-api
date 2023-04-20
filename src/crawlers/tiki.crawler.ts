import { connectDatabase } from '@/database';
import { isExistFile, readFileJson, writeFileJson } from '@/helpers/file.helper';
import { randomInt } from '@/helpers/random';
import { Category } from '@/models/category.model';
import { IProduct, Product } from '@/models/product.model';
import { logger } from '@/utilities/logger.utility';
import { faker } from '@faker-js/faker';
import puppeteer, { Page } from 'puppeteer';

const FILE_NAME_CATEGORIES = 'categories.json';
const FILE_NAME_PRODUCT_LINKS = 'product-links.json';
const FILE_NAME_PRODUCTS = 'products.json';

interface CrawlerCategory {
    _id: string;
    name: string;
    link: string;
}

interface CrawlerProductLink {
    categoryId: string;
    link: string;
}

async function crawlerData(url: string, callback, parameters?: Object) {
    let browser;
    try {
        browser = await puppeteer.launch({
            slowMo: 200,
            defaultViewport: null,
            userDataDir: './src/crawlers/cache/resource',
            executablePath: '/usr/bin/chromium-browser',
            args: ['--disable-dev-shm-usage'],
        });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        logger.info('Navigating to %s', url);
        logger.info('Crawling data...');
        const data = await callback(page, parameters);
        logger.info('Crawled data: %o', data);
        await page.close();
        return data;
    } catch (error) {
        throw error;
    } finally {
        await browser.close();
    }
}

async function crawlerCategories(url: string) {
    if (isExistFile('./src/crawlers/json/' + FILE_NAME_CATEGORIES)) {
        const categories = (await readFileJson(FILE_NAME_CATEGORIES)) as CrawlerCategory[];
        logger.info('categories: %o', categories);
        return categories;
    }

    const categories = await crawlerData(url, async (page: Page) => {
        return await page.$$eval(
            '.styles__StyledListItem-sc-w7gnxl-0.cjqkgR:not(.highlight-block) a',
            (aElements: HTMLAnchorElement[]) => {
                return aElements.slice(2, 5).map(aElement => ({
                    name: aElement.textContent,
                    link: aElement.href,
                }));
            }
        );
    });

    const categoryData: CrawlerCategory[] = [];
    for (const category of categories) {
        const createdCategory = await Category.create({ name: category.name });
        categoryData.push({
            _id: createdCategory._id.toString(),
            name: category.name,
            link: category.link,
        });
    }

    writeFileJson(FILE_NAME_CATEGORIES, categoryData);
    return categoryData;
}

async function crawlerProductLinks(categories: CrawlerCategory[]) {
    if (isExistFile('./src/crawlers/json/' + FILE_NAME_PRODUCT_LINKS)) {
        const productLinks = (await readFileJson(FILE_NAME_PRODUCT_LINKS)) as CrawlerProductLink[];
        logger.info('productLinks: %o', productLinks);
        return productLinks;
    }

    let productLinks: CrawlerProductLink[] = [];
    for (const category of categories) {
        const productLinksOfCategory: string[] = await crawlerData(category.link, async (page: Page) => {
            return await page.$$eval(
                '.CategoryViewstyle__Right-sc-bhstkd-1.jxmsjJ a.product-item',
                (aElements: HTMLAnchorElement[]) => {
                    return aElements.slice(0, 5).map(aElement => aElement.href);
                }
            );
        });
        const productLinkItem: CrawlerProductLink[] = productLinksOfCategory.map(productLink => ({
            link: productLink,
            categoryId: category._id,
        }));
        productLinks = [...productLinks, ...productLinkItem];
    }

    writeFileJson(FILE_NAME_PRODUCT_LINKS, productLinks);
    return productLinks;
}

async function crawlerProductDetails(productLinks: CrawlerProductLink[]) {
    const products: IProduct[] = [];
    for (const productLink of productLinks) {
        const product = await crawlerData(productLink.link, async (page: Page) => {
            const name = await page.$eval('h1.title', element => element.textContent);

            let image = faker.image.imageUrl(640, 480);
            const imageSelector = '.ImageLens__Wrapper-sc-10jbnlj-0.bobuMh .webpimg-container source';
            if (await page.$(imageSelector)) {
                image = await page.$eval(imageSelector, element => element.srcset);
            }

            let price;
            if (await page.$('.styles__Price-sc-6hj7z9-1.jgbWJA')) {
                price = await page.$eval('.styles__Price-sc-6hj7z9-1.jgbWJA', element =>
                    Number(element.textContent?.replace(/\./, '').substring(0, element.textContent.length - 3))
                );
            }
            if (await page.$('.product-price__current-price')) {
                price = await page.$eval('.product-price__current-price', element =>
                    Number(element.textContent?.replace(/\./, '').substring(0, element.textContent.length - 3))
                );
            }
            if (await page.$('.flash-sale-price span')) {
                price = await page.$eval('.flash-sale-price span', element =>
                    Number(element.textContent?.replace(/\./, '').substring(0, element.textContent.length - 3))
                );
            }

            const description = await page.$eval(
                '.style__Wrapper-sc-12gwspu-0.cIWQHl .left .ToggleContent__Wrapper-sc-1dbmfaw-1.cqXrJr',
                element => element.innerHTML
            );

            return {
                name,
                image,
                price,
                countInStock: randomInt(1, 9) * 10,
                rating: randomInt(1, 5),
                description,
                createdBy: '643f9a57e915198b9ca80ac1',
            };
        });
        const newProduct = { ...product, category: productLink.categoryId };
        const createdProduct = await Product.create(newProduct);
        products.push(createdProduct);
    }
    writeFileJson(FILE_NAME_PRODUCTS, products);
    return products;
}

export async function crawlerTiki() {
    try {
        await connectDatabase();
        await Category.deleteMany({});
        await Product.deleteMany({});
        const categories = await crawlerCategories('https://tiki.vn/');
        const productLinks = await crawlerProductLinks(categories);
        await crawlerProductDetails(productLinks);
    } catch (error) {
        logger.error('Error: %s', error.message);
        // eslint-disable-next-line no-console
        console.error(error);
    }
}
