import { Composer, Scenes } from "telegraf";
import { ExtraEditMessageText } from "telegraf/typings/telegram-types";
import { ISentence, Sentence } from "../../models/ISentence";
import { IUser, User } from "../../models/IUser";
import rlhubContext from "../models/rlhubContext";

const handler = new Composer<rlhubContext>();
const home = new Scenes.WizardScene("home", handler, async (ctx: rlhubContext) => await add_sentences_handler(ctx));

export async function greeting (ctx: rlhubContext, reply?: boolean) {

    let user: IUser | null = await User.findOne({ id: ctx.from?.id })

    if (user) {

        if (user.interface_language) {

            ctx.scene.session.interface_ln = user.interface_language

        } else {
            
            ctx.scene.session.interface_ln = 'russian'

        }

    }

    let keyboard_translates: any = {
        learns: {
            russian: 'Самоучитель',
            english: 'Learns',
            buryat: 'Заабари'
        },
        dictionary: {
            russian: 'Словарь',
            english: 'Dictionary',
            buryat: 'Толи'
        },
        sentences: {
            russian: 'Предложения',
            english: 'Sentences',
            buryat: 'Мэдуулэлнуд'
        },
        translator: {
            russian: 'Переводчик',
            english: 'Translator',
            buryat: 'Оршуулгари'
        },
        moderation: {
            russian: 'Модерация',
            english: 'Moderation',
            buryat: 'Зохисуулал'
        },
        dashboard: {
            russian: 'Личный кабинет',
            english: 'Dashboard',
            buryat: 'Оорын таhaг'
        }
    }

    const extra: ExtraEditMessageText = {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: keyboard_translates.learns[ctx.scene.session.interface_ln], callback_data: "study" },
                    { text: keyboard_translates.dictionary[ctx.scene.session.interface_ln], callback_data: "vocabular" }
                ],
                [{ text: keyboard_translates.sentences[ctx.scene.session.interface_ln], callback_data: 'sentences' }],
                [{ text: keyboard_translates.translator[ctx.scene.session.interface_ln], callback_data: 'translater' }],
                [{ text: keyboard_translates.moderation[ctx.scene.session.interface_ln], callback_data: 'moderation' }],
                [{ text: "🔓 Chat GPT", callback_data: "chatgpt" }],
                [{ text: keyboard_translates.dashboard[ctx.scene.session.interface_ln], callback_data: "dashboard" }],
            ]
        }
    }

    let message: any = {
        russian: `Самоучитель бурятского языка \n\nКаждое взаимодействие с ботом, \nвлияет на сохранение и дальнейшее развитие <b>Бурятского языка</b> \n\nВыберите раздел, чтобы приступить`,
        buryat: `Буряд хэлэнэ заабари \n\nКаждое взаимодействие с ботом, \nвлияет на сохранение и дальнейшее развитие <b>Бурятского языка</b> \n\nЭхилхиин, нэгэ юумэ дарагты`,
        english: `Buryat Language Tutorial \n\nEvery interaction with the bot affects the preservation and further development of the Buryat language \n\nChoose a section to start`,
    }

    try {
        
        if (reply) {
            return ctx.reply(message[ctx.scene.session.interface_ln], extra)
        }

        // ctx.updateType === 'message' ? await ctx.reply(message, extra) : false
        ctx.updateType === 'callback_query' ? await ctx.editMessageText(message[ctx.scene.session.interface_ln], extra) : ctx.reply(message[ctx.scene.session.interface_ln],extra)

    } catch (err) {
    
        console.log(err)
    
    }
}

