// Client-side JavaScript for handling the mapbox and form

function sendHeightToParent(height) {
  window.parent.postMessage({ type: "resize-iframe", height: height }, "*");
}

let loop = true;

let perHourRate = 0; // Example hourly rate, adjust as needed (20 currency units per hour)
let perKilometerRate = 0; // Example rate, adjust as needed (5 currency units per kilometer)

// Global variables to store calculated fees
let globalDistanceFee = 0;
let globalTimeFee = 0;

// Global variables to store calculated distance and time
let durationInHours = 0;
let distanceInKm = 0;

// Get the datepicker, timepicker, and error elements
const datepicker = document.getElementById("pickup-date");
const timepicker = document.getElementById("pickup-time");
const dateError = document.getElementById("pickup-date-close-error");
const timeError = document.getElementById("pickup-time-error");

// Get today's date and time
const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Current day at midnight
const threeHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours from now

// Set the minimum date (today's date) in the datepicker
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
datepicker.min = `${year}-${month}-${day}`;

// Function to check if the user-selected date is today
function isToday(selectedDate) {
  return (
    selectedDate.getFullYear() === today.getFullYear() &&
    selectedDate.getMonth() === today.getMonth() &&
    selectedDate.getDate() === today.getDate()
  );
}

// Add event listener to validate the selected date
datepicker.addEventListener("change", function () {
  const selectedDate = new Date(this.value);
  if (selectedDate < today) {
    dateError.style.display = "block"; // Show the error message for invalid date
  } else {
    dateError.style.display = "none"; // Hide the error message for valid date
  }
});

// Add event listener to validate the selected time
timepicker.addEventListener("change", function () {
  const selectedDate = new Date(datepicker.value);
  const selectedTime = this.value.split(":");
  const selectedTimeDate = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
    parseInt(selectedTime[0]),
    parseInt(selectedTime[1])
  );

  // Check if the selected date is today and if the time is at least 3 hours from now
  if (isToday(selectedDate) && selectedTimeDate < threeHoursLater) {
    timeError.style.display = "block"; // Show error for invalid time
  } else {
    timeError.style.display = "none"; // Hide error for valid time
  }
});
// Object to store prices for each car type
const carPrices = {
  Sprinter: { hourly: 325, perKilometer: 5.5 },
  "Stretch SUV": { hourly: 349, perKilometer: 6.5 },
  SUV: { hourly: 120, perKilometer: 2.55 },
  "Cadillac Escalade SUV": { hourly: 210, perKilometer: 2.95 },
  "Class Mercedes": { hourly: 175, perKilometer: 2.75 },
  Sedan: { hourly: 85, perKilometer: 1.97 },
};

// Function to set prices based on selected car
function setCarPrices(carType) {
  if (carPrices[carType]) {
    perHourRate = carPrices[carType].hourly;
    perKilometerRate = carPrices[carType].perKilometer;
    // Calculate distance-based fee
    if (durationInHours < 1) {
      globalDistanceFee = perHourRate;
    } else {
      globalDistanceFee = distanceInKm * perKilometerRate;
    }
    globalTimeFee = perHourRate * document.getElementById("hours").value;
    updatePriceSummary(globalDistanceFee, globalTimeFee);
  }
}

// calculating globalTieFee
document.getElementById("hours").addEventListener("change", function () {
  globalTimeFee = this.value * perHourRate;
  updatePriceSummary(globalDistanceFee, globalTimeFee);
});

// Swiper
const swiper = new Swiper(".swiper", {
  slidesPerView: 1, // Number of slides to show on mobile
  slidesPerGroup: 1, // Number of slides to scroll
  spaceBetween: 10, // Space between slides
  autoplay: loop,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  breakpoints: {
    991: {
      slidesPerView: 2, // Show 2 slide on desktop
    },
  },
});

// Handle gratuity selection
const gratuitySelect = document.getElementById("gratuity");
const gratuitySelectButton = document.getElementById("backToSelect");
const customGratuityInput = document.getElementById("custom-gratuity");
const customGratuityBox = document.getElementById("custom-gratuity-box");

