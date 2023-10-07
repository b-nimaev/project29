import dotenv from 'dotenv';
import rlhubContext from './bot/models/rlhubContext';
import { Scenes, Telegraf, session } from 'telegraf';
dotenv.config()

export const bot = new Telegraf<rlhubContext>(process.env.BOT_TOKEN!);

import './app'
import './webhook'
import './database'

import home from './bot/views/home.scene';
import sentences from './bot/views/sentences.scene';
import settings from './bot/views/settings.scene';
import dashboard from './bot/views/dashboard.scene';
import vocabular from './bot/views/vocabular.scene';
import moderation from './bot/views/moderation.scene';
import chat from './bot/views/chat.scene';
import { Translation, voteModel } from './models/ISentence';
import { IUser, User } from './models/IUser';
import { ExtraEditMessageText } from 'telegraf/typings/telegram-types';
import { InlineQueryResult } from 'telegraf/typings/core/types/typegram';
const stage: any = new Scenes.Stage<rlhubContext>([home], { default: 'home' });

console.log('hi')

bot.use(session())
bot.use(stage.middleware())

bot.on('channel_post', async (ctx) => {
    if (ctx.updateType === 'channel_post') {
        if (ctx.update.channel_post.message_id) {
            
            const users = await User.find()
            for (let i = 0; i < users.length; i++) {
                await ctx.copyMessage(users[i].id)
                console.log(users[i].id + ' отправлено')
            }
            // await ctx.copyMessage(1272270574)
            // ctx.update.channel_post.message_id
        }
    }
})
bot.on("message", async (ctx) => {
    console.log(ctx.update)
    // if (ctx.updateType === 'message') {
        // console.log(ctx.update)
    // }
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