let userLocation = { lat: 12.58, lng: 77.35 };
let place_id;
let lat;
let lng;
let hospitalName;
let map;
let initialValue = 0;
let finalValue = 0;
let allHospitals = [];
let selectedHospitals = [];
let done = false;
let circle;
let placesService;
let nearbyHospitals;
let slicedHospitals;
let bdGroup;
let incrementValue = 20;
let marker;

const yourName = document.getElementById("name");
const yourPhone = document.getElementById("mobile");
const yourBloodGroup = document.getElementById("bloodGroup");
const overlay = document.getElementById("popupOverlay");
const overlayHead = document.getElementById("overlayHead");
const overlayInfo = document.getElementById("overlayInfo");
const confirmBtn = document.getElementById("confirmBtn");
const cancelBtn = document.getElementById("cancelBtn");
const extraFiller = document.getElementById("extraFiller");
const verify = document.getElementById("verify");
const verifyBox = document.querySelector(".verifyBox");
const loadingOverlay = document.getElementById("loadingOverlay");

async function initMap(mapId) {
  const initialPosition = { lat: 12.58, lng: 77.35 };
  const { Map } = await google.maps.importLibrary("maps");
  await google.maps.importLibrary("places");

  map = new Map(document.getElementById(mapId), {
    zoom: 6,
    center: initialPosition,
    scrollwheel: true,
    gestureControl: true,
    mapId: "DEMO_MAP_ID",
  });

  placesService = new google.maps.places.PlacesService(map);

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
        if (marker) {
          marker.setPosition(userLocation);
        } else {
          marker = new google.maps.Marker({
            position: userLocation,
            map: map,
            title: "You are here",
          });
        }
      },
      (error) => {
        console.error("Error getting user location:", error);
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
  }

  circle = new google.maps.Circle({
    map: map,
    radius: 10000,
    center: userLocation,
    fillColor: "#FF0000",
    fillOpacity: 0.3,
    strokeWeight: 1,
  });
}

//   const service = new google.maps.places.PlacesService(map);
//   service.nearbySearch(
//     {
//       location: userLocation,
//       radius: 10000,
//       type: "hospital",
//     },
//     (results, status) => {
//       if (status === google.maps.places.PlacesServiceStatus.OK) {
//         console.log("Hospital data:", results);
//         results.forEach((hospital) => {
//           new google.maps.Marker({
//             position: hospital.geometry.location,
//             map: map,
//             title: hospital.name,
//             icon: {
//               url: "https://maps.google.com/mapfiles/ms/icons/hospital.png",
//             },
//           });
//         });
//       } else {
//         console.error("PlacesService failed:", status);
//         alert("Could not load hospital data. Please try again.");
//       }
//     }
//   );

function setMarkerAndCircle(pos) {
  circle.setCenter(pos);
  // geocoder.geocode({ location: pos }, (results, status) => {
  //   if (status === "OK" && results[0]) {
  //     const addressComponents = results[0].address_components;
  //     const sublocality = addressComponents[1]?.short_name || "";
  //     const locality = addressComponents[2]?.long_name || "";
  //     const town = addressComponents[3]?.long_name || "";
  //     const city = addressComponents[4]?.long_name || "";
  //     const address = `${sublocality}, ${locality}, ${town} - ${city}`;
  //     console.log("City:", address);
  //   } else {
  //     console.error("Geocoder failed due to:", status);
  //   }
  // });
}

