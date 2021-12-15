let app;
let map;
let dict = {};

let neighborhood_markers = 
[
    {location: [44.942068, -93.020521], marker: null, name: "Conway/Battlecreek/Highwood"},
    {location: [44.977413, -93.025156], marker: null, name: "Greater East Side"},
    {location: [44.931244, -93.079578], marker: null, name: "West Side"},
    {location: [44.956192, -93.060189], marker: null, name: "Dayton's Bluff"},
    {location: [44.978883, -93.068163], marker: null, name: "Payne/Phalen"},
    {location: [44.975766, -93.113887], marker: null, name: "North End"},
    {location: [44.959639, -93.121271], marker: null, name: "Thomas/Dale(Frogtown)"},
    {location: [44.947700, -93.128505], marker: null, name: "Summit/University"},
    {location: [44.930276, -93.119911], marker: null, name: "West Seventh"},
    {location: [44.982752, -93.147910], marker: null, name: "Como"},
    {location: [44.963631, -93.167548], marker: null, name: "Hamline/Midway"},
    {location: [44.973971, -93.197965], marker: null, name: "St. Anthony"},
    {location: [44.949043, -93.178261], marker: null, name: "Union Park"},
    {location: [44.934848, -93.176736], marker: null, name: "Macalester-Groveland"},
    {location: [44.913106, -93.170779], marker: null, name: "Highland"},
    {location: [44.937705, -93.136997], marker: null, name: "Summit Hill"},
    {location: [44.949203, -93.093739], marker: null, name: "Capitol River"}
];

let countOfCrimes = [];

function init() {
    let crime_url = 'http://localhost:8000';
    app = new Vue({
        el: '#app',
        data: {
            location_search: "",
            location_results: [],
            neighborhoods: [],
            classe:{
                'Rape':'violent',
                'Agg. Assault Dom.':'violent',
                'Simple Assault Dom.':'violent',
                'Homicide':'violent',
                'Agg. Assault':'violent',
                'Auto Theft':'property',
                'Graffiti':'property',
                'Robbery':'property',
                'Theft':'property',
                'Vandalism':'property',
                'Burglary':'property',
                'Proactive Police Visit':'other',
                'Discharge':'other',
                'Narcotics':'other',
                'Community Engagement Event':'other'
              },
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
            tablerows: [],
            checkedNames: [],
            selected_neigborhood: '',
            hoodOptions: [
                { text: 'All', value: '' },
                { text: 'Conway/Battlecreek/Highwood', value: '1' },
                { text: 'Greater East Side', value: '2' },
                { text: 'West Side', value: '3' },
                { text: "Dayton's Bluff", value: '4' },
                { text: 'Payne/Phalen', value: '5' },
                { text: 'North End', value: '6' },
                { text: 'Thomas/Dale(Frogtown)', value: '7' },
                { text: 'Summit/University', value: '8' },
                { text: 'West Seventh', value: '9' },
                { text: 'Como', value: '10' },
                { text: 'Hamline/Midway', value: '11' },
                { text: 'St. Anthony', value: '12' },
                { text: 'Union Park', value: '13' },
                { text: 'Macalester-Groveland', value: '14' },
                { text: 'Highland', value: '15' },
                { text: 'Summit Hill', value: '16' },
                { text: 'Capitol River', value: '17' }
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


    //add markers for each neighborhood
    for(let i = 0; i < 17; i++){
        L.marker(neighborhood_markers[i].location).bindPopup(neighborhood_markers[i].name).addTo(map);      
    }
    let district_boundary = new L.geoJson();
    district_boundary.addTo(map);

    getJSON('data/StPaulDistrictCouncil.geojson').then((result) => {
        //console.log(result);
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
    //console.log("app location_Search : " + app.location_search);
    let url = 'https://nominatim.openstreetmap.org/search?q=' + app.location_search +
              '&format=json&limit=25&accept-language=en'

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
        newUrl += "&limit=1000"                   //!!  CHANGE THIS TO 1000(?) LATER
        getJSON(newUrl).then((result) => {
            if(result.length == 0){
                console.log("Error: no results for this search");
            }
            else{
                app.tablerows = [];
                let popup_dict = {};
                result.forEach(row => {
                    //console.log("row: " + row);
                    let name = neighborhood_markers[row.neighborhood_number-1].name;
                    //console.log("name: " + name);
                    row.neighborhood_number = name; //unorthodox but I like it
                    popup_dict[name] = (popup_dict[name] || 0) + 1;
                    let blockName = "";
                    if(row.block.indexOf("X") >= 0)
                    {
                        blockName = addressTest(row.block);
                        row.block = blockName;
                    }

                    app.tablerows.push(row);               
                });
                dict = popup_dict;
                console.log(dict);
            }   
        });
    }
    else{
        app.neighborhoods = []; //clear array so that if no neighborhood pins present on screen, no data persists.
    }   
}

function addressTest(blockName){
    let index = 0;
    blockName = blockName + "";
    //console.log(blockName);
    let stringNumbers = "0123456789";
    for (let index = 0, len = blockName.length; index < len; index++){
        if(blockName.substring(index, index+1) == "X"){
            if(index == 1 && !stringNumbers.includes(blockName.substring(index-1,index)) && blockName.substring(index+1, index+2) == "X"){
                blockName = "0" + blockName.substring(index, blockName.length);
            }
            if(stringNumbers.includes(blockName.substring(index-1,index)) || stringNumbers.includes(blockName.substring(index+1,index+2)))
            {
                blockName = blockName.substring(0,index) + "0" + blockName.substring(index+1, blockName.length);
            }
        }
    }
    //console.log(blockName);
    return blockName;
}

function addMarker(row) {
    let popup_string = "Date: " + row.date + "\n" + "Time: " + row.time + "\n" + "Incident: " + row.incident;
    console.log(popup_string);
    //L.marker().bindPopup().addTo(map);
}