home.start(async (ctx: rlhubContext) => {

    try {

        await ctx.reply('Можете отправить объявление')

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

home.action("translater", async (ctx) => {

    let message: string = `<b>План по развитию Бурятского языка</b> \n\n`
    message += `<a href="https://telegra.ph/Znachimost-Mashinnogo-Perevodchika-dlya-Buryatskogo-YAzyka-09-01">На данный момент отсутствует машинный переводчик с Бурятского языка, над чем мы и работаем</a>\n`

    await ctx.editMessageText(message, { parse_mode: 'HTML', disable_web_page_preview: true })
    await greeting(ctx, true)
    return ctx.answerCbQuery('На стадии разработки 🎯')

})

home.action("study", async (ctx) => {
    console.log('study')
    return ctx.answerCbQuery('Программа обучения на стадии разработки 🎯')
})

home.action("moderation", async (ctx) => {
    try {

        if (ctx.updateType === 'callback_query') {


            const user: IUser | null = await User.findOne({ id: ctx.from?.id })

            if (user?.permissions?.admin || user?.permissions?.dictionary_moderator || user?.permissions?.sentences_moderator || user?.permissions?.translation_moderator) {

                ctx.answerCbQuery('Есть права!')
                return ctx.scene.enter('moderation')
                
            } else {
                
                ctx.answerCbQuery('Недостаточно прав')
                await ctx.editMessageText('Чтобы получить права модератора, напишите администратору @frntdev')
                await delay(1500)
                return await greeting(ctx, true)

            }

        }

    } catch (error) {
        console.error(error)
    }

    // ctx.answerCbQuery()
    // return ctx.scene.enter('moderation')
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

    if (ctx.from) {
        try {

            if (ctx.updateType === 'callback_query') {
                if (ctx.callbackQuery) {

                    // @ts-ignore
                    if (ctx.callbackQuery.data) {

                        // @ts-ignore
                        let data: 'send_sentences' | 'back' = ctx.callbackQuery.data

                        // сохранение предложенных предложений
                        if (data === 'send_sentences') {
                            
                            for (let i = 0; i < ctx.session.sentences.length; i++) {
                            
                                new Sentence({
                                    text: ctx.session.sentences[i],
                                    author: ctx.from.id,
                                    accepted: 'not view',
                                    translations: [],
                                    skipped_by: []
                                }).save().then(async (data) => {
                                    let object_id = data._id

                                    await User.findOneAndUpdate({ id: ctx.from?.id }, { $push: {
                                        "proposedProposals": object_id
                                    } })

                                })

                            }

                            await ctx.answerCbQuery(`${ctx.session.sentences} отправлены на проверку, спасибо!`)
                            ctx.wizard.selectStep(0)
                            await greeting(ctx)
                        }

                        if (data === 'back') {
                            ctx.wizard.selectStep(0)
                            await ctx.answerCbQuery()
                            return greeting(ctx)
                        }
                    }
                 }

            } else if (ctx.updateType === 'message') {

                if (ctx.update.message.text) {

                    let text: string = ctx.update.message.text

                    const user: IUser | null = await User.findOne({ id: ctx.from.id })
                    
                    if (!user || !user._id) {
                        return false
                    }

                    let sentence: ISentence = {
                        text: text.toLocaleLowerCase(),
                        author: user._id,
                        accepted: 'not view',
                        translations: [],
                        skipped_by: [],
                        active_translator: []
                    }

                    let message: string = ``

                    if (sentence.text.indexOf('+;') !== -1) {
                        let splitted = sentence.text.split('+;')
                        let arr: string[] = []
                        for (let i = 0; i < splitted.length; i++) {
                            arr.push(splitted[i].trimEnd().trimStart())
                        }

                        ctx.session.sentences = arr

                        for (let i = 0; i < splitted.length; i++) {
                            message += `${i+1}) ${splitted[i].trimStart().trimEnd()}\n`
                        }
                    } else {
                        ctx.session.sentences = [text]
                        message += text
                    }

                    await ctx.reply(message, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: 'Сохранить',
                                        callback_data: 'send_sentences'
                                    }
                                ],
                                [
                                    {
                                        text: 'Назад',
                                        callback_data: 'back'
                                    }
                                ]
                            ]
                        }
                    })

                } else {
                    await ctx.reply("Нужно отправить в текстовом виде")
                }

            }

        } catch (err) {
            ctx.wizard.selectStep(0)
            await greeting(ctx)
        }
    }
    
}

// home.on("message", async (ctx) => await greeting (ctx))
home.action(/\./, async (ctx) => {
    
    console.log(ctx)
    await greeting(ctx)

})
export default home
export { add_sentences_handler }