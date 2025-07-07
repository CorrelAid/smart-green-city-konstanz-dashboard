# Konstanz unter der Lupe  
## Wie ein paar Meter den Unterschied machen – beim Klima vor deiner Tür

---

## Einleitung: Spürst du den Unterschied?

Du läufst über den Stephansplatz und spürst, wie die Sonne auf dem Pflaster flimmert.  
Dann machst du ein paar Schritte in den Stadtgarten – plötzlich wirkt es kühler, angenehmer. Dabei bist du nur ein paar hundert Meter gegangen.

**Wie kann das sein?**

In dieser interaktiven Story zeigen wir dir, warum die Temperatur in Konstanz nicht überall gleich ist.  
Wir werfen einen Blick auf die Klimaveränderungen der letzten Jahrzehnte, zeigen dir überraschende Unterschiede innerhalb der Stadt – und du findest selbst heraus, was Orte heiß oder kühl macht.

Denn eines ist sicher: Der Klimawandel ist längst in Konstanz angekommen.  
Aber seine Auswirkungen hängen stark davon ab, **wo du wohnst, arbeitest oder dich einfach gerne aufhältst.**

---

## Teil 1: Wie heiß war’s, als du nach Konstanz gezogen bist?

Vielleicht wohnst du schon lange hier. Vielleicht bist du erst vor Kurzem nach Konstanz gezogen. Aber egal wann du angekommen bist – die Temperatur war damals ziemlich sicher niedriger als heute.

In dem letzten Jahrhundert ist die **durchschnittliche Lufttemperatur in Konstanz deutlich gestiegen**. Und dieser Trend ist kein Zufall. Vielmehr spiegelt er das wider, was Forscher:innen weltweit beobachten:  
**Die Erde erwärmt sich** – und auch hier am Bodensee wird’s Jahr für Jahr ein kleines bisschen wärmer.

In der folgenden Grafik kannst du nicht nur sehen, wie sich die Temperatur seit **1973** verändert hat, sondern auch, was Prognosen für die nächsten Jahrzehnte sagen.

---
🟢 **[Interaktivität]**  
_Trage ein, in welchem Jahr du nach Konstanz gezogen bist – wir zeigen dir den damaligen Standpunkt in der Temperaturkurve._


<!-- get data for chart 1 -> Should perhaps also be outsourced in chart1_weather_trens.js-->
```js
// Was wollt ihr hier für Daten nutzen? Eine Idee wäre, die Jahreswerte aus dem DWD Dashboard wiederzuverwenden.
// Es gäbe dort auch noch 30-jährige gleitende Durchschnitte
const yearly =  FileAttachment("../dwd/dwd/Jahreswerte.csv").csv({typed: true})
// Diese Datei wird von ../../dwd/dwd.zip.py erstellt. Das Python Skript bündelt meherere Dateien in ein ZIP-Archiv (u.a. Jahreswerte.csv);
// Observable Framework stellt diese dann einzeln oder gebündelt zum Download bereit.
```

```js
const years = yearly.map(row => row['Jahr'])
const minYear = Math.min(...years)
const maxYear = Math.max(...years)
// Das wächst automatisch mit, wenn sich die Daten im DWD Dashboard aktualisieren
const arrival = view(Inputs.range([minYear, maxYear], {step: 1}));
```

<!-- Display Chart 1 in a card-->
<div class="card">
  <h2>Temperatur</h2>
  <h3>Jahresdurchschnitt in Konstanz, DWD Station Konstanz</h3>

```js
import drawWeatherTrend from "./charts/chart1_weather_trends.js";

view(drawWeatherTrend(yearly, arrival));
``` 
</div> <!-- card -->



Tipp: Schau dir an, wie groß der Unterschied zwischen deinem Zuzugsjahr 
und heute ist. Das fühlt sich plötzlich gar nicht mehr so abstrakt an, oder?

---

<!-- Vorgehen Maja: 
        - Daten laden bleibt hier im Notebook
        - UI-Inputs bleibt hier im Notebook - Slider, Radiobuttons
        - ausgelagter - Visualisierung - Diagramm und Karte ertellen und Karte updaten-->
## Teil 2: Eine Stadt, viele Klimas
Es gibt Tage, da fühlt sich Konstanz an wie zwei verschiedene Städte: Wäh-
rend es in der Innenstadt heiß und stickig ist, ist es im Herose-Park oder am 
Hörnle deutlich angenehmer.

Aber ist das wirklich messbar - oder nur Gefühlssache?

Die Stadt Konstanz betreibt mehrere Wetter-Messstationen, die quer über 
das Stadtgebiet verteilt sind. Und genau diese liefern spannende Daten: 

Auch wenn alle Stationen dieselbe Sonne abbekommen, zeigen sie an einem 
Sommertag sehr unterschiedliche Temperaturverläufe

🟢 **[Interaktivität]**  
_Klicke auf eine der Stationen auf der Karte. Der 
dazugehörige Temperaturverlauf wird im Diagramm hervorgehoben. Mit 
dem Slider unterhalb der Grafik kannst du außerdem gezielt eine Uhrzeit 
auswählen - und sehen, wie warm es zu dieser Stunde an den verschiedenen 
Stationen war_

