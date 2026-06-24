import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose'
import { STRUCTURE_TYPE } from '../types.js'

const structureSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true, index: true },
    type: { type: String, enum: STRUCTURE_TYPE, required: true },
    status: { type: String, enum: ['ACTIVE', 'PENDING', 'SUSPENDED'], default: 'PENDING' },
    address: { type: String, trim: true },
    zone: { type: String, trim: true },
    vatNumber: { type: String, trim: true },
    contactName: { type: String, trim: true },
    phone: { type: String, trim: true },
    contractSigned: { type: Boolean, default: false },
    // Importi in Decimal128 (mai float): tariffa cliente e fee mensile.
    clientHourlyRate: { type: Schema.Types.Decimal128 },
    fee: { type: Schema.Types.Decimal128 },
    joinDate: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
)

export type Structure = InferSchemaType<typeof structureSchema>
export type StructureDoc = HydratedDocument<Structure>
export const StructureModel = model('Structure', structureSchema)
