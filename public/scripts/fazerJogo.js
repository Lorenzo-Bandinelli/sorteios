const thisScript = document.querySelector('#thisScript')
const globalVariables = JSON.parse(thisScript.getAttribute('globalvariables'))

//usando return nos ifs abaixo para evitar nesting
function nomeCorreto(nome){
    if (nome.length > globalVariables.tamMaxNomeJogador || nome.length < globalVariables.tamMinNomeJogador){
        return false
    }
    return true
}

//quebra o cpf em pedaços em seu pedaços númericos e verifica cada tentando converte-lo
//em um numero, o trecho -00 é permitido mas .000 não é. pretendo melhorar esta verificação
//mas por enquanto funciona suficientemente bem
function cpfCorreto(cpf){
    let trechosCPF = [cpf.slice(0,3), cpf.slice(4,7), cpf.slice(8,11), cpf.slice(12,14)]
    if (trechosCPF.some(esteTrecho => isNaN(Number(esteTrecho)) || Number(esteTrecho) === '' || (Number(esteTrecho) === 0 && esteTrecho !== '00'))){
        return false
    }
    return true
}

//quebra o jogo em pedaços númericos e verifica cada um, similar a função cpfCorreto, mas neste
//caso verifica para número menores que 1 e maiores que 0
function jogoCorreto(jogo){
    let trechosJogo = [jogo.slice(0,2), jogo.slice(3,5), jogo.slice(6,8), jogo.slice(9,11), jogo.slice(12,14)]
    //é importante salientar que na minha implementação o programa não aceita jogos com valores repetidos 
    //exemplo o jogo 50-50-50-50-50 é inválido, assim como o jogo 01-02-03-04-01, pois cada número jogado deve ser único
    //optei fazer assim pois é o que se vê mais comumente nos jogos 

    console.log(new Set(trechosJogo).size);
    if (trechosJogo.some(esteTrecho => isNaN(Number(esteTrecho)) || Number(esteTrecho) === '' || Number(esteTrecho) < 1 || Number(esteTrecho) > 50 || new Set(trechosJogo).size < 5)){
        return false
    }
    return true
}

//toda vez que o usuario digita algo, roda a função desejada de mascara
//no valor do objeto que o navegador devolve 
function mascara(objeto,funcao){
    objeto.value=funcao(objeto.value)
}

//funcao generica de mascarar o cpf 
function mascararCPF(valor){
    return valor
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

//mascara que criei para formatar os jogos em um molde esperado
function mascararJogo(valor){
    return valor
        .replace(/\D/g, "")
        .replace(/([^0][6-9].)|([^0][5][1-9])|00/gm, '')             //.replace(/([6-9].)|([5][1-9])|00/gm, '') esse era um regex antigo que testei e bugou
        .replace(/(\d{2})(\d)/, "$1-$2")                             //quando tentei fazer a sequencia dos primeiros primos 02-03-05-07-11, fica aqui como base                                                               
        .replace(/(\d{2})(\d)/, "$1-$2")                             //se for necessário algum dia
        .replace(/(\d{2})(\d)/, "$1-$2")
        .replace(/(\d{2})(\d)/, "$1-$2")
}

//função generica de gerar números em um escpo
function genRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

//para os numeros entre 1 e 9 devolve uma versão escrita com 0 na frente
//ex: input 1 output 01
function formatNumber(num){
    if (num.toString().length === 1){
        return num.toString().replace (/^/,'0');
    }
    return num.toString()
}

function apostaSurpresinha(){
    //cria um set para adicionar os valores aleatórios, note que o Set foi utilizado
    //pois ele só aceita valores exclusivos, então 01-01-03-04-05 nunca vai acontecer por exemplo
    //pois repete o 0
    let listaNumeros = new Set()
    while(listaNumeros.size < 5){
        let randomNumber = genRandomNumber(1, 50)
        listaNumeros.add(formatNumber(randomNumber))
    }
    listaNumeros = Array.from(listaNumeros)
    return `${listaNumeros[0]}-${listaNumeros[1]}-${listaNumeros[2]}-${listaNumeros[3]}-${listaNumeros[4]}`
}

function addAposta(event){
    let aposta = apostaSurpresinha()
    let inputJogo = document.querySelector('.jogo')
    inputJogo.value = aposta
}

const botãoSurpresa = document.querySelector('.buttonNumerosAleatorios')
botãoSurpresa.addEventListener('click', addAposta)
const form = document.querySelector('form')
form.addEventListener('submit', (event)=>{
    event.preventDefault()
    let {nome, jogoFeito, cpf} = Object.fromEntries(new FormData(event.target).entries())
    //return nos ifs abaixo para evitar nesting 
    jogoCorreto(jogoFeito)
    if(!nomeCorreto(nome)){
        alert(`favor inserir nome entre ${globalVariables.tamMinNomeJogador} e ${globalVariables.tamMaxNomeJogador} caracteres`)
        return
    }
    if(!cpfCorreto(cpf)){
        alert('favor inserir um cpf válido')
        return
    }

    if(!jogoCorreto(jogoFeito)){
        alert('favor inserir um jogo válido')
        return
    }
    alert('Jogo Feito com Sucesso!')
    event.target.submit()
    window.reload()
})