import { Config, Product } from "./model/config";
import * as fs from 'fs';
import * as https from "https";
import { startBot } from "./services/telegram.service";



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


startBot();
