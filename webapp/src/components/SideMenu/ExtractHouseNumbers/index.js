import React, {useEffect, useState} from "react";

import Button from "@material-ui/core/Button";
import styles from "./ExtractHouseNumbers.module.css";
import {useMatomo} from "@datapunt/matomo-tracker-react";
import Modal from "@material-ui/core/Modal";
import { sub, format } from 'date-fns';
import clone from 'lodash/clone';
import pick from 'lodash/pick';

import config from '../../../configuration.json';
import CircularProgress from "@material-ui/core/CircularProgress";
import Graph from "./Graph";

async function fetchData(featureCollection, setState) {

  const f = pick(clone(featureCollection), ['features', 'type'])

  const times = new Array(config.houseNumberCount)
    .fill(0)
    .reduce((prev) => [...prev, sub(prev[prev.length - 1], config.houseNumberInterval)], [sub(new Date(), { days: 7 })])

  const elements = times.map(time => {
    const data = new FormData();
    data.append('filter', 'addr:housenumber=*');
    data.append('time', format(time, 'yyyy-MM-dd'));
    data.append('bpolys', JSON.stringify(f));

    return fetch(`${process.env.REACT_APP_ENTRYPOINT}/v1/elements/count/`, {
      method: 'POST',
      body: data,
    }).then(res => res.json()).catch(res => null)
  });

  try {
    const responses = await Promise.all(elements);

    const values = responses.map((data, index) => {
      let y = 0
      if (data?.result && data?.result?.length > 0 && data?.result[0].value) {
        y = data.result[0].value;
      }
      return {x: times[index].getTime(), y}
    })

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
    trackEvent({
      category: 'Breadcrumb',
      action: 'open',
    })
    setOpenModal(true);
    if (!state.data) {
      setState({ loading: true });
      await fetchData(selectedFeature, setState);
    }
  };

  const handleClose = () => {
    trackEvent({
      category: 'Breadcrumb',
      action: 'close',
    })
    setOpenModal(false);
  };

  return (
    <>
      <div className={styles.resultItem}>
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
          <h4>Numeri Civici</h4>
          {state.loading && <div className={styles.centerContent}><CircularProgress /></div>}
          <div>{state.data && <Graph data={state.data} />}</div>
          {state.error && <p>{state.error}</p>}
        </div>
      </Modal>
    </>
  )
}