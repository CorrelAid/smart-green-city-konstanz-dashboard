import * as d3 from "d3";
import Plotly from "plotly.js-dist-min";
import L from "leaflet";

export async function TemperaturWidget() {
  // CSV-Datei laden (aus dem public-Ordner später oder per fetch relativ)
  const response = await fetch("Karte_Messstationen/finalerdf_ws.csv");
  const text = await response.text();
  const data = d3.csvParse(text, d3.autoType);

  const allData = data
    .filter(d => d.date === "2024-07-31")
    .map(d => ({
      ...d,
      datetime: new Date(d.datetime)
    }));

  const grouped = d3.groups(allData, d => d.hour);
  const avgByHour = grouped.map(([hour, values]) => ({
    hour,
    avg: d3.mean(values, d => d.temperature),
    datetime: values[0].datetime
  }));

  // Sicherstellen, dass alle Stunden vorhanden sind, falls Daten fehlen
  for (let i = 0; i < 24; i++) {
    if (!avgByHour[i]) {
      avgByHour[i] = { hour: i, avg: 0, datetime: new Date(2024, 6, 31, i) }; // Standardwert
    }
  }

  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.height = "500px";

  // Karte
  const mapDiv = document.createElement("div");
  mapDiv.id = "map";
  mapDiv.style.width = "65%";
  mapDiv.style.height = "100%";
  container.appendChild(mapDiv);

  // Infofeld
  const infoBox = document.createElement("div");
  infoBox.style.width = "35%";
  infoBox.style.padding = "20px";
  infoBox.style.background = "#f9f9f9";
  infoBox.style.borderLeft = "1px solid #ccc";
  infoBox.style.overflow = "auto";

  const title = document.createElement("h2");
  title.textContent = "Temperaturverlauf am 31. Juli 2024";
  infoBox.appendChild(title);

  const description = document.createElement("p");
  description.textContent = "Hier siehst du den Temperaturdurchschnitt aller Stationen über den Tag.";
  infoBox.appendChild(description);

  const chartDiv = document.createElement("div");
  chartDiv.id = "plotly-chart";
  chartDiv.style.width = "100%";
  chartDiv.style.height = "300px";
  infoBox.appendChild(chartDiv);

  const sliderLabel = document.createElement("label");
  sliderLabel.textContent = "Uhrzeit:";
  infoBox.appendChild(sliderLabel);

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = 0;
  slider.max = 23;
  slider.value = 0;
  slider.id = "hour-slider";
  slider.style.width = "100%";
  infoBox.appendChild(slider);

  container.appendChild(infoBox);

  // Karte initialisieren
  const map = L.map(mapDiv).setView([47.66, 9.18], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);

  const locations = [
    { name: "Döbele", lat: 47.65823856, lon: 9.16889836 },
    { name: "Europapark", lat: 47.66721463, lon: 9.16282324 },
    { name: "Fähre Staad", lat: 47.68211852, lon: 9.20933772 },
    { name: "Friedrichstrasse", lat: 47.67557538, lon: 9.18375494 },
    { name: "Herose-Park", lat: 47.66905485, lon: 9.17457428 },
    { name: "Hörnle", lat: 47.66702444, lon: 9.21448949 },
    { name: "Mainaustrasse", lat: 47.67050958, lon: 9.1877523 },
    { name: "Marktstätte", lat: 47.6604731, lon: 9.17723865 },
    { name: "Riedstrasse", lat: 47.6819759, lon: 9.14705786 },
    { name: "Stadtgarten", lat: 47.66241869, lon: 9.17889136 },
    { name: "Stephansplatz", lat: 47.66186644, lon: 9.17386062 },
    { name: "Bodanplatz", lat: 47.666969, lon: 9.173416 },
    { name: "DWD", lat: 47.6952, lon: 9.1307 }
  ];

  let circles = [];

  function updateMap(hour) {
    circles.forEach(c => map.removeLayer(c));
    circles = [];

    const avg = avgByHour.find(d => d.hour === +hour)?.avg ?? 0;
    const filtered = allData.filter(d => d.hour === +hour);

    filtered.forEach(d => {
      const loc = locations.find(l => l.name === d.name);
      if (!loc) return;

      const deviation = d.temperature - avg;
      const color = d3.scaleLinear().domain([-4, 0, 4]).range(["blue", "white", "red"])(deviation);
      const radius = Math.max(100, Math.abs(deviation) * 100);

      const circle = L.circle([loc.lat, loc.lon], {
        radius,
        fillColor: color,
        fillOpacity: 0.8,
        stroke: false
      }).addTo(map).bindPopup(`${d.name}<br>${d.temperature.toFixed(1)}°C`);

      circles.push(circle);
    });
  }

  function drawChart(hour) {
    const trace = {
      x: avgByHour.map(d => d.datetime),
      y: avgByHour.map(d => d.avg),
      mode: "lines",
      name: "Durchschnitt",
      line: { color: "black" }
    };

    const verticalLine = {
      type: "line",
      x0: avgByHour[hour].datetime,
      x1: avgByHour[hour].datetime,
      y0: 0,
      y1: 1,
      yref: "paper",
      line: {
        color: "gray",
        width: 1,
        dash: "dot"
      }
    };

    Plotly.newPlot(chartDiv, [trace], {
      title: "Temperaturdurchschnitt",
      shapes: [verticalLine],
      xaxis: { tickformat: "%H:%M" },
      yaxis: { title: "°C" },
      margin: { t: 30 }
    });
  }

  slider.addEventListener("input", e => {
    const hour = +e.target.value;
    updateMap(hour);
    drawChart(hour);
  });

  updateMap(0);
  drawChart(0);

  return container;
}
