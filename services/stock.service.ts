import { Config, Product } from "../model/config";
import * as fs from 'fs';
import * as https from "https";


/**
 * Get the config file from disk
 * @param configPath
 */
export async function getConfig(configPath: string): Promise<Config> {
    return new Promise((resolve, reject) => {
        fs.readFile(configPath, 'utf-8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });

    });
}

/**
 * Get the stock of one item
 * @param host Hostname of the website
 * @param path Path of the endpoint
 * @param product The product to check
 */
export async function getCurrentStock(host: string, path: string, product: Product): Promise<number> {
    return new Promise((resolve, reject) => {
        const option = {
            hostname: host,
            port: 443,
            path: path + `?vSkuCode=${product.vSkuCode}&vHourseCode=${product.vHourseCode}`,
            method: 'GET',
            encoding: 'utf-8'
        };
        https.get(option, (res) => {
            let data = "";
            if (res.statusCode !== 200) {
                reject('Response returned non 200 status code: ' + res.statusCode);
                return;
            }

            res.on('error', err => {
                reject(err);
            });
            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', () => {
                // This is so stupid: They just return 0, even if an invalid product id is given..
                // Well, makes my life easier I guess
                resolve(parseInt(data));
            });
        });
    });
}


/**
 * Get the current stock for all items in the config.
 * Alters the state of the config object by overwriting the stock property on the articles array
 * @param config The configuration
 * @return Product[] An array of Products with the stock property populated
 */
export async function getStockOfAll(config: Config): Promise<Product[]> {

        for (const product of config.articles) {
            product.stock = await getCurrentStock(config.apiHostname, config.apiPath, product);
        }

        return config.articles;
}
