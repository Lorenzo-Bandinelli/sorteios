const {parse:dateParse, format:dateFormat} = require('date-fns')
const thisScript = document.querySelector('#thisScript')

//pegando as globalVariables do html
let globalVariables = thisScript.getAttribute('globalVariables')
globalVariables = JSON.parse(globalVariables)

//usando return nos ifs abaixo para evitar nesting
function nomeCorreto(nome){
    if (nome.length > globalVariables.tamMaxNomeJogo || nome.length < globalVariables.tamMinNomeJogo){
        return false
    }
    return true
}

function isDateBeforeToday(date) {
    return new Date(date.toDateString()) < new Date(new Date().toDateString());
}

function dataCorreta(dataPrevista){
    //note que aqui o == foi usado ao invés de === pois o segundo não funciona como esperado,  provavelmente o retorno da função não
    //é uma string então apenas == funciona
    if(dateParse(dataPrevista, 'yyyy-mm-dd', new Date()) == 'Invalid Date'){
        return false
    }
    return true
}

let form = document.querySelector('form')

form.addEventListener('submit', (event) => {
    event.preventDefault()
    let {nome, dataPrevistaSorteio} = Object.fromEntries(new FormData(event.target).entries())
    //usando return nos ifs abaixo para evitar nesting
    if (!nomeCorreto(nome)){
        alert(`Insira um nome com mais que ${globalVariables.tamMinNomeJogo} e menos que ${globalVariables.tamMaxNomeJogo} caracteres`)
        return
    }

    if(!dataCorreta(dataPrevistaSorteio)){
        alert('insira uma data válida')
        return
    }

    //sem erros então dispara o evento 
    alert('Sorteio Criado Com Sucesso')
    event.target.submit()
})
