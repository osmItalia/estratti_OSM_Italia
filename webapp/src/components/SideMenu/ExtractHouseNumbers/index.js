import React, {useEffect, useState} from "react";
import { useTranslation } from 'react-i18next';

import Button from "@material-ui/core/Button";
import styles from "./ExtractHouseNumbers.module.css";
import {useMatomo} from "@datapunt/matomo-tracker-react";
import Modal from "@material-ui/core/Modal";
import { sub, format, startOfMonth } from 'date-fns';
import clone from 'lodash/clone';
import pick from 'lodash/pick';

import CircularProgress from "@material-ui/core/CircularProgress";
import Graph from "./Graph";

async function fetchData(featureCollection, setState, t) {
  let f = null;
  if (featureCollection.type === 'Feature') {
    f = {
      type: 'FeatureCollection',
      features: [
        clone(featureCollection),
      ]
    }
  } else if (featureCollection.type === 'FeatureCollection') {
    f = pick(clone(featureCollection), ['features', 'type'])
  }
  let dataEnd
  try {
    const metadata = await fetch(`${process.env.REACT_APP_ENTRYPOINT}/v1/metadata`)
      .then(res => res.json())
    dataEnd = new Date(metadata.extractRegion.temporalExtent.toTimestamp)
  } catch (e) {
    dataEnd = sub(startOfMonth(new Date()), { months: 2 })
  }
  const end = startOfMonth(dataEnd)
  const start = sub(end, { years: 1 })

  const data = new FormData();
  data.append('filter', 'addr:housenumber=* and type:node');
  data.append('time', `${format(start, 'yyyy-MM-dd')}/${format(end, 'yyyy-MM-dd')}/P1M`);
  data.append('bpolys', JSON.stringify(f));

  const res =await fetch(`${process.env.REACT_APP_ENTRYPOINT}/v1/elements/count/`, {
    method: 'POST',
    body: data,
  }).then(res => res.json()).catch(res => null)

  try {
    const values = res.result.map(data => ({
      x: data.timestamp,
      y: data.value
    }))

    setState({
      data: values,
      loading: false,
    })
  } catch (e) {
    console.error(e);

    setState({
      data: null,
      loading: false,
      error: t("errorFetchingData"),
    })
  }
}

export default function ExtractHouseNumber({ selectedFeature }) {
  const [openModal, setOpenModal] = useState(false);
  const [state, setState] = useState({
    loading: false,
    data: null,
  });
  const { t } = useTranslation();
  const { trackEvent } = useMatomo();

  useEffect(() => {
    setState({
      loading: false,
      data: null,
    })
  }, [selectedFeature]);

  if (!selectedFeature?.properties) {
    return null;
  }

  const handleOpen = async (t) => {
    let name = '';
    let value = '';
    const node = selectedFeature.properties;
    if (node.reg_istat) {
      name = t("region");
      value = node.reg_istat;
    }
    if (node.prov_istat) {
      name = t("province");
      value = node.prov_istat;
    }
    if (node.com_istat) {
      name = t("municipality");
      value = node.com_istat;
    }
    trackEvent({
      category: 'HouseNumberStats',
      action: 'open',
      name,
      value,
    })
    setOpenModal(true);
    if (!state.data) {
      setState({ loading: true });
      await fetchData(selectedFeature, setState, t);
    }
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  return (
    <>
      <div className={styles.resultItem}>
        <p>{t("availableAnalysesFor")} {selectedFeature.properties.name}</p>
        <Button
          variant="contained"
          target="_blank"
          className={styles.button}
          color="primary"
          onClick={() => handleOpen(t)}
        >
          {t("houseNumbers")}
        </Button>
      </div>
      <Modal open={openModal} onClose={handleClose}>
        <div className={styles.modal}>
          <h4>{t("houseNumberChange")} {selectedFeature.properties.reg_istat ? t("in") : t("at")} {selectedFeature.properties.name} {t("lastYear")}</h4>
          {state.loading && <div className={styles.centerContent}><CircularProgress /></div>}
          <div>{state.data && <Graph data={state.data} />}</div>
          {state.error && <p>{state.error}</p>}
        </div>
      </Modal>
    </>
  )
}