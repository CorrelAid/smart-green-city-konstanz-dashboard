---
theme: ["air", "wide"]
sidebar: true
toc:
  label: 'Kapitel'
---
<!-- mit theme: dashboard ist alles im darkmode, wenn die Voreinstellung des Betriebssystems/Browsers so ist
    mit "wide" wird die Sidebar kleiner -->

<!--brauche ich damit ich in style.css z.B. die Schriftbreite ändern kann -->
<div class="correlaid-page"> 

# Konstanz unter der Lupe  
## Wie ein paar Meter den Unterschied machen – beim Klima vor deiner Tür

---

## Einleitung: Spürst du den Unterschied?

Du läufst über den Stephansplatz und spürst, wie die Sonne auf dem Pflaster flimmert. Dann machst du ein paar Schritte in den Stadtgarten – plötzlich wirkt es kühler, angenehmer. Dabei bist du nur ein paar hundert Meter gegangen.

**Wie kann das sein?**

In dieser interaktiven Story zeigen wir dir, warum die Temperatur in Konstanz nicht überall gleich ist. Wir werfen einen Blick auf die Klimaveränderungen der letzten Jahrzehnte, zeigen dir überraschende Unterschiede innerhalb der Stadt – und du findest selbst heraus, was Orte heiß oder kühl macht.

Denn eines ist sicher: Der Klimawandel ist längst in Konstanz angekommen. Aber seine Auswirkungen hängen stark davon ab, **wo du wohnst, arbeitest oder dich einfach gerne aufhältst.**

---

## Teil 1: Wie heiß war’s, als du nach Konstanz gezogen bist?

Vielleicht wohnst du schon lange hier. Vielleicht bist du erst vor Kurzem nach Konstanz gezogen. Aber egal wann du angekommen bist – die Temperatur war damals ziemlich sicher niedriger als heute.

In dem letzten Jahrhundert ist die **durchschnittliche Lufttemperatur in Konstanz deutlich gestiegen**. Und dieser Trend ist kein Zufall. Vielmehr spiegelt er das wider, was Forscher:innen weltweit beobachten:  
<span style="padding-left: 6em; padding-top: 0.4em; display: inline-block;">**Die Erde erwärmt sich** – und auch hier am Bodensee wird’s Jahr für Jahr ein kleines bisschen wärmer. 



<span style="padding-top: 2em; display: inline-block;"> 🟢 **[Interaktivität]**  
In der folgenden Grafik kannst du nicht nur sehen, wie sich die Temperatur seit **1973** verändert hat, sondern auch, was Prognosen für die nächsten Jahrzehnte sagen.

_Trage ein, in welchem Jahr du nach Konstanz gezogen bist – wir zeigen dir den damaligen Standpunkt in der Temperaturkurve._

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

## Teil 2: Eine Stadt, viele Klimas
Es gibt Tage, da fühlt sich Konstanz an wie zwei verschiedene Städte: Während es in der Innenstadt heiß und stickig ist, ist es im Herose-Park oder am Hörnle deutlich angenehmer.

_Aber ist das wirklich messbar - oder nur Gefühlssache?_

Die Stadt Konstanz betreibt mehrere Wettermessstationen, die quer über das Stadtgebiet verteilt sind. Und genau diese liefern spannende Daten. Denn auch wenn alle Stationen dieselbe Sonne abbekommen, zeigen sie an einem 
Sommertag sehr unterschiedliche Temperaturverläufe

🟢 **[Interaktivität]**  
_Klicke auf eine der Stationen auf der Karte. Der 
dazugehörige Temperaturverlauf wird im Diagramm hervorgehoben. Mit 
dem Slider unterhalb der Grafik kannst du außerdem gezielt eine Uhrzeit 
auswählen - und sehen, wie warm es zu dieser Stunde an den verschiedenen 
Stationen war_

### Temperaturverlauf am 31. Juli 2024 