async function initAutocomplete() {
  const input = document.getElementById("hospital");

  const autocomplete = new google.maps.places.Autocomplete(input, {
    types: ["establishment"],
    componentRestrictions: { country: "in" },
    fields: ["place_id", "geometry", "name", "types"],
  });

  console.log("Autocomplete: ", autocomplete);

  autocomplete.addListener("place_changed", async () => {
    console.log("Place changed");
    const place = autocomplete.getPlace();
    console.log("Place: ", place);
    if (!place.geometry) {
      return;
    }
    if (place.types.includes("hospital")) {
      console.log("YES BRUH");
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      hospitalName = place.name;
      place_id = place.place_id;
      const pos = { lat, lng };

      setMarkerAndCircle(pos);

      map.setCenter({ lat, lng });

      if (marker) {
        marker.setPosition({ lat, lng });
      } else {
        marker = new google.maps.Marker({
          position: { lat, lng },
          map,
          title: hospitalName,
        });
      }
      alert(
        "Hospital: " + place.name + " Latitude: " + lat + " Longitude: " + lng
      );
      console.log(lat, lng, name);
    } else {
      overlay.style.display = "flex";
      verifyBox.innerHTML = "";
      overlayHead.innerHTML = "Confirm Hospital";
      overlayInfo.innerHTML = "Are you sure this is a Hospital?";
      extraFiller.innerHTML = `${place.name}`;
      confirmBtn.style.display = "block";
      cancelBtn.style.display = "block";

      const confirmation = await getConfirmation();

      if (confirmation) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        hospitalName = place.name;
        place_id = place.place_id;
        const pos = { lat, lng };
        setMarkerAndCircle(pos);
        map.setCenter({ lat, lng });
        if (marker) {
          marker.setPosition({ lat, lng });
        } else {
          marker = new google.maps.Marker({
            position: { lat, lng },
            map,
            title: hospitalName,
          });
        }
      }
    }
  });
}

function getConfirmation() {
  return new Promise((resolve, reject) => {
    confirmBtn.onclick = () => {
      overlay.style.display = "none";
      resolve(true);
    };

    cancelBtn.onclick = () => {
      overlay.style.display = "none";
      resolve(false);
    };
  });
}

async function finalConfirmation() {
  if (
    !yourName.value ||
    !yourPhone.value ||
    !yourBloodGroup.value ||
    !hospitalName
  ) {
    alert("Please fill all the fields");
    return;
  }
  overlay.style.display = "flex";
  overlayHead.innerHTML = "Confirm Request";
  verifyBox.innerHTML = "";
  extraFiller.innerHTML = `
  Your Name: ${yourName.value} <br>
  Your Phone: ${yourPhone.value} <br>
  Your Blood Group: ${yourBloodGroup.value} <br>
  Hospital: ${hospitalName} <br>
  `;
  confirmBtn.style.display = "block";
  cancelBtn.style.display = "block";
  overlayInfo.innerHTML =
    "<b>Are you sure you want to submit this request?</b>";

  const confirmation = await getConfirmation();

  if (confirmation) {
    // Submit request
    // sendSOS();
    loadingOverlay.style.display = "flex";
    saveData();
  }
}

document.getElementById("submitRequest").addEventListener("click", async () => {
  finalConfirmation();
});

window.onload = () => {
  initMap("map");
  initAutocomplete();
};

document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();
});

// verify.addEventListener("click", async () => {
//   overlay.style.display = "flex";
//   overlayHead.innerHTML = "Verify Mobile Number";
//   extraFiller.innerHTML = `+91 ${yourPhone.value}`;
//   overlayInfo.innerHTML = "Please enter the OTP sent to your mobile number";
//   verifyBox.innerHTML = `<input type="number" id="otp" placeholder="Enter OTP" required> <br> <button class="confirm-btn" id="verifyOTP">Verify</button>`;
//   confirmBtn.style.display = "none";
//   cancelBtn.style.display = "none";
// });

function saveData() {
  const data = {
    name: yourName.value,
    phone: yourPhone.value,
    bloodGroup: yourBloodGroup.value,
    hospital: hospitalName,
    place_id: place_id,
    lat: lat,
    lng: lng,
  };

  bdGroup = yourBloodGroup.value;
  updateNearbyHospitals(bdGroup);
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
      loadingOverlay.style.display = "none";
    });

  const data = {
    name: yourName.value,
    phone: yourPhone.value,
    bloodGroup: yourBloodGroup.value,
    hospital: hospitalName,
    place_id: place_id,
    selectedHospitals: selectedHospitals,
  };

  console.log("Data:", data);
  if (done) {
    fetch("/sos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Data:", data);
        if (res.status === 200) {
          alert("Request submitted successfully");
          window.location.href = "/";
        } else {
          alert("Request submission failed. Please try again.");
        }
      });
  }
}

function updateNearbyHospitals(bdGroup) {
  selectedHospitals = [];
  allHospitals = [];
  nearbyHospitals = [];
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
