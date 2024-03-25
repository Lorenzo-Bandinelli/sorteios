const router = require('express').Router()
const {mostrarTodosSorteiosUsuario, fazerJogo, fazerJogoPost, pesquisarMeusJogos, pesquisarJogosPassados, deletarJogoPremiado} = require('../controllers/usuario')

router.get('/', function(req, res) {
    res.render ('user', {pageTitle: "pagina usuario"});
  });

router.get('/meusJogos', pesquisarMeusJogos);

router.route('/jogosPassados').get(pesquisarJogosPassados).delete(deletarJogoPremiado)

router.route('/fazerAposta').get(mostrarTodosSorteiosUsuario)
router.route('/fazerAposta/:sorteioID').get(fazerJogo).post(fazerJogoPost)
module.exports = router;