const axios = require('axios')
const chartManager = require('../chart')

class Covid19 {

    constructor() {
        this.countriesName = null
        this.global = null
        this.countriesCache = {}
    }

    async fetchCountries(start) {
        const intervalFetch = async (start, finish) => {
            console.log(`fetching from ${start} -> ${finish}`)
            if (start >= this.countriesName.length) {
                console.log('fetch done!')
                return -1
            }
            let promises = []
            for (let i = start; i < finish; i ++) {
                let name = this.countriesName[i]
                promises.push(axios.get('https://api.covid19api.com/country/' + name))
            }
            return Promise.all(promises)
                .then((result) => {
                    for (let i = start; i < finish; i++) {
                        console.log(result[i - start].status)
                        let name = this.countriesName[i]
                        this.countriesCache[name] = result[i - start].data
                    }
                    return finish
                })
                .catch(err => {
                    let name = err.config.url.split('/')[4]
                    let id = this.countriesName.findIndex(e => e === name)
                    return (id + 1 >= this.countriesName.length ? -1 : id + 1)
                })
        }

        setTimeout(async () => {
            let newStart = await intervalFetch(start, Math.min(start + 5, this.countriesName.length))
            if (newStart !== -1) {
                this.fetchCountries(newStart)
            }
        }, 1000)
    }

    fetchData() {
        axios.get('https://api.covid19api.com/summary')
            .then((result) => {
                this.global = result.data
            })
            .catch((err) => {
                console.log(err)
            })

        axios.get('https://api.covid19api.com/countries')
            .then((result) => {
                this.countriesName = result.data.reduce((acc, item) => {
                    acc.push(item.Slug)
                    return acc
                }, [])
            })
            .then(() => {
                this.fetchCountries(0)
            })
            .catch(err => console.log(err))
    }

    validName(name) {
        return (this.countriesName.find(iname => iname === name) !== undefined)
    }

    getGlobal() {
        return this.global
    }

    getCountry(country, datetime) {
        if (this.countriesCache[country] === undefined) {
            return undefined
        }
        return this.countriesCache[country].find(e => equal(new Date(e.Date), datetime))
    }

    queryGlobal() {
        let result = this.getGlobal()
        return Object.entries(result.Global).reduce((acc, pair) => {
            acc += pair[0].toString() + ': ' + pair[1].toString() + '\n'
            return acc
        }, '')
    }

    queryCountry(options) {
        if (!this.validName(options.country)) {
            return "invalid country name!"
        }
        options.country = options.country.toLowerCase()
        let ret
        if (options.datetime === null) {
            let result = this.getGlobal()
            result = result.Countries.find(element => element.Slug === options.country)
            const keys = ['Country', 'NewConfirmed', 'TotalConfirmed', 'NewDeaths', 'TotalDeaths', 'NewRecovered', 'TotalRecovered', 'Date']
            ret = keys.reduce((acc, key) => {
                acc += key + ': ' + result[key].toString() + '\n'
                return acc
            }, '')
        } else {
            let result = this.getCountry(options.country, options.datetime)
            if (result === undefined) {
                ret = `data not updated at ${options.datetime}`
            } else {
                const keys = ['Country', 'Confirmed', 'Deaths', 'Recovered', 'Active', 'Date']
                ret = keys.reduce((acc, item) => {
                    acc += item + ': ' + result[item].toString() + '\n'
                    return acc
                }, '')
            }
        }
        return ret
    }

    async loadChart(countryName) {
        countryName = countryName.toLowerCase()
        if (!this.validName(countryName) || (this.countriesCache[countryName] === undefined)) {
            return false
        }
        if (chartManager.existsChart(countryName)) {
            return true
        }
        return chartManager.createChart(countryName, this.countriesCache[countryName])
    }
}

function equal(date, inputDate) {
    inputDate = inputDate.split('-')
    return (date.getDate() === Number(inputDate[0])
        && date.getMonth() + 1 === Number(inputDate[1])
        && date.getFullYear() === Number(inputDate[2]))
}

module.exports = new Covid19()