### Temperaturverlauf am 31. Juli 2024

<!-- get data for chart2 -->
```js
const stationen = FileAttachment("stationen.geo.json").json()
const tagesverlauf = FileAttachment('./tagesverlauf.csv').csv({typed: true})
```

<!-- UI-Inputs chart2 -->
```js
const stationsnamen = stationen.features.map(f => f.properties.name);
const station_input = Inputs.radio(stationsnamen, {value: stationsnamen[7]});
// const station_input = Mutable(stationsnamen[7]); // ohne Radio Buttons
const stunde_input = Inputs.range([0, 23], {step: 1, label: "Stunde"});

const station = view(station_input);
const stunde = view(stunde_input)
```



```js
const map_div = document.createElement("div");
map_div.style = "height:25rem";
//display(map_div)
```

```js
import { createSensorMap, updateSensorMap, createSensorLineChart } from "./charts/chart2_sensor_map.js";


const map = createSensorMap(map_div, stationen, station_input);
updateSensorMap(map, stationen, station, station_input);
view(createSensorLineChart(tagesverlauf, stationsnamen, stunde));

``` 

<div class="card">
  <h2>Temperatur</h2>
  <h3>Tagesverlauf an verschiedenen SGC Wetterstationen in Konstanz</h3>

<!--
```js
const plt = Plot.plot({
  grid: true, // Konsistent mit Dashboards
  inset: 10, // Konsistent mit Dashboards
  x: {
    label: "Stunde",
    labelAnchor: 'center',
    labelArrow: 'none',
    tickFormat: x => x, // do nothing
  },
  y: {
    label: "℃"
  },
  color: {
    domain: stationsnamen,
    legend: true,
  },
  marks: [
    Plot.line(tagesverlauf, {
      x: "Stunde",
      y: "Temperatur_Celsius",
      stroke: "Station",
    }),
    Plot.ruleX([stunde], {
      stroke: 'var(--theme-foreground-focus)', // use focus color defined by theme
    }),
  ]
});
view(plt);
```

</div> --> 
<!-- card -->


<!--
```js
// Die Karte wurde oben bereits ins HTML / DOM eingebettet. Hier wird sie befüllt.

const map = L.map(map_div, {
  scrollWheelZoom: false,
  dragging: false,
  doubleClickZoom: false,
  boxZoom: false,
  keyboard: false,
  zoomControl: false,
});

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a> & OpenStreetMap contributors',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

// This is for handling page resizes:
const bounds = L.geoJSON(stationen).getBounds();
const mapResizeObserver = new ResizeObserver(() => {
  map.invalidateSize();
  map.fitBounds(bounds, {padding: [13, 13]});
});
mapResizeObserver.observe(map_div); // do this once in the beginning

function paintPoints(selectedStation) {
  // To avoid adding layer after layer, we first remove all layers and
  // then only re-add what we need.
  map.eachLayer(function(layer) {
      // Keep the tile layer, remove everything else
      if (!(layer instanceof L.TileLayer)) {
          map.removeLayer(layer);
      }
  });

  const geojsonLayer = L.geoJSON(stationen, {
      pointToLayer: function (feature, latlng) {
          const highlight = feature.properties.name === selectedStation;
          const color = highlight ? 'var(--theme-foreground-focus)' : 'var(--theme-foreground-faint)';
          const marker = L.circleMarker(latlng, {
              radius: 8,
              color: color,
              fillColor: color,
              fillOpacity: 1
          });
          marker.bindTooltip(feature.properties.name);
          marker.on("click", () => {
            station_input.value = feature.properties.name;
            paintPoints(feature.properties.name); // I'd expect this to happen automatically but it doesn't
            return true;
          });
          return marker
      }
  }).addTo(map);
};
```


```js display=false
// This block is re-evaluated whenever the input 'station' changes.
paintPoints(station);
```
-->
Du wirst sehen: Manche Stationen steigen schon am frühen Morgen stark 
an, andere bleiben lange kühl. 

Am Abend kühlen einige rasch ab, während 
andere Orte die Hitze speichern - oft bis tief in die Nacht.
Man sieht deutlich, dass der Standort den Unterschied macht. Ob Wiese 
oder Asphalt, Bäume oder offene Fläche – all das beeinflusst, wie stark sich 
ein Ort im Laufe des Tages aufheizt oder abkühlt.

Und das hat Folgen: Für dein persönliches Wohlbefinden, aber auch für die 
Gesundheit älterer Menschen, die Planung von Spielplätzen, Fahrradwegen 
oder Schulhöfen



---

## Teil 3: Was beeinflusst die Temperatur vor deiner Haustür?
Warum ist es an einem Ort heißer als am anderen - obwohl beide nur wenige
Straßen voneinander entfernt sind?

Jetzt kannst du selbst vergleichen: Unsere dritte Grafik zeigt dir nicht nur 
die Temperaturdaten, sondern auch, wie die Umgebung der Messstationen 
aussieht. Gibt es dort viele Gebäude? Asphaltierte Flächen? Oder überwie-
gen Bäume und Wiesen?

