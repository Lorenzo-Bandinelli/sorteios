const mongoose = require('mongoose')
const globalVariables = require('../public/globalVariables')

//defininindo um "arcabouço"/"molde" pros jogos que serão add na db
const sorteiosSchema = new mongoose.Schema({
    nome:{
        type:String,
        required: [true, 'Nome é obrigatório'],
        maxLength: globalVariables.tamMaxNomeJogo,
        minLength: globalVariables.tamMinNomeJogo,
        unique: false
    },

    listaDeApostas:{
        type: [String],
        validate: {
            validator: function (value){
                //TODO validação dos valores que entram aqui
                return true
            },
            message: 'jogo adicionado invalido'
        },
    },

    dataPrevistaSorteio:{
        type:String
    },

    isActive:{
        type: Boolean,
        default: true,
    }

}, {timestamps: {createdAt: true, updatedAt: false}})

module.exports = mongoose.model('sorteios', sorteiosSchema)