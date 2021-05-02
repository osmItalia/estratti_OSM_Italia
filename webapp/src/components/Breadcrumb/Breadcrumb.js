import { useState } from "react";
import styles from "./Breadcrumb.module.css";
import logo from "../../static/assets/logo-wikimedia.png";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import InfoIcon from "@material-ui/icons/Info";

const Breadcrumb = ({ selectedTreeItem, setSelectedTreeItem }) => {
  const [openModal, setOpenModal] = useState(false);

  const handleOpen = () => {
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
  };
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
      <a
        className={styles.logo}
        href="https://www.wikimedia.it/"
        target="_blank"
        rel="noreferrer"
      >
        <img src={logo} alt="wikimedia" />
      </a>
      <a className={styles.appTitle} href=".">
        <h1>Estratti OpenStreetMap Italia</h1>
      </a>

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
      <div className={styles.buttonContainer}>
        <Button
          variant="contained"
          onClick={handleOpen}
          startIcon={<InfoIcon />}
          color="primary"
        >
          Info
        </Button>
        <Modal open={openModal} onClose={handleClose}>
          <div className={styles.modal}>
            <p>
              Estratti OpenStreetMap Italia è un servizio che permette di
              estrarre dati relativi all’Italia presenti nel database
              OpenStreetMap.
            </p>
            <p>
              I dati sono disponibili a seconda della scala in diversi formati:{" "}
            </p>
            <ul>
              <li>GPKG - OGC GeoPackage</li>
              <li> PBF - Protocolbuffer Binary Format </li>
              <li>OSMAND OBF- OsmAnd Binary Maps Format</li>
            </ul>
            <p>
              È possibile estrarre i dati per ogni regione, provincia o comune
              italiani.
            </p>
            <p>
              Lo sviluppo del servizio è stato finanziato da{" "}
              <a href="https://www.wikimedia.it">Wikimedia Italia</a>, capitolo
              locale italiano della{" "}
              <a href="https://wiki.osmfoundation.org/wiki/Main_Page">
                OpenStreetMap Foundation
              </a>
              , e il lavoro è stato realizzato da{" "}
              <a href="https://gisdev.io">GISdevio Srl</a>.
            </p>
            <p>I dati sono aggiornati con frequenza giornaliera.</p>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Breadcrumb;
