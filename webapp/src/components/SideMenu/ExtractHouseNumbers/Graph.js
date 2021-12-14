import React, {useState} from "react";
import {XYPlot, AreaSeries, Hint, HorizontalGridLines, XAxis, VerticalGridLines, YAxis, LineSeries} from "react-vis";
import 'react-vis/dist/style.css';
import { format } from 'date-fns';
import max from 'lodash/max';
import min from 'lodash/min';

import it from 'date-fns/locale/it';

let formatter = new Intl.NumberFormat('en', { notation: 'compact' });

export default function Graph({ data }) {
  const [state, setState] = useState(null);
  const ys = data.map(d => d.y);
  const maxY = max(ys);
  const minY = min(ys);

  const xs = data.map(d => d.x);
  const minX = min(xs);
  const maxX = max(xs);
  return (
    <XYPlot
      width={700}
      height={300}
      yDomain={[minY, maxY]}
      xDomain={[minX, maxX]}
      onMouseLeave={() => setState(null)}
    >
      <VerticalGridLines
        tickTotal={12}
      />
      <HorizontalGridLines tickTotal={10} />
      <AreaSeries
        color="#3f51b5"
        data={data}
        // onSeriesMouseOut={() => setState(null)}
        // onNearestX={v => setState(v)}
      />
      <XAxis
        tickFormat={v => format(new Date(v), 'MMM', { locale: it })}
        tickTotal={12}
      />
      <YAxis tickTotal={10} tickFormat={v => formatter.format(v)} />
    </XYPlot>
  )
}