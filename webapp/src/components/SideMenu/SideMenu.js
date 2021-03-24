/* eslint-disable no-unused-expressions */
import { useEffect, useState } from "react";
import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";
import TextField from "@material-ui/core/TextField";
import ArrowDropDownIcon from "@material-ui/icons/ExpandMore";
import ArrowRightIcon from "@material-ui/icons/ChevronRight";
import { useDebouncedCallback } from "use-debounce";
import { search } from "./filter";
import DownloadItems from "./DownloadItems";
import styles from "./SideMenu.module.css";
import { parentItem } from "../../helpers";

const scrollToElement = (element) =>
  element.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "start",
  });
const SideMenu = ({
  italyTree,
  selectedTreeItem,
  setSelectedTreeItem,
  selectedFeature,
}) => {
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
    try {
      var xpath = `(//div[text()="${name}"])[last()]`;
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
    } catch (e) {
      console.log(e);
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
    if (children?.length) {
      children.sort((n1, n2) => n1.reg_name?.localeCompare(n2.reg_name));
      children.sort((n1, n2) => n1.prov_name?.localeCompare(n2.prov_name));
      children.sort((n1, n2) => n1.com_name?.localeCompare(n2.com_name));
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
            scrollToElement(event.target);
            return;
          }

          setTimeout(() => {
            scrollToElement(event.target);
          }, 750);

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
  const showDownload = selectedFeature?.properties?.[".gpkg"];

  return (
    <div className={styles.sideMenu}>
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
        className={styles.rootItem}
        style={{ maxHeight: showDownload ? "50vh" : "80vh" }}
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

export default SideMenu;
