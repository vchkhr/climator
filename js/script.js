let language = window.navigator.language
let country = "Ukraine" // null
getLocation()

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            document.querySelector("div#allow-access").classList.add("hidden")
            getWeather(position.coords.latitude, position.coords.longitude)
        }, getLocationError)
    }
    else {
        console.error("Geolocation is not supported.")

        document.querySelector("div#error-geo").classList.remove("hidden")
        document.querySelector("div#allow-access").classList.add("hidden")

        getWeather()
    }
}

function getLocationError(error) {
    let errorText = null

    switch (error.code) {
        case error.PERMISSION_DENIED:
            errorText = "You have denied the request for Geolocation."
            console.error(errorText)
            break
        case error.POSITION_UNAVAILABLE:
            errorText = "Location information is unavailable."
            console.error(errorText)
            break
        case error.TIMEOUT:
            errorText = "The request to get your location timed out."
            console.error(errorText)
            break
        case error.UNKNOWN_ERROR:
            errorText = "An unknown error occurred."
            console.error(errorText)
            break
    }

    document.querySelector("div#error-geo span#error").innerHTML = errorText
    document.querySelector("div#error-geo").classList.remove("hidden")
    document.querySelector("div#allow-access").classList.add("hidden")

    getWeather()
}

async function getLocationName(lat, lon) {
    try {
        const response = await fetch("https://revgeocode.search.hereapi.com/v1/revgeocode?at=" + lat + "," + lon + "&lang=" + language + "&apiKey=4VSUFmGhP2nM-835r9Z7U__-irR56swCOntUxM4qDMA")

        let location = await response.json()
        console.log('Location:')
        console.log(location)
    
        if (!location.error) {
            country = location.items[0].address.countryName
            let pos = `${location.items[0].address.street}, ${location.items[0].address.city}, ${country}`
            document.querySelector("div#weather p#current span#location").innerHTML = pos
        }
        else {
            document.querySelector("div#error-location").classList.remove("hidden")
            document.querySelector("div#error-location span#error").innerHTML = location.error + "<br>" + location.error_description
        }
    }
    catch (errorLocationName) {
        document.querySelector("div#error-location").classList.remove("hidden")
        document.querySelector("div#error-location span#error").innerHTML = errorLocationName
    }
}

async function getWeather(lat=49.989116, lon=36.230737) {
    getLocationName(lat, lon)

    try {
        const response = await fetch("https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly,console.errors&appid=965377e7df13450410f0d36d23f9a5f6")

        let weather = await response.json()
        console.log('Weather forecast:')
        console.log(weather)
    
        processWeather(weather)
    }
    catch (errorWeather) {
        document.querySelector("div#weather").classList.add("hidden")
        document.querySelector("div#error-weather").classList.remove("hidden")
        document.querySelector("div#error-weather span#error").innerHTML = errorWeather
    }
}

function processWeather(weatherJSON) {
    let weather = document.querySelector("div#weather")
    weather.classList.remove("hidden")

    if (document.querySelector("div#weather p#current span#location").textContent == "") {
        weather.querySelector("div#weather p#current span#location").innerHTML = weatherJSON.lat + ', ' + weatherJSON.lon
    }

    let days = weather.querySelector("div.days")
    let sunnyDays = 0
    let avgTemperature = []

    for (let day of weatherJSON.daily) {
        let date = new Date(day.dt * 1000)
        let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        let daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        let dayOfWeek = daysOfWeek[date.getDay()]

        let weatherMain = day.weather[0].main
        let weatherIcon = getWeatherIcon(weatherMain)

        if (weatherMain == "Clear") {
            sunnyDays += 1
        }

        let temp = ~~(day.temp.day - 273.15)
        avgTemperature.push(temp)

        if (temp > 0) {
            temp = `+${temp}`
        }

        let feelsLike = [
            ~~(day.feels_like.morn - 273.15),
            ~~(day.feels_like.day - 273.15),
            ~~(day.feels_like.eve - 273.15),
            ~~(day.feels_like.night - 273.15)
        ]

        for (time in feelsLike) {
            if (feelsLike[time] > 0) {
                feelsLike[time] = `+${feelsLike[time]}`
            }
        }

        days.insertAdjacentHTML("beforeend", `<div class="day"><p class="date ${dayOfWeek}">${months[date.getMonth()]}, <span class="day-of-month">&nbsp;${date.getDate()}</span></p><p class="day-of-week ${dayOfWeek}">${dayOfWeek}</p><p class="forecast-and-temp"><span class="forecast forecast-${weatherMain}" title="${weatherMain} during the day">${weatherIcon}</span> <span class="temp" title="Temperature during the day">${temp}&deg;</span></p><p class="feels-like" title="Feels like in the morning, afternoon, evening & night">&#x1F9DD; ${feelsLike[0]}&deg;, ${feelsLike[1]}&deg;, ${feelsLike[2]}&deg;, ${feelsLike[3]}&deg;</p></div>`)
    }

    var sumTemperature = 0
    for (var i = 0; i < avgTemperature.length; i++) {
        sumTemperature += avgTemperature[i]
    }

    avgTemperature = sumTemperature / avgTemperature.length

    if (avgTemperature > 0) {
        avgTemperature = `+${Math.round(avgTemperature)}`
    }

    if (sunnyDays == 1) {
        document.querySelector("div#weather p.forecast-and-temp span.forecast-Clear").innerHTML = "\u{1F31E}"
    }

    let current = weatherJSON.current

    let weatherMain = current.weather[0].main
    let weatherIcon = getWeatherIcon(weatherMain)

    let temp = ~~(current.temp - 273.15)

    if (temp > 0) {
        temp = `+${temp}`
    }

    document.querySelector("div#weather p#current span#weather").innerHTML = `<span class="forecast" title="${weatherMain}">${weatherIcon}</span> ${temp}&deg;`

    for (day of ["Saturday", "Sunday"]) {
        document.querySelectorAll("div#weather div.day p." + day).forEach(function(elem) {
            elem.classList.add("red")
        })
    }

    document.querySelector("div#weather div.week").innerHTML = `<p>Average this week: ${avgTemperature}&deg;</p>`
}

function getWeatherIcon(weather) {
    switch (weather) {
        case "Thunderstorm":
        case "Squall":
            return "&#x26C8;&#xFE0F;"
        case "Drizzle":
        case "Rain":
            return "&#x2614;"
        case "Snow":
            return "&#x2744;&#xFE0F;"
        case "Mist":
        case "Smoke":
        case "Haze":
        case "Dust":
        case "Fog":
        case "Sand":
        case "Ash":
            return "&#x1F32B;&#xFE0F;"
        case "Tornado":
            return "&#x1F32A;&#xFE0F;"
        case "Clear":
            return "&#x2600;&#xFE0F;"
        case "Clouds":
        default:
            return "&#x2601;&#xFE0F;"
    }
}
