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

  const currentName =
    selectedFeature.municipality.name ||
    selectedFeature.province.name ||
    selectedFeature.region.name ||
    "Italy";

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
    if (!selectedFeature.selectionFromMap) {
      return;
    }

    const limitFilter = !selectedFeature.municipality.name;
    const filter = currentName;

    let filtered = filters.filterTree(italyTree, filter, undefined, false);

    closeChildren(filtered);

    filtered = filters.expandFilteredNodes(
      filtered,
      filter,
      undefined,
      limitFilter
    );
    console.log(filtered);
    setData(filtered);
  }, [selectedFeature]);

  const closeChildren = (node) => {
    node.children.forEach((child) => {
      child.toggled = false;
      child.active = false;
      if (child.children) {
        closeChildren(child);
      }
    });
  };

  const onToggle = (node, toggled) => {
    console.log(node);
    console.log(toggled);
    setData(italyTree);

    let filtered;

    const opening = !node.toggled;

    filtered = filters.filterTree(italyTree, node.name, undefined, false);

    console.log(filtered);
    if (!opening) {
      closeChildren(filtered);
    }

    if (cursor) {
      cursor.active = false;
    }
    node.active = true;

    if (node.children) {
      node.toggled = toggled;
    }

    setCursor(node);
    if (opening && !node.com_istat_code_num) {
      setData(filtered);
    } else {
      setData(Object.assign({}, data));
    }

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
      {currentName && (
        <div className="resultItem">
          <p>Download: {currentName}</p>
        </div>
      )}
    </div>
  );
};

export default SideMenu;
