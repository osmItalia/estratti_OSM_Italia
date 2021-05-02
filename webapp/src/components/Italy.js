import { useEffect, useRef } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import { italyBounds } from "../helpers";

const pathColors = [
  getComputedStyle(document.documentElement).getPropertyValue("--mainColor1"),
  getComputedStyle(document.documentElement).getPropertyValue("--mainColor2"),
  getComputedStyle(document.documentElement).getPropertyValue("--mainColor3"),
  getComputedStyle(document.documentElement).getPropertyValue("--mainColor4"),
];

const getPathColor = (type) => {
  return pathColors[type / 2 - 1];
};

const Italy = ({
  currentGeoJSON,
  italyTree,
  selectedTreeItem,
  setSelectedTreeItem,
}) => {
  const geoJSONref = useRef();
  const map = useMap();

  useEffect(() => {
    if (!geoJSONref.current) {
      return;
    }
    const bounds = geoJSONref.current.getBounds();
    if (!Object.entries(bounds).length) {
      return;
    }
    map.fitBounds(selectedTreeItem.name === "Italia" ? italyBounds : bounds);
  }, [currentGeoJSON, geoJSONref, map, selectedTreeItem]);

  return (
    <GeoJSON
      ref={geoJSONref}
      eventHandlers={{
        click: async (e) => {
          const feature = e.layer.feature;
          const geo_reg_istat = currentGeoJSON.reg_istat;
          const region = italyTree.children.find(
            ({ reg_istat }) => reg_istat === geo_reg_istat
          );

          let item = null;

          if (feature.properties.adm === 4) {
            item = italyTree.children.find(
              ({ reg_istat }) => reg_istat === feature.properties.istat
            );
          }

          if (feature.properties.adm === 6) {
            const geo_prov_istat = feature.properties.istat;
            item = region.children.find(
              ({ prov_istat }) => prov_istat === geo_prov_istat
            );
          }

          if (feature.properties.adm === 8) {
            const geo_prov_istat = currentGeoJSON.prov_istat;
            const geo_com_istat = feature.properties.istat;
            const province = region.children.find(
              ({ prov_istat }) => prov_istat === geo_prov_istat
            );
            item = province.children.find(
              ({ com_istat }) => com_istat === geo_com_istat
            );
          }

          if (item) {
            setSelectedTreeItem(item);
          }
        },
      }}
      pathOptions={{ color: getPathColor(selectedTreeItem.type) }}
      key={
        currentGeoJSON
          ? currentGeoJSON.com_istat ||
            currentGeoJSON.prov_istat ||
            currentGeoJSON.reg_istat
          : "state"
      }
      data={currentGeoJSON}
    />
  );
};

export default Italy;
