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

	results.data.forEach((record) => {
		if (record.customer_since) {
			record.customer_since = new Date(record.customer_since)
		}

		if (record.zip && record.zip.length < 5) {
			record.zip = record.zip.padStart(5, '0')
		}
	})

	return results.data
}

console.log(convertUserCSVToJSON(csvData))
