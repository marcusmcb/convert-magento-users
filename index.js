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

function normalizeAddress(address) {
	return address.replace(/\w\S*/g, function (txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
	})
}

function capitalizeFirstLetter(str) {
	// console.log('NAME STRING: ', str)
	const words = str.split(' ').filter((word) => word) // Split the string and remove empty strings
	const capitalizedWords = words.map(
		(word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
	)

	return {
		firstName: capitalizedWords[0] || '', // First word or empty string if no words
		lastName: capitalizedWords.slice(1).join(' '), // Rest of the words as last name
	}
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

		if (record.street_address) {
			record.street_address = capitalizeAddress(record.street_address)
		}
	})
	return results.data
}

const customerList = convertUserCSVToJSON(csvData)

let masterUserList = []

const addUsersToStrapiCMS = async (customerList) => {
	customerList.forEach((customer) => {
		const { firstName, lastName } = capitalizeFirstLetter(customer.name)

		const user = {
			username: customer.email,
			email: customer.email,
			password: '123456',
			confirmed: true,
			blocked: false,
			role: 'Public',
			first_name: firstName,
			last_name: lastName,
			street_address: normalizeAddress(customer.street_address),
			city: customer.city,
			state: customer.state,
			zip: customer.zip,
		}
		// console.log(user)
		masterUserList.push(user)
	})

	for (let user of masterUserList) {
		try {
			await axios.post('http://127.0.0.1:1337/api/auth/local/register', user, {
				headers: {
					'Content-Type': 'application/json',
					'Accept': '*/*'
				}
			})
			console.log("USER ADDED: ", user)
		} catch (error) {
			console.error("STRAPI API ERROR: ", error)
		}
	}
}
setTimeout(() => {
	console.log('---- HERE ----')
	console.log(masterUserList[0])
}, 1000)

addUsersToStrapiCMS(customerList)

// addUsersToStrapiCMS(customerList)

// const getStrapiUsers = async() => {
// 	try {
// 		await axios.get('http://127.0.0.1:1337/api/users').then(data => console.log("DATA: ", data))
// 	} catch (error) {
// 		console.log("ERROR FETCHING USERS: ")
// 		console.log(error)
// 	}
// }

// console.log(getStrapiUsers())
