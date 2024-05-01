const express = require('express')
const app = express()
const cheerio = require('cheerio')
const axios = require('axios')
const url = 'https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap'
const urlBase = 'https://es.wikipedia.org'
const links = []
const parrafos = []
const images = []
const scraping = async (urlBase, linkArray) => {
    const dataBase = []
    const axiosPromises = []
    linkArray.map(element => {
        axiosPromises.push(axios.get(urlBase + element))
    })
    const responses = await Promise.all(axiosPromises)
    responses.map(element => {
        const obj = {}
        const html = element.data
        const $ = cheerio.load(html)
        $('p').each((index, element) => {
            const parrafo = $(element).text()
            parrafos.push(parrafo)
        })

        $('img').each((index, element) => {
            const image = $(element).attr('src')
            images.push(image)
        })

        obj.title = $('h1').text()
        obj.parrafos = parrafos
        obj.imagenes = images
        dataBase.push(obj)
    
    })
    return dataBase
}

app.get('/', (req, res) => {
    axios.get(url).then(response => {
        if (response.status === 200) {
            const html = response.data
            const $ = cheerio.load(html)
            $('.mw-category-columns a').each((index, element) => {
                const link = $(element).attr('href')
                links.push(link)
            })

        }
        return links
    }).then(linksList => scraping(urlBase, linksList))
    .then(info => res.json(info))

})
app.listen(3000, () => {
    console.log('Server on')
})