const createGoogleMapsMock = require('./src/createGoogleMapsMock');

describe('user markers', () => {
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


  it('should return latitude and longitude', () => {
    const addy = 'vancouver';
    const results = [
      {"address_components":[{"long_name":"Vancouver","short_name":"Vancouver","types":["locality","political"]},
      {"long_name":"Metro Vancouver","short_name":"Metro Vancouver","types":["administrative_area_level_2","political"]},
      {"long_name":"British Columbia","short_name":"BC","types":["administrative_area_level_1","political"]},
      {"long_name":"Canada","short_name":"CA","types":["country","political"]}],
      "formatted_address":"Vancouver, BC, Canada",
      "geometry":{"bounds":{"south":49.19817700000001,"west":-123.22474,"north":49.3172939,"east":-123.023068},"location":{"lat":49.2827291,"lng":-123.1207375},"location_type":"APPROXIMATE","viewport":{"south":49.19817700000001,"west":-123.22474,"north":49.3172939,"east":-123.023068}},
      "place_id":"ChIJs0-pQ_FzhlQRi_OBm-qWkbs","types":["locality","political"]}
    ];

    var geocoder = new googleMaps.Geocoder();
    geocoder.geocode = jest.fn((location, callback) => callback(results, 'OK'));

    geocoder.geocode({ address: addy }, (results, status) => {
      if (status === "OK") {
          latitude = results[0].geometry.location.lat;
          longitude = results[0].geometry.location.lng;
      } else {
          alert("Geocode was not successful for the following reason: " + status);
      }

      // latitude should be 49.2827291
      expect(latitude).toEqual(49.2827291);

      // longitude should be -123.1207375
      expect(longitude).toEqual(-123.1207375);
    });

  });

});

