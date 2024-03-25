const mongoose = require('mongoose')

const connectDB = (url) => {
  return mongoose.connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
  })
}

//o plugin autoIncrement serve para armazenar os jogos com IDs na formatação requerida 
//começando em 1001 e incrementando por 1 a cada novo Jogo feito
const AutoIncrement = require('mongoose-sequence')(mongoose);

module.exports = {
  connectDB,
  AutoIncrement
}
