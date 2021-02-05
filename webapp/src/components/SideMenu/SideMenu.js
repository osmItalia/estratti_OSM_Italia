/* eslint-disable no-unused-expressions */
import { useEffect, useState } from "react";
import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import ArrowDropDownIcon from "@material-ui/icons/ExpandMore";
import ArrowRightIcon from "@material-ui/icons/ChevronRight";
import { useDebouncedCallback } from "use-debounce";
import { search } from "./filter";
import { parentItem } from "../../helpers";

const scrollToElement = (element) =>
  element.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "start",
  });
const SideMenu = ({ italyTree, selectedTreeItem, setSelectedTreeItem }) => {
  const [selectedFeature, setSelectedFeature] = useState(null);

  useEffect(() => {
    selectedTreeItem.getChildFeatures().then(setSelectedFeature);
  }, [selectedTreeItem]);

  const [expanded, setExpanded] = useState([parentItem]);
  const [selected, setSelected] = useState([parentItem]);
  const [searchFilter, setSearchFilter] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  const resetFilter = () => {
    setSearchFilter([]);
    setSearchValue("");
  };
  const handleSelect = (_, nodeIds) => {
    setSelected(nodeIds);
  };

  useEffect(() => {
    if (!selectedFeature) {
      return;
    }
    //this prevents triggers from the sidemenu itself
    if (selectedTreeItem.preventExpand) {
      return;
    }

    resetFilter();
    const toExpand = [
      ...(selectedTreeItem.com_istat ? [selectedTreeItem.com_istat] : []),
      ...(selectedTreeItem.prov_istat ? [selectedTreeItem.prov_istat] : []),
      ...(selectedTreeItem.reg_istat ? [selectedTreeItem.reg_istat] : []),
      parentItem,
    ];
    setExpanded(toExpand);
    setSelected(toExpand[0]);

    const name = selectedFeature?.properties?.name;
    var xpath = `(//div[text()='${name}'])[last()]`;
    const targetItem = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
    if (targetItem) {
      scrollToElement(targetItem);
    }
  }, [selectedFeature, selectedTreeItem]);

  const searchNode = (term) => {
    const dataNode = {
      children: italyTree.children,
    };
    const matchedIDS = [parentItem];
    search(dataNode, term, matchedIDS);
    if (matchedIDS.length > 1) {
      setSearchFilter(matchedIDS);
    } else {
      setSearchFilter([]);
    }
    setExpanded(matchedIDS);
    setSelected(matchedIDS);
  };

  const mapTree = ({ children, ...node }) => {
    const id =
      node.com_istat || node.prov_istat || node.reg_istat || parentItem;
    const name = node.com_name || node.prov_name || node.reg_name || parentItem;
    if (searchFilter.length && !searchFilter.includes(id)) {
      return null;
    }

    return (
      <TreeItem
        key={id}
        nodeId={id}
        label={name}
        onLabelClick={async (event) => {
          //close on tap on selected node
          if (
            (node.reg_istat === expanded[0] && !node.prov_istat) ||
            (node.prov_istat === expanded[0] && !node.com_istat)
          ) {
            setExpanded([...expanded.slice(1, expanded.length)]);
            console.log(event.target);
            scrollToElement(event.target);
            return;
          }

          const toExpand = [
            ...(node.com_istat ? [node.com_istat] : []),
            ...(node.prov_istat ? [node.prov_istat] : []),
            ...(node.reg_istat ? [node.reg_istat] : []),
            parentItem,
          ];
          setExpanded(toExpand);
          node.preventExpand = true;
          setSelectedTreeItem(node);

          setTimeout(() => {
            scrollToElement(event.target);
          }, 200);
        }}
      >
        {children && children.map(mapTree)}
      </TreeItem>
    );
  };

  const searchDebounced = useDebouncedCallback((value) => {
    searchNode(value);
  }, 500);

  return (
    <div className="sideMenu">
      <TextField
        label="Cerca"
        type="search"
        value={searchValue}
        onChange={(e) => {
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
      <DownloadItems selectedFeature={selectedFeature} />
    </div>
  );
};

const DownloadItems = ({ selectedFeature }) => {
  if (!selectedFeature) {
    return null;
  }

  const { name, links } = selectedFeature;

  if (!name || !links?.length) {
    return null;
  }

  return (
    <div className="resultItem">
      <p>Estratti disponibili per {name}</p>
      {links.map(({ format, url }) => (
        <a key={url} href={url}>
          <Button variant="contained">{format}</Button>
        </a>
      ))}
    </div>
  );
};

export default SideMenu;
