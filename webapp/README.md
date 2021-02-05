# Estratti OSM Italia

Questa repository contiene il codice sorgente dell'applicazione web per scaricare gli estratti OpenStreetMap dell'Italia.

L'applicazione può essere riutilizzata e riconfigurata in alcune delle sue parti seguendo le informazioni architetturali riportate di seguito.

## Informazioni architetturali

L'applicazione è basata su React.js e si appoggia ad un server web per il download dei confini per regioni, province e comuni visualizzati in mappa.

Le informazioni relative al server possono essere configurate durante il processo di build dell'applicazione.

## Build applicazione

L'applicazione necessita di un processo di build prima che ne venga eseguto il deploy su un web-server.

Il processo di build, si lancia tramite il comando `npm run build`, questo comando produce una directory di build con i file necessari per essere serviti tramite un web-server.

#### Configurazione

Il comando, inoltre, esegue il download dei file necessari all'applicazione per la corretta esecuzione.

Questo processo avviene tramite uno script node.js presente nella directory `scripts/`

Lo script si basa su un file di configurazione: `configuration.json` presente nella cartella `src`. Questo permette di impostare
i parametri necessari per la corretta configurazione:

`basePath`: URL che indica il server contente i file per le regioni, province e comuni
`regions`: nome del file GeoJSON contenente tutte le informazioni relative alle regioni
"provinces": nome del file GeoJSON contenente tutte le informazioni relative alle province
`municipalities`: nome del file GeoJSON contenente tutte le informazioni relative ai comuni
