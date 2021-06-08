# CNHL Stock Bot
Checks the stock on the CNHL page regularly and sends a telegram notification if an item is in stock

# Setup
You can run with `npx ts-node main.ts` or transpile to JS and run directly with NodeJS.

- [Create a Telegram bot](https://telegram.me/botfather) and add a token to the config file
- Add products and warehouses you want to check to the articles.json file.
  
  The product id is the last part of the product page URL `chinahobbyline.com/shop/detail/181`
- Schedule a cron job
- Send a `/subscribe` message to the bot in order to register for updates
- _Profit?_
