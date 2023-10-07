import mongoose, { Schema, model, ObjectId } from "mongoose";
import { User } from "telegraf/typings/core/types/typegram";
import { vote } from "./ISentence";

interface IUser extends User {
    _id?: ObjectId;
    translations?: ObjectId[]; // добавлено поле "переводы"
    voted_translations?: ObjectId[]; // добавлено поле "голосование за переводы"
    rating: number; // добавлено поле "рейтинг",
    supported: number;
    proposed_proposals?: IProposedProposal[];
    reports?: ObjectId[];
    interface_language?: string;
    chats?: ObjectId[];
    date_of_birth?: {
        day?: number,
        mounth?: number,
        year?: number
    },
    referral?: {
        users: ObjectId[]
    },
    gender?: 'male' | 'female' | undefined,
    stats?: {
        rating?: number,
        supported?: number,
    },
    sentences?: {
        suggested?: ObjectId[],
        accpeted?: ObjectId[]
    },
    translation?: {
        votes?: ObjectId[],
        translations?: ObjectId[]
    },
    permissions?: {
        admin?: boolean,
        translation_moderator?: boolean,
        sentences_moderator?: boolean,
        dictionary_moderator?: boolean
    },
    report?: {
        suggested?: ObjectId[],
        accepted?: ObjectId[],
        resolved?: ObjectId[]
    },
    dictionary_section?: {
        suggested_words_on_dictionary?: {
            suggested?: ObjectId[],
            accepted?: ObjectId[],
            diclined?: ObjectId[]
        },
        translated_words?: ObjectId[]
    },
    createdAt?: any
}

export interface IProposedProposal {
    id: ObjectId;
    accepted: boolean; 
}

export const proposedProposalSchema: Schema<IProposedProposal> = new Schema<IProposedProposal>({
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    accepted: { type: Boolean, required: true, default: false },
}, {
    timestamps: true
})

const userSchema: Schema<IUser> = new Schema<IUser>({
    id: { type: Number, required: true },
    username: { type: String, required: false },
    first_name: { type: String, required: false },
    last_name: { type: String, required: false },
    date_of_birth: { type: {
        day: { type: Number, required: false },
        mounth: { type: Number, required: false },
        year: { type: Number, required: false }
    }, required: false },
    permissions: {
        type: {
            admin: { type: Boolean, required: false, default: false },
            translation_moderator: { type: Boolean, required: false, default: false },
            sentences_moderator: { type: Boolean, required: false, default: false },
            dictionary_moderator: { type: Boolean, required: false, default: false },
        },
        required: false
    },
    referral: { type: { users: { type: [ mongoose.Schema.Types.ObjectId ], _id: false, required: false } }, required: false },
    gender: { type: String || undefined, required: false },
    supported: { type: Number, required: true },
    reports: { type: [mongoose.Schema.Types.ObjectId], required: false },
    chats: { type: [mongoose.Schema.Types.ObjectId], required: false },
    translations: { type: [mongoose.Schema.Types.ObjectId], required: false, default: [] }, // добавлено поле "переводы"
    voted_translations: { type: [mongoose.Schema.Types.ObjectId], required: false, default: [] }, // добавлено поле "голосование за переводы"
    interface_language: { type: String, required: false },
    dictionary_section: { type: {
        suggested_words_on_dictionary: {
            suggested: { type: [ mongoose.Schema.Types.ObjectId ], required: false },
            accepted: { type: [ mongoose.Schema.Types.ObjectId ], required: false },
            diclined: { type: [ mongoose.Schema.Types.ObjectId ], required: false },
        }
    }, required: false },
    rating: { type: Number, required: true, default: 1 }, // добавлено поле "рейтинг",
    proposed_proposals: { type: [ proposedProposalSchema ], required: false, _id: false },
}, {
    timestamps: true
});

const User = model<IUser>('User', userSchema);
const ProposedProposalModel = model<IProposedProposal>('Proposed_proposals', proposedProposalSchema)

export { User, IUser, ProposedProposalModel }
