const {parse:dateParse, format:dateFormat, parseISO, isMatch} = require('date-fns')

const mainDiv = document.querySelector('.main')

//toda vez que o usuario digita algo, roda a função desejada de mascara
//no valor do objeto que o navegador devolve 
function mascara(objeto,funcao){
    objeto.value=funcao(objeto.value)
}

function mascararData(valor){
    return valor
    .replace(/\D/g,"")
    .replace(/(\d{2})(\d)/,"$1/$2") 
    .replace(/(\d{2})(\d)/,"$1/$2") 
}

//pegando as globalVariables do html
let globalVariables = thisScript.getAttribute('globalVariables')
globalVariables = JSON.parse(globalVariables)

const months = {
    Jan: '01',
    Feb: '02',
    Mar: '03',
    Apr: '04',
    May: '05',
    Jun: '06',
    Jul: '07',
    Aug: '08',
    Sep: '09',
    Oct: '10',
    Nov: '11',
    Dec: '12',
  }
//substitui a formatação do mongoDB no frontend
let todasDatas = document.querySelectorAll('span[objectkey="createdAt"]')
for (let data of todasDatas){
    let dataText = data.innerText
    //note que a função que essa substituição espera que a data vinda do mongoDB
    //siga um formato parecido com este: 'Mon Mar 18 2024 02:39:22 GMT-0300 (Horário Padrão de Brasília)'
    data.innerHTML = `${dataText.slice(8,10)}/${months[dataText.slice(4,7)]}/${dataText.slice(11,15)}`
}

//usando return nos ifs abaixo para evitar nesting
function nomeCorreto(nome){
    if (nome.length > globalVariables.tamMaxNomeJogo || nome.length < globalVariables.tamMinNomeJogo){
        return false
    }
    return true
}
function dataCorreta(dataPrevista){
    //note que aqui o == foi usado ao invés de === pois o segundo não funciona como esperado,  provavelmente o retorno da função não
    //é uma string então apenas == funciona
    console.log(isMatch(dataPrevista, 'dd/mm/yyyy'));
    if(dateParse(dataPrevista, 'dd/mm/yyyy', new Date()) == 'Invalid Date'){
        return false
    }
    return true
}

function sendPatch(event){
    event.preventDefault()
    let formEntries = Object.fromEntries(new FormData(event.target).entries())
    //usando return nos ifs abaixo para evitar nesting
    if (!nomeCorreto(formEntries.nome)){
        alert(`Insira um nome com mais que ${globalVariables.tamMinNomeJogo} e menos que ${globalVariables.tamMaxNomeJogo} caracteres`)
        return
    }
    if (!dataCorreta(formEntries.dataPrevistaSorteio)){
        alert('favor inserir data na seguinte formatação dd/mm/aaaa')
        return
    }
    let xhr = new XMLHttpRequest();
    xhr.open("PATCH", "/admin/showGames");
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(JSON.stringify(formEntries));
    alert('Inserindo atualização, clique em OK e aguarde um momento por favor')
    //não sei mesmo pq esse reload demora tanto, mas ok.
    window.location.reload()
}

function editSorteio(event){
    //seleciona todos os valores dentro do sorteio que foi clicado editar
    //note que o querySelectorAll foi utilizado aqui para evitar hardcoding e facilitar
    //a manuntenção no caso de mais valores serem adicionados ao cartão do sorteio
    //no clientside
    const currentId = event.target.parentElement.parentElement.id
    let jogoAtual = document.getElementById(currentId)
    let todosValores = jogoAtual.querySelectorAll('p > .valores')
    let buttonDiv = jogoAtual.querySelector('.buttons')
    let launchSeeButtons = jogoAtual.querySelector(' .launchSeeButtons')
    buttonDiv.remove()

    let updateForm = document.createElement('form')
    jogoAtual.appendChild(updateForm)
    updateForm.id = 'updateForm'
    updateForm.style.display = 'none'
    updateForm.method = 'patch'
    updateForm.action = '/admin/showGames'

    let submitEditForm = document.createElement('input')
    submitEditForm.type = 'submit'
    submitEditForm.setAttribute('form', 'updateForm')
    submitEditForm.classList.add('enviarEdit')
    jogoAtual.replaceChild(submitEditForm, launchSeeButtons)


    let hiddenParam = document.createElement('input')
    hiddenParam.setAttribute('name', 'id');
    hiddenParam.setAttribute('value', currentId);
    hiddenParam.setAttribute('type', 'hidden')

    updateForm.appendChild(hiddenParam)

    for (let i =0; i< todosValores.length; i++){
        let element = todosValores[i]
        let dbKey = element.attributes.objectkey.value
        let oldValue = element.textContent
        //não se pode mudar a data de criação
        if(dbKey === 'createdAt'){
            continue

        }
        let currentElementInput = document.createElement('input')
        currentElementInput.setAttribute('form', 'updateForm')
        currentElementInput.setAttribute('name', `${dbKey}`)
        if(i === 0){
            currentElementInput.setAttribute('name', 'nome')
        } else{
            currentElementInput.setAttribute("maxlength", "10")
            currentElementInput.setAttribute("pattern", ".{10,10}")
            currentElementInput.setAttribute("required", "required")
            currentElementInput.setAttribute("onkeypress", 'mascara(this, mascararData)')
        }
        currentElementInput.value = oldValue
        element.replaceChild(currentElementInput, element.firstChild)
    }

    updateForm.addEventListener('submit', sendPatch)
}

function removeSorteio(event){
    const currentId = event.target.parentElement.parentElement.id
        let userConfirmed = confirm('Tem certeza que deseja remover este sorteio?\nEsta ação não pode ser desfeita')
        if(userConfirmed){
            let xhr = new XMLHttpRequest();
            xhr.open("DELETE", "/admin/showGames");
            xhr.setRequestHeader('Content-type', 'application/json');
            xhr.send(JSON.stringify({currentId}));
            history.go(0)
        }    
}

mainDiv.addEventListener('click', (event) => {
    //se clicou em editar...
    if (event.target.classList.contains('editButton')){
        editSorteio(event)
    }
    //se clicou em remover...
    else if (event.target.classList.contains('removeButton')){
        removeSorteio(event)
    }
})