gratuitySelectButton.addEventListener("click", function () {
  gratuitySelect.value = "0";
  customGratuityBox.style.display = "none";
  customGratuityInput.style.display = "none";
  gratuitySelect.style.display = "block";
});

gratuitySelect.addEventListener("change", function () {
  if (this.value === "custom") {
    customGratuityBox.style.display = "flex";
    customGratuityInput.style.display = "block";
    customGratuityInput.focus();
    gratuitySelect.style.display = "none";
  } else {
    customGratuityBox.style.display = "none";
    customGratuityInput.style.display = "none";
    gratuitySelect.style.display = "block";
  }
});

// Handle VIP service
const vipCheckbox = document.getElementById("vip-service");
vipCheckbox.addEventListener("change", function () {
  if (vipCheckbox.value === "yes") {
    document.getElementById("vip-service-row").className = "price-row";
  } else {
    document.getElementById("vip-service-row").className = "hidden";
  }
  updatePriceSummary(globalDistanceFee, globalTimeFee);
});

customGratuityInput.addEventListener("input", function () {
  if (customGratuityInput.value == 0) {
    document.getElementById("gratuity-row").className = "hidden";
  } else {
    document.getElementById("gratuity-row").className = "price-row";
  }
  updatePriceSummary(globalDistanceFee, globalTimeFee);
});
gratuitySelect.addEventListener("change", function () {
  if (gratuitySelect.value == 0 || gratuitySelect.value == "custom") {
    document.getElementById("gratuity-row").className = "hidden";
  } else {
    document.getElementById("gratuity-row").className = "price-row";
  }
  updatePriceSummary(globalDistanceFee, globalTimeFee);
});

// Fetch Mapbox token from server-side endpoint
fetch("/api/mapbox-token")
  .then((response) => response.json())
  .then((data) => {
    // Use the token to initialize Mapbox
    mapboxgl.accessToken = data.token;

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

    // Resize map when submit button is clicked
    document
      .getElementById("reserve-btn")
      .addEventListener("click", function () {
        map.resize(); // Adjust map when modal/tab is shown
      });

    // Function to get location suggestions from the server
    function getSuggestions(query, callback) {
      fetch(`/api/mapbox/geocode?q=${query}`)
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

            // Add new suggestions as <li> elements
            suggestions.forEach(function (suggestion) {
              var listItem = document.createElement("div");
              listItem.textContent = suggestion.place_name;
              listItem.className = "suggestion-item";
              listItem.dataset.lng = suggestion.center[0];
              listItem.dataset.lat = suggestion.center[1];

              // Handle suggestion click
              listItem.addEventListener("click", function () {
                inputField.value = suggestion.place_name;
                suggestionsContainer.innerHTML = ""; // Clear suggestions

                var lng = suggestion.center[0];
                var lat = suggestion.center[1];

                // Clear previous markers and add new marker
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

                // Fly to selected location
                map.flyTo({ center: [lng, lat], zoom: 12 });

                // Fetch route if both pickup and dropoff are selected
                if (pickupCoordinates && dropoffCoordinates) {
                  fetchDirections();
                }
              });

              suggestionsContainer.appendChild(listItem);
            });
          });
        } else {
          suggestionsContainer.innerHTML = ""; // Clear suggestions if query is too short
        }
      });

      // Hide suggestions on blur
      inputField.addEventListener("blur", function () {
        setTimeout(() => {
          suggestionsContainer.innerHTML = ""; // Clear suggestions after a short delay to allow click event to register
        }, 300);
      });
    }

    // Fetch directions automatically once both pickup and dropoff are selected
    function fetchDirections() {
      if (pickupCoordinates && dropoffCoordinates) {
        // Clear any previous route
        clearPrevious(null);

        const start = pickupCoordinates.join(",");
        const end = dropoffCoordinates.join(",");

        fetch(`/api/mapbox/directions?start=${start}&end=${end}`)
          .then((response) => response.json())
          .then((data) => {
            if (data.routes && data.routes.length > 0) {
              var route = data.routes[0];
              var routeCoordinates = route.geometry.coordinates;

              // Calculate distance and time
              distanceInKm = (route.distance / 1000).toFixed(2); // Convert to km
              durationInHours = (route.duration / 3600).toFixed(2); // Convert to hours
              var durationInMinutes = (route.duration / 60).toFixed(2); // Convert to minutes

              // Calculate distance-based fee
              if (durationInHours < 1) {
                globalDistanceFee = perHourRate;
              } else {
                globalDistanceFee = distanceInKm * perKilometerRate;
              }
              updatePriceSummary(globalDistanceFee, globalTimeFee);

              // Display the distance, time, and fees info
              document.getElementById("directions-info").innerHTML = `
                Distance: ${distanceInKm} km | Duration: ${Math.ceil(
                durationInMinutes
              )} mins `;

              // Update the price summary for both distance and time-based pricing
              updatePriceSummary(globalDistanceFee, globalTimeFee); // Pass both fees

              // Add the route to the map
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
                  "line-color": "#4285F4", // Blue color for the route
                  "line-width": 6,
                },
              });

              // Fit the map to the bounds (zoom out and center to show the entire route)
              var bounds = new mapboxgl.LngLatBounds();
              routeCoordinates.forEach(function (coord) {
                bounds.extend(coord);
              });
              map.fitBounds(bounds, {
                padding: 50, // Adjust padding to avoid markers too close to map edge
                maxZoom: 14, // Optionally set a maximum zoom level
              });
            } else {
              console.error("No routes found");
            }
          });
      }
    }

    // Initialize autocomplete for pickup and dropoff
    autocomplete("pickup", "pickup-suggestions", "pickup");
    autocomplete("dropoff", "dropoff-suggestions", "dropoff");
  })
  .catch((error) => {
    console.error("Error fetching Mapbox token:", error);
  });

