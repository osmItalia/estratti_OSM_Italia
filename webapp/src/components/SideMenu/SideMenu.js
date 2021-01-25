/* eslint-disable no-unused-expressions */
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ArrowDropDownIcon from '@material-ui/icons/ExpandMore';
import ArrowRightIcon from '@material-ui/icons/ChevronRight';
import { useDebouncedCallback } from 'use-debounce';
import { useEffect, useState } from "react";
import {search} from './filter';
import {
  fillDataFromProperties,
  getMunicipalitiesForProvinceIstatCode,
} from "../../helpers";


const SideMenu = ({
  italyTree,
  selectedFeature,
  setSelectedFeature,
  setCurrentGeoJSON,
  setFeatureIndex,
}) => {

  const [expanded, setExpanded] = useState(['Italy']);
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
    console.log(selectedFeature)
    const downloadLinks = [{format: 'gpks', url: 'http://google.com'}]

const findMunicipalityInProvince = (currentGeoJSON, com_istat ) =>
currentGeoJSON.features.find(
  ({ properties }) =>
    properties.istat === com_istat
);
  const setSelectedIstatProperties = async (selectedIstatProperties) => {
   resetFilter()
    let feature = {
      properties: selectedIstatProperties,
      feature: null,
    };

    if (selectedIstatProperties.com_istat) {
      let municipalityFeature;
        const featureGeometry = await getMunicipalitiesForProvinceIstatCode(selectedIstatProperties.prov_istat);
        municipalityFeature = findMunicipalityInProvince(featureGeometry, selectedIstatProperties.com_istat)
      feature = { ...municipalityFeature, properties: selectedIstatProperties };
    } else if (selectedIstatProperties.prov_istat) {
      const featureGeometry = await getMunicipalitiesForProvinceIstatCode(
        selectedIstatProperties.prov_istat
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
      ...(selectedFeature.municipality.com_istat ? [selectedFeature.municipality.com_istat]: []),
      ...(selectedFeature.province.prov_istat ? [selectedFeature.province.prov_istat]: []),
      ...(selectedFeature.region.reg_istat ? [selectedFeature.region.reg_istat]: []),
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
    console.log(dataNode)
    console.log(matchedIDS)
    if(matchedIDS.length >1){
    setSearchFilter(matchedIDS)
    } else {
      setSearchFilter([]);
    }
    setExpanded(matchedIDS)
    setSelected(matchedIDS);
  }


  const mapTree = ({children, ...node})=>{
    const id = node.com_istat || node.prov_istat || node.reg_istat || 'Italy';
    const name = node.com_name || node.prov_name || node.reg_name || 'Italy';
    if(searchFilter.length && !searchFilter.includes(id)){
      return null;
    }
  return (
  <TreeItem 
    key={id} 
    nodeId={id} 
    label={name} 
    onLabelClick={(_)=>{

    console.log(node)

    const toExpand = [
      ...(node.com_istat ? [node.com_istat]: []),
      ...(node.prov_istat ? [node.prov_istat]: []),
      ...(node.reg_istat ? [node.reg_istat]: []),
      'Italy',
     ]
    setExpanded(toExpand);

    setSelectedIstatProperties({
      reg_name: node.reg_name,
      prov_name: node.prov_name,
      reg_istat: node.reg_istat,
      prov_istat: node.prov_istat,
      com_istat: node.com_istat,
      com_name: node.com_name,
    });
  }}>
    {children && children.map(mapTree)}
  </TreeItem>)
  }
  const searchDebounced = useDebouncedCallback((value) => { searchNode(value) }, 500);

  return (
    <div className="sideMenu">
      <TextField 
      label="Cerca" 
      type="search"
      value={searchValue} onChange={(e) => {
        setSearchValue(e.target.value);
        searchDebounced.callback(e.target.value);
      }} 
       />
  
      <TreeView
        defaultCollapseIcon={<ArrowDropDownIcon />}
        defaultExpandIcon={<ArrowRightIcon />}
        expanded={expanded}
        selected={selected}
        onNodeSelect={handleSelect}
      >
        {mapTree(italyTree)}
      </TreeView>
      <DownloadItems links={downloadLinks} name={currentName} />
    </div>
  );
};

const DownloadItems = ({name, links}) =>{

  if(!name || !links.length){return null}

  return  (
  <div className="resultItem">
    <p>Estratti disponibili per {name}</p>
    {links.map( ({format, url}) =>(
      <a key={url} href={url}><Button variant="contained">{format}</Button></a>

    ))}
  </div>
)

}
export default SideMenu;
