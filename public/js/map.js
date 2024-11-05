async function initMap() {
    const position = { lat: 12.58, lng: 77.35 };
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    map = new Map(document.getElementById("map"), {
      zoom: 6,
      center: position,
      mapId: "DEMO_MAP_ID",
    });

    map.addListener("click", (e) => {
      const pos = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };

      setMarker(pos);
      map.setCenter(pos);
      map.setZoom(14);
    });

    const geocoder = new google.maps.Geocoder();
  }