// Tab Switching
document.getElementById("distance-tab").addEventListener("click", function () {
  document.getElementById("hours-row").classList.add("hidden");
  document.getElementById("distance-tab").classList.add("active");
  document.getElementById("hourly-tab").classList.remove("active");
  updatePriceSummary(globalDistanceFee, globalTimeFee); // Use global variables
});

document.getElementById("hourly-tab").addEventListener("click", function () {
  document.getElementById("hours-row").classList.remove("hidden");
  document.getElementById("hourly-tab").classList.add("active");
  document.getElementById("distance-tab").classList.remove("active");
  updatePriceSummary(globalDistanceFee, globalTimeFee); // Use global variables
});

function updatePriceSummary(distanceFee = 0, timeFee = 0) {
  // Constants and initial setup
  const taxRate = 0.13;
  const vipFee = vipCheckbox.value === "yes" ? 100 : 0; // Example VIP fee
  let gratuity = 0;

  // Determine the active pricing tab
  const isHourlyTab = document
    .getElementById("hourly-tab")
    .classList.contains("active");

  // Calculate total price based on the active tab
  let total = 0;
  if (isHourlyTab) {
    // Hourly tab is active: Use timeFee

    // Handle Gratuity Calculation
    const selectedGratuity = gratuitySelect.value;
    if (selectedGratuity === "custom") {
      gratuity = parseFloat(customGratuityInput.value) || 0;
    } else {
      gratuity = (parseFloat(selectedGratuity) / 100) * timeFee;
    }

    total = timeFee + gratuity + vipFee;
    document.getElementById("pricing-title").textContent =
      "Hourly-Based Price Summary";
    document.getElementById("pricing-fee-label").textContent = "Duration fee";
    document.getElementById("pricing-fee").textContent = `$${timeFee.toFixed(
      2
    )}`;
  } else {
    // Distance tab is active: Use distanceFee

    // Handle Gratuity Calculation
    const selectedGratuity = gratuitySelect.value;
    if (selectedGratuity === "custom") {
      gratuity = parseFloat(customGratuityInput.value) || 0;
    } else {
      gratuity = (parseFloat(selectedGratuity) / 100) * distanceFee;
    }

    total = distanceFee + gratuity + vipFee;
    document.getElementById("pricing-title").textContent =
      "Distance-Based Price Summary";
    document.getElementById("pricing-fee-label").textContent = "Distance fee";
    document.getElementById(
      "pricing-fee"
    ).textContent = `$${distanceFee.toFixed(2)}`;
  }

  // Apply tax
  const taxAmount = total * taxRate;
  total += taxAmount;

  // Update shared fields
  document.getElementById("gratuity-fee").textContent = `$${gratuity.toFixed(
    2
  )}`;
  document.getElementById("vip-fee").textContent = `$${vipFee.toFixed(2)}`;
  document.getElementById("tax-fee").textContent = `$${taxAmount.toFixed(2)}`;
  document.getElementById("total-price").textContent = `$${total.toFixed(2)}`;

  // Update hidden input for the final price to be submitted
  document.getElementById("final-price").value = total.toFixed(2);
}

