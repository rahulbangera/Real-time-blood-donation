let map;
let geocoder;
let marker;
let circle;
let nearbyHospitals = [];
let placesService;
let bdGroup;
let slicedHospitals = [];
let allHospitals = [];
let initialValue = 0;
let incrementValue = 20;
let finalValue = 0;
let done = false;
let selectedHospitals = [];

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

function updateDonorCards(selectedHospitals) {
  const donorColumn = document.getElementById("donorColumn");
  donorColumn.innerHTML = "";
  selectedHospitals.forEach((donorInfo) => {
    const donorCard = document.createElement("div");
    donorCard.className = "donor-card";
    donorCard.innerHTML = `
      <h3>Donor Name: ${donorInfo.donorName}</h3>
      <p>Blood Group: ${donorInfo.bloodGroup}</p>
      <p>Donor Location: ${donorInfo.donorPlace}</p>
      <p>Hospital: ${donorInfo.name}</p>
    `;
    donorColumn.appendChild(donorCard);
  });
  addEffectToDonorCards();
}

function addEffectToDonorCards() {
  document.querySelectorAll(".donor-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * 10; 
      const rotateY = ((centerX - x) / centerX) * 10; 

      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "rotateX(0) rotateY(0) scale(1)"; 
    });
  });
}

function openMapPopup() {
  document.getElementById("popupContainer").style.display = "flex";
  document.querySelector(".popupContent").style.display = "block";
  document.querySelector(".popupContent").style.animation =
    "popup-appear 0.6s forwards";
}

window.onload = () => {
  async function initMap(mapId) {
    const radiusSlider = document.getElementById("radiusSlider");
    const radiusValue = document.getElementById("radiusValue");
    const bloodGroup = document.getElementById("bloodGroup");

    openMapPopup();

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

    map = new Map(document.getElementById(mapId), {
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
      selectedHospitals = [];
      allHospitals = [];
      initialValue = 0;
      finalValue = 0;
      done = false;
      console.log("Circle Radius:", circle.getRadius());
      placesService.nearbySearch(
        {
          location: circle.getCenter(),
          radius: circle.getRadius(),
          type: "hospital",
        },
        (results, status, pagination) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            allHospitals = allHospitals.concat(results);
            if (pagination.hasNextPage) {
              console.log("Next Page:", pagination.hasNextPage);
              pagination.nextPage();
            } else {
              console.log("All Hospitals:", allHospitals);
              const maxDistanceMeters = circle.getRadius();
              allHospitals = allHospitals.filter((hospital) => {
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
              const center2 = circle.getCenter();
              const hospitalWithDistance = allHospitals.map((hospital) => {
                const hospitalLocation = new google.maps.LatLng(
                  hospital.geometry.location.lat(),
                  hospital.geometry.location.lng()
                );
                const distance =
                  google.maps.geometry.spherical.computeDistanceBetween(
                    center2,
                    hospitalLocation
                  );
                return {
                  ...hospital,
                  distance,
                };
              });
              hospitalWithDistance.sort((a, b) => a.distance - b.distance);
              console.log("Nearby Hospitals:", allHospitals);
              allHospitals = hospitalWithDistance;
              console.log("Hospitals with Distance:", hospitalWithDistance);
              arrangeData();
            }
          } else {
            console.error("Nearby search failed due to:", status);
          }
        }
      );
    }

    function findNearbyDonors(nearbyHospitals, bdGroup) {
      fetch("/nearbysearch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nearbyHospitals, bdGroup }),
      })
        .then((res) => res.json())
        .then((data) => {
          selectedHospitals = selectedHospitals.concat(data.selectedHospitals);
          if (!done) {
            console.log("Arranging data again");
            arrangeData();
            return;
          }
          console.log("Selected Hospitals:", selectedHospitals);
          document.querySelector(".popupContent").style.animation =
            "popup-disappear 0.6s forwards";

          updateDonorCards(selectedHospitals);

          setTimeout(() => {
            document.getElementById("popupContainer").style.display = "none";
            document.querySelector(".popupContent").style.display = "none";
          }, 600);
          showPopup();
        });
    }

    function arrangeData() {
      finalValue += incrementValue;
      if (allHospitals.length < finalValue) {
        finalValue = allHospitals.length;
        done = true;
      }
      slicedHospitals = allHospitals.slice(initialValue, finalValue);
      initialValue = finalValue;
      console.log("Sliced Hospitals:", slicedHospitals);
      nearbyHospitals = slicedHospitals;
      findNearbyDonors(nearbyHospitals, bdGroup);
    }
  }

  initMap("map");
};
