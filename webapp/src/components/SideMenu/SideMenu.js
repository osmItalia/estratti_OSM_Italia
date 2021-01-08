/* eslint-disable no-unused-expressions */
import { makeStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';

import { useEffect, useState } from "react";

import {
  fillDataFromProperties,
  getMunicipalitiesForProvinceIstatCode,
} from "../../helpers";

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    maxWidth: 500,
  },
});
const SideMenu = ({
  italyTree,
  selectedFeature,
  setSelectedFeature,
  currentGeoJSON,
  setCurrentGeoJSON,
  setFeatureIndex,
}) => {


  const classes = useStyles();
  const [expanded, setExpanded] = useState([]);
  const [selected, setSelected] = useState([]);

  const handleSelect = (event, nodeIds) => {
    setSelected(nodeIds);
  };


  const currentName =
    selectedFeature.municipality.name ||
    selectedFeature.province.name ||
    selectedFeature.region.name ||
    "Italy";

  const setSelectedIstatProperties = async (selectedIstatProperties) => {
    let feature = {
      properties: selectedIstatProperties,
      feature: null,
    };
    if (selectedIstatProperties.com_istat_code_num) {
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
    }else if (selectedIstatProperties.prov_istat_code_num) {
      const featureGeometry = await getMunicipalitiesForProvinceIstatCode(
        selectedIstatProperties.prov_istat_code_num
      );
      feature.feature = featureGeometry;
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
    const toExpand = [
      ...(selectedFeature.municipality.com_istat_code_num ? [selectedFeature.municipality.com_istat_code_num]: []),
      ...(selectedFeature.province.prov_istat_code_num ? [selectedFeature.province.prov_istat_code_num]: []),
      ...(selectedFeature.region.reg_istat_code ? [selectedFeature.region.reg_istat_code]: []),
      'Italy',
    ]
    setExpanded(toExpand);
    setSelected(toExpand[0]);

  }, [selectedFeature]);




  const mapTree = ({name, children, ...node})=>{
    const id = node.com_istat_code_num || node.prov_istat_code_num || node.reg_istat_code || name;
    
  return (<TreeItem nodeId={id} label={name} onLabelClick={(event)=>{
    const toExpand = [
      ...(node.com_istat_code_num ? [node.com_istat_code_num]: []),
      ...(node.prov_istat_code_num ? [node.prov_istat_code_num]: []),
      ...(node.reg_istat_code ? [node.reg_istat_code]: []),
      'Italy',
     ]
    setExpanded(toExpand);
      setSelectedIstatProperties({
        reg_istat_code: node.reg_istat_code,
        prov_istat_code_num: node.prov_istat_code_num,
        com_istat_code_num: node.com_istat_code_num,
        name: name,
      });
  }}>
    {children && children.map(mapTree)}
  </TreeItem>)
  }
  
  return (
    <div className="sideMenu">
    <TreeView
      className={classes.root}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      expanded={expanded}
      selected={selected}
      onNodeSelect={handleSelect}
    >
   {mapTree(italyTree)}
      
    </TreeView>
      {currentName && (
        <div className="resultItem">
          <p>Download: {currentName}</p>
        </div>
      )}
    </div>
  );
};

export default SideMenu;
