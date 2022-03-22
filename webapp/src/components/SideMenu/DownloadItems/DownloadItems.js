import styles from "./DownloadItems.module.css";
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import Tooltip from "@material-ui/core/Tooltip";
import config from "../../../configuration.json";
import {useMatomo} from "@datapunt/matomo-tracker-react";

const ToolTipButton = ({ title, href, tooltip, istat }) => {
  const { trackEvent,  } = useMatomo();

  return (
    <Tooltip title={tooltip}>
      <Button
        variant="contained"
        href={href}
        target="_blank"
        startIcon={<SaveIcon />}
        className={styles.button}
        color="primary"
        onClick={() => trackEvent({
          category: 'Download',
          action: 'click',
          name: title,
          value: istat,
        })}
      >
        {title}
      </Button>
    </Tooltip>
  );
}

const DownloadItems = ({ selectedFeature }) => {
  if (!selectedFeature?.properties) {
    return null;
  }

  const { properties } = selectedFeature;

  if (!properties[".gpkg"] && !properties[".osm.pbf"] && !properties[".obf"]) {
    return null;
  }

  return (
    <div className={styles.resultItem}>
      <p>Formati disponibili per {properties.name}</p>
      {properties[".gpkg"] && (
        <ToolTipButton
          tooltip="OGC GeoPackage"
          href={config.basePathFiles + "/" + properties[".gpkg"]}
          title="GPKG"
          istat={properties.istat}
        />
      )}
      {properties[".osm.pbf"] && (
        <ToolTipButton
          tooltip="Protocolbuffer binary format"
          href={config.basePathFiles + "/" + properties[".osm.pbf"]}
          title="PBF"
          istat={properties.istat}
        />
      )}
      {properties[".obf"] && (
        <ToolTipButton
          tooltip="OsmAnd OBF Format"
          href={config.basePathFiles + "/" + properties[".obf"]}
          title="OsmAnd OBF"
          istat={properties.istat}
        />
      )}
    </div>
  );
};

export default DownloadItems;
