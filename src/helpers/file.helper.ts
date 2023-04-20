import fs from 'fs';
import path from 'path';

export function writeFileJson(filename: string, data) {
    const jsonFolder = './src/crawlers/json';
    const filePath = path.join(jsonFolder, filename);
    fs.writeFile(filePath, JSON.stringify(data), function (error) {
        if (error) {
            // eslint-disable-next-line no-console
            console.log(error);
            throw error;
        }
    });
}

export async function readFileJson(filename: string) {
    return new Promise((resolve, reject) => {
        const jsonFolder = './src/crawlers/json';
        const filePath = path.join(jsonFolder, filename);
        fs.readFile(filePath, 'utf8', (error, data) => {
            if (error) {
                reject(error);
            }
            resolve(JSON.parse(data));
        });
    });
}

export function isExistFile(filePath: string) {
    return fs.existsSync(filePath);
}
