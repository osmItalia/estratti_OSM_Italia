import { fillDataFromProperties, getParentForFeature } from "../helpers";

const Breadcrumb = ({
  selectedFeature,
  setSelectedFeature,
  setCurrentGeoJSON,
  setFeatureIndex,
  featureIndex,
  italyTree,
}) => {
  return (
    <div className="breadcrumb">
      <div className="appTitle"><h1>Estratti OpenStreetMap Italia</h1></div>
      {Object.entries(selectedFeature)
        .filter(([, { name }]) => !!name)
        .map(([type, { name, index }]) => {
          const visible = name && index <= featureIndex;
          return (
            <p
              key={type}
              style={{
                transform: `translateX(${visible ? "0%" : "-100%"})`,
                "minWidth": `${visible ? "50px" : "0px"}`,
                padding: `${visible ? "6px" : "0px"}`,
                zIndex: 4 - index,
              }}
              className={`breadItem ${type}`}
              onClick={() => {
                if(featureIndex===index){
                  return
                }
                console.log('selectedFeature',selectedFeature)
                const parent = Object.entries(selectedFeature).filter(
                  ([, { index: mappedIndex }]) => mappedIndex === index - 1
                );

                let currentFeature;
                if (!parent.length) { // if clicking on the state
                  currentFeature = selectedFeature.state.feature;
                  currentFeature.properties = {};
                } else {
                  currentFeature = parent[0][1].feature.features.find(
                    ({ properties }) =>
                      (properties.name === name) || (properties.name===name) 
                  );
                }
                const featureWithParent = getParentForFeature(currentFeature, selectedFeature)
                console.log('featureWithParent',featureWithParent)
                fillDataFromProperties(
                  featureWithParent,
                  selectedFeature,
                  setSelectedFeature,
                  setCurrentGeoJSON,
                  setFeatureIndex,
                  true,
                  italyTree,
                );
              }}
            >
              {name}
            </p>
          );
        })}
    </div>
  );
};

export default Breadcrumb;
