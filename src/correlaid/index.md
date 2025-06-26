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

In der folgenden Grafik kannst du nicht nur sehen, wie sich die Temperatur seit **1943** (→ _Insert korrektes Startjahr_) verändert hat, sondern auch, was Prognosen für die nächsten Jahrzehnte sagen.

---
🟢 **[Interaktivität]**  
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
const plt = Plot.plot({
  grid: true, // Konsistent mit Dashboards
  inset: 10, // Konsistent mit Dashboards
  x: {
    label: "Jahr",
    labelAnchor: 'center',
    labelArrow: 'none',
    tickFormat: JSON.stringify, // suppress delimiting dots, e.g. 2.024
  },
  y: {
    label: "℃"
  },
  marks: [
    Plot.line(yearly, {
      x: "Jahr",
      y: "Temperatur_Celsius_Mittel_Tagesdurchschnitt",
      stroke: () => 'constant', // trick to use the first color of the theme
    }),
    Plot.ruleX([arrival], {
      stroke: 'var(--theme-foreground-focus)', // use focus color defined by theme
    }),
  ]
});
view(plt);
```

</div> <!-- card -->
Tipp: Schau dir an, wie groß der Unterschied zwischen deinem Zuzugsjahr 
und heute ist. Das fühlt sich plötzlich gar nicht mehr so abstrakt an, oder?

---

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
NEU:

```js
import {TemperaturWidget} from "./Karte_Messstationen/Temperaturvergleich.js"
view(await TemperaturWidget())
```
ALT:

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

