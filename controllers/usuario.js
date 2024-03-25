const sorteios = require('../models/sorteios')
const jogos = require('../models/jogos')
const asyncWrapper = require('../middleware/async')
const {parse:dateParse, format:dateFormat} = require('date-fns')

//importa as globalariables para passar elas pro handlebars
let globalVariables = require('../public/globalVariables')
const sorteiosFinalizados = require('../models/sorteiosFinalizados')
globalVariables = JSON.stringify(globalVariables)

//formata a data de criação que vem da base de dados para uma string, evitando assim problemas em outras partes do programa
function formatarSorteios(listaSorteios){
    let listaFormatada = listaSorteios.map((curretElement, index, currArray)=>{
        curretElement = curretElement.toObject()
        curretElement.createdAt = curretElement.createdAt.toString()
        return curretElement
    })
    return listaFormatada
}

const mostrarTodosSorteiosUsuario = asyncWrapper(async (req, res)=>{
    let todosSorteios = await sorteios.find()
    let todosSorteiosFormat = formatarSorteios(todosSorteios)
    return res.status(201).render('userShowAllGames', {todosSorteios: todosSorteiosFormat, globalVariables: globalVariables})
})

const fazerJogo = asyncWrapper(async (req, res)=>{
    return res.status(201).render('fazerJogo', {sorteioID: req.params.sorteioID, globalVariables: globalVariables})
})

const fazerJogoPost = asyncWrapper(async (req, res)=>{
    let {nome, jogoFeito, cpf, sorteioId} = req.body

    // cria o jogo na base de dados com base no molde feito e retorna 204, que simplesmente reinicia a página
    const jogo = await jogos.create({nome, cpf, jogo:jogoFeito, idSorteio: sorteioId})
    const idJogo = jogo._id
    const esteSorteio = await sorteios.findById(sorteioId)
    await esteSorteio.update({$push: {listaDeApostas: idJogo}})
    return res.status(204).send()
})

const pesquisarMeusJogos = asyncWrapper(async(req, res)=>{
    let params = ''
    let nenhumJogoEncontrado = false
    if (Object.keys(req.query).length === 0 ){
      params = ''
      nenhumJogoEncontrado = false
    } else{
      let {cpf} = req.query
      let todosJogos = await jogos.find({cpf})
      let todosJogosComSorteio = []
      if(todosJogos.length === 0){
        nenhumJogoEncontrado = true
      }
      for (let jogo of todosJogos){
        jogo = jogo.toObject()
        let sorteioDesteJogo = await sorteios.findById(jogo.idSorteio)
        jogo.sorteioDesteJogo = sorteioDesteJogo
        todosJogosComSorteio.push(jogo)
      }
      params = todosJogosComSorteio
    }
    res.render('meusJogos', {params: params, nenhumJogoEncontrado: nenhumJogoEncontrado});
})

const pesquisarJogosPassados = asyncWrapper(async(req, res)=>{
    let nenhumJogoEncontrado = true
    let algumJogoEncontrado = false
    if (Object.keys(req.query).length === 0 ){
      params = ''
      nenhumJogoEncontrado = false
    } else{
      var {cpf} = req.query
      var sorteiosGanhos = await sorteiosFinalizados.find({'listaDeGanhadores.cpf': cpf});
      var sorteiosGanhosFormat = []
      if (sorteiosGanhos.length !== 0 && typeof sorteiosGanhos.length !== 'undefined'){
        nenhumJogoEncontrado = false
        algumJogoEncontrado = true
      } 

      //não gostei particularmente dessa solução mas o tempo está contra mim!
      //cria uma nova lista de objetos com um novo atributo do jogo Ganhador, e se este sorteio ja foi retirado pois a que retorna do mongoose não
      //não dá pra modificar, isso serve pra mostrar o jogo ganhador pro cara que venceu o sorteio e se ele ja retirou ou não
      // como pode estar meio confuso (detesto isso), vou comentar cada linha para tentar deixar mais claro!
      for (let sorteio of sorteiosGanhos){  //para cada um dos sorteios
        let sorteioFormat = sorteio.toObject()  //converte em objeto para poder modificar
        sorteioFormat.jaFoiRetirado = true      //define um padrão de ja foi retirado que será modificado depois se não foi 
        for (ganhador of sorteio.listaDeGanhadores){  //para cada ganhador deste sorteio
          if(ganhador.cpf === cpf){                   //se o cpf bater com o do cara pesquisando
            for (let sorteioNaoRetirado of sorteio.listaDeGanhadoresNaoRetiraram){ // loopa na lista de jogos nao retirados
              if(sorteioNaoRetirado.idSorteio === ganhador.idSorteio){             //e verifica se este jogo especifico ja foi baseado no id
                sorteioFormat.jaFoiRetirado = false
              }
            }
            sorteioFormat.jogoGanhador = ganhador.listaApostas.toString()   //insere o jogoGanhador para mostrar pro usuario
          }
          sorteiosGanhosFormat.push(sorteioFormat) //insere o jogo ganhador transformado para objeto
        }
      }
    }
    console.log(JSON.stringify(sorteiosGanhosFormat));
    res.render('jogosPassados', {nenhumJogoEncontrado: nenhumJogoEncontrado, sorteiosGanhos: sorteiosGanhosFormat, algumJogoEncontrado: algumJogoEncontrado, cpf: cpf})
})

const deletarJogoPremiado = asyncWrapper(async(req, res)=>{
  let {esteId, jogoGanhador, cpf} = req.body
  jogoGanhador = jogoGanhador.split(',')
  console.log(jogoGanhador);
  let resultado = await sorteiosFinalizados.updateMany(
    { _id: esteId },
    { $pull: { listaDeGanhadoresNaoRetiraram: { cpf: cpf, listaApostas: jogoGanhador } } },
    { safe: true, multi: true }
  )
  console.log(resultado);
})

module.exports = {
    mostrarTodosSorteiosUsuario,
    fazerJogo,
    fazerJogoPost,
    pesquisarMeusJogos,
    pesquisarJogosPassados,
    deletarJogoPremiado,
}