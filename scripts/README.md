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

# Generate topojson files

Run `gen-topojson.sh`
