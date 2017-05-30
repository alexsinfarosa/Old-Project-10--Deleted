import axios from "axios";
import format from "date-fns/format";

// Projection 2040-2069 ---------------------------------------------------------------------
export const fetchProjection2040 = (protocol, station, temperature) => {
  const params = {
    loc: `${station.lon}, ${station.lat}`,
    sdate: `2040-${format(new Date(), "MM-DD")}`,
    edate: `2069-${format(new Date(), "MM-DD")}`,
    grid: 23,
    elems: [
      {
        name: "maxt",
        interval: [1, 0, 0],
        duration: "std",
        season_start: "01-01",
        reduce: `cnt_ge_${temperature}`
      }
    ]
  };

  // console.log(params);

  return axios
    .post(`${protocol}//grid.rcc-acis.org/GridData`, params)
    .then(res => {
      if (!res.data.hasOwnProperty("error")) {
        return res.data.data;
      }
      console.log(res.data.error);
    })
    .catch(err => {
      console.log(err);
    });
};

// Projection 2070-2099 ----------------------------------------------------------------------
export const fetchProjection2070 = (protocol, station, temperature) => {
  const params = {
    loc: `${station.lon}, ${station.lat}`,
    sdate: `2070-${format(new Date(), "MM-DD")}`,
    edate: `2099-${format(new Date(), "MM-DD")}`,
    grid: 23,
    elems: [
      {
        name: "maxt",
        interval: [1, 0, 0],
        duration: "std",
        season_start: "01-01",
        reduce: `cnt_ge_${temperature}`
      }
    ]
  };

  // console.log(params);

  return axios
    .post(`${protocol}//grid.rcc-acis.org/GridData`, params)
    .then(res => {
      if (!res.data.hasOwnProperty("error")) {
        return res.data.data;
      }
      console.log(res.data.error);
    })
    .catch(err => {
      console.log(err);
    });
};

export const fetchProjections = (protocol, station, temperature) => {
  return axios
    .all([
      fetchProjection2040(protocol, station, temperature),
      fetchProjection2070(protocol, station, temperature)
    ])
    .then(res => {
      if (!res.hasOwnProperty("error")) {
        return res;
      }
    })
    .catch(err => {
      console.log(err);
    });
};
