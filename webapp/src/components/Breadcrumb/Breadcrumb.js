import styles from "./Breadcrumb.module.css";

const Breadcrumb = ({ selectedTreeItem, setSelectedTreeItem }) => {
  const getParentData = (item, allData) => {
    allData.push(item);
    if (item.parent) {
      return getParentData(item.parent, allData);
    }
    return allData;
  };
  const breadcrumbData = getParentData(selectedTreeItem, []).reverse();

  return (
    <div className={styles.breadcrumb}>
      <div className={styles.appTitle}>
        <h1>Estratti OpenStreetMap Italia</h1>
      </div>
      {breadcrumbData.map((node, index) => {
        return (
          <p
            key={node.type}
            style={{ zIndex: 4 - index }}
            className={styles.breadItem}
            onClick={() => setSelectedTreeItem(node)}
          >
            {node.com_name || node.prov_name || node.reg_name || node.name}
          </p>
        );
      })}
    </div>
  );
};

export default Breadcrumb;
