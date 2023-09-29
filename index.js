const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const csvData = fs.readFileSync(
    path.join(__dirname, 'data', 'magento_customer_list.csv'),
    'utf-8'
);

const capitalizeAddress = (address) => {
    return address.split(' ').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
};

const convertUserCSVToJSON = (csv) => {
    const results = Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
    });

    results.data.forEach(record => {
        // Convert 'customer_since' values into Date objects
        if (record.customer_since) {
            record.customer_since = new Date(record.customer_since);
        }

        // Assuming the zip code column is named 'zipcode'. Adjust the key if it's named differently.
        if (record.zip && record.zip.length < 5) {
            record.zip = record.zip.padStart(5, '0');
        }

        // Normalize street address
        if (record.street_address) {
            record.street_address = capitalizeAddress(record.street_address);
        }
    });

    return results.data;
};

console.log(convertUserCSVToJSON(csvData));
