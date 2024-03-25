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