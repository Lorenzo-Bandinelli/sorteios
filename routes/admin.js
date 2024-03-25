const router = require('express').Router()
const {criarSorteio, pegarTodosSorteios, updateSorteio, removerSorteio, launchSorteio, mostrarJogos, pegarGameHistory} = require('../controllers/sorteios');

//importa as globalariables para passar elas pro handlebars
let globalVariables = require('../public/globalVariables')
globalVariables = JSON.stringify(globalVariables)


//roteia a paginal inical do admin
router.get('/', function(req, res) {
    res.render ('admin', {pageTitle: "jogos aqui2"});
  });

  //roteia de criar novos jogos
router.route('/createGame').get((req, res) => {res.render ('adminCreateGame', {pageFunction: "Criar Jogos", globalVariables: globalVariables})}).post(criarSorteio)

//roteia a paginal que mostra todos os sorteios
router.route('/showGames').get(pegarTodosSorteios).patch(updateSorteio).delete(removerSorteio)
router.route('/showGames/launchGame/:id').get(launchSorteio)
router.route('/showGames/:id').get(mostrarJogos)
router.route('/showGameHistory').get(pegarGameHistory)
module.exports = router;