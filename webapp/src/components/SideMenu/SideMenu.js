/* eslint-disable no-unused-expressions */
import { makeStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import { useDebouncedCallback } from 'use-debounce';
import { useEffect, useState } from "react";
import {search} from './filter';
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
  setCurrentGeoJSON,
  setFeatureIndex,
}) => {

  const classes = useStyles();
  const [expanded, setExpanded] = useState([]);
  const [selected, setSelected] = useState([]);
  const [searchFilter, setSearchFilter] = useState([]);
  const [searchValue, setSearchValue] = useState('');


  const resetFilter = ()=>{
    setSearchFilter([]);
    setSearchValue('');
  }
  const handleSelect = (_, nodeIds) => {
    setSelected(nodeIds);
  };

  const currentName =
    selectedFeature.municipality.name ||
    selectedFeature.province.name ||
    selectedFeature.region.name ||
    "Italy";

const findMunicipalityInProvince = (currentGeoJSON,com_istat_code_num ) =>
currentGeoJSON.features.find(
  ({ properties }) =>
    properties.com_istat_code_num ===
    com_istat_code_num
);
  const setSelectedIstatProperties = async (selectedIstatProperties) => {
   resetFilter()
    let feature = {
      properties: selectedIstatProperties,
      feature: null,
    };
    if (selectedIstatProperties.com_istat_code_num) {
      let municipalityFeature;
        const featureGeometry = await getMunicipalitiesForProvinceIstatCode(
          selectedIstatProperties.prov_istat_code_num
        );
        municipalityFeature = findMunicipalityInProvince(featureGeometry, selectedIstatProperties.com_istat_code_num)
      feature = { ...feature, ...municipalityFeature };
    } else if (selectedIstatProperties.prov_istat_code_num) {
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
   resetFilter();
    const toExpand = [
      ...(selectedFeature.municipality.com_istat_code_num ? [selectedFeature.municipality.com_istat_code_num]: []),
      ...(selectedFeature.province.prov_istat_code_num ? [selectedFeature.province.prov_istat_code_num]: []),
      ...(selectedFeature.region.reg_istat_code ? [selectedFeature.region.reg_istat_code]: []),
      'Italy',
    ]
    setExpanded(toExpand);
    setSelected(toExpand[0]);

  }, [selectedFeature]);


  
  const searchNode= term => {
    const dataNode = {
      children: italyTree.children,
    };
    const matchedIDS = ['Italy'];
    search(dataNode, term, matchedIDS);
    if(matchedIDS.length >1){
    setSearchFilter(matchedIDS)
    } else {
     resetFilter()
    }
    setExpanded(matchedIDS)
    setSelected(matchedIDS);
  }

  const mapTree = ({name, children, ...node})=>{
    const id = node.com_istat_code_num || node.prov_istat_code_num || node.reg_istat_code || name;
    if(searchFilter.length && !searchFilter.includes(id)){
      return null;
    }
  return (<TreeItem nodeId={id} label={name} onLabelClick={(_)=>{
    const toExpand = [
      ...(node.com_istat_code_num ? [node.com_istat_code_num]: []),
      ...(node.prov_istat_code_num ? [node.prov_istat_code_num]: []),
      ...(node.reg_istat_code ? [node.reg_istat_code]: []),
      'Italy',
     ]
    setExpanded(toExpand);
      setSelectedIstatProperties({
        reg_name: node.reg_name,
        prov_name: node.prov_name,
        reg_istat_code: node.reg_istat_code,
        prov_istat_code_num: node.prov_istat_code_num,
        com_istat_code_num: node.com_istat_code_num,
        name: name,
      });
  }}>
    {children && children.map(mapTree)}
  </TreeItem>)
  }
  const searchDebounced = useDebouncedCallback((value) => { searchNode(value) }, 500);

  return (
    <div className="sideMenu">
      <input type='text' value={searchValue} onChange={(e) => {
        setSearchValue(e.target.value);
        searchDebounced.callback(e.target.value);
      }} />
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
