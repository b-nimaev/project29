import dotenv from 'dotenv';
import rlhubContext from './bot/models/rlhubContext';
import { Composer, Scenes, Telegraf, session } from 'telegraf';
dotenv.config()

export const bot = new Telegraf<rlhubContext>(process.env.BOT_TOKEN!);

import './app'
import './webhook'
import './database'

import home, { add_sentences_handler } from './bot/views/home.scene';
import sentences from './bot/views/sentences.scene';
import settings from './bot/views/settings.scene';
import dashboard from './bot/views/dashboard.scene';
import vocabular from './bot/views/vocabular.scene';
import moderation from './bot/views/moderation.scene';
import chat from './bot/views/chat.scene';
import { Translation, voteModel } from './models/ISentence';
import { IUser, MessageModel, User, blacks, stopModel } from './models/IUser';
import { ExtraEditMessageText } from 'telegraf/typings/telegram-types';
import { InlineQueryResult } from 'telegraf/typings/core/types/typegram';
import { greeting } from './bot/views/home.scene';
const handler2 = new Composer<rlhubContext>();
const handler3 = new Composer<rlhubContext>();
const blacklist = new Scenes.WizardScene("blacklist", handler2, async (ctx: rlhubContext) => await add_sentences_handler(ctx));
const stopsection = new Scenes.WizardScene("stopsection", handler3);
const stage: any = new Scenes.Stage<rlhubContext>([home, blacklist, stopsection], { default: 'home' });
console.log('hi')
home.command("blacklist", async (ctx) => { await ctx.scene.enter('blacklist') })
blacklist.enter(async (ctx: rlhubContext) => {
    try {
        await ctx.reply('Переотправьте объявление нарушителя')
        ctx.wizard.next()
    } catch (error) {
        console.error(error)
    }
})
home.command("stop2", async (ctx) => { await ctx.scene.enter("stopsection") })
blacklist.command("stop2", async (ctx) => { await ctx.scene.enter("stopsection") })
stopsection.enter(async (ctx) => { 
    
    await ctx.reply('Отправьте слово которое хотите добавить в стоп-лист');

    const words = await stopModel.find()
    let message: string = `существующие в списке слова:\n`
    for (let i = 0; i < words.length; i++) {
        if (words.length > i + 1) {
            message += `${words[i].word}, `
        } else if (words.length === i + 1) {
            message += `${words[i].word}`
        }
    }

    message += `\n\nЧтобы вернуться на главную отправьте команду /home`

    await ctx.reply(message)

})
stopsection.command("home", async (ctx) => { await ctx.scene.enter('home') })
stopsection.command("blacklist", async (ctx) => { await ctx.scene.enter("blacklist") })
stopsection.on("message", async (ctx) => {
    if (ctx.updateType === 'message') {

        //@ts-ignore
        if (ctx.update.message.text) {

            //@ts-ignore
            let arr = ctx.update.message.text.split(' ')

            for (let i = 0; i < arr.length; i++) {

                let exists = await stopModel.findOne({
                    word: arr[i]
                })

                if (exists) {

                    await stopModel.findByIdAndDelete(exists._id)
                    await ctx.reply(`${arr[i]} удалён`)
                    continue
                }

                await new stopModel({ word: arr[i] }).save()
                await ctx.reply(`${arr[i]} сохранен в стоп лист`)

            }

            await ctx.scene.enter('stopsection')

        }

    }
})

blacklist.command("home", async (ctx) => { await ctx.scene.enter("home") })
blacklist.on("message", async (ctx: rlhubContext) => {
    try {
        if (ctx.updateType === 'message') {

            //@ts-ignore
            if (ctx.update.message.forward_from_chat) {

                //@ts-ignore
                let message_id = ctx.update.message.forward_from_message_id

                if (ctx.update.message) {

                    //@ts-ignore
                    if (ctx.update.message.text) {

                        //@ts-ignore
                        // console.log(ctx.update.message.text)

                    }

                }

                const message = await MessageModel.findOne({ message_id: message_id })

                let exists = await blacks.findOne({ user_id: message?.user_id })

                if (exists) {
                    await ctx.reply('Нарушитель уже в черном списке')
                    return true
                } else {
                    await new blacks({ user_id: message?.user_id }).save()
                    await ctx.reply(`Нарушитель заблокирован удачно \n\n/home команда чтобы вернуться на главную`)
                }

                return false
            } else {
                await ctx.reply('Это секция для добавления пользователей в черный список!')
                await ctx.reply('Чтобы вернуться на главную, отправьте команду /home')
            }

            console.log(ctx.update.message)
        }
    } catch (error) {
        console.error(error)
    }
})

