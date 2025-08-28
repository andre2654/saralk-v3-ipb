import mongoose from 'mongoose'

export default defineNitroPlugin(async (nitroApp) => {
  const MONGO_URI = process.env.MONGO_URI || ''

  try {
    // Conecta uma única vez
    await mongoose.connect('mongodb://andre:12345678@localhost:27017/saralk?authSource=admin')
    console.log('Conectado ao MongoDB via Mongoose!')
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error)
  }
})
