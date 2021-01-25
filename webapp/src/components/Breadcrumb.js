import { fillDataFromProperties } from "../helpers";

const Breadcrumb = ({
  selectedFeature,
  setSelectedFeature,
  setCurrentGeoJSON,
  setFeatureIndex,
  featureIndex,
}) => {
  return (
    <div className="breadcrumb">
      {console.log(selectedFeature) || Object.entries(selectedFeature)
        .filter(([, { name }]) => !!name)
        .map(([type, { name, index }]) => {
          const visible = name && index <= featureIndex;
          return (
            <p
              key={type}
              style={{
                transform: `translateX(${visible ? "0%" : "-100%"})`,
                "minWidth": `${visible ? "100px" : "0px"}`,
                padding: `${visible ? "6px" : "0px"}`,
                zIndex: 4 - index,
              }}
              className={`breadItem ${type}`}
              onClick={() => {
                const parent = Object.entries(selectedFeature).filter(
                  ([, { index: mappedIndex }]) => mappedIndex === index - 1
                );
                console.log(index)
                console.log('parent', parent)
                let currentFeature;
                if (!parent.length) {
                  currentFeature = selectedFeature.state.feature;
                  currentFeature.properties = {};
                } else {
                  currentFeature = parent[0][1].feature.features.find(
                    ({ properties }) =>
                      (properties.prov_name === name) || (properties.reg_name===name) 
                  );
                }
                fillDataFromProperties(
                  currentFeature,
                  selectedFeature,
                  setSelectedFeature,
                  setCurrentGeoJSON,
                  setFeatureIndex,
                  true
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
