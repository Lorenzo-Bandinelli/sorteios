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

const form = document.querySelector('form')
form.addEventListener('submit', (event)=>{
    event.preventDefault()
    let {cpf} = Object.fromEntries(new FormData(event.target).entries())
    if(!cpfCorreto(cpf)){
        alert('favor inserir um cpf válido')
        return
    }
    //formata o cpf para ir pra url
    cpf = cpf.slice(0,3) + cpf.slice(4,7) + cpf.slice(8,11) + cpf.slice(12,14)
    // event.target.setAttribute('action', `/meusJogos/${cpf}`)
    event.target.submit()
})