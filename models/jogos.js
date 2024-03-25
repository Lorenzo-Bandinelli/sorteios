const mongoose = require('mongoose')
const globalVariables = require('../public/globalVariables')
const {AutoIncrement} = require('../db/connect')

//defininindo um "arcabouço"/"molde" pros jogos que serão add na db
const jogosSchema = new mongoose.Schema({
    nome:{
        type:String,
        required: [true, 'Nome é obrigatório'],
        maxLength: globalVariables.tamMaxNomeJogador,
        minLength: globalVariables.tamMinNomeJogador,
        unique: false
    },

    cpf:{
        type:String,
        required: [true, 'cpf é obrigatório'],
    },

    jogo:{
        type: String,
        required: [true, 'cpf é obrigatório'],
    },

    idSorteio:{
        type: String,
        required: [true, 'idSorteio é obrigatório'],
    },

    _id:{
        Number
    },

}, {timestamps: {createdAt: false, updatedAt: false, _id: false}})


//o plugin autoIncrement serve para armazenar os jogos com IDs na formatação requerida 
//começando em 1001 e incrementando por 1 a cada novo Jogo feito
jogosSchema.plugin(AutoIncrement, {start_seq: 1000})
module.exports = mongoose.model('jogos', jogosSchema)