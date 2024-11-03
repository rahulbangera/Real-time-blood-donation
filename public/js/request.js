let map;
let geocoder;
let marker;
let circle;
let nearbyHospitals = [];
let placesService;
let bdGroup;

function showPopup() {
  const popup = document.getElementById("popupSuccess");
  popup.style.display = "block";
  popup.style.opacity = "1";
  popup.style.top = "20px";

  setTimeout(() => {
    popup.style.opacity = "0";
    popup.style.top = "0";
    setTimeout(() => {
      popup.style.display = "none";
    }, 500);
  }, 3000);
}

function findNearbyDonors(nearbyHospitals, bdGroup) {
  let selectedHospitals = [];
  fetch("/nearbysearch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nearbyHospitals, bdGroup }),
  })
    .then((res) => res.json())
    .then((data) => {
      selectedHospitals = data.selectedHospitals;
      console.log("Selected Hospitals:", selectedHospitals);
      document.querySelector(".popupContent").style.animation =
        "popup-disappear 0.6s forwards";

      setTimeout(() => {
        document.getElementById("popupContainer").style.display = "none";
        document.querySelector(".popupContent").style.display = "none";
      }, 600);
      showPopup();
    });
}

window.onload = () => {
  async function initMap() {
    const searchPopup = document.getElementById("popupContainer");
    searchPopup.style.display = "flex";

    const radiusSlider = document.getElementById("radiusSlider");
    const radiusValue = document.getElementById("radiusValue");
    const bloodGroup = document.getElementById("bloodGroup");

    bloodGroup.onchange = () => {
      bdGroup = bloodGroup.value;
    };

    radiusSlider.oninput = () => {
      radiusValue.innerHTML = `${radiusSlider.value} km`;
      updateRadius(radiusSlider.value);
    };

    const initialPosition = { lat: 12.58, lng: 77.35 };
    const { Map } = await google.maps.importLibrary("maps");
    await google.maps.importLibrary("places");

    map = new Map(document.getElementById("map"), {
      zoom: 6,
      center: initialPosition,
      mapId: "DEMO_MAP_ID",
    });
    placesService = new google.maps.places.PlacesService(map);

    geocoder = new google.maps.Geocoder();

    circle = new google.maps.Circle({
      map: map,
      radius: 1000,
      center: initialPosition,
      fillColor: "#FF0000",
      fillOpacity: 0.3,
      strokeWeight: 1,
    });

    marker = new google.maps.Marker({
      position: initialPosition,
      map: map,
      draggable: true,
    });

    navigator.geolocation.getCurrentPosition(
      onSuccessLocation,
      onErrorLocation
    );

    function onSuccessLocation(position) {
      const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setMarkerAndCircle(pos);
      map.setCenter(pos);
      map.setZoom(14);
    }

    function onErrorLocation() {
      console.log("Error fetching location, using default location.");
    }

    map.addListener("click", (e) => {
      const pos = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setMarkerAndCircle(pos);
    });

    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      if (pos) {
        setMarkerAndCircle({
          lat: pos.lat(),
          lng: pos.lng(),
        });
      }
    });

    function setMarkerAndCircle(pos) {
      marker.setPosition(pos);

      circle.setCenter(pos);
      geocoder.geocode({ location: pos }, (results, status) => {
        if (status === "OK" && results[0]) {
          const addressComponents = results[0].address_components;
          const sublocality = addressComponents[1]?.short_name || "";
          const locality = addressComponents[2]?.long_name || "";
          const town = addressComponents[3]?.long_name || "";
          const city = addressComponents[4]?.long_name || "";
          const address = `${sublocality}, ${locality}, ${town} - ${city}`;
          console.log("City:", address);
        } else {
          console.error("Geocoder failed due to:", status);
        }
      });
    }

    function updateRadius(value) {
      const radiusInMeters = value * 1000;
      circle.setRadius(radiusInMeters);
    }

    const searchButton = document.getElementById("searchButton");

    searchButton.onclick = () => {
      if (!bdGroup) {
        alert("Please select blood group");
        return;
      }
      updateNearbyHospitals(bdGroup);
    };

    function updateNearbyHospitals(bdGroup) {
      placesService.nearbySearch(
        {
          location: circle.getCenter(),
          rankBy: google.maps.places.RankBy.DISTANCE,
          type: "hospital",
        },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            const maxDistanceMeters = circle.getRadius();
            nearbyHospitals = results.filter((hospital) => {
              const hospitalLatLng = new google.maps.LatLng(
                hospital.geometry.location.lat(),
                hospital.geometry.location.lng()
              );
              const distance =
                google.maps.geometry.spherical.computeDistanceBetween(
                  circle.getCenter(),
                  hospitalLatLng
                );
              return distance <= maxDistanceMeters;
            });

            console.log("Filtered nearby hospitals:", nearbyHospitals);

            findNearbyDonors(nearbyHospitals, bdGroup);
          } else {
            console.error("Nearby search failed due to:", status);
          }
        }
      );
    }
  }

  initMap();
};
