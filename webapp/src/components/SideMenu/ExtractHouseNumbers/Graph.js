import React, {useState} from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import it from 'date-fns/locale/it';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
);

const options = {
  responsive: true,
};



let formatter = new Intl.NumberFormat('en', { notation: 'compact' });

export default function Graph({ data }) {
  const values = data.map(d => d.y);
  const labels = data.map(d => d.x.split('T')[0]);
  
  return (
    <Line 
      options={options}
      data={{
        labels,
        datasets: [
          {
            label: 'Quantità',
            data: values,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          }
        ],
      }}
    />
  )
}