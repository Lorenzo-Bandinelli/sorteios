const sorteios = require('../models/sorteios')
const sorteiosFinalizados = require('../models/sorteiosFinalizados')
const asyncWrapper = require('../middleware/async')
const {parse:dateParse, format:dateFormat} = require('date-fns')

//importa as globalariables para passar elas pro handlebars
let globalVariables = require('../public/globalVariables')
const jogos = require('../models/jogos')
globalVariables = JSON.stringify(globalVariables)

//função generica de gerar números em um escpo
function genRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

function formatNumber(num){
    if (num.toString().length === 1){
        return num.toString().replace (/^/,'0');
    }
    return num.toString()
}

//devolve a lista dos ganhadores
function checkWinners(numerosSorteados, listaJogadores){
    let listaGanhadores = []
    numerosSorteados = Array.from(numerosSorteados)
    for(let jogador of listaJogadores){
        if(jogador.listaApostas.every(number =>  numerosSorteados.includes(number))){
            listaGanhadores.push(jogador)
        }
    }
    return listaGanhadores
}

function realizarSorteio(listaJogadores, qntdNumSorteados = 5, numerosSorteados = new Set(), logRodadas = ''){
    while(numerosSorteados.size < qntdNumSorteados){
        //usando var aqui para arrumar o scope de disponibinilidade
        var randomNumber = genRandomNumber(1, 50)
        numerosSorteados.add(formatNumber(randomNumber))
        
        if(qntdNumSorteados > 5 && (!Array.from(numerosSorteados).includes(randomNumber))){   //se estiver depois da primeira rodada (em que 5 nums sao gerados) confere se o numero já
            logRodadas += `"rodada ${qntdNumSorteados - 4}": "${formatNumber(randomNumber)}",`   //não está no set e insere ele no log
        }
    }
    if(qntdNumSorteados === 5){
        logRodadas += `"rodada ${qntdNumSorteados - 4}": "${Array.from(numerosSorteados)}",`
    }
    let ganhadores = checkWinners(numerosSorteados, listaJogadores)
    if(ganhadores.length >= 1){
        return {temGanhador: true, logRodadas: logRodadas, ganhadores: ganhadores, numerosSorteados: Array.from(numerosSorteados), listaJogadores}
    } else{
        if (qntdNumSorteados === 30){
            // foi sorteado 30 numeros e nenhum ganhador
            return {temGanhador: false, logRodadas: logRodadas, ganhadores: ganhadores, numerosSorteados: Array.from(numerosSorteados), listaJogadores}
        }
        return realizarSorteio(listaJogadores, qntdNumSorteados + 1, numerosSorteados, logRodadas)
    }
}

//formata a data de criação que vem da base de dados para uma string, evitando assim problemas em outras partes do programa
function formatarSorteios(listaSorteios){
    let listaFormatada = listaSorteios.map((curretElement, index, currArray)=>{
        curretElement = curretElement.toObject()
        curretElement.createdAt = curretElement.createdAt.toString()
        return curretElement
    })
    return listaFormatada
}

function filtrarAlfabeticaNome( a, b ) {
    if ( a.nome < b.nome ){
      return -1;
    }
    if ( a.nome > b.nome ){
      return 1;
    }
    return 0;
}

function dadosTodosJogos(todosOsJogos){
    let numeros = []
    for (jogo of todosOsJogos){ //para cada jogo
        let listaNumeros = jogo.split('-') //divide a string numa lista de numeros
        listaNumeros.forEach(esteNumero => { //para cada numero desta lista
            let posDesteNumero = numeros.map(numero => numero.valor).indexOf(esteNumero) //verifica a posição dele
            if (posDesteNumero !== -1){ //caso tenha o numero aumenta a quantidade
                numeros[posDesteNumero].quantidade += 1
            } else{ //caso não tenha o numero cria ele 
                numeros.push({valor: esteNumero.toString(), quantidade: 1})
            }
        })
    }
    return numeros.sort((a,b) => b.quantidade - a.quantidade)
}

const criarSorteio = asyncWrapper (async (req, res) => {
    //formata a data pra armazená-la na base de dados com um formato mais legivel dd/mm/aaaa
    let dataPrevista = req.body.dataPrevistaSorteio
    dataPrevista = dateParse(dataPrevista, 'yyyy-mm-dd', new Date())
    dataPrevista = dateFormat(dataPrevista, 'dd/mm/yyyy')
    req.body.dataPrevistaSorteio = dataPrevista

    // cria o sorteio na base de dados com base no molde feito e retorna 204, que simplesmente reinicia a página
    const sorteio = await sorteios.create(req.body)

    //TODO TODO TODO clear form and show success message, check for dates before today
    return res.status(204).send()
})

