const map = L.map('weathermap').setView([38, -95], 4);
const basemap = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  { attribution: '&copy; OpenStreetMap contributors &copy; CARTO' }
).addTo(map);

const radar = L.tileLayer.wms('https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi', {
  layers: 'nexrad-n0r-900913',
  format: 'image/png',
  transparent: true,
  opacity: 0.6
}).addTo(map);

fetch('https://api.weather.gov/alerts/active?region_type=land')
  .then(r => r.json())
  .then(data => {
    L.geoJSON(data, {
      style: function (feature) {
        const sev = (feature.properties?.severity || '').toLowerCase();
        let alertColor = 'orange';
        if (sev === 'extreme') alertColor = 'purple';
        else if (sev === 'severe') alertColor = 'red';
        else if (sev === 'moderate') alertColor = 'gold';
        else if (sev === 'minor') alertColor = 'green';
        return { color: alertColor, weight: 2, fillOpacity: 0.15 };
      },
      onEachFeature: function (feature, layer) {
        const h = feature.properties?.headline || 'NWS Alert';
        const sev = feature.properties?.severity || 'N/A';
        const evt = feature.properties?.event || '';
        const area = feature.properties?.areaDesc || '';
        layer.bindPopup(`<strong>${h}</strong><br/>Severity: ${sev}<br/>Event: ${evt}<br/><small>${area}</small>`);
      }
    }).addTo(map);
  })
  .catch(err => console.error('NWS alerts error:', err));