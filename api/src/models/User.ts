import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose'
import { ROLES, USER_STATUS } from '../types.js'

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, required: true },
    status: { type: String, enum: USER_STATUS, default: 'ACTIVE' },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
)

// Non esporre mai l'hash della password nelle risposte JSON.
userSchema.set('toJSON', {
  transform(_doc, ret: Record<string, unknown>) {
    delete ret.passwordHash
    return ret
  },
})

export type User = InferSchemaType<typeof userSchema>
export type UserDoc = HydratedDocument<User>
export const UserModel = model('User', userSchema)