const pegarTodosSorteios = asyncWrapper(async (req, res)=>{
    let todosSorteios = await sorteios.find()
    let todosSorteiosFormat = formatarSorteios(todosSorteios)
    return res.status(201).render('adminShowGames', {todosSorteios: todosSorteiosFormat, globalVariables: globalVariables})
})

const updateSorteio = asyncWrapper(async (req, res)=>{
    let {nome, dataPrevistaSorteio, id} = req.body
    var updatedSorteio = await sorteios.findOneAndUpdate({_id:id}, {nome, dataPrevistaSorteio})
    if(!updatedSorteio){
        throw new Error('sorteio não encontrado!')
    }

})

const removerSorteio = asyncWrapper(async(req, res) =>{
    const {currentId: sorteioID} = req.body
    const sorteioRemovido = await sorteios.findOneAndDelete({_id:sorteioID})
    
    //se um sorteio com aquele id não existe joga um erro
    if (!sorteioRemovido){
        throw new Error('sorteio com este id não encontrado')
    }
})

const mostrarJogos = asyncWrapper(async(req, res)=>{
    const {id} = req.params
    let jogosDesteSorteio = await jogos.find({idSorteio:id})
    if (jogosDesteSorteio.length === 0){
        return res.render('naoJogos')
    }
    res.render('mostrarJogos', {jogosDesteSorteio})
})

const launchSorteio = asyncWrapper(async(req, res) => {
    const {id:idDesteSorteio} = req.params
    const esteSorteio = await sorteios.findById(idDesteSorteio)
    const nomeJogo = esteSorteio.nome
    let todosIDs = esteSorteio.listaDeApostas
    let listaTodosJogos = []
    if(todosIDs.length === 0){
        //se não tem jogos inscritos renderiza, não roda a funcao e mostra pro usuario
        return res.render('naoJogos')
    }
    let listaDeJogadores = []
    for(let id of todosIDs){
        let esteJogo = await jogos.findById(id)
        let jogo = esteJogo.jogo.split('-')
        listaTodosJogos.push(esteJogo.jogo)
        listaDeJogadores.push({id: esteJogo._id, listaApostas: jogo, nome: esteJogo.nome, cpf: esteJogo.cpf, idSorteio: esteJogo.idSorteio})
        // await jogos.findByIdAndDelete(id) //ao executar o sorteio, remove todos os jogos do schema de jogos
}
    let sorteioFeito = realizarSorteio(listaDeJogadores)
    sorteioFeito.logRodadas = sorteioFeito.logRodadas.replace (/^/,'{') // coloca { no inicio
    sorteioFeito.logRodadas = sorteioFeito.logRodadas.replace (/.$/,'}') //coloca } no fim
    sorteioFeito.logRodadas = JSON.parse(sorteioFeito.logRodadas)

    const sorteioFinalizado = await sorteiosFinalizados.create({
        nomeJogo: nomeJogo,
        temGanhador: sorteioFeito.temGanhador,
        logRodadas: sorteioFeito.logRodadas,
        listaDeGanhadores: sorteioFeito.ganhadores,
        listaDeGanhadoresNaoRetiraram: sorteioFeito.ganhadores,
        numerosSorteados: sorteioFeito.numerosSorteados,
        todosOsJogos: listaTodosJogos,
    })
    // await sorteios.findByIdAndDelete(idDesteSorteio) ////ao executar o sorteio, remove o sorteio do schema de sorteio
    res.render('sorteioFinalizado', {sorteioFeito})
})

const pegarGameHistory = asyncWrapper(async(req, res)=>{
    const allSorteiosFinalizados = await sorteiosFinalizados.find()
    let allSorteiosFinalizadosFormat = []
    for (let sorteioFinalizado of allSorteiosFinalizados){
        let sorteioFinalizadoFormat = sorteioFinalizado.toObject()
        if(sorteioFinalizado.temGanhador){
            sorteioFinalizadoFormat.listaDeGanhadores = sorteioFinalizadoFormat.listaDeGanhadores.sort(filtrarAlfabeticaNome)
        }
        sorteioFinalizadoFormat.dadosJogos = dadosTodosJogos(sorteioFinalizado.todosOsJogos)
        allSorteiosFinalizadosFormat.push(sorteioFinalizadoFormat)
    }
    res.render('gameHistory', {sorteiosFinalizados: allSorteiosFinalizadosFormat})
})

module.exports = {
    criarSorteio,
    pegarTodosSorteios,
    updateSorteio,
    removerSorteio,
    launchSorteio,
    mostrarJogos,
    pegarGameHistory,
}