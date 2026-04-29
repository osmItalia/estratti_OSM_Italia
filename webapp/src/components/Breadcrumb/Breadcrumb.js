import { useState } from "react";
import { useTranslation } from 'react-i18next';
import styles from "./Breadcrumb.module.css";
import logo from "../../static/assets/logo-wikimedia.png";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import InfoIcon from "@material-ui/icons/Info";
import {useMatomo} from "@datapunt/matomo-tracker-react";

const Breadcrumb = ({ selectedTreeItem, setSelectedTreeItem }) => {
  const [openModal, setOpenModal] = useState(false);
  const { t, i18n } = useTranslation();
  const { trackEvent } = useMatomo();

  const handleOpen = () => {
    trackEvent({
      category: 'Breadcrumb',
      action: 'open',
    })
    setOpenModal(true);
  };

  const handleClose = () => {
    trackEvent({
      category: 'Breadcrumb',
      action: 'close',
    })
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
        <h1>{t("appTitle")}</h1>
      </a>

      {breadcrumbData.map((node, index) => {
        return (
          <p
            key={node.type}
            style={{ zIndex: 4 - index }}
            className={styles.breadItem}
            onClick={() => {
              trackEvent({
                category: 'Breadcrumb',
                action: 'click',
                name: node.com_name || node.prov_name || node.reg_name || node.name
              })
              setSelectedTreeItem(node)
            }}
          >
            {node.com_name || node.prov_name || node.reg_name || node.name}
          </p>
        );
      })}
      <div className={styles.buttonGeneralContainer}>
        <div className={styles.buttonContainer}>
          <Button
            variant="outlined"
            onClick={() => i18n.changeLanguage(i18n.language == "it" ? "en" : "it")}
          >
            🇮🇹🔄🇬🇧
          </Button>
          <Button
            variant="contained"
            onClick={handleOpen}
            startIcon={<InfoIcon />}
            color="primary"
          >
            {t("info")}
          </Button>
          <Modal open={openModal} onClose={handleClose}>
            <div className={styles.modal}>
              <p>
                {t("infoText.p1")}
              </p>
              <p>
                {t("infoText.p2")}
              </p>
              <ul>
                <li>{t("infoText.li1")}</li>
                <li>{t("infoText.li2")}</li>
                <li>{t("infoText.li3")}</li>
                <li>{t("infoText.li4")}</li>
              </ul>
              <p>
                {t("infoText.p3")}{" "}
              </p>
              <p>
                {t("infoText.p4.t1")}{" "}
                <a href="https://www.wikimedia.it">{t("infoText.p4.a1")}</a>
                {t("infoText.p4.t2")}{" "}
                <a href="https://wiki.osmfoundation.org/wiki/Main_Page">{t("infoText.p4.a2")}</a>
                {t("infoText.p4.t3")}{" "}
                <a href="https://gisdev.io">{t("infoText.p4.a3")}</a>
                {t("infoText.p4.t4")}
              </p>
              <p>{t("infoText.p5")}</p>
              <p>
                {t("infoText.p6.t1")}{" "}
                <a href="https://github.com/osmItalia/estratti_OSM_Italia">
                  {t("infoText.p6.a1")}
                </a>
                {t("infoText.p6.t2")}
              </p>
              <p>{t("infoText.p7.t1")}{" "}
                <a href="https://www.wikimedia.it/cookie-policy/">{t("infoText.p7.a1")}</a>
                {t("infoText.p7.t2")}
              </p>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumb;
