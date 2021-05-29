import {notifySubscribers, startBot} from "./services/telegram.service";
import {getConfig, getStockOfAll} from "./services/stock.service";

// Launch the telegram bot
startBot();

// Check the stock page on an interval
getConfig('config.json')
    .then(config => {
        // Repeat on an interval
        setInterval(() =>{
            // Get all stocks, check if any are above their set threshold
            getStockOfAll(config)
                .then(products => {
                    for (const product of products) {

                        if (product.stock ?? 0 > (product.threshold ?? 0)) {
                            // Notify all subscribers that the given item is back in stock
                            const productPageLink = config.productPageUrl + product.vSkuCode;
                            notifySubscribers(`Hey, one of your items seems to be back in stock:\n${
                                product.prettyName}\nThere are currently ${product.stock} items in stock. Check out the product page here: ${
                                productPageLink
                            }`)
                        }
                    }
                });
        }, config.pollingInterval)
    })
