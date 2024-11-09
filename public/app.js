// Client-side JavaScript for handling the mapbox and form

function sendHeightToParent(height) {
  window.parent.postMessage({ type: "resize-iframe", height: height }, "*");
}

let perHourRate = 0; // Example hourly rate, adjust as needed (20 currency units per hour)
let perKilometerRate = 0; // Example rate, adjust as needed (5 currency units per kilometer)

// Global variables to store calculated fees
let globalDistanceFee = 0;
let globalTimeFee = 0;

// Global variables to store calculated distance and time
let durationInHours = 1;
let distanceInKm = 0;

// Get the datepicker, timepicker, and error elements
const datepicker = document.getElementById("pickup-date");
const timepicker = document.getElementById("pickup-time");
const dateError = document.getElementById("pickup-date-close-error");
const timeError = document.getElementById("pickup-time-close-error");

// Get the current time in UTC
const now = new Date();
// Get today's date at midnight in UTC
const todayUTC = new Date(
  Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
);
const nowUTC = new Date(
  Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes()
  )
);

// Calculate 3 hours later from now in UTC
const threeHoursLaterUTC = new Date(nowUTC.getTime() + 3 * 60 * 60 * 1000);

// Set the minimum date (today's date) in the datepicker
const year = nowUTC.getUTCFullYear();
const month = (nowUTC.getUTCMonth() + 1).toString().padStart(2, "0");
const day = nowUTC.getUTCDate().toString().padStart(2, "0");
datepicker.min = `${year}-${month}-${day}`;

// Add event listener to validate the selected date
datepicker.addEventListener("change", function () {
  const selectedDate = new Date(this.value);
  const selectedDateUTC = new Date(
    Date.UTC(
      selectedDate.getUTCFullYear(),
      selectedDate.getUTCMonth(),
      selectedDate.getUTCDate()
    )
  );

  if (selectedDateUTC < todayUTC) {
    dateError.style.display = "block"; // Show the error message for invalid date
  } else {
    dateError.style.display = "none"; // Hide the error message for valid date
  }
  checkTime();
});

// Add event listener to validate the selected time
timepicker.addEventListener("change", checkTime);
function checkTime() {
  // Get selected date and time from the pickers
  const selectedDateString = datepicker.value; // e.g., "2024-10-29"
  const selectedTimeString = timepicker.value; // e.g., "09:00"

  // Parse the selected date and time as UTC
  const [year, month, day] = selectedDateString.split("-").map(Number);
  const [hours, minutes] = selectedTimeString.split(":").map(Number);

  const selectedDateTimeUTC = new Date(year, month - 1, day, hours, minutes);

  // Check if the selected date and time in UTC are less than 3 hours from now
  if (selectedDateTimeUTC < threeHoursLaterUTC) {
    timeError.style.display = "block"; // Show error for invalid time
  } else {
    timeError.style.display = "none"; // Hide error for valid time
  }
}

// Object to store prices for each car type
const carPrices = {
  Sprinter: { hourly: 325, perKilometer: 5.5 },
  "Stretch SUV": { hourly: 349, perKilometer: 6.5 },
  SUV: { hourly: 150, perKilometer: 2.65 },
  "Cadillac Escalade SUV": { hourly: 210, perKilometer: 2.95 },
  "Mid-Size SUV": { hourly: 120, perKilometer: 2.55 },
  "Class Mercedes": { hourly: 175, perKilometer: 2.75 },
  Sedan: { hourly: 85, perKilometer: 1.97 },
};

function updateCarPrices() {
  Object.keys(carPrices).forEach((carName) => {
    let price = 0;

    if (document.getElementById("hourly-tab").classList.contains("active")) {
      // Calculate price based on hourly rate if duration is set
      price =
        carPrices[carName].hourly * document.getElementById("hours").value;
    } else {
      // Calculate price based on per kilometer rate if distance is set
      if (durationInHours <= 1 || distanceInKm == 0) {
        price = carPrices[carName].hourly;
      } else {
        price = carPrices[carName].perKilometer * distanceInKm;
      }
    }

    // Update the price displayed on the page
    const priceElements = document.getElementsByClassName(`price-${carName}`);
    for (let i = 0; i < priceElements.length; i++) {
      if (priceElements[i]) {
        priceElements[i].textContent = `Starting at - $${price.toFixed(2)}`;
      }
    }
  });
}

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

// Updating Cars based on no. of passengers and bags
const passengers = document.getElementById("passengers");
const bags = document.getElementById("bags");

