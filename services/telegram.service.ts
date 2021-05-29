import { Telegraf } from 'telegraf';
import { getConfig, getCurrentStock } from '../main';

export function startBot() {
	const bot_token = '1863496414:AAFAUwjG10YglqUIIETrWyjcGMqOiFdyFlY';
	const bot = new Telegraf(bot_token);
	// bot.start((ctx) => ctx.reply('Welcome'));
	// bot.help((ctx) => ctx.reply('Help'));
	bot.command('request', (ctx) => ctx.reply('request'));
	bot.command('list', (ctx) => list(ctx));
	bot.command('add', (ctx) => ctx.reply('add'));
	bot.command('remove', (ctx) => ctx.reply('remove'));
	bot.launch();

	// Enable graceful stop
	process.once('SIGINT', () => bot.stop('SIGINT'));
	process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

function list(ctx: any) {
	getConfig('./config.json')
		.then((config) => {
			let loop = new Promise((res) => {
				config.articles.forEach(async (product, i, arr) => {
					await getCurrentStock(config.apiHostname, config.apiPath, product)
						.then(stock => {
							product.threshold = stock;

						});
					if (i === arr.length - 1) res(0);
				});

			});
			loop.then(() => {
				let reply = "";
				config.articles.forEach((el) => {
					reply += el.prettyName + "\n" + "Stock: " + el.threshold + "\n\n";
				});
				ctx.reply(reply);
			});
		});


}