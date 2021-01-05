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
        .filter(
          ([, { index, name, feature }]) =>
            name && feature && index <= featureIndex
        )
        .map(([type, { name, feature, index }]) => {
          return (
            <p
              key={name + type}
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
