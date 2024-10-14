mapboxgl.accessToken =
  "pk.eyJ1IjoiemFpZC0xIiwiYSI6ImNsa3QzeTA0dzBiMDUzc280ZjByc244MnUifQ.ut9zDZJIc0kCaUTyu0u_FQ";

// Create the map instance and set size
var map = new mapboxgl.Map({
  container: "map", // ID of the div to display the map
  style: "mapbox://styles/mapbox/streets-v11",
  center: [-79.5, 43.5], // Initial map center [lng, lat]
  zoom: 9, // Initial map zoom level
});

var pickupMarker = null;
var dropoffMarker = null;
var routeLayerId = "route";
var pickupCoordinates = null;
var dropoffCoordinates = null;

// Clear previous marker and route
function clearPrevious(marker) {
  if (marker) marker.remove();
  if (map.getLayer(routeLayerId)) {
    map.removeLayer(routeLayerId);
    map.removeSource(routeLayerId);
  }
}

// Function to get location suggestions from the Mapbox Geocoding API
function getSuggestions(query, callback) {
  fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${mapboxgl.accessToken}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.features) {
        callback(data.features);
      }
    });
}

// Autocomplete functionality for pickup and dropoff fields
function autocomplete(inputId, suggestionId, type) {
  var inputField = document.getElementById(inputId);
  var suggestionsContainer = document.getElementById(suggestionId);

  inputField.addEventListener("input", function () {
    var query = this.value;
    if (query.length > 2) {
      getSuggestions(query, function (suggestions) {
        // Clear existing suggestions
        suggestionsContainer.innerHTML = "";
        suggestions.forEach(function (suggestion) {
          var item = document.createElement("div");
          item.classList.add("suggestion-item");
          item.innerHTML = suggestion.place_name;
          item.addEventListener("click", function () {
            inputField.value = suggestion.place_name;
            suggestionsContainer.innerHTML = "";
            var [lng, lat] = suggestion.center;

            // Clear previous markers
            if (type === "pickup") {
              clearPrevious(pickupMarker);
              pickupMarker = new mapboxgl.Marker()
                .setLngLat([lng, lat])
                .addTo(map);
              pickupCoordinates = [lng, lat];
            } else {
              clearPrevious(dropoffMarker);
              dropoffMarker = new mapboxgl.Marker()
                .setLngLat([lng, lat])
                .addTo(map);
              dropoffCoordinates = [lng, lat];
            }

            // Fly to the selected location on the map
            map.flyTo({ center: [lng, lat], zoom: 12 });
          });
          suggestionsContainer.appendChild(item);
        });
      });
    } else {
      suggestionsContainer.innerHTML = "";
    }
  });
}

// Initialize autocomplete for pickup and dropoff
autocomplete("pickup", "pickup-suggestions", "pickup");
autocomplete("dropoff", "dropoff-suggestions", "dropoff");

// Get directions between pickup and dropoff
document
  .getElementById("directions-button")
  .addEventListener("click", function () {
    if (pickupCoordinates && dropoffCoordinates) {
      // Clear any previous route
      clearPrevious(null);

      var directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoordinates.join(
        ","
      )};${dropoffCoordinates.join(",")}?geometries=geojson&access_token=${
        mapboxgl.accessToken
      }`;

      fetch(directionsUrl)
        .then((response) => response.json())
        .then((data) => {
          if (data.routes && data.routes.length > 0) {
            var route = data.routes[0];
            var routeCoordinates = route.geometry.coordinates;

            // Add the route line on the map
            map.addSource(routeLayerId, {
              type: "geojson",
              data: {
                type: "Feature",
                geometry: {
                  type: "LineString",
                  coordinates: routeCoordinates,
                },
              },
            });

            map.addLayer({
              id: routeLayerId,
              type: "line",
              source: routeLayerId,
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#ffcc00",
                "line-width": 6,
              },
            });

            // Update the distance and time info
            var distance = (route.distance / 1000).toFixed(2); // in km
            var duration = (route.duration / 60).toFixed(2); // in minutes
            document.getElementById(
              "directions-info"
            ).innerHTML = `Distance: ${distance} km | Duration: ${Math.ceil(
              duration
            )} mins`;

            // Get bounds of the route
            var bounds = new mapboxgl.LngLatBounds();

            // Extend bounds to include each point of the route
            routeCoordinates.forEach(function (coord) {
              bounds.extend(coord);
            });

            // Fit the map to the bounds (zoom out and center to show the entire route)
            map.fitBounds(bounds, {
              padding: 50, // Adjust padding to avoid markers too close to map edge
              maxZoom: 14, // Optionally set a maximum zoom level
            });
          } else {
            console.error("No routes found");
          }
        });
    } else {
      alert("Please select both pickup and dropoff locations.");
    }
  });

// Car selection
const carOptions = document.querySelectorAll(".car-option");
carOptions.forEach((option) => {
  option.addEventListener("click", () => {
    carOptions.forEach((opt) => opt.classList.remove("selected"));
    option.classList.add("selected");
  });
});

// Handle form submission
document
  .getElementById("reservation-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    let bookingInfo = {
      passengers: document.getElementById("passengers").value,
      bags: document.getElementById("bags").value,
      firstName: document.getElementById("first-name").value,
      lastName: document.getElementById("last-name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      flightNo: document.getElementById("flight-no").value || "N/A",
      additionalInfo: document.getElementById("additional-info").value || "N/A",
      pickupLocation: document.getElementById("pickup").value,
      dropoffLocation: document.getElementById("dropoff").value,
      pickupDate: document.getElementById("pickup-date").value,
      pickupTime: document.getElementById("pickup-time").value,
      selectedCar:
        document.querySelector(".car-option.selected")?.innerText ||
        "No car selected",
    };
    console.log(bookingInfo);

    // Add validation checks for required fields
    const requiredFields = [
      "passengers",
      "bags",
      "first-name",
      "last-name",
      "email",
      "phone",
      "pickup-date",
      "pickup-time",
      "pickup",
      "dropoff",
      // "car-option-selected",
    ];
    let isValid = true;

    requiredFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      const errorField = document.getElementById(fieldId + "-error");
      if (!field.value) {
        errorField.innerText = "This field is required!";
        isValid = false;
      } else {
        errorField.innerText = "";
      }
    });

    if (bookingInfo.selectedCar === "No car selected") {
      console.log(bookingInfo.selectedCar);
      document.getElementById("car-option-error").innerText =
        "Please select a car.";
      isValid = false;
    } else {
      document.getElementById("car-option-error").innerText = "";
    }

    if (isValid) {
      alert("Form submitted successfully!");
    } else {
      alert("Missing required fields!");
    }
  });
