function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            document.querySelector("div.info.access").classList.add("hidden")
            getWeather(position.coords.latitude, position.coords.longitude)
        }, getLocationError)
    }
    else {
        let errorText = "Geolocation is not supported by this browser."

        console.error(errorText)

        document.querySelector("div.info.error span.error").innerHTML = errorText
        document.querySelector("div.info.error").classList.remove("hidden")
        document.querySelector("div.info.access").classList.add("hidden")

        getWeather()
    }
}

getLocation()

function getLocationError(error) {
    let errorText = null

    switch(error.code) {
        case error.PERMISSION_DENIED:
            errorText = "You have denied the request for Geolocation."
            console.error(errorText)
            break;
        case error.POSITION_UNAVAILABLE:
            errorText = "Location information is unavailable."
            console.error(errorText)
            break;
        case error.TIMEOUT:
            errorText = "The request to get your location timed out."
            console.error(errorText)
            break;
        case error.UNKNOWN_ERROR:
            errorText = "An unknown error occurred."
            console.error(errorText)
            break;
    }

    document.querySelector("div.info.error span.error").innerHTML = errorText
    document.querySelector("div.info.error").classList.remove("hidden")
    document.querySelector("div.info.access").classList.add("hidden")

    getWeather()
}

async function getWeather(lat=50.0095171, lon=36.31866) {
    let response = await fetch("https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=current,minutely,hourly,console.errors&appid=965377e7df13450410f0d36d23f9a5f6");
    let weather = await response.json();
    console.log('Weather forecast:');
    console.log(weather);

    processWeather(weather)
}

function processWeather(weatherJSON) {
    let weather = document.querySelector("div.weather")
    weather.classList.remove("hidden")
    weather.querySelector("span.location").innerHTML = weatherJSON.lat + ', ' + weatherJSON.lon

    let days = weather.querySelector("div.days")

    for (let day of weatherJSON.daily) {
        let date = new Date(day.dt * 1000)
        let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        let daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

        let weatherMain = day.weather[0].main
        let weatherIcon = null

        if (weatherMain == 'Thunderstorm') {
            weatherIcon = `🌩️`
        }
        else if (weatherMain == 'Drizzle') {
            weatherIcon = `☔`
        }
        else if (weatherMain == 'Rain') {
            weatherIcon = `☔`
        }
        else if (weatherMain == 'Snow') {
            weatherIcon = `❄️`
        }
        else if (weatherMain == 'Mist') {
            weatherIcon = `🌫️`
        }
        else if (weatherMain == 'Smoke') {
            weatherIcon = `🌫️`
        }
        else if (weatherMain == 'Haze') {
            weatherIcon = `🌫️`
        }
        else if (weatherMain == 'Dust') {
            weatherIcon = `🌫️`
        }
        else if (weatherMain == 'Fog') {
            weatherIcon = `🌫️`
        }
        else if (weatherMain == 'Sand') {
            weatherIcon = `🌫️`
        }
        else if (weatherMain == 'Ash') {
            weatherIcon = `🌫️`
        }
        else if (weatherMain == 'Squall') {
            weatherIcon = `⛈️`
        }
        else if (weatherMain == 'Tornado') {
            weatherIcon = `🌪️`
        }
        else if (weatherMain == 'Clear') {
            weatherIcon = `☀️`
        }
        else {
            weatherIcon = `☁️`
        }

        let tempK = day.temp.day
        let temp = ~~(tempK - 273.15)

        if (temp > 0) {
            temp = `+${temp}`
        }

        days.insertAdjacentHTML("beforeend", `<div class='day'><p class='date'>${months[date.getMonth()]}, <span class="day-of-month">&nbsp;${date.getDate()}</span></p><p class="day-of-week">${daysOfWeek[date.getDay()]}</p><p class='forecast'>${weatherIcon}</p><p class="temp">${temp}&deg;</p></div>`)
    }
}
