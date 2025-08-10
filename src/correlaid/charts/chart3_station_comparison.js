// charts/chart3_station_comparison.js
import * as d3 from "npm:d3";
import * as L from "npm:leaflet";
import { html } from "htl";

// =====================
// Konfiguration
// =====================
const MAP_RADIUS_M = 50;            // 50 m Kreis
const MAP_DIAMETER = 350;           // Kreisgröße auf der Karte (px)
const MAP_ZOOM = 18.48;
const HEAT_H = 40;                  // Höhe inkl. Zahlen
const HEAT_MIN_W = 320;             // Sicherheitsminimum Heatmap-Breite

const TREE_COLOR = "#008000ff";     // Farbe für Baumkronen-Fortschrittsleiste

// Kategorien (Kies = unversiegelt) – mit deinen Farben
const flaechenKategorien = [
    { key: "gebaeude_%", label: "Gebäude", color: "#b3b3b3ff", group: "versiegelt" },
    { key: "asphalt_%", label: "Asphalt", color: "#333333ff", group: "versiegelt" },
    { key: "kies_%", label: "Kies", color: "#ffd7aaff", group: "unversiegelt" },
    { key: "gruen_%", label: "Grünflächen", color: "#b1d49aff", group: "unversiegelt" },
    { key: "wasser_%", label: "Wasser", color: "#5a8ebfff", group: "unversiegelt" }
];

// Schlüssel für Baum-/Baumkronen-Anteile (tree statt canopy)
const treeKeys = ["baeume_%", "baumkronen_%", "baumkronenflaeche_%"];
const maxTempKeys = ["Hottest_Day"];     // deine Spaltennamen
const hotDaysKeys = ["Hot_Days_Count"];

// =====================
// Öffentliche API
// =====================
export function createStationComparison({
    host,
    stationMeta,
    heatmapData,
    hotData,
    leftSelect,
    rightSelect,
    stationTexts = {}
}) {
    // Grid-Layout für die zwei Kartenkarten (linke/rechte Seite)
    host.style.display = "grid";
    host.style.gridTemplateColumns = "minmax(0,1fr) minmax(0,1fr)";
    host.style.columnGap = "8px";
    host.style.alignItems = "start";

    const left = buildCard();
    const right = buildCard();

    host.append(left.cardEl, right.cardEl);

    // initial render
    renderSide(left, leftSelect.value, stationMeta, heatmapData, hotData, stationTexts);
    renderSide(right, rightSelect.value, stationMeta, heatmapData, hotData, stationTexts);

    // Interaktion
    leftSelect.addEventListener("input", () => renderSide(left, leftSelect.value, stationMeta, heatmapData, hotData, stationTexts));
    rightSelect.addEventListener("input", () => renderSide(right, rightSelect.value, stationMeta, heatmapData, hotData, stationTexts));

    // Re-Layout bei Resize (volle Breite Heatmap)
    const onResize = () => {
        renderHeatFullWidth(left);
        renderHeatFullWidth(right);
    };
    window.addEventListener("resize", onResize);
}

