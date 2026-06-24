import { Schema, model, Types, type InferSchemaType, type HydratedDocument } from 'mongoose'
import { SHIFT_STATUS, CONTRACT_TYPE, SERVICE_TYPE } from '../types.js'

const shiftSchema = new Schema(
  {
    structureId: { type: Types.ObjectId, ref: 'Structure', required: true, index: true },
    employeeId: { type: Types.ObjectId, ref: 'Employee', default: null, index: true },
    requiredRole: { type: String, required: true },
    // Orari in UTC; attenzione ai turni a cavallo della mezzanotte (gestione lato calcolo ore).
    date: { type: Date, required: true, index: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    contractType: { type: String, enum: CONTRACT_TYPE, default: 'EXTRA' },
    serviceType: { type: String, enum: SERVICE_TYPE, default: 'CATERING' },
    status: { type: String, enum: SHIFT_STATUS, default: 'TO_ASSIGN', index: true },
    recurrenceId: { type: String },
    createdBy: { type: Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

export type Shift = InferSchemaType<typeof shiftSchema>
export type ShiftDoc = HydratedDocument<Shift>
export const ShiftModel = model('Shift', shiftSchema)
