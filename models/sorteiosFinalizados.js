const mongoose = require('mongoose')


const ganhadoresSchema = new mongoose.Schema({
    nome:{
        type:String,
        required: [true, 'Nome é obrigatório'],
    },
    cpf:{
        type:String,
        required: [true, 'Cpf é obrigatório'],
    },
    idSorteio:{
        type:String,
        required: [true, 'Id Sorteio é obrigatório'],
    },
    listaApostas:{
        type:[String],
        required: [true, 'lista de apostas é obrigatório'],
    },
    id:{
        type: Number,
        required: [true, 'id jogo é obrigatório']
    }
})

//defininindo um "arcabouço"/"molde" pros jogos finalizados que serão add na db
const sorteiosFinalizadosSchema = new mongoose.Schema({
    nomeJogo:{
        type:String,
        required: [true, 'Nome é obrigatório'],
        unique: false
    },

    temGanhador:{
        type: Boolean,
        require: [true, 'Tem Ganhador é um campo obrigatório']
    },

    logRodadas:{
        type: Object,
        require: [true, 'Log Rodadas é um campo obrigatório']
    },

    listaDeGanhadores:{
        type: [ganhadoresSchema],
    },

    listaDeGanhadoresNaoRetiraram:{
        type: [ganhadoresSchema],
    },

    numerosSorteados:{
        type:[String]
    },
    todosOsJogos:{
        type:[String]
    }

}, {timestamps: {createdAt: true, updatedAt: false}})

module.exports = mongoose.model('sorteiosFinalizados', sorteiosFinalizadosSchema)