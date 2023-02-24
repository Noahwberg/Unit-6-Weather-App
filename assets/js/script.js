var searchData = [];
var weatherApiUrl = 'https://api.openweathermap.org';
var apiKey = '7563799c4abe9a09c92d23a0f1b3ecc8';

var searchId = document.querySelector('#search-form');
var searchInput = document.querySelector('#search-input');
var todayContainer = document.querySelector('#today');
var weatherContainer = document.querySelector('#weather');
var searchWeatherData = document.querySelector('#history');

dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

function addHistory(search) {
  // Nothing in the search bar so return this function
  if (searchData.indexOf(search) !== -1) {                                 
    return;
  }
  searchData.push(search);
  
  localStorage.setItem('search-history', JSON.stringify(searchData));
  updateSearchData();
}

function weatherSearchData() {
  var storedWeatherData = localStorage.getItem('search-history');
  if (storedWeatherData) {
    searchData = JSON.parse(storedWeatherData);
  }
  updateSearchData();
}

function searchBarId(e) {
  if (!searchInput.value) {
    return;
  }
  e.preventDefault();
  var search = searchInput.value.trim();
  pullApiCon(search);
  searchInput.value = '';
}
  
function searchDataClick(e) {
  if (!e.target.matches('.btn-history')) {
    return;
  }
  var button = e.target;
  var search = button.getAttribute('data-search');
  pullApiCon(search);
}

function updateSearchData() {
  searchWeatherData.innerHTML = '';
  for (var i = searchData.length - 1; i >= 0; i--) {
    var button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('aria-controls', 'todays forcast');
    button.classList.add('history-btn', 'btn-history');

    button.setAttribute('data-search', searchData[i]);
    button.textContent = searchData[i];
    searchWeatherData.append(button);
    } 
  }


function updateLocationData (location, data) {
  updateCurrentWeather(location, data.current, data.timezone);
  updateForecast(data.daily, data.timezone);
}

function pullWeatherUrl(location) {
  var { lat } = location;
  var { lon } = location;
  var location = location.name;
  var apiCon = `${weatherApiUrl}/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=${apiKey}`;

  fetch(apiCon)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      updateLocationData(location, data);
     })
    .catch(function (err) {
      console.error(err);
    });
}

function pullApiCon(search) {
  var apiCon = `${weatherApiUrl}/geo/1.0/direct?q=${search}&limit=5&appid=${apiKey}`;

  fetch(apiCon)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (!data[0]) {
        alert('Location not found');
      } else {
        addHistory(search);
        pullWeatherUrl(data[0]);
      }
    })
    .catch(function (err) {
      console.error(err);
    });
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
function updateCurrentWeather(location, weather, timezone) {
  var date = dayjs().tz(timezone).format('M/D/YYYY');

  var tempFah = weather.temp;
  var windMph = weather.wind_speed;
  var humidity = weather.humidity;
  var uvIndex = weather.uvi;
  var logoUrl = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
  var iconDes = weather.weather[0].description || weather[0].main;

  var card = document.createElement('div');
  var cardMain = document.createElement('div');
  var heading = document.createElement('h2');
  var temperature = document.createElement('p');
  var windId = document.createElement('p');
  var humidityId = document.createElement('p');
  var weatherIcon = document.createElement('img');
  var uvElement = document.createElement('p');
  var uvIndexBtn = document.createElement('button');

  card.setAttribute('class', 'card');
  cardMain.setAttribute('class', 'card-body');
  card.append(cardMain);

  heading.setAttribute('class', 'h3 card-header');
  temperature.setAttribute('class', 'card-text');
  windId.setAttribute('class', 'card-text');
  humidityId.setAttribute('class', 'card-text');

  heading.textContent = `${location} (${date})`;
  weatherIcon.setAttribute('src', logoUrl);
  weatherIcon.setAttribute('alt', iconDes);
  weatherIcon.setAttribute('class', 'weather-img');
  heading.append(weatherIcon);
  temperature.textContent = `Temp: ${tempFah}°F`;
  windId.textContent = `Wind: ${windMph} MPH`;
  humidityId.textContent = `Humidity: ${humidity} %`;
  cardMain.append(heading, temperature, windId, humidityId);

  uvElement.textContent = 'UV Index: ';
  uvIndexBtn.classList.add('btn', 'btn-sm');

  if (uvIndex < 3) {
    uvIndexBtn.classList.add('btn-success');
  } else if (uvIndex < 7) {
    uvIndexBtn.classList.add('btn-warning');
  } else {
    uvIndexBtn.classList.add('btn-danger');
  }

  uvIndexBtn.textContent = uvIndex;
  uvElement.append(uvIndexBtn);
  cardMain.append(uvElement);

  todayContainer.innerHTML = '';
  todayContainer.append(card);
}

function updateWeatherCard(forecast, timezone) {
  // variables for api data
  var unixData = forecast.dt;
  var logoUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
  var iconDes = forecast.weather[0].description;
  var tempFah = forecast.temp.day;
  var { humidity } = forecast;
  var windMph = forecast.wind_speed;

  var colum = document.createElement('div');
  var card = document.createElement('div');
  var cardMain = document.createElement('div');
  var cardName = document.createElement('h5');
  var weatherIcon = document.createElement('img');
  var temperature = document.createElement('p');
  var windSpeed = document.createElement('p');
  var humidityPercent = document.createElement('p');

  colum.append(card);
  card.append(cardMain);
  cardMain.append(cardName, weatherIcon, temperature, windSpeed, humidityPercent);

  colum.setAttribute('class', 'col-md');
  colum.classList.add('five-day-card');
  card.setAttribute('class', 'card bg-primary h-100 text-white');
  cardMain.setAttribute('class', 'card-body p-2');
  cardName.setAttribute('class', 'card-title');
  temperature.setAttribute('class', 'card-text');
  windSpeed.setAttribute('class', 'card-text');
  humidityPercent.setAttribute('class', 'card-text');

  // Adding content to elements
  cardName.textContent = dayjs.unix(unixData).tz(timezone).format('M/D/YYYY');
  weatherIcon.setAttribute('src', logoUrl);
  weatherIcon.setAttribute('alt', iconDes);
  temperature.textContent = `Temp: ${tempFah} °F`;
  windSpeed.textContent = `Wind: ${windMph} MPH`;
  humidityPercent.textContent = `Humidity: ${humidity} %`;

  weatherContainer.append(colum);
}

// Display 5 day forecast.
function updateForecast(dailyForecast, timezone) {
  var startDt = dayjs().tz(timezone).add(1, 'day').startOf('day').unix();
  var endDt = dayjs().tz(timezone).add(6, 'day').startOf('day').unix();

  var headingCol = document.createElement('div');
  var heading = document.createElement('h4');

  headingCol.setAttribute('class', 'col-12');
  heading.textContent = '5-Day Forecast:';
  headingCol.append(heading);

  weatherContainer.innerHTML = '';
  weatherContainer.append(headingCol);
  for (var i = 0; i < dailyForecast.length; i++) 
  { if (dailyForecast[i].dt >= startDt && dailyForecast[i].dt < endDt) {
      updateWeatherCard(dailyForecast[i], timezone);
    }
  }
}

weatherSearchData();
searchId.addEventListener('submit', searchBarId);
searchWeatherData.addEventListener('click', searchDataClick);