// =====================
// Card-Baustein
// =====================
function buildCard() {
    // Karten-Card (äußerer Wrapper)
    const cardEl = document.createElement("div");
    cardEl.className = "card";

    // Titel der Card
    const titleEl = document.createElement("station_name");
    titleEl.className = "station_name";

    // Top-Zeile: runde Karte (links) + Info-Boxen (rechts)
    const topRow = document.createElement("div");
    topRow.className = "grid-2";
    topRow.style.gridTemplateColumns = `${MAP_DIAMETER}px 1fr`; // linke Spalte fest auf Kartendurchmesser

    // Runder Karten-Container
    const mapWrap = document.createElement("div");
    mapWrap.className = "map-round";
    mapWrap.style.width = `${MAP_DIAMETER}px`;
    mapWrap.style.height = `${MAP_DIAMETER}px`;

    // Leaflet-Karte
    const map = L.map(mapWrap, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        doubleClickZoom: false,
        scrollWheelZoom: false,
        boxZoom: false,
        keyboard: false,
        zoomSnap: 0,
        zoomDelta: 0.1,
        maxZoom: 22,
        zoom: MAP_ZOOM
    });

    L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "Tiles © Esri", maxZoom: 22, maxNativeZoom: 19 }
    ).addTo(map);
    setTimeout(() => map.invalidateSize(), 0);

    // Rechte Spalte (Container für die Boxen)
    const rightCol = document.createElement("div");
    rightCol.style.display = "flex";
    rightCol.style.flexDirection = "column";
    rightCol.style.gap = "8px";

    // --- Box 1: Überschrift Oberflächen ---
    const surfHdr = document.createElement("div");      // Überschrift der Box
    surfHdr.className = "small-title";
    surfHdr.textContent = "Oberflächenbeschaffenheit im Umkreis von 50 m";

    const surfBox = document.createElement("div");      // Inhaltliche Box (Rahmen/Hintergrund via CSS)
    surfBox.className = "box";

    const barsHost = document.createElement("div");     // Container für die Balkenliste
    barsHost.className = "barlist";
    surfBox.appendChild(barsHost);

    // --- Box 2: Überschrift Baumkronen/Tree ---
    const treeHdr = document.createElement("div");      // Überschrift der Tree-Box
    treeHdr.className = "small-title";
    treeHdr.textContent = "Beschattungsanteil durch Baumkronen im Sommer";

    const treeBox = document.createElement("div");      // Tree-Box (Rahmen/Hintergrund via CSS)
    treeBox.className = "box";

    const treeRow = document.createElement("div");      // Zeile: Label – Fortschrittsbalken – Prozent
    treeRow.className = "barrow";

    const treeLabel = document.createElement("span");   // Label links
    treeLabel.className = "barlabel";
    treeLabel.textContent = "Baumkronenfläche";


    const treeBar = document.createElement("div");      // Fortschrittsbalken außen
    treeBar.className = "barouter";
    treeBar.style.flex = "1";
    treeBar.style.height = "14px";

    const treeFill = document.createElement("div");     // Fortschrittsbalken Füllung
    treeFill.className = "barvalue";
    treeFill.style.height = "14px";
    treeFill.style.background = TREE_COLOR;
    treeFill.style.width = "0%";
    treeBar.appendChild(treeFill);

    const treePct = document.createElement("span");     // Prozentzahl rechts
    treePct.style.fontSize = "14px";
    treePct.style.fontWeight = "700";

    treeRow.append(treeLabel, treeBar, treePct);
    treeBox.appendChild(treeRow);

    // Rechte Spalte zusammenbauen
    rightCol.append(surfHdr, surfBox, treeHdr, treeBox);

    // Top-Zeile zusammenbauen
    topRow.append(mapWrap, rightCol);

    // --- Heatmap-Block (Titel, Erklärung, SVG, Achsenbeschriftung) ---
    const heatBlock = document.createElement("div");    // Container Heatmap-Bereich
    heatBlock.className = "heat-block";

    const heatTitle = document.createElement("div");    // Heatmap-Titel
    heatTitle.className = "heat-title";
    heatTitle.textContent = "Wie warm war es hier im Vergleich zu den anderen Stationen im Tagesverlauf?";

    const heatExplain = document.createElement("div");  // Heatmap-Erklärung
    heatExplain.className = "heat-explain";
    heatExplain.textContent = "Tägliches Erwärmungsmuster – blau = kühler, rot = wärmer (Abweichung vom Mittel)";

    const heatSvg = d3.create("svg")                    // Heatmap-SVG selbst
        .attr("height", HEAT_H)
        .node();

    const heatBottom = document.createElement("div");   // Achsenbeschriftung unten
    heatBottom.className = "heat-bottom";
    heatBottom.textContent = "Uhrzeit [Stunden]";

    heatBlock.append(heatTitle, heatExplain, heatSvg, heatBottom);

    // --- KPI-Boxen (zwei Spalten) ---
    const kpiWrap = document.createElement("div");      // Grid für zwei KPI-Boxen
    kpiWrap.className = "grid-2";
    kpiWrap.style.gridTemplateColumns = "1fr 1fr";

    const kpi1 = mkKpiBox("Maximaltemperatur (2024)");  // KPI 1
    const kpi2 = mkKpiBox("Anzahl heißer Tage (2024)"); // KPI 2
    kpiWrap.append(kpi1.wrap, kpi2.wrap);

    // --- Freitext-Box unten ---
    const textBox = document.createElement("div");      // Einheitliche Box-Optik
    textBox.className = "box";
    const textEl = document.createElement("div");       // Text-Inhalt
    textEl.className = "station-text";
    textEl.style.fontSize = "14px";
    textEl.style.color = "#111";
    textBox.appendChild(textEl);

    // Card zusammenbauen
    cardEl.append(titleEl, topRow, heatBlock, kpiWrap, textBox);

    return {
        cardEl,
        titleEl,
        map,
        barsHost,
        treeFill,
        treePct,
        heatSvg,
        maxTempEl: kpi1.value,
        hotDaysEl: kpi2.value,
        textEl,
        marker: null,
        circle: null,
        currentStation: null
    };
}

