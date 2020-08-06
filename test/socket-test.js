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

  describe('My Test Suite', () => {
    it('My Test Case', () => {
      expect(true).toEqual(true);
    });
  });

});

