import { Telegraf, Context } from 'telegraf';
import {getConfig, getCurrentStock, getStockOfAll} from './stock.service';

const CONFIG_PATH = './config.json';

// Keep a list of all subscribers
const stockUpdateSubscribers: Context[] = [];

export function startBot() {
	const bot_token = '1863496414:AAFAUwjG10YglqUIIETrWyjcGMqOiFdyFlY';
	const bot = new Telegraf(bot_token);

	bot.command('hello', ctx => ctx.reply('Hey friend!'));

	// manually list the stock of each item
	bot.command('list', ctx => list(ctx));

	// Command to list all items that are currently being watched
	bot.command('watched', ctx => listWatchedItems(ctx))

	// Command to subscribe to notifications
	bot.command('subscribe', ctx => subscribeToStockNotifications(ctx));

	// Command to subscribe to notifications
	bot.command('unsubscribe', ctx => unsubscribeFromStockNotifications(ctx));

	bot.launch();

	// Enable graceful stop
	const PROCESS_TERMINATION_MESSAGE = 'The bot process was terminated. If you want to continue to receive updates, please resubscribe as soon as the bot is restarted';
	process.once('SIGINT', () => {
		notifySubscribers(PROCESS_TERMINATION_MESSAGE)
			.then(() => bot.stop('SIGINT'));
	})
	process.once('SIGTERM', () => {
		notifySubscribers(PROCESS_TERMINATION_MESSAGE)
			.then(() => bot.stop('SIGTERM'));
	});
}

/**
 * List all items that are currently listed in the config (including their vSkuCode)
 * @param ctx
 */
function listWatchedItems(ctx: Context) {
	getConfig(CONFIG_PATH)
		.then(config => {
			config.articles.forEach((prod) => {
				ctx.reply(prod.prettyName + ` [${prod.vSkuCode}]`);
			});
		});
}

/**
 * Reply with the current stock for each of the items in the config
 * @param ctx
 */
function list(ctx: Context) {
	getConfig(CONFIG_PATH)
		.then(getStockOfAll)
		.then(products => {
			for (const prod of products) {
				ctx.reply(`There are currently ${prod.stock} of ${prod.prettyName || prod.vSkuCode} in stock.`)
			}
		})
}

function subscribeToStockNotifications(ctx: Context) {
	// Check if the current chat is already registered
	// Im just assuming chat id is unique here
	if (stockUpdateSubscribers.some((context) => context.chat!.id === ctx.chat!.id)) {
		ctx.reply('It seems this chat is already registered for notifications. Use /unsubscribe if you dont want to receive notifications any more.')
		return;
	}
	stockUpdateSubscribers.push(ctx);
	ctx.reply('You are now successfully registered for stock notifications. Use /unsubscribe if you dont want to receive notifications any more.')
}

function unsubscribeFromStockNotifications(ctx: Context) {
	// Find if the cat id is in the subscriber list
	const index = stockUpdateSubscribers.findIndex(context => context.chat!.id === ctx.chat!.id);

	if (index === -1) {
		ctx.reply('It does not seem like you were subscribed :/');
		return;
	}

	// Remove context from subscriber list
	stockUpdateSubscribers.splice(index, 1);
	ctx.reply('You have successfully unsubscribed');
}


/**
 * Send a given message to all subscribers
 * @param message Message to send
 */
async function notifySubscribers(message: string): Promise<void> {
	for (const context of stockUpdateSubscribers) {
		await context.reply(message);
	}
}
