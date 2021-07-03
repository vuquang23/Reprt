const axios = require('axios')

class Covid19 {

    constructor() {
        this.countriesName = null
    }

    async updateCountriesName() {
        if (this.countriesName === null) {
            return new Promise((resolve, reject) => {
                axios.get('https://api.covid19api.com/countries')
                    .then((result) => {
                        this.countriesName = result.data.reduce((acc, item) => {
                            acc.push(item.Slug)
                            return acc
                        }, [])
                        resolve(null)
                    })
                    .catch(err => console.log(err))
            })
        }
    }

    async validName(name) {
        await this.updateCountriesName()
        return (this.countriesName.find(iname => iname === name))
    }

    getGlobalApi() {
        return new Promise((resolve, reject) => {
            axios.get('https://api.covid19api.com/summary')
                .then((result) => {
                    resolve(result)
                })
                .catch((err) => {
                    console.log(err)
                })
        })
    }

    getCountryApi(country, datetime) {
        return new Promise((resolve, reject) => {
            axios.get('https://api.covid19api.com/country/' + country)
                .then(result => {
                    result = result.data.find(element => equal(new Date(element.Date), datetime))
                    resolve(result)
                })
                .catch(err => console.log(err))
        })
    }

    async queryGlobal() {
        let result = await this.getGlobalApi()
        return Object.entries(result.data.Global).reduce((acc, pair) => {
            acc += pair[0].toString() + ': ' + pair[1].toString() + '\n'
            return acc
        }, '')
    }

    async queryCountry(options) {
        if (await this.validName(options.country) === false) {
            return "invalid country name!"
        }
        options.country = options.country.toLowerCase()
        let ret
        if (options.datetime === null) {
            let result = await this.getGlobalApi()
            result = result.data.Countries.find(element => element.Slug === options.country)
            const keys = ['Country', 'NewConfirmed', 'TotalConfirmed', 'NewDeaths', 'TotalDeaths', 'NewRecovered', 'TotalRecovered', 'Date']
            ret = keys.reduce((acc, key) => {
                acc += key + ': ' + result[key].toString() + '\n'
                return acc
            }, '')
        } else {
            let result = await this.getCountryApi(options.country, options.datetime)
            if (result === undefined) {
                ret = `no data at ${options.datetime}`
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
}

function equal(date, inputDate) {
    inputDate = inputDate.split('-')
    return (date.getDate() === Number(inputDate[0])
        && date.getMonth() + 1 === Number(inputDate[1])
        && date.getFullYear() === Number(inputDate[2]))
}

module.exports = new Covid19()
