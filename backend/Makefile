COUNTRY ?= europe/italy
WORK_DIR ?= $(abspath ../data)

SCRIPTS = scripts
	
LATEST = $(WORK_DIR)/input/latest.osm.pbf

BOUNDARIES_DATABASE = $(WORK_DIR)/input/boundaries.sqlite
BOUNDARIES_GEOJSON_DIR = $(WORK_DIR)/input/boundaries
BOUNDARIES_GEOJSON = $(BOUNDARIES_GEOJSON_DIR)/.dirstamp

OUTPUT = $(WORK_DIR)/output
PBF_DIR = $(OUTPUT)/pbf
PBF_REGIONI = $(PBF_DIR)/regioni/.dirstamp
PBF_PROVINCE = $(PBF_DIR)/province/.dirstamp
PBF_COMUNI = $(PBF_DIR)/comuni/.dirstamp

GPKG_DIR = $(OUTPUT)/gpkg

MAPCREATOR_URL ?= "https://download.osmand.net/latest-night-build/OsmAndMapCreator-main.zip"
MAPCREATOR_DIR = $(WORK_DIR)/mapcreator
MAPCREATOR_TMP = $(MAPCREATOR_DIR)/tmp
MAPCREATOR_CONF = $(MAPCREATOR_DIR)/mapcreator.xml
PBF_REGIONI_DIR = $(dir $(PBF_REGIONI))
OBF_REGIONI = $(subst /pbf/,/obf/,$(PBF_REGIONI))
OBF_REGIONI_DIR = $(dir $(OBF_REGIONI))

NPM_PREFIX = $(WORK_DIR)/npm
TOPOJSON_DIR = $(OUTPUT)/topojson
TOPOJSON = $(TOPOJSON_DIR)/.dirstamp

WEBAPP_DIR = ../webapp/src/static/boundaries

.PHONY: all latest pbf gpkg obf setup setup_mapcreator setup_topojson topojson webapp clean
.SUFFIXES:

all: pbf gpkg obf topojson webapp
setup: setup_mapcreator setup_topojson

dir_guard=@mkdir -p $(@D)

ifeq ($(wildcard $(LATEST)),) 
	CURL_OPTS = 
else 
	CURL_OPTS = -z $(LATEST)
endif 

.DELETE_ON_ERROR: ;
FORCE: ;
$(LATEST): FORCE
	$(dir_guard)
	curl "https://download.geofabrik.de/$(COUNTRY)-latest.osm.pbf" -o "$@" $(CURL_OPTS)

latest: $(LATEST)

$(BOUNDARIES_DATABASE): $(LATEST) $(SCRIPTS)/boundaries.ini $(SCRIPTS)/boundaries.sql
	$(dir_guard)
	$(SCRIPTS)/boundaries.sh $@ $^

$(BOUNDARIES_GEOJSON): $(BOUNDARIES_DATABASE) $(SCRIPTS)/boundaries_geojson.sql
	$(dir_guard)
	cd $(dir $@) && sqlite3 -bail "$<" < $(abspath $(word 2,$^))
	touch $@

$(PBF_REGIONI): $(LATEST) $(BOUNDARIES_GEOJSON)
	$(dir_guard)
	$(SCRIPTS)/extract_4_regioni.sh $(dir $@) $< $(BOUNDARIES_GEOJSON_DIR)
	touch $@

$(PBF_PROVINCE): $(BOUNDARIES_DATABASE) $(BOUNDARIES_GEOJSON) $(PBF_REGIONI)
	$(dir_guard)
	$(SCRIPTS)/extract_6_province.sh $(dir $@) $< $(BOUNDARIES_GEOJSON_DIR)
	touch $@

$(PBF_COMUNI): $(BOUNDARIES_DATABASE) $(BOUNDARIES_GEOJSON) $(PBF_PROVINCE)
	$(dir_guard)
	$(SCRIPTS)/extract_8_comuni.sh $(dir $@) $< $(BOUNDARIES_GEOJSON_DIR)
	touch $@

pbf: $(PBF_REGIONI) $(PBF_PROVINCE) $(PBF_COMUNI)

$(GPKG_DIR)/%.gpkg: $(PBF_DIR)/%.osm.pbf
	$(dir_guard)
	rm -f "$(@F)"
	ogr2ogr -f GPKG -dsco VERSION=1.2 "$@" "$<" >/dev/null

PBF_FILES = $(wildcard $(PBF_DIR)/*/*.osm.pbf)

gpkg: $(subst /pbf/,/gpkg/,$(PBF_FILES:.osm.pbf=.gpkg))

$(MAPCREATOR_CONF): $(SCRIPTS)/mapcreator.xml.template
	$(dir_guard)
	export PBF_REGIONI_DIR=$(PBF_REGIONI_DIR) OBF_REGIONI_DIR=$(OBF_REGIONI_DIR) MAPCREATOR_TMP=$(MAPCREATOR_TMP) && envsubst '$$PBF_REGIONI_DIR:$$OBF_REGIONI_DIR:$$MAPCREATOR_TMP' < "$<" > "$@"

setup_mapcreator:
	mkdir -p $(MAPCREATOR_DIR)
	curl -s $(MAPCREATOR_URL) | bsdtar -xvf- -C $(MAPCREATOR_DIR)

$(OBF_REGIONI): $(MAPCREATOR_CONF) $(PBF_REGIONI)
	$(dir_guard)
	$(SCRIPTS)/mapcreator.sh $(MAPCREATOR_DIR) $<
	$(SCRIPTS)/mapcreator_rename.sh $(dir $@) $(SCRIPTS)/mapcreator_rename.sed
	touch $@

obf: $(OBF_REGIONI)

setup_topojson:
	$(dir_guard)
	npm --prefix=$(NPM_PREFIX) install mapshaper
	npm --prefix=$(NPM_PREFIX) install topojson-server

$(TOPOJSON): $(BOUNDARIES_GEOJSON)
	$(dir_guard)
	export PATH="$(NPM_PREFIX)/node_modules/.bin/:$$PATH" && $(SCRIPTS)/topojson.sh $(TOPOJSON_DIR) $(BOUNDARIES_DATABASE)

topojson: $(TOPOJSON)

$(WEBAPP_DIR)/municipalities.json: $(BOUNDARIES_DATABASE) $(SCRIPTS)/municipalities.sql
	$(dir_guard)
	sqlite3 -bail "$<" < $(abspath $(word 2,$^)) > "$@"

$(WEBAPP_DIR)/%.json: $(TOPOJSON_DIR)/%.json
	$(dir_guard)
	cp "$<" "$@"

webapp: $(WEBAPP_DIR)/municipalities.json $(WEBAPP_DIR)/limits_IT_regions.json $(WEBAPP_DIR)/limits_IT_provinces.json

clean:
	rm -rf $(WORK_DIR)
