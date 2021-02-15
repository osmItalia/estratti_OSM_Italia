# Estratti OSM Italia

Questa directory contiene il codice sorgente dell'applicazione web per visualizzare una mappa interattiva dell'Italia e scaricare gli estratti OpenStreetMap per ciascuna regione, provincia e comune.

L'applicazione può essere riutilizzata e riconfigurata in alcune delle sue parti seguendo le informazioni architetturali riportate di seguito.

## Informazioni architetturali

L'applicazione è basata su React e si appoggia ad un server web per il download dei file TopoJSON dei confini per regioni, province e comuni visualizzati in mappa.

Le informazioni relative al server possono essere configurate durante il processo di build dell'applicazione.

## Build applicazione

L'applicazione necessita di un processo di build prima che ne venga eseguto il deploy su un web-server.

Il processo di build richiede `node.js` e si lancia tramite il comando `npm run build`, questo comando produce una directory di build con i file necessari per essere serviti tramite un web-server.

#### Configurazione

Il comando di build, inoltre, esegue il download dei file necessari all'applicazione per la corretta esecuzione.

Questo processo avviene tramite uno script node.js presente nella directory `scripts/`.

Lo script si basa su un file di configurazione: `configuration.json` presente nella cartella `src`. Questo permette di impostare
i parametri necessari per la corretta configurazione:

- `basePathFiles`: URL che indica il basepbath del server contente i file per le regioni, province e comuni e gli estratti da scaricare
- `outputFilesPath`: directory in cui si trovano gli estratti da scaricare
- `basePathApp`: URL che indica il basepath dove è hostata l'applicazione 
- `inputFilesPath`: directory in cui si trovano i file GeoJSON di input
- `regions`: nome del file GeoJSON contenente tutte le informazioni relative alle regioni
- `provinces`: nome del file GeoJSON contenente tutte le informazioni relative alle province
- `municipalities`: nome del file GeoJSON contenente tutte le informazioni relative ai comuni
- `mapAttribution`: codice `HTML` da visualizzare come attribuzione per la mappa
