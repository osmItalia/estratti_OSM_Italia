import React from "react";
import { useTranslation } from 'react-i18next';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

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

export default function Graph({ data }) {
  const values = data.map(d => d.y);
  const labels = data.map(d => d.x.split('T')[0]);
  const { t } = useTranslation();
  
  return (
    <Line 
      options={options}
      data={{
        labels,
        datasets: [
          {
            label: t("quantity"),
            data: values,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          }
        ],
      }}
    />
  )
}