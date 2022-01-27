import React, {useEffect, useState} from "react";

import Button from "@material-ui/core/Button";
import styles from "./ExtractHouseNumbers.module.css";
import {useMatomo} from "@datapunt/matomo-tracker-react";
import Modal from "@material-ui/core/Modal";
import { sub, format, startOfMonth } from 'date-fns';
import clone from 'lodash/clone';
import pick from 'lodash/pick';

import CircularProgress from "@material-ui/core/CircularProgress";
import Graph from "./Graph";

async function fetchData(featureCollection, setState) {
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
  const end = sub(startOfMonth(new Date()), { months: 1 })
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
      error: 'Si è verificato un\'errore',
    })
  }
}

export default function ExtractHouseNumber({ selectedFeature }) {
  const [openModal, setOpenModal] = useState(false);
  const [state, setState] = useState({
    loading: false,
    data: null,
  });
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

  const handleOpen = async () => {
    let name = '';
    let value = '';
    const node = selectedFeature.properties;
    if (node.reg_istat) {
      name = 'Regione';
      value = node.reg_istat;
    }
    if (node.prov_istat) {
      name = 'Provincia';
      value = node.prov_istat;
    }
    if (node.com_istat) {
      name = 'Comune';
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
      await fetchData(selectedFeature, setState);
    }
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  return (
    <>
      <div className={styles.resultItem}>
        <p>Analisi disponibili per {selectedFeature.properties.name}</p>
        <Button
          variant="contained"
          target="_blank"
          className={styles.button}
          color="primary"
          onClick={handleOpen}
        >
          Numeri Civici
        </Button>
      </div>
      <Modal open={openModal} onClose={handleClose}>
        <div className={styles.modal}>
          <h4>Andamento dei numeri civici {selectedFeature.properties.reg_istat ? 'in' : 'a' } {selectedFeature.properties.name} nell’ultimo anno</h4>
          {state.loading && <div className={styles.centerContent}><CircularProgress /></div>}
          <div>{state.data && <Graph data={state.data} />}</div>
          {state.error && <p>{state.error}</p>}
        </div>
      </Modal>
    </>
  )
}