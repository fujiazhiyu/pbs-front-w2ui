// $(function() {
  var mymap = L.map('mapid').setView([51.505, -0.09], 13);

  // L.tileLayer('http://wprd03.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=2&style=7', {
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiZnVqaWF6aGl5dSIsImEiOiJjam8xN3NsdXcwOHNtM3BwZ2Y1aTBtamx1In0.4ecuq5Izwa2GwDekFZYrmQ'
  }).addTo(mymap);

  var map = new AMap.Map('container', {
    resizeEnable: true,
    center: [51.505, -0.09]
  });

  function refresh(enName) {
    map.setMapStyle('amap://styles/dark');
  }

  L.marker([51.5, -0.09]).addTo(mymap)
    .bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();

  L.circle([51.508, -0.11], 500, {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5
  }).addTo(mymap).bindPopup("I am a circle.");

  L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
  ]).addTo(mymap).bindPopup("I am a polygon.");


  var popup = L.popup();

  function onMapClick(e) {
    popup
      .setLatLng(e.latlng)
      .setContent("You clicked the map at " + e.latlng.toString())
      .openOn(mymap);
  }

  mymap.on('click', onMapClick);
// });
