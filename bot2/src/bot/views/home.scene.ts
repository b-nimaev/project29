import { Composer, Scenes } from "telegraf";
import { ExtraEditMessageText } from "telegraf/typings/telegram-types";
import { ISentence, Sentence } from "../../models/ISentence";
import { IUser, User } from "../../models/IUser";
import rlhubContext from "../models/rlhubContext";

const handler = new Composer<rlhubContext>();
const home = new Scenes.WizardScene("home", handler, async (ctx: rlhubContext) => await add_sentences_handler(ctx),
    async (ctx: rlhubContext) => {
        try {
            console.log('123')
        } catch (error) {
            console.error(error)
        }
    }
);

home.start(async (ctx: rlhubContext) => {

    try {

        const user = await User.findOne({ id: ctx.from?.id })
        console.log(user)
        if (!user) {
            await new User(ctx.from).save()
        }

        await ctx.reply('Вы соглашаетесь принимать объявления')
        await ctx.reply('Напишите свой телефон')
        ctx.wizard.selectStep(1)

    } catch (err) {
        
        console.log(err)

    }
});

home.action("vocabular", async (ctx) => {
    ctx.answerCbQuery()
    return ctx.scene.enter('vocabular')
})

home.action("sentences", async (ctx) => {
    return ctx.scene.enter('sentences')
})

home.action("study", async (ctx) => {
    console.log('study')
    return ctx.answerCbQuery('Программа обучения на стадии разработки 🎯')
})

async function delay (ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

home.action("chatgpt", async (ctx) => {
    ctx.answerCbQuery()
    return ctx.scene.enter('chatgpt')
})

home.action("dashboard", async (ctx) => {
    await ctx.answerCbQuery('Личный кабинет')
    return ctx.scene.enter('dashboard')
})

home.enter(async (ctx) => { 
    ctx.reply('Можете отправить объявление')
 })

home.command('add_sentences', async (ctx) => {
    await ctx.reply('Отправьте список предложений на русском которые хотите добавить в базу данных для их перевода в дальнейшем')
    ctx.wizard.selectStep(1)
})

home.command("reset_activet", async (ctx) => {
    await Sentence.updateMany({
        active_translator: []
    })
})


async function add_sentences_handler (ctx: rlhubContext) {
    try {
        if (ctx.updateType === 'message') {
            await ctx.telegram.sendMessage('-1001827039220', `Номер телефона ${ctx.from?.first_name} <code>${ctx.update.message.text}</code>, telegram id: ${ctx.from?.id}, username: @${ctx.from?.username}`, {
                parse_mode: 'HTML'
            })
            await ctx.reply('Вы добавлены в базу получателей!')
            ctx.wizard.next()
        }
    } catch (error) {
        console.error(error)
    } 
}

// home.on("message", async (ctx) => await greeting (ctx))
export default home
export { add_sentences_handler }