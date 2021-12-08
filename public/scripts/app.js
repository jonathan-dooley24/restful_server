let app;
let map;

let neighborhood_markers = 
[
    {location: [44.942068, -93.020521], marker: null},
    {location: [44.977413, -93.025156], marker: null},
    {location: [44.931244, -93.079578], marker: null},
    {location: [44.956192, -93.060189], marker: null},
    {location: [44.978883, -93.068163], marker: null},
    {location: [44.975766, -93.113887], marker: null},
    {location: [44.959639, -93.121271], marker: null},
    {location: [44.947700, -93.128505], marker: null},
    {location: [44.930276, -93.119911], marker: null},
    {location: [44.982752, -93.147910], marker: null},
    {location: [44.963631, -93.167548], marker: null},
    {location: [44.973971, -93.197965], marker: null},
    {location: [44.949043, -93.178261], marker: null},
    {location: [44.934848, -93.176736], marker: null},
    {location: [44.913106, -93.170779], marker: null},
    {location: [44.937705, -93.136997], marker: null},
    {location: [44.949203, -93.093739], marker: null}
];
 
function init() {
    let crime_url = 'http://localhost:8000';

    app = new Vue({
        el: '#app',
        data: {
            location_search: "",
            location_results: [],

            map: {
                center: {
                    lat: 44.955139,
                    lng: -93.102222,
                    address: ""
                },
                zoom: 12,
                bounds: {
                    nw: {lat: 45.008206, lng: -93.217977},
                    se: {lat: 44.883658, lng: -92.993787}
                }
            }

        }/*,
        computed: {
            input_placeholder: setPlaceholder()
        }*/
    });

    map = L.map('leafletmap').setView([app.map.center.lat, app.map.center.lng], app.map.zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: 11,
        maxZoom: 18
    }).addTo(map);
    map.setMaxBounds([[44.883658, -93.217977], [45.008206, -92.993787]]);
    
    L.marker([44.942068, -93.020521]).addTo(map);
    L.marker([44.977413, -93.025156]).addTo(map);
    L.marker([44.931244, -93.079578]).addTo(map);
    L.marker([44.956192, -93.060189]).addTo(map);
    L.marker([44.978883, -93.068163]).addTo(map);
    L.marker([44.975766, -93.113887]).addTo(map);
    L.marker([44.959639, -93.121271]).addTo(map);
    L.marker([44.947700, -93.128505]).addTo(map);
    L.marker([44.930276, -93.119911]).addTo(map);
    L.marker([44.982752, -93.147910]).addTo(map);
    L.marker([44.963631, -93.167548]).addTo(map);
    L.marker([44.973971, -93.197965]).addTo(map);
    L.marker([44.949043, -93.178261]).addTo(map);
    L.marker([44.934848, -93.176736]).addTo(map);
    L.marker([44.913106, -93.170779]).addTo(map);
    L.marker([44.937705, -93.136997]).addTo(map);
    L.marker([44.949203, -93.093739]).addTo(map);

    let district_boundary = new L.geoJson();
    district_boundary.addTo(map);

    getJSON('data/StPaulDistrictCouncil.geojson').then((result) => {
        console.log(result);
        // St. Paul GeoJSON
        $(result.features).each(function(key, value) {
            district_boundary.addData(value);
        });
    }).catch((error) => {
        console.log('Error:', error);
    });
}

function getJSON(url) {
    return new Promise((resolve, reject) => {
        $.ajax({
            dataType: "json",
            url: url,
            success: function(data) {
                resolve(data);
            },
            error: function(status, message) {
                reject({status: status.status, message: status.statusText});
            }
        });
    });
}

function locationSearch(event){
    console.log("app location_Search : " + app.location_search);

    let url = 'https://nominatim.openstreetmap.org/search?q=' + app.location_search +
              '&format=json&limit=25&accept-language=en'
    //console.log(url);
    getJSON(url).then((result) => {
        if(result.length == 0){ //if no results
            console.log("Error: no results for this search");
        }
        else{
            //console.log(result);
            //console.log("lat " + result[0].lat + " result[0].lon " + lon);
            app.data.
            map.flyTo([result[0].lat, result[0].lon], 15, {duration:0.4});   //hard coded to zoom 15 instead of app.map.zoom     
        }   
    }).catch((error) => {
        console.log('Error:', error);
    });
}

function setPlaceholder(){
    let currentlatlong = document.getElementById("current");
    currentlatlong.textContent = "Lat: " + map.getCenter().lat.toFixed(6) + " Long: " + map.getCenter().lng.toFixed(6);
}




//test address
//643 Virginia St, Saint Paul, MN