bot.use(session())
bot.use(stage.middleware())
bot.start(async (ctx) => {
    await ctx.scene.enter('home')
    // ctx.deleteMessage(874)
});

(async function () {
    try {
        await bot.telegram.sendMessage(1272270574, '/start')
    } catch (error) {
        console.error(error)
    }
})();

bot.action(/./, async function (ctx: rlhubContext) {
    // await ctx.scene.enter('home')
    ctx.answerCbQuery()
    await greeting(ctx, true)
})

bot.on("message", async (ctx) => {
    let arr_inc: any = []
    
    await stopModel.find().then(async (result: { word: string }[]) => {
        for (let i = 0; i < result.length; i++) {
            arr_inc.push(result[i].word)
        }
    })

    const user_in_black = await blacks.findOne({ user_id: ctx.from.id })
    console.log(user_in_black)
    if (user_in_black !== null) {
        return await ctx.reply('Вы в черном списке')
    }

    let exi = false
    if (ctx.updateType === 'message') {
        if (ctx.update.message) {

            let message = {
                bot_message_id: ctx.update.message.message_id,
                channel_message_id: 0,
                user_id: ctx.from.id
            }

            console.log(ctx.message)
            //@ts-ignore
            if (ctx.update.message.text) {

                //@ts-ignore
                let text = ctx.update.message.text

                let splitted = text.split(' ')
                for (let i = 0; i < splitted.length; i++) {
                    let word = splitted[i].toLowerCase()

                    for (let z = 0; z < arr_inc.length; z++) {

                        if (arr_inc[z].indexOf(word) !== -1) {
     
                            await ctx.reply('Вы нарушаете правила')
                            return false

                        }

                    }

                }

                if (exi) {
                    return false
                }
                //@ts-ignore
                await ctx.telegram.sendMessage(`${process.env.chat}`, ctx.update.message.text).then(async (result) => {
                    console.log(result)
                    message.channel_message_id = result.message_id
                })
                await ctx.reply('Ваше объявление опубликовано успешно')
                await ctx.reply('Можете ещё объявление отправить')
                console.log(ctx.update.message.from.id)
                await new MessageModel({ message_id: message.channel_message_id, user_id: ctx.update.message.from.id }).save()

            }

        }
        
    }
})

bot.command('update_translates_collection', async (ctx) => {

    let translates = await Translation.find()
    translates.forEach(async (element: any) => {

        let votes = element.votes
        let rating = 0

        if (votes) {

            let pluses = 0
            let minuses = 0

            for (let i = 0; i < votes.length; i++) {

                let voteDocument = await voteModel.findById(votes[i])

                if (voteDocument) {

                    if (voteDocument.vote === true) {
                        pluses++
                    } else {
                        minuses++
                    }

                }

            }

            rating = pluses - minuses
        }

        await Translation.findByIdAndUpdate(element._id, {
            $set: {
                rating: rating
            }
        })
    })

});

bot.command('chat', async (ctx) => { await ctx.scene.enter('chatgpt') })
bot.command('home', async (ctx) => { await ctx.scene.enter('home') })

// bot.on("inline_query", async (ctx) => {

//     const query = ctx.inlineQuery.query

//     console.log(query)
    
//     const results: InlineQueryResult[] = [
//         {
//             type: 'document',
//             id: '1',
//             title: 'Результат 1',
//             input_message_content: {
//                 message_text: 'Это результат 1'
//             },
//         },
//         // Добавьте другие результаты поиска
//     ];

//     // @ts-ignore
//     await ctx.answerInlineQuery(results, {});

// })