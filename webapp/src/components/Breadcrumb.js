const Breadcrumb = ({
  setCurrentGeoJSON,
  selectedTreeItem,
  setSelectedTreeItem,
}) => {
    const getParentData = (item, allData) => {
      console.log('item', item)
    const data = item
    allData.push(data)
    if(item.parent){
    return getParentData(item.parent, allData)
    }
    return allData
  }
  const breadcrumbData = getParentData(selectedTreeItem, []).reverse()
  
  return (
    <div className="breadcrumb">
      <div className="appTitle"><h1>Estratti OpenStreetMap Italia</h1></div>
      {breadcrumbData
        .map((node , index) => {
          return (
            <p
              key={node.type}
              style={{zIndex: 4 - index }}
              className={`breadItem ${node.type}`}
              onClick={async() => {
                setSelectedTreeItem(node)
                const geo = await node.getChildFeatures()
                setCurrentGeoJSON(geo)
              }}
            >
              {node.com_name || node.prov_name || node.reg_name || node.name}
            </p>
          );
        })}
    </div>
  );
};

export default Breadcrumb;
