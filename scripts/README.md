# Dependencies

## NPM

Additional setup that could be required on WM servers to run npm:

```
sudo aptitude install npm # select second option
npm install n -g
export PATH="/usr/local/bin/:$PATH"
```

## mapshaper

Install mapshaper:

```
npm install mapshaper -g
```

## poly2geojson

```
wget https://github.com/frafra/poly2geojson/releases/download/v0.1.2/poly2geojson-v0.1.2-linux-x64 -O /usr/local/bin/poly2geojson
chmod +x "$_"
```

# Generate topojson files

Run `gen-topojson.sh`
