#!/bin/bash
#

mkdir -p $WORK_DIR
pushd ~/estratti
mkdir -p {input/{osmand,pbf},output/{boundaries/{bbox/{comuni,province,regioni},poly/{comuni,province,regioni}},dati/{bbox/{comuni,province,regioni},poly/{comuni,province,regioni}},scripts}}
pushd output/dati
pushd bbox/comuni
mkdir {geopackage,pbf}
popd
pushd bbox/province
mkdir {geopackage,pbf}
popd
pushd bbox/regioni
mkdir {geopackage,pbf}
popd
pushd poly/comuni
mkdir {geopackage,pbf}
popd
pushd poly/province
mkdir {geopackage,pbf}
popd
pushd poly/regioni
mkdir {geopackage,pbf}
popd
popd


#

