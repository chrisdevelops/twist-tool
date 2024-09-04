const IS_DEBUG = true
function debug(message, data = "") {
	if (IS_DEBUG) {
		console.log(`${message}`, data)
	}
}

function setPackageIds(packageIds) {
	return packageIds.length > 1 ? packageIds.split(',').map(item => item.trim()) : []
}

function setCountryCodes(countryCodes) {
	return countryCodes.length > 1 ? countryCodes.split(',').map(item => item.trim()) : []
}

function setResponseFormat(responseFormat) {
	return responseFormat ? responseFormat : "country"
}

export const actions = {
	default: async ({ request }) => {
		
		const formData = await request.formData();
		const accessToken = formData.get('access_token')
		const packageIds = setPackageIds(formData.get('package_ids'))
		const countryCodes = setCountryCodes(formData.get('country_codes'))
		const responseFormat = setResponseFormat(formData.get('response_format'))
		debug(`[1] Form Fields`, {accessToken, packageIds, countryCodes, responseFormat})

		// Check if accessToken is valid
		const tokenIsValid = await verifyAccessToken(accessToken);
		debug(`[2] Is token valid`, tokenIsValid)
		if (!tokenIsValid) {
			debug(`[2b] Token is invalid`)
			return { 
				success: false,
				field: {
					accessToken,
					packageIds,
					countryCodes,
					responseFormat
				},
				error: {
					field: 'access_token',
					message: 'Access Token Failed'
				}
			};
		}

		// Get list of package ids
		const packageIdList = await getPackageIds(accessToken, packageIds);
		debug(`[3] Get List of Package Ids`, packageIdList)

		// Get final list of requried fields per country / field
		if (responseFormat === 'field') {
			const requiredFields = await twistByField(
				accessToken,
				packageIdList,
				countryCodes
			);
			return {
				success: true,
				format: "field",
				data: requiredFields
			};
		} else {
			const requiredFields = await twistByCountry(
				accessToken,
				packageIdList,
				countryCodes
			);
			return {
				success: true,
				format: 'country',
				data: requiredFields
			};
		}
	}
};

async function verifyAccessToken(accessToken) {
	const response = await testAuthentication(accessToken);
	return response.status === 200;
}

async function getPackageIds(accessToken, packageIdList) {
	const response = await getPackages(accessToken, packageIdList);
	if (packageIdList.length) {
		return await response
			.filter((pkg) => pkg.IsApproved && packageIdList.includes(pkg.PackageIdentifier))
			.map((pkg) => ({
				id: pkg.PackageIdentifier,
				name: pkg.Name
			}));
	} else {
		return await response
			.filter((pkg) => pkg.IsApproved)
			.map((pkg) => ({
				id: pkg.PackageIdentifier,
				name: pkg.Name
			}));
	}
}

async function testAuthentication(accessToken) {
	const response = await fetch('https://api.trulioo.com/v3/connection/testauthentication', {
		headers: new Headers([
			['authorization', `Bearer ${accessToken}`],
			['accept', 'application/json']
		])
	});
	return response;
}

async function getPackages(accessToken) {
	const response = await fetch('https://api.trulioo.com/v3/account/packages', {
		headers: new Headers([['Authorization', `Bearer ${accessToken}`]])
	});
	return await response.json();
}

async function getCountryCodes(accessToken, currentPackage) {
	const response = await fetch(
		`https://api.trulioo.com/v3/configuration/countrycodes/${currentPackage.id}`,
		{
			headers: new Headers([['Authorization', `Bearer ${accessToken}`]])
		}
	);
	console.log(`GET Country Codes => https://api.trulioo.com/v3/configuration/countrycodes/${currentPackage.id}`)
	return await response.json();
}

async function getFieldsByCountry(accessToken, currentPackage, countryCode) {
	const response = await fetch(
		`https://api.trulioo.com/v3/configuration/fields/${currentPackage.id}/${countryCode}`,
		{
			headers: new Headers([['Authorization', `Bearer ${accessToken}`]])
		}
	);
	console.log(`https://api.trulioo.com/v3/configuration/fields/${currentPackage.id}/${countryCode}`)
	return await response.json();
}

function getRequiredFields(schema) {
	const requiredFields = [];

	function traverseSchema(obj) {
		if (obj.required && Array.isArray(obj.required)) {
			for (const item of obj.required) {
				if (typeof item === 'string') {
					requiredFields.push(item);
				}
			}
		}

		for (const key in obj) {
			if (typeof obj[key] === 'object' && obj[key] !== null) {
				traverseSchema(obj[key]);
			}
		}
	}

	traverseSchema(schema);
	return requiredFields;
}

async function twistByField(accessToken, packageIdList, countryCodes = []) {

	debug(`[4] Entered Twist by Country`, {accessToken, packageIdList, countryCodes})
	const twistResponse = [];
	debug(`[5] Country codes length`, countryCodes.length)

	for (const currentPackage of packageIdList) {

		debug(`[6] Package Loop`, currentPackage)
		
		if (!countryCodes.length) {
			debug(`[7a] Get list of country codes`)
			countryCodes = await getCountryCodes(accessToken, currentPackage);
			debug(`[7b] Returned list of country codes`, countryCodes)
		}

		const output = {
			name: currentPackage.name,
			id: currentPackage.id,
			fields: []
		};

		for (const countryCode of countryCodes) {

			debug(`[8] Country code loop -> Get fields by country`, {accessToken, currentPackage, countryCode})
			
			const fields = await getFieldsByCountry(accessToken, currentPackage, countryCode);
			const requiredFields = await getRequiredFields(fields);

			for (const field of requiredFields) {
				const fieldEntry = output.fields.filter((item) => Object.keys(item).includes(field));
				if (!fieldEntry.length) {
					output.fields.push({ [field]: [] });
				}
				const index = output.fields.indexOf(
					Object.values(output.fields).filter((item) => Object.keys(item).includes(field))[0]
				);
				output.fields[index][field].push(countryCode);
			}

		}

		twistResponse.push(output);
	}

	debug(`[9] Twist Response`, JSON.stringify(twistResponse, null, 2))
	return twistResponse;
}

async function twistByCountry(accessToken, packageIdList, countryCodes = []) {
	
	debug(`[4] Entered Twist by Country`, {accessToken, packageIdList, countryCodes})
	const twistResponse = [];
	debug(`[5] Country codes length`, countryCodes.length)
	

	for (const currentPackage of packageIdList) {
		
		debug(`[6] Package Loop`, currentPackage)

		if (!countryCodes.length) {
			debug(`[7a] Get list of country codes`)
			countryCodes = await getCountryCodes(accessToken, currentPackage);
			debug(`[7b] Returned list of country codes`, countryCodes)
		}

		const output = {
			name: currentPackage.name,
			id: currentPackage.id,
			countryList: []
		};

		for (const countryCode of countryCodes) {

			debug(`[8] Country code loop -> Get fields by country`, {accessToken, currentPackage, countryCode})
			const fields = await getFieldsByCountry(accessToken, currentPackage, countryCode);
			
			output.countryList.push({
				code: countryCode,
				requiredFields: getRequiredFields(await fields)
			});
		}

		twistResponse.push(output);
	}
	return twistResponse;
}