function passengersAndBagsChangeHandler() {
  if (passengers.value > 2 || bags.value > 2) {
    document.getElementById("car-7").classList.add("hidden");
    hideSlides((index) => index === 1);
  } else {
    document.getElementById("car-7").classList.remove("hidden");
    hideSlides((index) => index === 11);
  }
  if (passengers.value > 3 || bags.value > 3) {
    document.getElementById("car-6").classList.add("hidden");
    hideSlides((index) => index === 1 || index === 6);
  } else {
    document.getElementById("car-6").classList.remove("hidden");
  }
  if (passengers.value > 6 || bags.value > 4) {
    document.getElementById("car-5").classList.add("hidden");
    document.getElementById("car-3").classList.add("hidden");
    hideSlides(
      (index) => index === 1 || index === 6 || index === 4 || index === 0
    );
  } else {
    document.getElementById("car-5").classList.remove("hidden");
    document.getElementById("car-3").classList.remove("hidden");
  }
  if (passengers.value > 6 || bags.value > 6) {
    document.getElementById("car-4").classList.add("hidden");

    hideSlides(
      (index) =>
        index === 1 || index === 4 || index === 5 || index === 6 || index === 0
    );
  } else {
    document.getElementById("car-4").classList.remove("hidden");
  }
  // if (passengers.value > 6 || bags.value > 8) {
  //   document.getElementById("car-5").classList.add("hidden");
  //   hideSlides(
  //     (index) =>
  //       index === 6 || index === 0 || index === 5 || index === 1 || index === 4
  //   );
  // } else {
  //   document.getElementById("car-5").classList.remove("hidden");
  // }
  if (passengers.value > 10 || bags.value > 10) {
    document.getElementById("car-2").classList.add("hidden");
    hideSlides(
      (index) =>
        index === 1 ||
        index === 3 ||
        index === 0 ||
        index === 4 ||
        index === 5 ||
        index === 6
    );
  } else {
    document.getElementById("car-2").classList.remove("hidden");
  }
}

passengers.addEventListener("input", function () {
  if (parseInt(this.value, 10) < 1) {
    this.value = 1;
  } else if (parseInt(this.value, 10) > 11) {
    this.value = 11;
  }
});
passengers.addEventListener("change", passengersAndBagsChangeHandler);

bags.addEventListener("input", function () {
  if (parseInt(this.value, 10) < 0) {
    this.value = 0;
  } else if (parseInt(this.value, 10) > 11) {
    this.value = 11;
  }
});
bags.addEventListener("change", passengersAndBagsChangeHandler);

const hoursInput = document.getElementById("hours");

// Add an event listener to prevent typing a value lower than the minimum
hoursInput.addEventListener("input", function () {
  if (parseInt(hoursInput.value, 10) < Math.ceil(durationInHours)) {
    hoursInput.value = Math.ceil(durationInHours);
  }
  !hoursInput.value === false && updateCarPrices();
});
hoursInput.addEventListener("blur", function () {
  if (!hoursInput.value) {
    hoursInput.value = 1;
    updateCarPrices();
  }
});

// calculating globalTieFee
hoursInput.addEventListener("change", function () {
  globalTimeFee = this.value * perHourRate;
  updatePriceSummary(globalDistanceFee, globalTimeFee);
  updateCarPrices();
});

// Swiper
const swiper = new Swiper(".swiper", {
  slidesPerView: 1, // Number of slides to show on mobile
  slidesPerGroup: 1, // Number of slides to scroll
  spaceBetween: 10, // Space between slides
  autoplay: true,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  breakpoints: {
    768: {
      slidesPerView: 2, // Show 2 slide on desktop
    },
  },
});

