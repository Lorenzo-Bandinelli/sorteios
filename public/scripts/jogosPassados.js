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

//manda uma mensagem de whatsapp para o administrador/responsavel (para este exemplo está mandando para o meu whatsapp pessoal) 
//pela premiação com os dados necessários para verificação como o id e o jogo ganhador, a partir do whats o resonsavel
//deverá pedir a documentação para averiguar o cpf e prosseguir com o pagamento via método desejado (pix, transferencia bancaria etc...)
//após clicado em reivindicar é removido o jogo retirado da listaDeGanhadoresNaoRetiraram dentro de sorteioFinalizado na db
function reivindicarPremio(event){
    alert('Pedindo Premio, por favor não modifique a mensagem pre-inserida')
    const esteJogo = event.target.parentElement
    const esteId = esteJogo.getAttribute('id')
    const cpf = document.querySelector('.main').getAttribute('cpf')
    let jogoGanhador = esteJogo.querySelector('.jogoGanhador > .valores')
    jogoGanhador = jogoGanhador.innerText
    let urlText = encodeURIComponent(`olá eu ganhei o jogo de id ${esteId} com o jogo ${jogoGanhador}`)
    window.open(`https://api.whatsapp.com/send?phone=5551984018999&text=${urlText}`, '_blank')
    let xhr = new XMLHttpRequest();
    xhr.open("DELETE", "/user/jogosPassados");
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(JSON.stringify({esteId, jogoGanhador, cpf}));
    location.reload()
}



//adiciona a função de reivindicar premio a todos os botoes
const allButtonReivindicarPremio = document.querySelectorAll('.reivindicarPremio')
allButtonReivindicarPremio.forEach(buttonReivindicarPremio =>{
    buttonReivindicarPremio.addEventListener('click', reivindicarPremio)
})
