const createGoogleMapsMock = require('./src/createGoogleMapsMock')

describe('createGoogleMapsMock', () => {
    let googleMaps;

    beforeEach(() => {
        googleMaps = createGoogleMapsMock();
    });

    it('should create a map mock', () => {
        const mapDiv = document.createElement('div');
        new googleMaps.Map(mapDiv);

        // The function was called exactly once
        expect(googleMaps.Map).toHaveBeenCalledTimes(1);

        // The function was instantiated exactly once
        expect(googleMaps.Map.mock.instances.length).toBe(1);

        // The last call to the function was called with the 'mapDiv' argument
        expect(googleMaps.Map).toHaveBeenLastCalledWith(mapDiv);
    });

    it('should return the country name and ISO code', () => {
        // Coordinates for somewhere in the US
        const latlng = { lat: 23.174723750933826, lng: -102.97275240819592 }
        const results = [
            {
                "address_components": [
                    {
                        "long_name": "80834",
                        "short_name": "80834",
                        "types": [
                            "postal_code"
                        ]
                    },
                    {
                        "long_name": "Seibert",
                        "short_name": "Seibert",
                        "types": [
                            "locality",
                            "political"
                        ]
                    },
                    {
                        "long_name": "Colorado",
                        "short_name": "CO",
                        "types": [
                            "administrative_area_level_1",
                            "political"
                        ]
                    },
                    {
                        "long_name": "United States",
                        "short_name": "US",
                        "types": [
                            "country",
                            "political"
                        ]
                    }
                ],
                "formatted_address": "Seibert, CO 80834, USA",
                "geometry": {
                    "bounds": {
                        "south": 38.97982289999999,
                        "west": -103.0625868,
                        "north": 39.641216,
                        "east": -102.743031
                    },
                    "location": {
                        "lat": 39.2850958,
                        "lng": -102.8744945
                    },
                    "location_type": "APPROXIMATE",
                    "viewport": {
                        "south": 38.97982289999999,
                        "west": -103.0625868,
                        "north": 39.641216,
                        "east": -102.743031
                    }
                },
                "place_id": "ChIJoZO7OhLUcocRRTHmaOm0O3s",
                "types": [
                    "postal_code"
                ]
            },
            {
                "address_components": [
                    {
                        "long_name": "Cheyenne County",
                        "short_name": "Cheyenne County",
                        "types": [
                            "administrative_area_level_2",
                            "political"
                        ]
                    },
                    {
                        "long_name": "Colorado",
                        "short_name": "CO",
                        "types": [
                            "administrative_area_level_1",
                            "political"
                        ]
                    },
                    {
                        "long_name": "United States",
                        "short_name": "US",
                        "types": [
                            "country",
                            "political"
                        ]
                    }
                ],
                "formatted_address": "Cheyenne County, CO, USA",
                "geometry": {
                    "bounds": {
                        "south": 38.6124499,
                        "west": -103.1729429,
                        "north": 39.0470818,
                        "east": -102.044792
                    },
                    "location": {
                        "lat": 38.8002562,
                        "lng": -102.6216211
                    },
                    "location_type": "APPROXIMATE",
                    "viewport": {
                        "south": 38.6124499,
                        "west": -103.1729429,
                        "north": 39.0470818,
                        "east": -102.044792
                    }
                },
                "place_id": "ChIJ06Mi_fHvDIcRDEW5WOdybNY",
                "types": [
                    "administrative_area_level_2",
                    "political"
                ]
            },
            {
                "address_components": [
                    {
                        "long_name": "Colorado",
                        "short_name": "CO",
                        "types": [
                            "administrative_area_level_1",
                            "political"
                        ]
                    },
                    {
                        "long_name": "United States",
                        "short_name": "US",
                        "types": [
                            "country",
                            "political"
                        ]
                    }
                ],
                "formatted_address": "Colorado, USA",
                "geometry": {
                    "bounds": {
                        "south": 36.992424,
                        "west": -109.060256,
                        "north": 41.0034439,
                        "east": -102.040878
                    },
                    "location": {
                        "lat": 39.5500507,
                        "lng": -105.7820674
                    },
                    "location_type": "APPROXIMATE",
                    "viewport": {
                        "south": 36.992424,
                        "west": -109.060256,
                        "north": 41.0034439,
                        "east": -102.040878
                    }
                },
                "place_id": "ChIJt1YYm3QUQIcR_6eQSTGDVMc",
                "types": [
                    "administrative_area_level_1",
                    "political"
                ]
            },
            {
                "address_components": [
                    {
                        "long_name": "United States",
                        "short_name": "US",
                        "types": [
                            "country",
                            "political"
                        ]
                    }
                ],
                "formatted_address": "United States",
                "geometry": {
                    "bounds": {
                        "south": 18.7763,
                        "west": 170.5957,
                        "north": 71.5388001,
                        "east": -66.885417
                    },
                    "location": {
                        "lat": 37.09024,
                        "lng": -95.712891
                    },
                    "location_type": "APPROXIMATE",
                    "viewport": {
                        "south": 18.7763,
                        "west": 170.5957,
                        "north": 71.5388001,
                        "east": -66.885417
                    }
                },
                "place_id": "ChIJCzYy5IS16lQRQrfeQ5K5Oxw",
                "types": [
                    "country",
                    "political"
                ]
            }
        ];

        var geocoder = new googleMaps.Geocoder();
        geocoder.geocode = jest.fn((location, callback) => callback(results, 'OK'));

        geocoder.geocode({ location: latlng }, (results, status) => {
            if (status == googleMaps.GeocoderStatus.OK) {
                // Loop through results to get ISO code
                for (var i = 0; i < results[0].address_components.length; i++) {
                    var addressObj = results[0].address_components[i];
                    for (var j = 0; j < addressObj.types.length; j++) {
                        if (addressObj.types[j] === 'country') {
                            var ISO = addressObj.short_name;
                            break;
                        }
                    }
                }

                var countryName = results[results.length - 1].formatted_address;

                // Country name should be "United States"
                expect(countryName).toEqual('United States');

                // ISO code should be "US"
                expect(ISO).toEqual('US');
            }
        });

        // Assert
        expect(geocoder.geocode).toHaveBeenCalled();
    });
});