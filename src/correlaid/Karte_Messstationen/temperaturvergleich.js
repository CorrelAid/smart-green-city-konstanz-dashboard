import * as d3 from "d3";
import Plotly from "plotly.js-dist-min";

export async function TemperaturWidget() {
  const response = await fetch("/Karte_Messstationen/finalerdf_ws.csv");
  const text = await response.text();
  const data = d3.csvParse(text, d3.autoType);

  const locations = {
    "Bodanplatz": { lat: 47.666969, lon: 9.173416 },
    "Marktstätte": { lat: 47.6604731, lon: 9.17723865 },
    "Hörnle": { lat: 47.66702444, lon: 9.21448949 },
    "Döbele": { lat: 47.65823856, lon: 9.16889836 },
    "Europapark": { lat: 47.66721463, lon: 9.16282324 },
    "Fähre Staad": { lat: 47.68211852, lon: 9.20933772 },
    "Friedrichstrasse": { lat: 47.67557538, lon: 9.18375494 },
    "Herose-Park": { lat: 47.66905485, lon: 9.17457428 },
    "Mainaustrasse": { lat: 47.67050958, lon: 9.1877523 },
    "Riedstrasse": { lat: 47.6819759, lon: 9.14705786 },
    "Stadtgarten": { lat: 47.66241869, lon: 9.17889136 },
    "Stephansplatz": { lat: 47.66186644, lon: 9.17386062 },
    "DWD": { lat: 47.6952, lon: 9.1307 }
  };
  const allData = data
    .filter(d => d.date === "2024-07-31" && d.name in locations)
    .map(d => ({
      ...d,
      ...locations[d.name],
      datetime: new Date(d.datetime)
    }));

  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.padding = "1rem";

  const title = document.createElement("h2");
  title.textContent = "Temperaturabweichungen am 31. Juli 2024 (interaktive Karte)";
  container.appendChild(title);

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = 0;
  slider.max = 23;
  slider.value = 0;
  slider.style.width = "100%";
  container.appendChild(slider);

  const chartDiv = document.createElement("div");
  chartDiv.style.width = "100%";
  chartDiv.style.height = "500px";
  container.appendChild(chartDiv);

  function drawMap(hour) {
    const subset = allData.filter(d => d.hour === +hour);
    const avg = d3.mean(subset, d => d.temperature);

    const trace = {
      type: "scattergeo",
      locationmode: "ISO-3",
      lat: subset.map(d => d.lat),
      lon: subset.map(d => d.lon),
      text: subset.map(d => `${d.name}<br>${d.temperature.toFixed(1)}°C`),
      marker: {
        size: subset.map(d => Math.abs(d.temperature - avg) * 10 + 5),
        color: subset.map(d => d.temperature - avg),
        colorscale: "RdBu",
        cmin: -4,
        cmax: 4,
        colorbar: { title: "Abweichung (°C)" },
        reversescale: true
      },
      hoverinfo: "text"
    };

    const layout = {
      title: `Stunde: ${hour}:00`,
      geo: {
        projection: { type: "mercator" },
        center: { lat: 47.66, lon: 9.18 },
        lataxis: { range: [47.63, 47.70] },
        lonaxis: { range: [9.12, 9.22] },
        showland: true,
        landcolor: "#eee",
        countrycolor: "#ccc"
      },
      margin: { t: 30, r: 10, l: 10, b: 10 }
    };

    Plotly.newPlot(chartDiv, [trace], layout, { responsive: true });
  }

  slider.addEventListener("input", e => drawMap(+e.target.value));
  drawMap(0);

  console.log("Daten geladen:", allData);
  console.log("CSV-Rohtext:", text);


  return container;
}