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

let neighborhood_names = [
    {name: "Conway/Battlecreek/Highwood"},
    {name: "Greater East Side"},
    {name: "West Side"},
    {name: "Dayton's Bluff"},
    {name: "Payne/Phalen"},
    {name: "North End"},
    {name: "Thomas/Dale(Frogtown)"},
    {name: "Summit/University"},
    {name: "West Seventh"},
    {name: "Como"},
    {name: "Hamline/Midway"},
    {name: "St. Anthony"},
    {name: "Union Park"},
    {name: "Macalester-Groveland"},
    {name: "Highland"},
    {name: "Summit Hill"},
    {name: "Capitol River"}
];

function init() {
    let crime_url = 'http://localhost:8000';

    app = new Vue({
        el: '#app',
        data: {
            location_search: "",
            location_results: [],
            neighborhoods: [],

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
            },
            tablerows: [

            ]
        }
    });


    map = L.map('leafletmap').setView([app.map.center.lat, app.map.center.lng], app.map.zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: 11,
        maxZoom: 18
    }).addTo(map);
    map.setMaxBounds([[44.883658, -93.217977], [45.008206, -92.993787]]);

    //event 'listeners' for map zooms and pans
    map.on("moveend", setPlaceholder);
    map.on("zoomend", setPlaceholder);
    
    var marker1 = L.marker([44.942068, -93.020521]).addTo(map);
    var marker2 = L.marker([44.977413, -93.025156]).addTo(map);
    var marker3 = L.marker([44.931244, -93.079578]).addTo(map);
    var marker4 = L.marker([44.956192, -93.060189]).addTo(map);
    var marker5 = L.marker([44.978883, -93.068163]).addTo(map);
    var marker6 = L.marker([44.975766, -93.113887]).addTo(map);
    var marker7 = L.marker([44.959639, -93.121271]).addTo(map);
    var marker8 = L.marker([44.947700, -93.128505]).addTo(map);
    var marker9 = L.marker([44.930276, -93.119911]).addTo(map);
    var marker10 = L.marker([44.982752, -93.147910]).addTo(map);
    var marker11 = L.marker([44.963631, -93.167548]).addTo(map);
    var marker12 = L.marker([44.973971, -93.197965]).addTo(map);
    var marker13 = L.marker([44.949043, -93.178261]).addTo(map);
    var marker14 = L.marker([44.934848, -93.176736]).addTo(map);
    var marker15 = L.marker([44.913106, -93.170779]).addTo(map);
    var marker16 = L.marker([44.937705, -93.136997]).addTo(map);
    var marker17 = L.marker([44.949203, -93.093739]).addTo(map);

    let markerArray = [];

    markerArray.push(marker1);
    markerArray.push(marker2);
    markerArray.push(marker3);
    markerArray.push(marker4);
    markerArray.push(marker5);
    markerArray.push(marker6);
    markerArray.push(marker7);
    markerArray.push(marker8);
    markerArray.push(marker9);
    markerArray.push(marker10);
    markerArray.push(marker11);
    markerArray.push(marker12);
    markerArray.push(marker13);
    markerArray.push(marker14);
    markerArray.push(marker15);
    markerArray.push(marker16);
    markerArray.push(marker17);

    let district_boundary = new L.geoJson();
    district_boundary.addTo(map);

    //Event listener for every marker
    for(var i = 0; i < markerArray.length; i++) {
        var currentMarker = markerArray[i];
        //if mouseover on marker, popup will appear
        currentMarker.on("mouseover", function(e) {
            var popup = L.popup()
            .setLatLng(e.latlng)
            .setContent("popup")
            .openOn(map);
        });

        //Maybe have a mouseout to close, if time?
    }
    

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
            map.flyTo([result[0].lat, result[0].lon], 15, {duration:0.4});  //hard coded to zoom 15 instead of app.map.zoom    
            setTimeout(() => {
               setPlaceholder(); 
            }, 600);
            
        }   
    }).catch((error) => {
        console.log('Error:', error);
    });
}

function setPlaceholder(){
    let currentlatlong = document.getElementById("current");
    currentlatlong.textContent = "Lat: " + map.getCenter().lat.toFixed(6) + " Long: " + map.getCenter().lng.toFixed(6);
    getDataTable();
}

function getDataTable() {
    let mapBounds = map.getBounds();
    let northEast = mapBounds._northEast;
    let southWest = mapBounds._southWest;
    let onScreen = [];
    let count = 1;
    neighborhood_markers.forEach(neighborhood => {
        if(neighborhood.location[0] <= northEast.lat && neighborhood.location[0] >= southWest.lat && neighborhood.location[1] <= northEast.lng && neighborhood.location[1] >= southWest.lng){
            onScreen.push(count);
        }
        count++;
    });
    if(onScreen.length > 0){
        let url = "http://localhost:8000/neighborhoods?id=";
        onScreen.forEach(number => {
            url += number + ",";
        });
        let neighborhoodNames = [];
        getJSON(url).then((result) => {
            if(result.length == 0){
                console.log("Error: no results for this search");
            }
            else{
                result.forEach(row => {
                    neighborhoodNames.push(row.neighborhood_name);
                });
                app.neighborhoods = neighborhoodNames;
            }   
        });  
        let newUrl = "http://localhost:8000/incidents?neighborhood=";
        onScreen.forEach(number => {
            newUrl += number + ",";
        });
        newUrl += "&limit=30"
        getJSON(newUrl).then((result) => {
            if(result.length == 0){
                console.log("Error: no results for this search");
            }
            else{
                app.tablerows = [];
                result.forEach(row => {
                    //console.log(row)
                    let name = neighborhood_names[row.neighborhood_number-1]['name'];
                    row.neighborhood_number = name;
                    app.tablerows.push(row);               
                });
            }   
        });
    }
    else{
        app.neighborhoods = []; //clear array so that if no neighborhood pins present on screen, no data persists.
    }   
}