const bodyParser = require('body-parser');
const express = require('express');
const expressHandlebars = require('hbs');
const admin = require('./routes/admin')
const user = require('./routes/user')
const {connectDB} = require('./db/connect');

const mongoUri = process.env.MongoUri

//NOTE que alguns comentários estão repetidos em pedaços do código que fazem a mesma coisa
//no caso de nem todos os arquivos serem verificados os comentários dos pedaços de código respectivos
//serão

  //é importante salientar que na minha implementação o programa não aceita jogos com valores repetidos 
  //exemplo o jogo 50-50-50-50-50 é inválido, assim como o jogo 01-02-03-04-01, pois cada número jogado deve ser único
  //optei fazer assim pois é o que se vê mais comumente nos jogos como mega-sena por exemplo


//inicializando express
const app = express();

//configurando o express para que os valores do request fiquem acessiveis através do req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( {extended : true} ) );


//renderizando os arquivos estáticos e as páginas 
app.use('/admin', admin)
app.use('/user', user)
app.use(express.static('./public'));

//configurando o express para utilização do handlebars
app.set('view engine', 'hbs');

//função para o handlebars que criei para este projeto, pega um valor da lista que é puxada da base de dados e devolve sua respectiva chave
//util para conseguir as chaves de um objeto dinamicamente dentro de um template do hbs
expressHandlebars.handlebars.registerHelper('getKey', function (aString) {
  let allKeys = Object.keys(this)
  let correctKey
  allKeys.forEach((currentKey)=>{
      if(this[currentKey] === aString && currentKey !== "updatedAt"){
          correctKey = currentKey
      }
  })
return correctKey
})

//ligando o server
const port = process.env.PORT || 4000;

const start = async () => {
  try {
    await connectDB(mongoUri);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();