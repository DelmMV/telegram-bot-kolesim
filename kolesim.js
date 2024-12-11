const { Telegraf } = require("telegraf");
require("dotenv").config();
//
// //Тестовая -1001959551535  message_thread_id: 2
// //id чата админов -1001295808191 message_thread_id: 17137
// //id chat admin kolesim
// // id chat kolesim -1002206861583
// // id chat admin kolesim -1002186118563 thread_id: 16478047
// //id chat монопитер -1001405911884

// Constants
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const ADMIN_CHAT_ID = parseInt(process.env.ADMIN_CHAT);
const ADMIN_THREAD_ID = parseInt(process.env.ADMIN_THREAD_ID);

const KOLESIM_CHAT_ID = parseInt(process.env.KOLESIM_CHAT_ID);

// Initialize bot and database connection
const bot = new Telegraf(BOT_TOKEN);

const sendTelegramMessage = async (chatId, message, options = {}) => {
	try {
		return await bot.telegram.sendMessage(chatId, message, options);
	} catch (error) {
		console.error('Error sending message:', error);
	}
};

// Event Handlers
bot.on('new_chat_members', async (ctx) => {
	const { from, new_chat_member } = ctx.message;
	const isInvited = from.id !== new_chat_member.id;
	
	const message = isInvited
			? `<a href="tg://user?id=${from.id}">${from.first_name} ${from.last_name || ""}</a> принял в группу <a href="tg://user?id=${new_chat_member.id}">${new_chat_member.first_name} ${new_chat_member.last_name || ""}</a>`
			: `<a href="tg://user?id=${from.id}">${from.first_name} ${from.last_name || ""}</a> принят(а) в группу`;
	
	if (ctx.message.chat.id === KOLESIM_CHAT_ID) {
		console.log(`add new user  ${new_chat_member.first_name}`)
		await sendTelegramMessage(ADMIN_CHAT_ID, message, { message_thread_id: ADMIN_THREAD_ID, parse_mode: 'HTML' });
		await sendTelegramMessage(from.id, `${new_chat_member.first_name}${new_chat_member.last_name || ""}, добро пожаловать в наш чат!`);
	}
});

bot.on('chat_join_request', async (ctx) => {
	const { from } = ctx.chatJoinRequest;
	if (ctx.chatJoinRequest.chat.id !== KOLESIM_CHAT_ID) return;
	
	const adminMessage = `
    ${from.first_name} подал(а) заявку на вступление
    ID: <a href="tg://user?id=${from.id}">${from.id}</a>
    Логин: ${from.username ? `@${from.username}` : 'нету'}
    Имя: ${from.first_name} ${from.last_name || ""}
    Язык юзера: ${from.language_code}
  `;
	
	const userMessage = `
    Привет! Получили от тебя заявку на вступление в сообщество МОО КолеСИМ ( https://t.me/kole_sim ).
    Такие заявки мы проверяем на ботов!
    
    Напишите с какой целью вы хотите зайти в сообщество МОО КолеСИМ.
    
    Не будет ответа на это сообщение в течение суток - придётся отклонить заявку.
    Но если что, после отклонения заявку можно подать повторно!
  `;
	console.log(`new request  ${from.first_name}`)
	await sendTelegramMessage(from.id, userMessage);
	await sendTelegramMessage(ADMIN_CHAT_ID, adminMessage, { message_thread_id: ADMIN_THREAD_ID, parse_mode: 'HTML' });
});

bot.on('message', async (ctx) => {
	const messageText = ctx.message.text;
	if (!messageText) return;

	
	if (ctx.message.chat.type === "private" && ctx.message.text) {
		const answer = `Ответ от пользователя <a href="tg://user?id=${ctx.message.from.id}">${ctx.message.from.first_name} ${ctx.message.from.last_name || ""}</a>: ${ctx.message.text}`;
		await sendTelegramMessage(ADMIN_CHAT_ID, answer, {
			caption: ctx.message.caption,
			message_thread_id: ADMIN_THREAD_ID,
			parse_mode: 'HTML'
		});
	}
});

// Start the bot
(async () => {
	bot.launch();
	console.log('Bot is running');
})();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
