import { Telegraf, Context } from 'telegraf';
import {getConfig, getCurrentStock, getStockOfAll} from './stock.service';
import {StorageService} from "./storage.service";

const CONFIG_PATH = './config.json';

// Keep a list of all subscribers
let stockUpdateSubscribers: number[] = [];

// Keep the current bot instance
let bot: Telegraf;

// Storage service
const storageService = new StorageService();

export function startBot() {
	const bot_token = '1863496414:AAFAUwjG10YglqUIIETrWyjcGMqOiFdyFlY';
	bot = new Telegraf(bot_token);

	// Initialize the storage service and restore the subscriber list from there
	storageService.init()
		.then(() =>
			restoreSubscriberList()
				.then(() =>
					notifySubscribers('The bot has been restarted, and your subscription will continue')
				)
		);

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
	process.once('SIGINT', () => stopBot('SIGINT'));
	process.once('SIGTERM', () => stopBot('SIGTERM'));
}

/**
 * Save the subscriber list before exiting the bot
 * @param reason
 */
function stopBot(reason: string) {
	const PROCESS_TERMINATION_MESSAGE = 'The bot process was terminated. Go write an angry message to Nico :D';
	saveSubscribersToStorage()
		.then(() =>
			notifySubscribers(PROCESS_TERMINATION_MESSAGE)
				.then(() => {
					bot.stop(reason);
					process.exit(0);
				})
		)
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

/**
 * Add a given chat to the subscriber list, if not on it already
 * @param ctx
 */
function subscribeToStockNotifications(ctx: Context) {
	// Check if the current chat is already registered
	// Im just assuming chat id is unique here
	if (stockUpdateSubscribers.includes(ctx.chat!.id)) {
		ctx.reply('It seems this chat is already registered for notifications. Use /unsubscribe if you dont want to receive notifications any more.')
		return;
	}
	stockUpdateSubscribers.push(ctx.chat!.id);
	ctx.reply('You are now successfully registered for stock notifications. Use /unsubscribe if you dont want to receive notifications any more.')
}

/**
 * Remove a given chat from the subscriber list if it was present
 * @param ctx
 */
function unsubscribeFromStockNotifications(ctx: Context) {
	// Find if the cat id is in the subscriber list
	const index = stockUpdateSubscribers.findIndex((chatId) => ctx.chat!.id === chatId);

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
export async function notifySubscribers(message: string): Promise<void> {
	for (const chat of stockUpdateSubscribers) {
		await bot.telegram.sendMessage(chat, message);
	}
}


async function restoreSubscriberList() {
	stockUpdateSubscribers = await storageService.getValue('stock_service_subscribers') ?? [];
}

async function saveSubscribersToStorage() {
	await storageService.setValue('stock_service_subscribers', stockUpdateSubscribers);
}
