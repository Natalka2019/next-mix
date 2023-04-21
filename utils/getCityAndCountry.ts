export const getCityAndCountry = async (latLng: any) => {
    let geocoder = new google.maps.Geocoder();
    let city: string | undefined;
    let country: string | undefined;

    await geocoder.geocode({location: latLng}, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results) {

            const details = results[0].address_components;

            const {extractedCity, extractedCountry} = extractCityAndCountryFromAddress(details);

            city = extractedCity;
            country = extractedCountry;

        }


    });

    return {
        city,
        country
    }
};

export const extractCityAndCountryFromAddress = (details: any) => {

    let city: string | undefined;
    let country: string | undefined;

    for (let i = details.length - 1; i >= 0; i--) {
        for (let j = 0; j < details[i].types.length; j++) {
            if (details[i].types[j] == 'locality') {
                city = details[i].long_name;
            } else if (details[i].types[j] == 'sublocality') {
                city = details[i].long_name;
            } else if (details[i].types[j] == 'neighborhood') {
                city = details[i].long_name;
            } else if (details[i].types[j] == 'postal_town') {
                city = details[i].long_name;
            } else if (details[i].types[j] == 'administrative_area_level_2') {
                city = details[i].long_name;
            }
            // from "google maps API geocoding get address components"
            // https://stackoverflow.com/questions/50225907/google-maps-api-geocoding-get-address-components
            if (details[i].types[j] == "country") {
                country = details[i].long_name;
            }
        }
    }

    return {extractedCity: city, extractedCountry: country}
};