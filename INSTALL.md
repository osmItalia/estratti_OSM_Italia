# Setup

## Clone repository

```bash
git clone https://github.com/osmItalia/estratti_OSM_Italia.git
cd estratti_OSM_Italia
```

## Run without Docker

### Backend

It is suggested to use `nix` or `nix-portable` to create an environment with the dependencies installed

```bash
cd backend/
nix-shell --pure
make setup
make pbf
make -j8
```

