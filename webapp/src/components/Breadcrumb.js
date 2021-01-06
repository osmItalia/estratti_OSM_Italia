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
      {Object.entries(selectedFeature)
        .filter(([, { name }]) => !!name)
        .map(([type, { name, feature, index }]) => {
          const visible = name && index <= featureIndex;
          return (
            <p
              key={type}
              style={{
                transform: `translateX(${visible ? "0%" : "-100%"})`,
                "min-width": `${visible ? "100px" : "0px"}`,
                padding: `${visible ? "6px" : "0px"}`,
                zIndex: 4 - index,
              }}
              className={`breadItem ${type}`}
              onClick={() => {
                const parent = Object.entries(selectedFeature).filter(
                  ([, { index: mappedIndex }]) => mappedIndex === index - 1
                );
                let currentFeature;
                if (!parent.length) {
                  currentFeature = selectedFeature.state.feature;
                  currentFeature.properties = {};
                } else {
                  currentFeature = parent[0][1].feature.features.find(
                    ({ properties }) =>
                      name ===
                      (properties.name ||
                        properties.prov_name ||
                        properties.reg_name)
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
