import { Treebeard } from "react-treebeard";
import { useState } from "react";
import style from "./style";
import * as filters from "./filter";

const SideMenu = ({ italyTree, setSelected }) => {
  const [data, setData] = useState(italyTree);
  const [cursor, setCursor] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const onFilterMouseUp = ({ target: { value } }) => {
    const filter = value.trim();
    if (!filter) {
      return setData(italyTree);
    }
    let filtered = filters.filterTree(italyTree, filter);
    filtered = filters.expandFilteredNodes(filtered, filter);
    setData(filtered);
  };

  const onToggle = (node, toggled) => {
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
    setSelected(node.name);
  };
  return (
    <div className="sideMenu">
      <input
        className="form-control"
        onKeyUp={onFilterMouseUp}
        placeholder="Search the tree..."
        type="text"
      />
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