// Car selection
const carOptions = document.querySelectorAll(".car-option");
carOptions.forEach(function (option) {
  option.addEventListener("click", function () {
    carOptions.forEach((opt) => opt.classList.remove("selected"));
    this.classList.add("selected");
    const selectedCarType = this.querySelector("strong").textContent.trim();
    setCarPrices(selectedCarType);
    loop = false;
  });
});

$(document).ready(function () {
  // Initialize Magnific Popup
  $("#reserve-btn").on("click", function (e) {
    e.preventDefault();

    // Perform validation first before showing the popup
    let isValid = true;
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
    ];

    requiredFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      const errorField = document.getElementById(fieldId + "-error");
      if (!field.value) {
        errorField.innerText = "This field is required!";
        isValid = false;
      } else {
        errorField.innerText = "";
      }
      if (!document.querySelector(".car-option.selected")) {
        isValid = false;
        document.getElementById("car-option-error").innerText =
          "Please select a car.";
      } else {
        document.getElementById("car-option-error").innerText = "";
      }
      if (
        document.getElementById("hourly-tab").classList.contains("active") &&
        document.getElementById("hours").value < 1
      ) {
        document.getElementById("hours-error").innerText =
          "This field is required!";
        isValid = false;
      } else {
        document.getElementById("hours-error").innerText = "";
      }
    });

    if (isValid) {
      // Show the popup if the form is valid
      $.magnificPopup.open({
        items: {
          src: "#reservation-popup", // This is the ID of the popup
          type: "inline",
        },
        closeOnBgClick: true, // Close popup when clicking on backdrop
        showCloseBtn: false, // Hide default close button
        callbacks: {
          // Send message to parent when the popup is closed
          close: function () {
            sendHeightToParent(["1500px", "2200px"]);
          },
        },
      });
      sendHeightToParent(["100vh", "100vh"]);
    } else {
      sendHeightToParent(["1700px", "2400px"]);
      alert("Missing required fields!");
    }
  });

  // Close popup on clicking "Cancel" button
  $("#edit-btn").on("click", function () {
    $.magnificPopup.close();
    sendHeightToParent(["1500px", "2200px"]);
    alert("Booking cancelled!");
  });

  // Handle confirm button action
  $("#confirm-btn").on("click", function () {
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
      selectedCar: document
        .querySelector(".car-option.selected")
        ?.querySelector("strong")
        .textContent.trim(),
      basicFee: document.getElementById("pricing-fee").innerText,
      hours: document.getElementById("hours-row").classList.contains("hidden")
        ? "N/A"
        : document.getElementById("hours").value,
      gratuity: document.getElementById("gratuity-fee").innerText || "N/A",
      vipService: document.getElementById("vip-fee").innerText || "N/A",
      tax: document.getElementById("tax-fee").innerText || "N/A",
      finalPrice: document.getElementById("final-price").value,
    };

    // Send the booking information to the backend
    fetch("/api/submit-form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingInfo),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        alert("Reservation confirmed!");
        $.magnificPopup.close(); // Close the popup after successful submission
        sendHeightToParent(["1500px", "2200px"]);
        document.getElementById("reservation-form").reset();
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        alert("There was an error submitting your form. Please try again.");
      });
  });
});
