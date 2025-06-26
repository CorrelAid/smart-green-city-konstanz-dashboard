# patrik: Ich hole mir die Daten aus eurem GitHub Repository und filtere den gewünschten Tag.
# Im Frontend (index.md) kann ich dann gezielt die Daten laden, die ich anzeigen will -- mit kurzen Ladezeiten.
#
# https://github.com/CorrelAid/smart-green-city-konstanz/blob/main/maites_notebooks/karte_vgl_stationen/finalerdf_ws
#
# Cool wäre, wenn wir die Abhängigkeit auf das CorrelAid Repo vermeiden.
# Also diesen Datensatz hier aufbereiten. Und die Daten idealerweise direkt aus Open Data ziehen,
# damit sich die Website automatisch aktualisiert, wenn es die Daten tun.

import pandas as pd
import sys

# ---

correlaid_csv = "https://github.com/CorrelAid/smart-green-city-konstanz/raw/refs/heads/main/maites_notebooks/karte_vgl_stationen/finalerdf_ws"
ws_24_path = (
    "/workspaces/smart-green-city-konstanz-dashboard/correlaid/ws_compl_summer_24.csv"
)
day = "2024-07-31"

"""
Altes skript um vom der Ursprungsdatei zu ws_compl_summer zu kommen
# ---
ws_24 = pd.read_csv(ws_24_path)
# change datetime column to timezone-naive values (utc as argument since some entries have ms and somes dont) 
# From entries with +01 and +02 the hours are subtracted respectively
ws_24['dateobserved'] = pd.to_datetime(ws_24['dateobserved'],utc=True, format='ISO8601').dt.tz_convert(None)

#new variables: date, time, hour & week_of_year
ws_24['date'] = ws_24['dateobserved'].dt.date
ws_24['time'] = ws_24['dateobserved'].dt.time
ws_24['hour'] = ws_24['dateobserved'].dt.hour

#calculate median values grouped by location, date & hour 
#drop irrelevant columns& round results to two decimal places
ws_hour = ws_24.drop(columns=['entity_id', 'dateobserved', 'time', 'entity_id']).groupby(['name', 'date', 'hour']).median().round(2).reset_index()
ws_hour.head()

#vollständigen dataframe erstellen, fehlende werte = nan
all_possible_combinations = pd.MultiIndex.from_product(
    [ws_hour['name'].unique(), pd.to_datetime(ws_hour['date']).unique(), range(24)],
    names=['name', 'date', 'hour'])

ws_compl = ws_hour.set_index(['name', 'date', 'hour']).reindex(all_possible_combinations, fill_value=np.nan)
ws_compl = ws_compl.reset_index()

#insg. nur zwei sehr auffällige werte (sehr sicher falsche messergebnisse) -> durch nan ersetzen
ws_compl.loc[~((ws_compl['z_score'].abs() <= 3) | ws_compl['z_score'].isna()), 'temperature'] = np.nan

#europapark raus
ws_compl_summer = ws_compl[ws_compl['name'] != 'Europapark']
"""
# ---

full = pd.read_csv(correlaid_csv, index_col=0).reset_index(drop=True)
del full["datetime"]
full.rename(
    columns={
        "name": "Station",
        "date": "Datum",
        "hour": "Stunde",
        "temperature": "Temperatur_Celsius",
        "winddirection": "Windrichtung_Grad",
        "windspeedavg": "Windgeschwindigkeit_Durchschnitt_kmh",  # TODO: Stimmt die Einheit?
    },
    inplace=True,
)

subset = full[full.Datum == day].reset_index(drop=True)

subset.to_csv(sys.stdout, index=False)
