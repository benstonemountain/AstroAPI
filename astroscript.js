const btn = document.getElementById("btn");
const container = document.querySelector(".container");

//IPUTFIELDS
const countryName = document.getElementById("inputValueCountry");
const cityName = document.getElementById("inputValueCity");
const date = document.getElementById("inputValueDate");
const time = document.getElementById("inputValueTime");
const submit = document.querySelector(".submitButton");

//CURRENT LOCATION
const content = document.querySelector(".content");
const objects = document.getElementById("inputValueObject");
const myConstellation = document.getElementById("cons");

//TABLE VARIABLES
const planetTitleName = document.getElementById("planet-title-name");
const myTable = document.querySelector(".table-wrapper");
console.log(myTable);
const planetDatas = document.getElementById("planet-datas");
let whatever = "Ez tartalom";
console.log(planetDatas.children[1].children[1]);
console.log(planetDatas.children[2].children[1]);

fetch("./data/countries.json")
  .then((response) => response.json())
  .then((data) => {
    let output = "";
    data.country_codes.forEach((c) => {
      output += `<option>${c.country}</option>`;
    });
    countryName.innerHTML = output;
  });

let searchedCountry = function (countries, countryName) {
  let country = countries.find((c) => c.country === countryName.value);
  return country;
};

const basicDataEndpointNames = {
  Sun: "sun",
  Moon: "moon",
  Mercury: "mercury",
  Venus: "venus",
  Earth: "earth",
  Mars: "mars",
  Jupiter: "jupiter",
  Saturn: "saturn",
  Uranus: "uranus",
  Neptune: "neptune",
  Pluto: "pluto",
};

function getEndpoint() {
  const endpointName = basicDataEndpointNames[objects.value];

  if (endpointName === undefined) {
    throw "Doesn't find object";
  }

  return endpointName;
}

submit.addEventListener("click", function () {
  content.innerHTML = "";

  const basic_datas = document.getElementById("basic-datas");
  const planetImage = document.getElementById("planet-img");

  //bolygó jsonből adatok táblázatba
  try {
    fetch(`./data/${getEndpoint()}.json`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        planetImage.src = `${data.src}`;
        console.log(data.src);
        planetTitleName.textContent = data.name;
        basic_datas.children[1].children[1].textContent = data.radius;
        basic_datas.children[2].children[1].textContent = data.relative_radius;
        basic_datas.children[3].children[1].textContent = data.volume;
        basic_datas.children[4].children[1].textContent = data.mass;
        basic_datas.children[5].children[1].textContent = data.length_of_day;
        basic_datas.children[6].children[1].textContent = data.length_of_year;
        basic_datas.children[7].children[1].textContent = data.orbital_speed;
        basic_datas.children[8].children[1].textContent =
          data.surface_temperature;
        basic_datas.children[9].children[1].textContent = data.rotation;
      })
      .catch((error) => console.log("VALAMI HIBA TÖRTÉNT", error));
  } catch (e) {
    alert(e);
  }

  //Lekérem a helyi json file-ból a beütött országot
  fetch("./data/countries.json")
    .then((response) => response.json())
    .then((data) => {
      let myCountry = searchedCountry(data.country_codes, countryName);
      console.log(myCountry);

      //a helyi json file-ból kiszedett ország iso kódja
      let countryCodeofCountry = myCountry.alpha2;

      //MÁSODIK API KÉRÉS
      //lekérem a külső file-ból a várost is
      fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${cityName.value}&limit=5&appid=2eca79207a882632be3d0a6c7b62492c`
      )
        .then((response) => response.json())
        .then((data) => {
          console.log(data);

          //Mivel ugyanaz a városnév több országban előfordulhat,
          //azt szeretném, ha az első olyan találatot megkapnám, ahol az
          //a user által beütött ország és város passzol
          //összehasonliítom az országhoz és a városhoz rendelt ISO kódot -->
          //ha stimmel, akkor jók vagyunk
          let getCountryByCode = data.find(
            (barmi) => barmi.country === countryCodeofCountry
          );
          console.log(getCountryByCode);

          content.style.backgroundColor = "black";

          let loc = document.createElement("p");
          loc.textContent = "CURRENT LOCATION";
          content.appendChild(loc);

          let city = document.createElement("p");
          city.textContent = "City: " + getCountryByCode.name;
          content.appendChild(city);

          let latitude = document.createElement("p");
          latitude.textContent = "Latitude: " + getCountryByCode.lat;
          content.appendChild(latitude);

          let longitude = document.createElement("p");
          longitude.textContent = "Longitude: " + getCountryByCode.lon;
          content.appendChild(longitude);

          let isoCode = document.createElement("p");
          isoCode.textContent = `Country CODE: ${getCountryByCode.country}, (${myCountry.country})`;
          content.appendChild(isoCode);

          const applicationId = "95f2aa53-f7c7-4c1b-9946-cfc3736f00f7";
          const applicationSecret =
            "cc1547e894ae748b72f3b8bf7a41a1f30d027ec59fb33d7aaead86f9200eb74eda02b2a0d396382d9589c36dfe22e8f39f5c2ce4203fa9d9f67af36bdad12e2b1089eec3723db49cbf005fb94f7ac1db2cd12c05b4d380a018d4f8be2dca094fe25e9c65a8274a7e443b86f7a0c88124";

          const hash = btoa(`${applicationId}:${applicationSecret}`);

          fetch(
            `https://api.astronomyapi.com/api/v2/bodies/positions?latitude=${getCountryByCode.lat}&longitude=${getCountryByCode.lon}&from_date=${date.value}&to_date=${date.value}&time=${time.value}&elevation=100`,
            {
              headers: {
                Authorization: "Basic " + hash,
              },
            }
          )
            .then((response) => response.json())
            .then((data) => {
              console.log(data);

              let foundObject = data.data.table.rows.find(
                (o) => o.entry.name === objects.value
              );
              console.log(foundObject);

              let distanceFromEarth =
                foundObject.cells[0].distance.fromEarth.km;
              console.log(distanceFromEarth);
              let magnitude = foundObject.cells[0].extraInfo.magnitude;
              console.log(magnitude);
              let elongation = foundObject.cells[0].extraInfo.elongation;
              console.log(elongation);
              let constellation =
                foundObject.cells[0].position.constellation.name;
              console.log(constellation);

              if (Number(distanceFromEarth) < 1000000) {
                planetDatas.children[1].children[1].textContent =
                  Number(distanceFromEarth).toFixed(2) + " km";
              } else {
                planetDatas.children[1].children[1].textContent =
                  Number(distanceFromEarth / 1000000).toFixed(2) + "M km";
              }

              planetDatas.children[2].children[1].textContent = magnitude;
              planetDatas.children[3].children[1].textContent = elongation;
              planetDatas.children[4].children[1].textContent = constellation;

              myTable.style.opacity = 1;
            })
            .catch((err) => console.log());
        });
    });
});
