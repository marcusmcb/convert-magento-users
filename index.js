const fs = require('fs')
const path = require('path')
const Papa = require('papaparse')
const axios = require('axios')

const csvData = fs.readFileSync(
	path.join(__dirname, 'data', 'magento_customer_list.csv'),
	'utf-8'
)

const capitalizeAddress = (address) => {
	return address
		.split(' ')
		.map((word) => {
			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
		})
		.join(' ')
}

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

		// Normalize street address
		if (record.street_address) {
			record.street_address = capitalizeAddress(record.street_address)
		}
	})

	return results.data
}

// console.log(convertUserCSVToJSON(csvData))
const customerList = convertUserCSVToJSON(csvData)

// for (let i = 0; i < customerList.length; i++) {
// 	const user = {
// 		data: {
// 			username: customerList[i].email,
// 			email: customerList[i].email,
// 			password: '',
// 			confirmed: true,
// 			blocked: false,
// 			role: 'Public',
// 			name: customerList[i].name,
// 			street_address: customerList[i].street_address,
// 			city: customerList[i].city,
// 			state: customerList[i].state,
// 			zip: customerList[i].zip,
// 		},
// 	}
// 	axios.post('http://127.0.0.1:1337/users', user, {
// 		headers: {
// 			'Content-Type': 'application/json',
// 		},
// 	})
// }

let masterUserList = []

const addUsersToStrapiCMS = async (customerList) => {
	customerList.forEach((customer) => {
		const user = {
			username: customer.email,
			email: customer.email,
			password: '123456',
			confirmed: true,
			blocked: false,
			role: 'Public',
			name: customer.name,
			street_address: customer.street_address,
			city: customer.city,
			state: customer.state,
			zip: customer.zip,
		}
		// console.log('-----------')
		// console.log(user)
		masterUserList.push(user)
	})
	console.log(masterUserList[0])
	try {
		axios.post(
			'http://127.0.0.1:1337/api/auth/local/register',
			masterUserList[0],
			{
				headers: {
					'Content-Type': 'application/json',
					Accept: '*/*',
				},
			}
		)
		// console.log('SUCCESSFULLY ADDED: ', user)
	} catch (error) {
		console.log('************')
		console.log(
			'Error inserting user into collection: ',
			error.response.data.error.details.errors
		)
	}
}

addUsersToStrapiCMS(customerList)
// console.log('HERE: ', masterUserList[0])
