---
theme: dashboard
toc: false
---

<h1>Data Story Überschrift</h1>
<h2>Unterüberschrift</h2>

```js
const ref_tab = FileAttachment("dwd/Referenzperiode_1973_2000.csv").csv({typed: true})

const ma30y = FileAttachment("dwd/Jahreswerte_30Jahre_gleitender_Durchschnitt.csv").csv({typed: true})
const points = FileAttachment("dwd/Jahreswerte.csv").csv({typed: true})

import { plot } from "./lib.js";
```

<div class="grid grid-cols-1">

<div class="card grid-colspan-1">
<div class="header">
<div class="title">
<h2>Teil 1.1: Warum reden wir über Temperatur?</h2>
</div> <!-- title -->
</div> <!-- header -->
“Hallo du, lass uns über die Temperatur in Konstanz reden.”
Rekordtemperaturen in Deutschland und der Welt → auch im Kleinen in Konstanz?
extremes Wetterereignis in Konstanz, zB wärmster Sommer? Flut letztes Jahr?
War das Wetter schon immer so? Können wir sicher sein, dass es so bleiben wird? 
</div> <!-- card -->

</div>

```js
const temperature_variables = [
  'Temperatur_Celsius_Mittel_Tagesminimum',
  'Temperatur_Celsius_Mittel_Tagesdurchschnitt',
  'Temperatur_Celsius_Mittel_Tagesmaximum'
];
```

<div class="grid grid-cols-2">

<div class="card">
<div class="header">
<div class="title">
<h2>Temperatur der Luft</h2>
<h3>Jahresmittel mit 30-jährigem gleitendem Durchschnitt</h3>
</div> <!-- title -->
<div class="tools"><button class="info-button" aria-label='Info' title='Info'></button></div>
</div> <!-- header -->
<div class='with-info'>
<div class='body'>
${resize((width) => plot(points, ma30y, width, temperature_variables))}
</div> <!-- body -->
<div class='info'>

Dieses Diagramm zeigt den Temperaturverlauf in Form von Jahresmittelwerten der Lufttemperatur über mehrere Jahrzehnte, basierend auf drei unterschiedlichen Berechnungsarten:

1. **Jahresmittel aus Tagesminimum (blaue Punkte):** Der Durchschnitt der täglichen Minimaltemperaturen im Jahr.
2. **Jahresmittel aus Tagesdurchschnitt (gelbe Punkte):** Der Durchschnitt der täglichen Durchschnittstemperaturen im Jahr.
3. **Jahresmittel aus Tagesmaximum (rote Punkte):** Der Durchschnitt der täglichen Maximaltemperaturen im Jahr.

#### Eigenschaften:
- **X-Achse:** Stellt die Zeit (Jahre) dar, beginnend in den 1970er-Jahren bis in die 2020er-Jahre.
- **Y-Achse:** Zeigt die Temperaturen in Grad Celsius (°C).
- **Punkte:** Beziehen sich auf ein einzelnes Jahr.
- **Linien:** Stellen den 30-jährigen gleitenden Durchschnitt dar, der die langfristige Entwicklung der Jahresmittelwerte verdeutlicht.

#### Beobachtungen:
- Die Minimaltemperaturen (blau) sind die niedrigsten Werte und zeigen einen relativ langsamen Anstieg.
- Die Durchschnittstemperaturen (gelb) liegen zwischen den Minimal- und Maximaltemperaturen und weisen ebenfalls einen deutlichen Aufwärtstrend auf.
- Die Maximaltemperaturen (rot) sind die höchsten Werte und zeigen den steilsten Anstieg, was auf eine Erwärmung der heißeren Tage hinweist.
- Der gleitende 30-jährige Durchschnitt verdeutlicht die langfristigen Trends und minimiert jährliche Schwankungen.

#### Interpretation:
Insgesamt ist eine zunehmende Erwärmung im Lauf der Jahre erkennbar.

</div> <!-- info -->
</div> <!-- with-info -->
</div> <!-- card -->

<div class="card">
<div class="header">
<div class="title">
<h2>Temperatur der Luft</h2>
<h3>Absolutes Maximum mit 30-jährigem gleitendem Durchschnitt</h3>
</div> <!-- title -->
<div class="tools"><button class="info-button" aria-label='Info' title='Info'></button></div>
</div> <!-- header -->
<div class='with-info'>
<div class='body'>
${resize((width) => plot(points, ma30y, width, "Temperatur_Celsius_Maximum"))}
</div> <!-- body -->
<div class='info'>

Dieses Diagramm zeigt das **absolute Maximum der Lufttemperatur** im Laufe der Jahre, ergänzt durch einen **30-jährigen gleitenden Durchschnitt**, um langfristige Trends darzustellen.

#### Eigenschaften:
- **X-Achse:** Stellt die Zeit (Jahre) dar, beginnend in den 1970er-Jahren bis in die 2020er-Jahre.
- **Y-Achse:** Zeigt die maximal erreichten Temperaturen in Grad Celsius (°C).
- **Punkte:** Repräsentieren die jährlichen absoluten Maximaltemperaturen.
- **Linie:** Stellt den 30-jährigen gleitenden Durchschnitt dar, der die langfristige Entwicklung der Maximaltemperaturen verdeutlicht.

#### Beobachtungen:
- Die jährlichen absoluten Maximaltemperaturen zeigen große Schwankungen zwischen den Jahren.
- Seit den 1990er-Jahren ist ein deutlicher Trend zu steigenden Maximaltemperaturen erkennbar.
- Der gleitende 30-jährige Durchschnitt zeigt einen konstanten Anstieg, insbesondere ab den 2000er-Jahren.
- Die höchsten absoluten Maximaltemperaturen liegen über 36 °C.

#### Interpretation:
Das Diagramm verdeutlicht, dass die maximalen Temperaturen in den letzten
Jahrzehnten deutlich gestiegen sind, was auf eine Zunahme von
Extremhitze-Ereignissen hindeutet.

</div> <!-- info -->
</div> <!-- with-info -->
</div> <!-- card -->

</div> <!-- grid -->

---

<div style="display: flex; align-items: center; flex-wrap: wrap; gap: 1rem;">
  <img
    style="flex: 0 1 auto; max-width: 20rem; width: 100%;"
    title="Smart City Sponsor"
    alt="Gefördert durch das Bundensministerium für Wohnen, Stadtentwicklung und Bauwesen"
    src="/assets/sponsor-BMWSB.svg"
  />
  <img
    style="flex: 0 1 auto; max-width: 15rem; width: 100%;"
    title="Smart City Sponsor"
    alt="Gefördert durch die Kreditanstalt für Wiederaufbau (KFW)"
    src="/assets/sponsor-KFW.png"
  />
</div>
