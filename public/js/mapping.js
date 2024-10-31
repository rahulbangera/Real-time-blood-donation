window.onload = function () {
  let map;
  let marker;
  let geocoder;

  const cityValue = document.getElementById("cityValue");
  const mapNextButton = document.getElementById("mapNextButton");
  const popupContent = document.getElementById("popupContent");

  mapNextButton.addEventListener("click", () => {
    if (cityValue.value === "") {
      alert("Please select a location");
    } else {
      window.location.href = "/register";
    }
  });

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
        const sublocality = results[0].address_components[1].short_name;
        const locality = results[0].address_components[2].long_name;
        const town = results[0].address_components[3].long_name;
        const city = results[0].address_components[4].long_name;

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

  function onSuccessLocation(position) {
    const pos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
    setMarker(pos);
    map.setCenter(pos);
    map.setZoom(14);
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
