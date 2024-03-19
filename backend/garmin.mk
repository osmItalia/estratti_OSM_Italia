MKGMAP_URL ?= https://www.mkgmap.org.uk/download/mkgmap-latest.tar.gz
MKGMAP_DIR = $(WORK_DIR)/mkgmap
MKGMAP = $(MKGMAP_DIR)/mkgmap.jar
MKGMAP_XMX = 8G
MKGMAP_PRIORITY = 10
SPLITTER_URL ?= https://www.mkgmap.org.uk/download/splitter-latest.jar
SPLITTER = $(MKGMAP_DIR)/splitter.jar
SEA_URL = https://www.thkukuk.de/osm/data/sea-latest.zip
SEA_DIR = $(MKGMAP_DIR)/sea
SEA = $(SEA_DIR)/.dirstamp
BOUNDS_URL = https://www.thkukuk.de/osm/data/bounds-latest.zip
BOUNDS_DIR = $(MKGMAP_DIR)/bounds
BOUNDS = $(BOUNDS_DIR)/.dirstamp

REPO_URL = https://github.com/lucadelu/ital.img.git
REPO_DIR = $(MKGMAP_DIR)/ital.img
REPO = $(REPO_DIR)/.git/HEAD
STYLES = styles/.directory
STYLES_DIR = $(REPO_DIR)/$(dir $(STYLES))

NATION = $(notdir $(patsubst %/,%,$COUNTRY))

.PHONY: setup_garmin setup_garmin_data garmin_regioni

$(MKGMAP):
	$(dir_guard)
	curl -s "$(MKGMAP_URL)" | bsdtar --strip-components 1 -xf- -C "$(MKGMAP_DIR)"

$(SPLITTER): $(MKGMAP)
	curl -s "$(SPLITTER_URL)" -o "$@"

$(SEA):
	$(dir_guard)
	curl -s "$(SEA_URL)" | bsdtar --strip-components 1 -xf- -C "$(SEA_DIR)"
	touch $@

$(BOUNDS):
	$(dir_guard)
	curl -s "$(BOUNDS_URL)" | bsdtar -xf- -C "$(BOUNDS_DIR)"
	touch $@

$(REPO):
	cd $(dir $(REPO_DIR)) && git clone -n --depth=1 --filter=tree:0 $(REPO_URL) $(notdir $(REPO_DIR))

$(STYLES): $(REPO)
	cd $(REPO_DIR) && git sparse-checkout set --no-cone $(dir $(STYLES))
	cd $(REPO_DIR) && git checkout

setup_garmin_data: $(SEA) $(BOUNDS)
setup_garmin: $(MKGMAP) $(SPLITTER) $(STYLES)
setup: setup_garmin

PBF_FILES_REGIONI = $(wildcard $(PBF_DIR)/regioni/*.osm.pbf)
garmin_regioni: $(subst /pbf/,/garmin/,$(PBF_FILES_REGIONI:.osm.pbf=.tar.gz))
all: garmin_regioni

.NOTPARALLEL:
$(OUTPUT)/garmin/%.tar.gz: $(PBF_DIR)/%.osm.pbf
	$(dir_guard)
	./scripts/garmin.sh "$<" "$@" "$(MKGMAP)" "-Xmx$(MKGMAP_XMX) --draw-priority=$(MKGMAP_PRIORITY)" "$(SPLITTER)" "-Xmx$(MKGMAP_XMX)" "$(STYLES_DIR)" "$(SEA_DIR)" "$(BOUNDS_DIR)"