<!-- Learning: 
  Erst in separaten JavaScript-Zellen den Inhalt vorbereiten.
  Dann im Markdown die Anzeige steuern.
-->

```js
// Daten der Stationen und Tagesverlauf laden
const stationen = FileAttachment("stationen.geo.json").json()
const tagesverlauf = FileAttachment('./tagesverlauf.csv').csv({typed: true})
```

<!-- UI-Inputs chart2 -->
```js
// UI-Elemente vorbereiten
const stationsnamen = stationen.features.map(f => f.properties.name);

// Radiobuttons für Stationen
const station_input = Inputs.radio(stationsnamen, {value: stationsnamen[7]});
// durch Mutable wird station_input.value automatisch reaktiv
//const station_input = Mutable(stationsnamen[7]);

//const station = station_input;

// Uhrzeit-Slider
const stunde = Inputs.range([0, 23], {step: 1, label: "Stunde"});
```

```js
// Import der ausgelagerten Funktionen
import { createSensorLineChart, createSensorMap, updateSensorMap, createReactiveSensorChart } from "./charts/chart2_sensor_map.js";
```

```js
// Karten-Div vorbereiten - wird im Markdown verwendet
const map_div = document.createElement("div");
map_div.style = "height:25rem";
map_div
```


```js
// ausgelagert in charts/chart2_sensor_map.js
// Liniendiagramm erzeugen - wird im Markdown verwendet
const sensor_plt = createReactiveSensorChart(tagesverlauf, station_input, stunde);
```


<!-- Layout Dia 2 (2 Charts)-->
<div class="grid grid-cols-2 gap-4">

<!-- Zeigen der Karte-->
<div class="card">
  <div class="header">
    <div class="title">
      <h2>Messstationen</h2>
      <h3>Interaktive Karte</h3>
    </div>
  </div>

  <div class="body">
    ${view(station_input)}
    <br/>
    ${map_div}
  </div>
</div> 
<!-- Ende Card - Map -->

<!-- Zeigen der Sensorliniendiagramme-->
<!-- Line Plot der Stationen-->
<div class="card">
  <div class="header">
    <div class="title">
      <h2>Temperatur</h2>
      <h3>Tagesverlauf an verschiedenen SGC Wetterstationen in Konstanz</h3>
    </div>
  </div>

  <div class="body">
    ${view(sensor_plt)}
    <br/>
    ${view(stunde)}
  </div>

</div> <!-- card -->

</div> <!-- Grid mit 2 Spalten Ende -->

