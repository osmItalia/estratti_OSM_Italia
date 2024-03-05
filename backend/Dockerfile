FROM docker.io/library/debian:trixie

RUN --mount=type=cache,sharing=locked,target=/var/cache/apt \
    --mount=type=cache,sharing=locked,target=/var/lib/apt \
    rm /etc/apt/apt.conf.d/docker-clean && \
    apt-get update && \
    apt-get install -yq --no-install-recommends \
        `# generic` \
        curl gettext make anacron sqlite3 libsqlite3-mod-spatialite \
        `# pbf` \
        osmium-tool \
        `# OsmAndMapCreator` \
        libarchive-tools openjdk-17-jre-headless \
        `# boundaries, gpkg` \
        gdal-bin \
        `# mapshaper, topojson` \
        npm \
        `# garmin styles` \
        git \
        && \
   rm /etc/cron.daily/apt-compat /etc/cron.daily/dpkg

WORKDIR /root
# https://github.com/moby/moby/issues/17175
COPY Makefile garmin.mk .
RUN make setup

COPY scripts/ scripts/
COPY cronjob.sh /etc/cron.daily/estratti

CMD ["anacron", "-d"]