// Function to hide specific slides based on a condition
function hideSlides(condition) {
  // Get all Swiper slides
  const slides = document.querySelectorAll(".swiper-slide");

  slides.forEach((slide, index) => {
    if (condition(index, slide)) {
      slide.classList.add("hidden"); // Hide the slide
    } else {
      slide.classList.remove("hidden"); // Show the slide if it was previously hidden
    }
  });

  // Update Swiper to reflect the hidden slides
  swiper.update();
}

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
    // Initialize Mapbox with the token
    mapboxgl.accessToken = data.token;

    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-79.5, 43.5],
      zoom: 9,
    });

    let pickupMarker = null;
    let dropoffMarker = null;
    let additionalMarker = null;
    let routeLayerId = "route";
    let pickupCoordinates = null;
    let dropoffCoordinates = null;
    let additionalCoordinates = null;

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
        map.resize();
      });

    function getSuggestions(query, callback) {
      fetch(`/api/mapbox/geocode?q=${query}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.features) {
            callback(data.features);
          }
        });
    }

    function clearRouteAndMarker(type) {
      // Clear the route layer
      clearPrevious(null);

      // Set specific coordinates to null if fields are empty
      if (type === "pickup") {
        pickupCoordinates = null;
        clearPrevious(pickupMarker);
        durationInHours = 1;
      }
      if (type === "dropoff") {
        dropoffCoordinates = null;
        clearPrevious(dropoffMarker);
        durationInHours = 1;
      }
      if (type === "additional") {
        additionalCoordinates = null;
        clearPrevious(additionalMarker);
      }
      fetchDirections();
    }

    function autocomplete(inputId, suggestionId, type) {
      const inputField = document.getElementById(inputId);
      const suggestionsContainer = document.getElementById(suggestionId);

      inputField.addEventListener("input", function () {
        const query = this.value;

        if (!query) {
          clearRouteAndMarker(type);
          return;
        }

        if (query.length > 2) {
          getSuggestions(query, (suggestions) => {
            suggestionsContainer.innerHTML = "";

            suggestions.forEach((suggestion) => {
              const listItem = document.createElement("div");
              listItem.textContent = suggestion.place_name;
              listItem.className = "suggestion-item";
              listItem.dataset.lng = suggestion.center[0];
              listItem.dataset.lat = suggestion.center[1];

              listItem.addEventListener("click", function () {
                inputField.value = suggestion.place_name;
                suggestionsContainer.innerHTML = "";

                const lng = suggestion.center[0];
                const lat = suggestion.center[1];

                if (type === "pickup") {
                  clearPrevious(pickupMarker);
                  pickupMarker = new mapboxgl.Marker()
                    .setLngLat([lng, lat])
                    .addTo(map);
                  pickupCoordinates = [lng, lat];
                } else if (type === "dropoff") {
                  clearPrevious(dropoffMarker);
                  dropoffMarker = new mapboxgl.Marker()
                    .setLngLat([lng, lat])
                    .addTo(map);
                  dropoffCoordinates = [lng, lat];
                } else if (type === "additional") {
                  clearPrevious(additionalMarker);
                  additionalMarker = new mapboxgl.Marker()
                    .setLngLat([lng, lat])
                    .addTo(map);
                  additionalCoordinates = [lng, lat];
                }

                map.flyTo({ center: [lng, lat], zoom: 12 });

                if (pickupCoordinates && dropoffCoordinates) {
                  fetchDirections();
                }
              });

              suggestionsContainer.appendChild(listItem);
            });
          });
        } else {
          suggestionsContainer.innerHTML = "";
        }
      });

      inputField.addEventListener("blur", function () {
        setTimeout(() => {
          suggestionsContainer.innerHTML = "";
        }, 300);
      });
    }

    async function fetchDirections() {
      const coordinates = [
        pickupCoordinates,
        additionalCoordinates,
        dropoffCoordinates,
      ].filter(Boolean);
      const coordinateString = coordinates
        .map((coord) => coord.join(","))
        .join(";");

      if (coordinates.length > 1) {
        const response = await fetch(
          `/api/mapbox/directions?coordinates=${coordinateString}`
        );
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const routeCoordinates = route.geometry.coordinates;

          distanceInKm = (route.distance / 1000).toFixed(2);
          durationInHours = (route.duration / 3600).toFixed(2);
          var durationInMinutes = (route.duration / 60).toFixed(2);

          if (durationInHours < 1) {
            globalDistanceFee = perHourRate;
          } else {
            globalDistanceFee = distanceInKm * perKilometerRate;
          }

          const minHours = Math.ceil(durationInHours);

          hoursInput.value = minHours;
          hoursInput.min = minHours;
          durationInHours = minHours;
          globalTimeFee = perHourRate * durationInHours;

          document.getElementById("directions-info").innerHTML = `
                Distance: ${distanceInKm} km | Duration: ${Math.ceil(
            durationInMinutes
          )} mins
              `;

          updatePriceSummary(globalDistanceFee, globalTimeFee);
          updateCarPrices();

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
              "line-color": "#4285F4",
              "line-width": 6,
            },
          });

          const bounds = new mapboxgl.LngLatBounds();
          routeCoordinates.forEach((coord) => bounds.extend(coord));
          map.fitBounds(bounds, { padding: 50, maxZoom: 14 });
        }
      } else {
        hoursInput.value = 1;
        hoursInput.min = 1;
        distanceInKm = 0;
        updateCarPrices();
      }
    }

    autocomplete("pickup", "pickup-suggestions", "pickup");
    autocomplete("dropoff", "dropoff-suggestions", "dropoff");
    autocomplete("additional", "additional-suggestions", "additional");
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
  updateCarPrices();
});

document.getElementById("hourly-tab").addEventListener("click", function () {
  document.getElementById("hours-row").classList.remove("hidden");
  document.getElementById("hourly-tab").classList.add("active");
  document.getElementById("distance-tab").classList.remove("active");
  updatePriceSummary(globalDistanceFee, globalTimeFee); // Use global variables
  updateCarPrices();
});

function updatePriceSummary(distanceFee = 0, timeFee = 0) {
  // Constants and initial setup
  const taxRate = 0.13;
  const vipFee = vipCheckbox.value === "yes" ? 50 : 0; // Example VIP fee
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
    swiper.autoplay.stop();
    carOptions.forEach((opt) => opt.classList.remove("selected"));
    this.classList.add("selected");
    const selectedCarType = this.querySelector("strong").textContent.trim();
    setCarPrices(selectedCarType);
  });
});

$(document).ready(function () {
  // Initialize Stripe with your publishable key
  const stripe = Stripe("pk_test_gg8pWvMfDrdZv8wAvKcUSU8A"); // Replace with your actual publishable key
  const elements = stripe.elements();

  // Optionally, add some basic styling
  const style = {
    base: {
      iconColor: "#c4f0ff",
      color: "#fff",
      fontWeight: "500",
      fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
      fontSize: "16px",
      fontSmoothing: "antialiased",
      ":-webkit-autofill": {
        color: "#fce883",
      },
      "::placeholder": {
        color: "#87BBFD",
      },
    },
    invalid: {
      iconColor: "#FFC7EE",
      color: "#FFC7EE",
    },
  };
  const cardElement = elements.create("card", {
    style: style,
    hidePostalCode: true,
  });
  cardElement.mount("#card-element");

  const cashBtn = document.getElementById("cash-btn");
  const cardBtn = document.getElementById("card-btn");
  const cardPaymentSection = document.getElementById("card-payment-section");
  const confirmBtn = document.getElementById("confirm-btn");
  const payNowBtn = document.getElementById("pay-now-btn");
  const paymentMethodInput = document.getElementById("payment-method");

  // Handle cash and card button clicks
  cashBtn.addEventListener("click", () => {
    cardPaymentSection.classList.add("hidden");
    paymentMethodInput.value = "cash";
    confirmBtn.classList.remove("hidden");
    cardBtn.className = "btn btn-choice";
    cashBtn.className = "btn btn-success";
    payNowBtn.classList.add("hidden");
  });

  cardBtn.addEventListener("click", () => {
    cardPaymentSection.classList.remove("hidden");
    paymentMethodInput.value = "card";
    confirmBtn.classList.add("hidden");
    cashBtn.className = "btn btn-choice";
    cardBtn.className = "btn btn-success";
    payNowBtn.classList.remove("hidden");
  });

  // Handle the "Pay Now" button for card payment
  payNowBtn.addEventListener("click", async (event) => {
    event.preventDefault();

    // Fetch payment intent from server
    const response = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: calculateTotalAmount(), // You may need to adjust this to calculate the actual total
      }),
    });
    const { clientSecret } = await response.json();

    // Confirm the card payment
    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      const errorField = document.getElementById("card-errors");
      errorField.textContent = error.message;
    } else {
      alert("Payment successful!");
      submitBookingForm();
    }
  });

  function calculateTotalAmount() {
    const totalElement = document.getElementById("total-price");
    const totalValue = parseFloat(totalElement.innerText.replace("$", ""));
    return Math.round(totalValue * 100); // Stripe uses cents
  }

  function submitBookingForm() {
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
      additionalLocation: document.getElementById("additional").value || "N/A",
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
      paymentMethod: document.getElementById("payment-method").value,
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
        sendHeightToParent(["1600px", "2300px"]);
        document.getElementById("reservation-form").reset();
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        alert("There was an error submitting your form. Please try again.");
      });
  }
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
        document.getElementById("car-option-error-mobile").innerText =
          "Please select a car.";
      } else {
        document.getElementById("car-option-error").innerText = "";
        document.getElementById("car-option-error-mobile").innerText = "";
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
            sendHeightToParent(["1600px", "2300px"]);
          },
        },
      });
      sendHeightToParent(["33vh", "50vh"]);
    } else {
      sendHeightToParent(["1700px", "2500px"]);
      alert("Missing required fields!");
    }
  });

  // Close popup on clicking "Edit" button
  $("#edit-btn").on("click", function () {
    $.magnificPopup.close();
    sendHeightToParent(["1600px", "2300px"]);
  });
  // Close popup on clicking "Cancel" button
  $("#cancel-btn").on("click", function () {
    $.magnificPopup.close();
    sendHeightToParent(["1600px", "2300px"]);
    alert("Booking cancelled!");
  });

  // Handle confirm button action
  $("#confirm-btn").on("click", function () {
    submitBookingForm();
  });
});
