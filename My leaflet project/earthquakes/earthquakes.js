const map = L.map('eqmap').setView([20, 0], 2);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OSM contributors &copy; CARTO' }).addTo(map);

function magColor(m) {
  return m >= 5 ? '#d73027' : m >= 4 ? '#fc8d59' : m >= 3 ? '#fee08b' : m >= 2 ? '#d9ef8b' : m >= 1 ? '#91cf60' : '#1a9850';
}
function magRadius(m) { return 4 + (m || 0) * 3; }

fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson')
  .then(r => r.json())
  .then(geojson => {
    L.geoJSON(geojson, {
      pointToLayer: function (feature, latlng) {
        const m = feature.properties?.mag || 0;
        return L.circleMarker(latlng, {
          radius: magRadius(m), color: '#333', weight: 0.5, fillColor: magColor(m), fillOpacity: 0.75
        });
      },
      onEachFeature: function (feature, layer) {
        const p = feature.properties || {};
        const when = p.time ? new Date(p.time).toLocaleString() : 'N/A';
        layer.bindPopup(`<strong>${p.place || 'Location unknown'}</strong><br/>Magnitude: <strong>${p.mag ?? 'N/A'}</strong><br/><small>${when}</small>`);
      }
    }).addTo(map);
  });

const legend = L.control({ position: 'bottomright' });
legend.onAdd = function () {
  const div = L.DomUtil.create('div', 'legend');
  const grades = [0, 1, 2, 3, 4, 5];
  let html = '<strong>Magnitude</strong><br/>';
  for (let i = 0; i < grades.length; i++) {
    const from = grades[i], to = grades[i + 1];
    html += `<i style="background:${magColor(from + 0.001)}"></i>${from}${to ? '&ndash;' + to : '+'}<br/>`;
  }
  div.innerHTML = html; return div;
};
legend.addTo(map);