const fs = require('fs')

class ChartManager {
    existsChart(countryName) {
        const path = `../../data/${countryName}`
        return fs.existsSync(path)
    }

    filterData(data) {
        // obj keys = ['TotalConfirmed', 'TotalDeaths', 'TotalRecovered', 'TotalActive', 'Date', SortKey]
        return data.reduce((acc, item) => {
            let date = new Date(item.Date)
            let obj = acc.find(e => e.Date === (date.getFullYear().toString() + '-' + (date.getMonth() + 1).toString()))
            if (obj === undefined) {
                acc.push({
                    TotalConfirmed: item.Confirmed,
                    TotalDeaths: item.Deaths,
                    TotalRecovered: item.Recovered,
                    TotalActive: item.Active,
                    Date: date.getFullYear().toString() + '-' + (date.getMonth() + 1).toString(),
                    SortKey: (date.getFullYear() - 1) * 12 + (date.getMonth())
                })
            } else {
                obj.TotalConfirmed += item.Confirmed
                obj.TotalDeaths += item.Deaths
                obj.TotalRecovered += item.Recovered
                obj.TotalActive += item.Active
            }
            return acc
        }, [])
    }

    async createChart(countryName, data) {
        data = this.filterData(data)
        //TODO: request to Python server. & create Flask server
        return true
    }
}

module.exports = new ChartManager()
