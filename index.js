const fs = require('fs')
const path = require('path')
const Papa = require('papaparse')

const csvData = fs.readFileSync(
	path.join(__dirname, 'data', 'magento_customer_list.csv'),
	'utf-8'
)

const convertUserCSVToJSON = (csv) => {
	const results = Papa.parse(csv, {
		header: true,
		skipEmptyLines: true,
	})
	return results.data
}

console.log(convertUserCSVToJSON(csvData))