🟢 **[Interaktivität]**  
Wähle zwei Stationen aus. Die Grafik zeigt dir für jede von ihnen, wie die Umgebung im Umkreis von 50 Metern (stimmt 
das mit den 50 Metern?) beschaffen ist – also zum Beispiel, wie viel Grünflä-
che, Gebäude oder Asphalt dort vorhanden sind. Außerdem siehst du durch 
die unter den Kartenausschnitten angezeigten „Erhitzungsmuster“, wie 
stark die Temperatur der jeweiligen Station zu verschiedenen Tageszeiten 
vom Mittelwert aller Stationen abweicht.  (Eventuell hier noch etwas dazu, 
wie die Erhitzungsmuster mit der Umgebungsbeschaffenheit zusammenhän-
gen könnten)

```js
const left_input = Inputs.select(stationsnamen, {value: stationsnamen[0]});
const right_input = Inputs.select(stationsnamen, {value: stationsnamen[1]});
```

<div class="grid grid-cols-2">
<div class="card grid-colspan-1">

Station A

```js
const left = view(left_input)
```

</div> <!-- card -->

<div class="card grid-colspan-1">

Station B

```js
const right = view(right_input)
```

</div> <!-- card -->

</div> <!-- grid -->


<div class="card">

```js
const plt = Plot.plot({
  grid: true, // Konsistent mit Dashboards
  inset: 10, // Konsistent mit Dashboards
  x: {
    label: "℃",
    labelAnchor: 'center',
    labelArrow: 'none',
    tickFormat: x => x, // do nothing
  },
  y: {
    label: "",
    tickFormat: x => "", // drop label
  },
  color: {
    domain: [left, right],
    legend: true,
  },
  marks: [
    Plot.barX(tagesverlauf.filter(x => x.Station === left || x.Station === right), {y: "Station", fy: "Stunde", x:"Temperatur_Celsius", fill: "Station"}),
  ]
});
view(plt);
```

</div> <!-- card -->

Hier zeigt sich, wie stark der Einfluss der Umgebung wirklich ist: 

Eine Station, die zum Beispiel von sehr vielen Bäumen umgeben ist, heizt sich 
tagsüber deutlich langsamer auf als eine, die in einem versiegelten, offenen 
Innenhof liegt. (Eventuell zu allgemein, da dies nicht auf alle Stationen zu-
trifft, oder?) Die Unterschiede sind messbar – und spürbar.
Genau an diesem Punkt setzt auch die städtische Klimapolitik an. Wenn wir 
besser verstehen, welche Faktoren das Mikroklima beeinflussen, können 
gezielt Maßnahmen ergriffen werden, um gegenzusteuern

---

## Experteninterview: Was tun gegen die Hitze in der Stadt?

Im folgenden Video kommen zwei Expert:innen zu Wort:

Tim, Experte für das Stadtklima Konstanz, erklärt (kommt noch, können wir 
dann darauf anpassen, über was er am Ende redet)

Die Klimaanpassungsbeauftragte der Stadt Konstanz, (Insert her name), er-
zählt (kommt  auch noch, wenn wir die Videos haben)

Sie gehen auch auf die Daten ein, die du gerade selbst untersucht hast - und
sprechen darüber, was man daraus für die Stadt, die Planung und den Um-
gang mit Hitze lernen kann

<!-- patrik: Ich werde hier noch etwas einbauen, dass Youtube nur nach Consent geladen wird. Oder das Video selber hosten. -->
 <iframe style="width:100%; aspect-ratio: 16/9;"
src="https://www.youtube.com/embed/E4WlUXrJgy4">
</iframe> 

## Fazit: Das Klima ist nicht überall gleich - auch nicht in deiner Stadt Konstanz

Was wir aus dieser Reise durch Konstanz mitnehmen: Der Klimawandel ist 
nicht nur ein globales Thema. Er ist spürbar - und er trifft nicht alle Orte in 
der Stadt gleichermaßen.

Es macht einen Unterschied, ob du in einem grünen Viertel wohnst oder in 
einem Quartier mit vielen versiegelten Flächen. Und es macht einen Unter-
schied, wie eine Stadt auf diese Unterschiede reagiert.

Lösungen gibt es – aber sie brauchen Raum und Aufmerksamkeit. Dazu ge-
hört, vorhandene Grünflächen zu erhalten und neue zu schaffen, versiegelte 
Flächen dort zu reduzieren, wo es möglich ist, und gezielt Schattenräume 
einzuplanen – vor allem an stark genutzten Orten wie Spielplätzen, Schulhö-
fen oder öffentlichen Plätzen.

## Und du?

Was ist dein heißester Ort in Konstanz?

Ist dir schon mal aufgefallen, dass es bei dir zuhause abends einfach nicht 
abkühlt? Oder dass ein bestimmter Weg zur Arbeit besonders schweißtrei-
bend ist?

Teile deine Erfahrungen mit uns! (falls wir noch ein letztes interaktives Ele-
ment anstreben