// =====================
// Rendering
// =====================
function renderSide(side, stationName, metaRows, heatmapData, hotRows, stationTexts) {
    if (!stationName) return;
    side.currentStation = stationName;

    const meta = metaRows.find(d => d.name === stationName);
    if (!meta) return;

    // Titel aktualisieren
    side.titleEl.textContent = stationName;

    // Karte setzen
    const { lat, lon } = meta;
    side.map.setView([+lat, +lon], MAP_ZOOM, { animate: false });
    side.map.setZoom(MAP_ZOOM, { animate: false });
    if (side.marker) side.map.removeLayer(side.marker);
    if (side.circle) side.map.removeLayer(side.circle);
    //side.marker = L.marker([+lat, +lon]).addTo(side.map);
    side.circle = L.circle([+lat, +lon], { radius: MAP_RADIUS_M, color: "#9f9f9fff", weight: 4, fill: false }).addTo(side.map);

    // Oberflächen-Balken
    renderSurfaceBars(side.barsHost, meta);

    // Tree-/Baumkronen-Balken
    const treeKey = firstExistingKey(meta, treeKeys);
    const treeVal = percent01(+meta[treeKey]);
    const pct = Math.round(treeVal * 100);
    side.treeFill.style.width = `${pct}%`;
    side.treePct.textContent = `${pct} %`;

    // Heatmap volle Breite
    side.heatSvg.dataset.values = JSON.stringify(heatmapData[stationName] || []);
    renderHeatFullWidth(side);

    // KPIs
    const hot = hotRows.find(d => d.name === stationName) || {};
    const maxKey = firstExistingKey(hot, maxTempKeys);
    const hotKey = firstExistingKey(hot, hotDaysKeys);
    const maxVal = hot[maxKey] != null ? +hot[maxKey] : null;
    const daysVal = hot[hotKey] != null ? +hot[hotKey] : null;

    side.maxTempEl.textContent = maxVal != null && !Number.isNaN(+maxVal) ? `${(+maxVal).toFixed(1)} °C` : "–";
    side.hotDaysEl.textContent = daysVal != null && !Number.isNaN(+daysVal) ? `${Math.round(+daysVal)}` : "–";

    // Text (falls vorhanden), sonst Auto-Text
    const t = stationTexts && (stationTexts[stationName] || stationTexts[slug(stationName)]);
    side.textEl.textContent = t ? String(t) : makeAutoText(meta, daysVal);
}

// Heatmap neu zeichnen (volle Card-Breite)
function renderHeatFullWidth(side) {
    const values = JSON.parse(side.heatSvg.dataset.values || "[]");
    if (!values || values.length !== 24) return;

    // verfügbare Breite ~ Cardbreite minus Padding
    const box = side.cardEl.getBoundingClientRect();
    const width = Math.max(HEAT_MIN_W, Math.floor(box.width - 32));

    side.heatSvg.setAttribute("width", width.toString());
    renderHeat(side.heatSvg, values);
}

