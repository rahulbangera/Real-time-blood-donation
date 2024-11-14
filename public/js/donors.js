window.onload = function () {
  let map;
  let marker;
  let geocoder;
  let placeService;
  let hospitalMarkers = [];
  let selectedHospitals = new Set();
  let previousInfoWindow;
  let sublocality;
  let locality;
  let town;
  let city;

  const cityValue = document.getElementById("cityValue");
  const mapNextButton = document.getElementById("mapNextButton");
  const popupContent = document.getElementById("popupContent");
  const visibilityTurnOff = document.getElementById("turnOffVisibility");

  visibilityTurnOff.addEventListener("click", () => {
    const visibilityPopup = document.getElementById("visibilityPopup");
    visibilityPopup.style.display = "flex";
    setTimeout(() => {
      fetch("/donorinactive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => {
        if (res.status === 200) {
          console.log("Success");
          window.location.href = "/";
        } else {
          console.log("Error");
        }
      });
    }, 3000);
  });

  mapNextButton.addEventListener("click", async () => {
    // Check if hospitals have been selected
    if (selectedHospitals.size > 0) {
      try {
        result = await getDetails(selectedHospitals);
        // if (Notification.permission !== "granted") {
        //   const permission =  Notification.requestPermission();
        // }
        showStatusPopup(result, sublocality, town);
      } catch (error) {
        console.error(error);
        alert("An error occurred. Please try again.");
      }
    } else {
      alert("Please select at least one hospital before proceeding.");
    }
  });

  function getDetails(selectedHospitals) {
    const promises = Array.from(selectedHospitals).map((placeId) => {
      return new Promise((resolve, reject) => {
        placeService.getDetails(
          {
            placeId: placeId,
            fields: ["name", "geometry", "formatted_address"],
          },
          (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              const hospital = {
                placeId: placeId,
                name: place.name,
                location: {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                },
                // WE HAVEN'T USED THE FORMATTED ADDRESS YET, BUT WE CAN USE IT TO DISPLAY THE ADDRESS OF THE HOSPITAL IF WE WISH
              };
              // console.log(result);
              // result.push(hospital);
              resolve(hospital);
            } else {
              console.error("Places Service failed due to:", status);
              reject(status);
            }
          }
        );
      });
    });
    return Promise.all(promises);
  }

  function showStatusPopup(result, sublocality, town) {
    const statusPopup = document.getElementById("statusPopup");
    statusPopup.style.display = "flex";

    console.log("Res: " + result);
    setTimeout(() => {
      fetch("/donoractive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedHospitals: result,
          sublocality: sublocality,
          town: town,
        }),
      }).then((res) => {
        if (res.status === 200) {
          console.log("Success");
          window.location.href = "/";
        } else {
          console.log("Error");
        }
      });
    }, 3000);
  }

  // mapNextButton.addEventListener("click", () => {
  //   if (cityValue.value === "") {
  //     alert("Please select a location");
  //   } else {
  //     window.location.href = "/register";
  //   }
  // });

  const scrollDown = () => {
    if (cityValue.value === "") {
      mapNextButton.disabled = true;
    } else {
      mapNextButton.disabled = false;
      popupContent.scrollIntoView({ behavior: "smooth" });
      popupContent.scrollTop = popupContent.scrollHeight;
    }
  };

  async function initMap() {
    const position = { lat: 12.58, lng: 77.35 };
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    map = new Map(document.getElementById("map"), {
      zoom: 6,
      center: position,
      mapId: "DEMO_MAP_ID",
    });

    geocoder = new google.maps.Geocoder();

    map.addListener("click", (e) => {
      const pos = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setMarker(pos);
      map.setCenter(pos);
      map.setZoom(14);
      showNearbyHospitals(pos);
    });
  }

  function setMarker(pos) {
    if (marker) {
      marker.setPosition(pos);
    } else {
      marker = new google.maps.Marker({
        position: pos,
        map: map,
      });
    }
    // geocoder.geocode({ location: pos }, (results, status) => {
    //   if (status === "OK" && results[0]) {
    //     const city =
    //       results[0].address_components.find((component) =>
    //         component.types.includes("locality")
    //       )?.long_name || "Location not found";
    //     console.log("City:", city);
    //     cityValue.value = city;
    //     scrollDown();
    //     console.log(results[0]);
    //   } else {
    //     console.error("Geocoder failed due to:", status);
    //   }
    // });

    geocoder.geocode({ location: pos }, (results, status) => {
      if (status === "OK" && results[0]) {
        sublocality = results[0].address_components[1].short_name;
        locality = results[0].address_components[2].long_name;
        town = results[0].address_components[3].long_name;
        city = results[0].address_components[4].long_name;

        const address = `${sublocality}, ${locality}, ${town} - ${city}`;
        console.log("City:", address);
        cityValue.value = address;
        scrollDown();
        console.log(results[0]);
      } else {
        console.error("Geocoder failed due to:", status);
      }
    });

    // geocoder.geocode({ location: pos }, (results, status) => {
    //   if (status === "OK" && results[0]) {
    //     // Try to find the place name or a sublocality
    //     const place =
    //       results[0].address_components.find(
    //         (component) =>
    //           component.types.includes("premise") ||
    //           component.types.includes("sublocality")
    //       )?.long_name || "Location not found";

    //     console.log("Place:", place);
    //     cityValue.value = place; // Set the place name in the input
    //     scrollDown(); // Call the scroll function
    //   } else {
    //     console.error("Geocoder failed due to:", status);
    //   }
    // });
  }

  function showNearbyHospitals(pos) {
    const request = {
      location: pos,
      radius: 5000,
      type: "hospital",
    };
    placeService = new google.maps.places.PlacesService(map);

    placeService.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        selectedHospitals = new Set();
        hospitalMarkers.forEach((marker) => marker.setMap(null));
        hospitalMarkers = [];

        results.forEach((place) => {
          const hospitalMarker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            icon: {
              url: "https://maps.google.com/mapfiles/ms/icons/hospitals.png",
              scaledSize: new google.maps.Size(32, 32),
            },
            title: place.name,
          });

          hospitalMarkers.push(hospitalMarker);

          const infoWindow = new google.maps.InfoWindow({
            content: `<strong>${place.name}</strong><br><button class="hospital-btn" id="select-btn-${place.place_id}" data-place-id="${place.place_id}">Select</button>`,
          });

          google.maps.event.addListener(hospitalMarker, "click", () => {
            if (previousInfoWindow) previousInfoWindow.close();

            infoWindow.open(map, hospitalMarker);
            previousInfoWindow = infoWindow;

            google.maps.event.addListenerOnce(infoWindow, "domready", () => {
              const selectBtn = document.getElementById(
                `select-btn-${place.place_id}`
              );

              if (!selectBtn.dataset.listenerAdded) {
                selectBtn.addEventListener("click", () => {
                  toggleHospitalSelection(
                    place.place_id,
                    hospitalMarker,
                    selectBtn,
                    place.name
                  );
                  selectBtn.dataset.listenerAdded = "true"; // Mark listener as added
                });
              }
            });
          });
        });
      } else {
        console.error("PlacesService failed due to:", status);
      }
    });
  }

  // SMALL BUG IS IN THIS CODE WHICH IS LIKE, IF U SELECT FEW HOSPITALS AND THEN GO TO OTHER LOCATION TO SEE OTHER HOSPITALS, THEN THE PREVIOUSLY SELECTED HOSPITALS WILL BE MARKED RED BUT STILL BE SELECTED IN THE SET
  // OK GUYS, it was fixed by just emptying the selectedHospitals set before adding new hospitals to the map, hehehehe

  function toggleHospitalSelection(placeId, marker, button, placeName) {
    if (selectedHospitals.has(placeId)) {
      selectedHospitals.delete(placeId);
      marker.setIcon({
        url: "https://maps.google.com/mapfiles/ms/icons/hospitals.png",
        scaledSize: new google.maps.Size(32, 32),
      });
      button.innerText = "Select";
    } else {
      selectedHospitals.add(placeId);
      marker.setIcon({
        url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
        scaledSize: new google.maps.Size(32, 32),
      });
      button.innerText = "Deselect";
    }
  }

  function onSuccessLocation(position) {
    const pos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
    setMarker(pos);
    map.setCenter(pos);
    map.setZoom(14);
    showNearbyHospitals(pos);
  }

  function onErrorLocation() {
    console.log("Error");
  }

  const getLoc = document.getElementById("getLoc");
  getLoc.addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(
      onSuccessLocation,
      onErrorLocation
    );
  });

  initMap();
};
