const Breadcrumb = ({
  selectedFeature,
  selectFeature,
  featureIndex,
  setFeatureIndex,
}) => {
  return (
    <div className="breadcrumb">
      {Object.entries(selectedFeature)
        .filter(
          ([, { index, name, feature }]) =>
            name && feature && index <= featureIndex
        )
        .map(([type, { index, name, feature }]) => {
          return (
            <p
              key={name + type}
              className={`breadItem ${type}`}
              onClick={() => {
                selectFeature(feature);
                setFeatureIndex(index);
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