// =====================
// Zeichner
// =====================
function renderSurfaceBars(containerEl, meta) {
    containerEl.innerHTML = "";

    const groups = [
        { title: "Versiegelte Flächen", items: flaechenKategorien.filter(k => k.group === "versiegelt") },
        { title: "Unversiegelte Flächen", items: flaechenKategorien.filter(k => k.group === "unversiegelt") }
    ];

    groups.forEach(g => {
        // Box für eine Gruppe (Rahmen/Hintergrund via .box)
        const box = document.createElement("div");
        box.className = "box";

        // Überschrift der Gruppe
        const gTitle = document.createElement("div");
        gTitle.className = "smaller-title";
        gTitle.textContent = g.title;
        box.appendChild(gTitle);

        // Einträge (Label – Balken – Prozent)
        g.items.forEach(item => {
            const row = document.createElement("div");        // eine Balken-Zeile
            row.className = "barrow";

            const lbl = document.createElement("div");        // Label links
            lbl.className = "barlabel";
            lbl.textContent = item.label;

            const barOuter = document.createElement("div");   // Balken außen
            barOuter.className = "barouter";

            const barInner = document.createElement("div");   // Balken-Füllung
            const val = clamp0_100(+meta[item.key]);
            barInner.className = "barvalue";
            barInner.style.width = `${val}%`;
            barInner.style.background = item.color;
            barOuter.appendChild(barInner);

            const valTxt = document.createElement("div");     // Prozentzahl rechts
            valTxt.textContent = `${Math.round(val)}%`;
            valTxt.style.fontSize = "12px";
            valTxt.style.width = "30px";
            valTxt.style.textAlign = "right";

            row.append(lbl, barOuter, valTxt);
            box.appendChild(row);
        });

        containerEl.appendChild(box);
    });
}

function renderHeat(svgNode, values) {
    const width = +svgNode.getAttribute("width");
    const height = +svgNode.getAttribute("height") || HEAT_H;

    const labelPad = 20;               // reservierter Bereich unten (px)
    const labelOffset = 6;                // kleiner Abstand von oben in diesem Bereich
    const plotH = Math.max(0, height - labelPad);
    const cellW = width / 24;

    const color = d3.scaleLinear()
        .domain([-0.6, 0, 0.9])
        .range(["#2166AC", "#F7F7F7", "#C70039"]);

    const svg = d3.select(svgNode);
    svg.selectAll("*").remove();

    // Heatmap-Zellen
    svg.append("g")
        .selectAll("rect")
        .data(values)
        .join("rect")
        .attr("x", (_, i) => i * cellW)
        .attr("y", 0)
        .attr("width", cellW)
        .attr("height", plotH)
        .attr("fill", d => color(d));

    // Stunden 1..24 — korrekt im reservierten Bereich platzieren
    svg.append("g")
        .attr("transform", `translate(0, ${plotH + labelOffset})`)
        .selectAll("text")
        .data(values)
        .join("text")
        .attr("x", (_, i) => i * cellW + cellW / 2)
        .attr("y", 0)                       // y=0, weil wir die Gruppe verschoben haben
        .attr("text-anchor", "middle")
        .attr("class", "heat-hour-label")
        .text((_, i) => i + 1);
}

// =====================
// Utilities
// =====================
function mkKpiBox(title) {
    // KPI-Box (Rahmen/Hintergrund via .kpi)
    const wrap = document.createElement("div");
    wrap.className = "kpi";

    // KPI-Titel (gleiche Typo wie Heatmap-Titel)
    const t = document.createElement("div");
    t.className = "heat-title";
    t.textContent = title;

    // KPI-Wert (Farbe via CSS-Variable --kpi-color)
    const v = document.createElement("div");
    v.className = "kpi__value";

    wrap.append(t, v);
    return { wrap, value: v };
}

function firstExistingKey(obj, candidates) {
    for (const k of candidates) if (obj && Object.prototype.hasOwnProperty.call(obj, k)) return k;
    return candidates[0];
}
function clamp0_100(v) {
    if (Number.isNaN(v) || v == null) return 0;
    return Math.max(0, Math.min(100, v));
}
function percent01(v) {
    if (Number.isNaN(v) || v == null) return 0;
    return v > 1 ? clamp0_100(v) / 100 : Math.max(0, Math.min(1, v));
}
function slug(s) { return String(s).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-"); }

function makeAutoText(meta, hotDays) {
    // versiegelt = Gebäude + Asphalt (Kies unversiegelt)
    const sealed = ["gebaeude_%", "asphalt_%"].map(k => +meta[k] || 0).reduce((a, b) => a + b, 0);
    const tree = Math.round(clamp0_100(+meta[firstExistingKey(meta, treeKeys)] || 0));
    const parts = [];
    parts.push(`Im 50-m-Umkreis sind etwa ${Math.round(clamp0_100(sealed))} % der Fläche versiegelt.`);
    parts.push(`Baumkronenanteil ca. ${tree} %.`);
    if (hotDays != null) parts.push(`2024 wurden hier ungefähr ${Math.round(+hotDays)} heiße Tage gezählt.`);
    return parts.join(" ");
}