<!--Layout kommt zuerst (HTML/Markdown darüber), Inhalt kommt danach (befüllen der Karte und Interaktivität hier drunter.-->

```js
// Die Karte wurde oben bereits ins HTML / DOM eingebettet. Hier wird sie befüllt.
// ausgelagert in charts/chart2_sensor_map.js
const map = createSensorMap(map_div, stationen, station_input);
```

```js display=false
// This block is re-evaluated whenever the input 'station' changes.
// ausgelagert in charts/chart2_sensor_map.js
updateSensorMap(map, stationen, station_input.value, station_input, tagesverlauf, stunde.value);
```

```js
// Immer wenn der Stunden-Slider bewegt wird, neu zeichnen
stunde.addEventListener("input", () => {
  updateSensorMap(
    map,
    stationen,
    station_input.value,
    station_input,
    tagesverlauf,
    stunde.value
  );
});
```

Du wirst sehen: Manche Stationen steigen schon am frühen Morgen stark an, während andere lange kühl bleiben. 
Am Abend kühlt es an einigen Stellen rasch ab, während andere Orte die Hitze speichern - oft bis tief in die Nacht.
Man sieht deutlich, dass der Standort den Unterschied macht. Ob Wiese oder Asphalt, Bäume oder offene Fläche – all das beeinflusst, wie stark sich ein Ort im Laufe des Tages aufheizt oder abkühlt.

Und das hat Folgen: Für dein persönliches Wohlbefinden, aber auch für die Gesundheit älterer Menschen, die Planung von Spielplätzen, Fahrradwegen oder Schulhöfen.

---

## Teil 3: Was beeinflusst die Temperatur vor deiner Haustür?
Warum ist es an einem Ort heißer als am anderen - obwohl beide nur wenige Straßen voneinander entfernt sind?

Jetzt kannst du selbst vergleichen: Unsere dritte Grafik zeigt dir nicht nur die Temperaturdaten, sondern auch, wie die Umgebung der Messstationen aussieht. Gibt es dort viele Gebäude? Asphaltierte Flächen? Oder überwiegen Bäume und Wiesen?

🟢 **[Interaktivität]**  
_Wähle zwei Stationen aus. Was fällt dir auf?_

Die Grafik zeigt dir für jede von ihnen, wie die Umgebung im Umkreis von 50 Metern beschaffen ist – also zum Beispiel, wie viel Grünfläche, Gebäude oder Asphalt dort vorhanden sind. Außerdem siehst du durch die unter den Kartenausschnitten angezeigten „Erhitzungsmuster“, wie stark die Temperatur der jeweiligen Station zu verschiedenen Tageszeiten vom Mittelwert aller Stationen abweicht.  

_(Eventuell hier noch etwas dazu, wie die Erhitzungsmuster mit der Umgebungsbeschaffenheit zusammenhängen könnten)_

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
Genau an diesem Punkt setzt auch die städtische Klimapolitik an. Wenn wir besser verstehen, welche Faktoren das Mikroklima beeinflussen, können gezielt Maßnahmen ergriffen werden, um gegenzusteuern

---

## Experteninterview: Was tun gegen die Hitze in der Stadt?

Im folgenden Video kommen zwei Expert:innen zu Wort:

**Tim, Experte für das Stadtklima Konstanz,** erklärt (kommt noch, können wir 
dann darauf anpassen, über was er am Ende redet)

Die **Klimaanpassungsbeauftragte der Stadt Konstanz**, (Insert her name), erzählt (kommt  auch noch, wenn wir die Videos haben)

Sie gehen auch auf die Daten ein, die du gerade selbst untersucht hast - und sprechen darüber, was man daraus für die Stadt, die Planung und den Umgang mit Hitze lernen kann

<!-- patrik: Ich werde hier noch etwas einbauen, dass Youtube nur nach Consent geladen wird. Oder das Video selber hosten. -->
 <iframe style="width:100%; aspect-ratio: 16/9;"
src="https://www.youtube.com/embed/E4WlUXrJgy4">
</iframe> 

## Fazit: Das Klima ist nicht überall gleich - auch nicht in deiner Stadt Konstanz

Was wir aus dieser Reise durch Konstanz mitnehmen: Der Klimawandel ist nicht nur ein globales Thema. Er ist spürbar - und er trifft nicht alle Orte in der Stadt gleichermaßen.

Es macht einen Unterschied, ob du in einem grünen Viertel wohnst oder in einem Quartier mit vielen versiegelten Flächen. Und es macht einen Unterschied, wie eine Stadt auf diese Unterschiede reagiert.

Lösungen gibt es – aber sie brauchen Raum und Aufmerksamkeit. Dazu gehört, vorhandene Grünflächen zu erhalten und neue zu schaffen, versiegelte Flächen dort zu reduzieren, wo es möglich ist, und gezielt Schattenräume einzuplanen – vor allem an stark genutzten Orten wie Spielplätzen, Schulhöfen oder öffentlichen Plätzen.

## Und du?

Was ist dein heißester Ort in Konstanz?
Ist dir schon mal aufgefallen, dass es bei dir zuhause abends einfach nicht abkühlt? Oder dass ein bestimmter Weg zur Arbeit besonders schweißtreibend ist?

Teile deine Erfahrungen mit uns! (falls wir noch ein letztes interaktives Ele-
ment anstreben

</div> <!--Ende class="correlaid-page"-->