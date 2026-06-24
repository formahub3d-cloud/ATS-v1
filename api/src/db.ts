import mongoose from 'mongoose'
import { env } from './env.js'

/** Connessione a MongoDB (Mongoose). Da chiamare una sola volta all'avvio. */
export async function connectDb(uri: string = env.MONGODB_URI): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
  return mongoose
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect()
}
