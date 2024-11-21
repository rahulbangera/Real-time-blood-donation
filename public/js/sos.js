let userLocation = { lat: 12.58, lng: 77.35 };
let place_id;
let lat;
let lng;
let name;

async function initMap(mapId) {
  const initialPosition = { lat: 12.58, lng: 77.35 };
  const { Map } = await google.maps.importLibrary("maps");
  await google.maps.importLibrary("places");

  const map = new Map(document.getElementById(mapId), {
    zoom: 6,
    center: initialPosition,
    scrollwheel: true,
    gestureControl: true,
    mapId: "DEMO_MAP_ID",
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("User location:", position);
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        map.setCenter(userLocation);
        map.setZoom(15);
        new google.maps.Marker({
          position: userLocation,
          map: map,
          title: "You are here",
        });
      },
      (error) => {
        console.error("Error getting user location:", error);
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
  }

  const service = new google.maps.places.PlacesService(map);
  service.nearbySearch(
    {
      location: userLocation,
      radius: 10000,
      type: "hospital",
    },
    (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        console.log("Hospital data:", results);
        results.forEach((hospital) => {
          new google.maps.Marker({
            position: hospital.geometry.location,
            map: map,
            title: hospital.name,
            icon: {
              url: "https://maps.google.com/mapfiles/ms/icons/hospital.png",
            },
          });
        });
      } else {
        console.error("PlacesService failed:", status);
        alert("Could not load hospital data. Please try again.");
      }
    }
  );
}
function initAutocomplete() {
  const input = document.getElementById("hospital");

  const autocomplete = new google.maps.places.Autocomplete(input, {
    types: ["establishment"],
    componentRestrictions: { country: "in" },
    fields: ["place_id", "geometry", "name", "types"],
  });

  console.log("Autocomplete: ", autocomplete);

  autocomplete.addListener("place_changed", () => {
    console.log("Place changed");
    const place = autocomplete.getPlace();
    console.log("Place: ", place);
    if (!place.geometry) {
      return;
    }
    if (place.types.includes("hospital")) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const name = place.name;
      place_id = place.place_id;

      map.setCenter({ lat, lng });
      new google.maps.Marker({
        position: { lat, lng },
        map,
        title: name,
      });
      alert(
        "Hospital: " + place.name + " Latitude: " + lat + " Longitude: " + lng
      );
      console.log(lat, lng, name);
      const confirmation = confirm(
        "Not a Hospital, are you sure you want to continue"
      );

      if (confirmation) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const name = place.name;
        place_id = place.place_id;

        map.setCenter({ lat, lng });
        new google.maps.Marker({
          position: { lat, lng },
          map,
          title: name,
        });
      }

      else{
        alert("Please select a hospital");
      }
    }
  });
}

document.getElementById('submitRequest').addEventListener('click', async () => {

});


window.onload = () => {
  initMap("map");
  initAutocomplete();
};