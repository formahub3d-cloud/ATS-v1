import { Schema, model, Types, type InferSchemaType, type HydratedDocument } from 'mongoose'
import { EMPLOYEE_STATUS } from '../types.js'

const employeeSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User' },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    fiscalCode: { type: String, required: true, uppercase: true, trim: true, index: true },
    phone: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    iban: { type: String, trim: true },
    zone: { type: String, trim: true },
    hasVehicle: { type: Boolean, default: false },
    status: { type: String, enum: EMPLOYEE_STATUS, default: 'PENDING', index: true },
    rankLevel: { type: Number, default: 1, min: 1, max: 5 },
    rankPoints: { type: Number, default: 0 },
    roles: { type: [String], default: [] },
    joinDate: { type: Date, default: () => new Date() },
    notes: { type: String },
  },
  { timestamps: true }
)

export type Employee = InferSchemaType<typeof employeeSchema>
export type EmployeeDoc = HydratedDocument<Employee>
export const EmployeeModel = model('Employee', employeeSchema)
