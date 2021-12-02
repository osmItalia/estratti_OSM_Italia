import React, {useState} from "react";
import {AreaSeries, Hint, HorizontalGridLines, XAxis, VerticalGridLines} from "react-vis";
import XYPlot from "react-vis/es/plot/xy-plot";
import { format } from 'date-fns';
import max from 'lodash/max';
import min from 'lodash/min';
import styles from "./ExtractHouseNumbers.module.css";


export default function Graph({ data }) {
  const [state, setState] = useState(null);
  const maxVal = max(data.map(d => d.y));

  const xs = data.map(d => d.x)
  const minX = min(xs);
  const maxX = max(xs);
  return (
    <XYPlot
      width={700}
      height={300}
      yDomain={[0, maxVal + 1]}
      xDomain={[minX - 100000, maxX + 100000]}
      onMouseLeave={() => setState(null)}
    >
      <AreaSeries
        color="#3f51b5"
        data={data}
        onSeriesMouseOut={() => setState(null)}
        onNearestX={v => setState(v)}
      />
      <XAxis
        title="Data"
        tickFormat={v => format(new Date(v), 'yyyy/MM')}
        tickSize={1}
        tickPadding={5}
        tickTotal={6}
      />
      <HorizontalGridLines />
      <VerticalGridLines />
      {state && (
        <Hint value={state}>
          <div className={styles.hint}>
            <strong>{state.y}</strong>
            <br/>
            <small>{format(new Date(state.x), 'yyyy/MM/dd')}</small>
          </div>
        </Hint>
      )}
    </XYPlot>
  )
}