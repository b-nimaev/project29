import mongoose, { Schema, model, ObjectId } from "mongoose";
import { User } from "telegraf/typings/core/types/typegram";
import { vote } from "./ISentence";

interface IUser extends User {

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
}, {
    timestamps: true
});

const User = model<IUser>('User', userSchema);
const ProposedProposalModel = model<IProposedProposal>('Proposed_proposals', proposedProposalSchema)

export { User, IUser, ProposedProposalModel }
