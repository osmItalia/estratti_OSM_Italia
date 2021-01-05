import { Treebeard } from "react-treebeard";
import { useEffect, useState } from "react";
import style from "./style";
import * as filters from "./filter";
import {
  fillDataFromProperties,
  getMunicipalitiesForProvinceIstatCode,
} from "../../helpers";

const SideMenu = ({
  italyTree,
  selectedFeature,
  setSelectedFeature,
  currentGeoJSON,
  setCurrentGeoJSON,
  setFeatureIndex,
}) => {
  const [data, setData] = useState(italyTree);
  const [cursor, setCursor] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const setSelectedIstatProperties = async (selectedIstatProperties) => {
    if (!selectedIstatProperties) {
      return;
    }

    let feature = {
      properties: selectedIstatProperties,
      feature: null,
    };

    if (selectedIstatProperties.prov_istat_code_num) {
      const featureGeometry = await getMunicipalitiesForProvinceIstatCode(
        selectedIstatProperties.prov_istat_code_num
      );
      feature.feature = featureGeometry;
    } else if (selectedIstatProperties.com_istat_code_num) {
      let municipalityFeature;
      if (currentGeoJSON.features) {
        municipalityFeature = currentGeoJSON.features.find(
          ({ properties }) =>
            properties.com_istat_code_num ===
            selectedIstatProperties.com_istat_code_num
        );
      } else {
        municipalityFeature = currentGeoJSON;
      }
      feature = { ...feature, ...municipalityFeature };
    }

    fillDataFromProperties(
      feature,
      selectedFeature,
      setSelectedFeature,
      setCurrentGeoJSON,
      setFeatureIndex,
      false
    );
  };
  useEffect(() => {
    console.log(selectedFeature);
    if (!selectedFeature.selectionFromMap) {
      return;
    }

    const currentName =
      selectedFeature.municipality.name ||
      selectedFeature.province.name ||
      selectedFeature.region.name ||
      "Italy";

    const limitFilter = !selectedFeature.municipality.name;
    const filter = currentName;

    let filtered = filters.filterTree(italyTree, filter, undefined, false);
    filtered = filters.expandFilteredNodes(
      filtered,
      filter,
      undefined,
      limitFilter
    );
    setData(filtered);
  }, [selectedFeature]);

  const onToggle = (node, toggled) => {
    console.log(node);
    if (cursor) {
      cursor.active = false;
    }
    node.active = true;
    if (node.children) {
      node.toggled = toggled;
    }
    setCursor(node);
    setData(Object.assign({}, data));
    setSelectedItem(node.name);
    setSelectedIstatProperties({
      prov_istat_code_num: node.prov_istat_code_num,
      reg_istat_code: node.reg_istat_code,
      com_istat_code_num: node.com_istat_code_num,
      name: node.name,
    });
  };
  return (
    <div className="sideMenu">
      <Treebeard style={style} data={data} onToggle={onToggle} />
      {selectedItem && (
        <div className="resultItem">
          <p>Download: {selectedItem}</p>
        </div>
      )}
    </div>
  );
};

export default SideMenu;
