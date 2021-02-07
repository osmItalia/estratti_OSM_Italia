import styles from "./DownloadItems.module.css";
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import Tooltip from "@material-ui/core/Tooltip";
import config from "../../../configuration.json";

const ToolTipButton = ({ title, href, tooltip }) => (
  <Tooltip title={tooltip}>
    <Button
      variant="contained"
      href={href}
      target="_blank"
      startIcon={<SaveIcon />}
      className={styles.button}
      color="primary"
    >
      {title}
    </Button>
  </Tooltip>
);

const DownloadItems = ({ selectedFeature }) => {
  if (!selectedFeature?.properties) {
    return null;
  }

  const { properties } = selectedFeature;

  if (!properties[".gpkg"] && !properties[".osm.pbf"]) {
    return null;
  }

  return (
    <div className={styles.resultItem}>
      <p>Estratti disponibili per {properties.name}</p>
      {properties[".gpkg"] && (
        <ToolTipButton
          tooltip="OGC GeoPackage"
          href={config.basePath + config.outputFilesPath + properties[".gpkg"]}
          title="GPKG"
        />
      )}
      {properties[".osm.pbf"] && (
        <ToolTipButton
          tooltip="Protocolbuffer binary format"
          href={config.basePath + config.outputFilesPath + properties[".osm.pbf"]}
          title="PBF"
        />
      )}
    </div>
  );
};

export default DownloadItems;
