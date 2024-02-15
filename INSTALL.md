# Setup

Prerequisites:
- docker
- docker compose
- git

## Clone repository

```bash
git clone https://github.com/osmItalia/estratti_OSM_Italia.git
cd estratti_OSM_Italia
```

## Run using Docker

```bash
docker compose up
```

## Run without Docker

### Backend

It is suggested to use `nix` or `nix-portable` to create an environment with the dependencies installed

```bash
nix-shell --pure
cd backend
make setup
make pbf
make -j$(nproc)
make webapp
```

### Frontend

Configure NGINX by customizing `nginx/default.conf`. Adjust `src/configuration.json` if needed (read more at `webapp/README.md`).

```bash
cd webapp/
npm install
npm run build
```

The contents of `build/` should be served by NGINX.

