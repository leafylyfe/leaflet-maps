const map = L.map('map').setView([35, -98], 4);
const base = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OSM contributors &copy; CARTO' }).addTo(map);
const radar = L.tileLayer.wms('https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi', { layers: 'nexrad-n0r-900913', format: 'image/png', transparent: true, opacity: 0.6 }).addTo(map);
const alertsLayer = L.layerGroup(); const quakesLayer = L.layerGroup();

fetch('https://api.weather.gov/alerts/active?region_type=land')
  .then(r => r.json())
  .then(data => { alertsLayer.addLayer(L.geoJSON(data, { style: f => { const sev = (f.properties?.severity || '').toLowerCase(); let c = 'orange'; if (sev === 'extreme') c = 'purple'; else if (sev === 'severe') c = 'red'; else if (sev === 'moderate') c = 'gold'; else if (sev === 'minor') c = 'green'; return { color: c, weight: 2, fillOpacity: 0.15 }; }, onEachFeature: (f, l) => { l.bindPopup(`<strong>${f.properties?.headline || 'NWS Alert'}</strong>`); } })); });

function magColor(m) { return m >= 5 ? '#d73027' : m >= 4 ? '#fc8d59' : m >= 3 ? '#fee08b' : m >= 2 ? '#d9ef8b' : m >= 1 ? '#91cf60' : '#1a9850'; }
function magRadius(m) { return 4 + (m || 0) * 3; }

fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson')
  .then(r => r.json())
  .then(geo => { quakesLayer.addLayer(L.geoJSON(geo, { pointToLayer: (f, ll) => { const m = f.properties?.mag || 0; return L.circleMarker(ll, { radius: magRadius(m), color: '#333', weight: 0.5, fillColor: magColor(m), fillOpacity: 0.75 }); }, onEachFeature: (f, l) => { const p = f.properties || {}; const when = p.time ? new Date(p.time).toLocaleString() : 'N/A'; l.bindPopup(`<strong>${p.place || 'Unknown'}</strong><br/>Mag: ${p.mag ?? 'N/A'}<br/><small>${when}</small>`); } })); });

L.control.layers(null, { 'Weather Alerts': alertsLayer, 'Earthquakes': quakesLayer, 'Radar': radar }, { collapsed: false }).addTo(map);

const legend = L.control({ position: 'bottomright' });
legend.onAdd = function () { const div = L.DomUtil.create('div', 'legend'); const grades = [0, 1, 2, 3, 4, 5]; let html = '<strong>Magnitude</strong><br/>'; for (let i = 0; i < grades.length; i++) { const from = grades[i], to = grades[i + 1]; html += `<i style="background:${magColor(from + 0.001)}"></i>${from}${to ? '&ndash;' + to : '+'}<br/>`; } div.innerHTML = html; return div; }; legend.addTo(map);
map.on('overlayadd', e => { if (e.name.includes('Earthquakes')) legend.getContainer().style.display = 'block'; });
map.on('overlayremove', e => { if (e.name.includes('Earthquakes')) legend.getContainer().style.display = 'none'; });
setTimeout(() => { if (legend.getContainer()) legend.getContainer().style.display = 'none'; }, 0);