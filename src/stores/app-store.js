import { observable, action, computed } from "mobx";
import { stations } from "stations";
import { jStat } from "jStat";
import format from "date-fns/format";
import axios from "axios";

// import Uniq from "lodash/uniq";

export default class AppStore {
  // logic-------------------------------------------------------------------------
  @observable protocol = window.location.protocol;

  @observable isLoading = false;
  @action setIsLoading = d => (this.isLoading = d);

  @observable selectedProjection = "projection2040";
  @action setProjection = d => (this.selectedProjection = d);

  // Stations -----------------------------------------------------------------------
  @observable station = JSON.parse(localStorage.getItem("gauge-stations")) ||
    stations[0];
  @action setStation = d => {
    localStorage.removeItem("gauge-stations");
    this.station = stations.find(s => s.name === d);
    localStorage.setItem("gauge-stations", JSON.stringify(this.station));
  };

  // Slider -------------------------------------------------------------------------
  @observable temperature = JSON.parse(localStorage.getItem("temperature")) ||
    75;
  @action setTemperature = d => {
    this.temperature = d;
    localStorage.setItem("temperature", JSON.stringify(this.temperature));
  };

  // Observed ----------------------------------------------------------------------
  @observable observedData = [];
  @action setObservedData = d => (this.observedData = d);

  @action loadObservedData = () => {
    this.setIsLoading(true);
    const params = {
      sid: this.station.sid,
      // you can change back this to 1980-08-01
      sdate: `1980-${format(new Date(), "MM-DD")}`,
      edate: format(new Date(), "YYYY-MM-DD"),
      elems: [
        {
          name: "maxt",
          interval: [1, 0, 0],
          duration: "std",
          season_start: "01-01",
          reduce: `cnt_ge_${this.temperature}`
        }
      ]
    };

    // console.log(params);

    return axios
      .post(`${this.protocol}//data.rcc-acis.org/StnData`, params)
      .then(res => {
        if (!res.data.hasOwnProperty("error")) {
          // res.data.data.map(e => console.log(e));
          this.setObservedData(res.data.data);
          this.setIsLoading(false);
          return;
        }
        console.log(res.data.error);
      })
      .catch(err => {
        console.log(err);
      });
  };

  @computed get daysAboveLastYear() {
    const values = this.observedData.map(year => Number(year[1]));
    console.log(values[values.length - 1]);
    return values[values.length - 1];
  }

  @computed get observedIndex() {
    if (this.observedData.length > 0) {
      const values = this.observedData.map(year => Number(year[1]));
      const min = Math.min(...values);
      const quantiles = jStat.quantiles(values, [0.25, 0.5, 0.75, 1]);
      const minPlusQuantiles = [min, ...quantiles];
      const sorted = [...minPlusQuantiles];
      const d = this.daysAboveLastYear;
      // const quantile = closest(quantiles, d);
      const quantile = sorted.sort(
        (a, b) => Math.abs(d - a) - Math.abs(d - b)
      )[0];
      const index = minPlusQuantiles.indexOf(quantile);

      console.log(values.toString(), d, minPlusQuantiles, quantile, index);
      return index;
    }
  }

  @computed get observed() {
    let results = [];
    let barColor = "";
    const index = this.observedIndex;
    if (index === 0) {
      barColor = "#292F36";
    } else if (index === 1) {
      barColor = "#0088FE";
    } else if (index === 2) {
      barColor = "#7FB069";
    } else if (index === 3) {
      barColor = "#FFBB28";
    } else if (index === 4) {
      barColor = "#E63B2E";
    }
    this.observedData.forEach(d => {
      results.push({
        year: format(d[0], "YYYY"),
        "days above": Number(d[1]),
        barColor: barColor
      });
    });

    return results;
  }

  // Projection 2040-2069 ----------------------------------------------------------
  @observable projectedData2040 = [];
  @action setProjectedData2040 = d => (this.projectedData2040 = d);

  @action loadProjection2040 = () => {
    this.setIsLoading(true);
    const params = {
      loc: `${this.station.lon}, ${this.station.lat}`,
      sdate: `2040-${format(new Date(), "MM-DD")}`,
      edate: `2069-${format(new Date(), "MM-DD")}`,
      grid: 23,
      elems: [
        {
          name: "maxt",
          interval: [1, 0, 0],
          duration: "std",
          season_start: "01-01",
          reduce: `cnt_ge_${this.temperature}`
        }
      ]
    };

    // console.log(params);

    return axios
      .post(`${this.protocol}//grid.rcc-acis.org/GridData`, params)
      .then(res => {
        if (!res.data.hasOwnProperty("error")) {
          // return res.data.data;
          this.setProjectedData2040(res.data.data);
          this.setIsLoading(false);
          return;
        }
        console.log(res.data.error);
      })
      .catch(err => {
        console.log(err);
      });
  };

  @computed get projection2040Index() {
    if (this.projectedData2040.length > 0) {
      const values = this.projectedData2040.map(year => Number(year[1]));
      const min = Math.min(...values);
      const quantiles = jStat.quantiles(values, [0.25, 0.5, 0.75, 1]);
      const minPlusQuantiles = [min, ...quantiles];
      const sorted = [...minPlusQuantiles];
      const d = this.daysAboveLastYear;
      // const quantile = closest(quantiles, d);
      const quantile = sorted.sort(
        (a, b) => Math.abs(d - a) - Math.abs(d - b)
      )[0];
      const index = minPlusQuantiles.indexOf(quantile);

      console.log(values.toString(), d, minPlusQuantiles, quantile, index);
      return index;
    }
  }

  @computed get projection2040() {
    let results = [];
    let barColor = "";
    const index = this.projection2040Index;
    if (index === 0) {
      barColor = "#292F36";
    } else if (index === 1) {
      barColor = "#0088FE";
    } else if (index === 2) {
      barColor = "#7FB069";
    } else if (index === 3) {
      barColor = "#FFBB28";
    } else if (index === 4) {
      barColor = "#E63B2E";
    }
    this.projectedData2040.forEach(d => {
      results.push({
        year: format(d[0], "YYYY"),
        "days above": Number(d[1]),
        barColor: barColor
      });
    });

    return results;
  }

  // Projection 2070-2099 ----------------------------------------------------------
  @observable projectedData2070 = [];
  @action setProjectedData2070 = d => (this.projectedData2070 = d);

  @action loadProjection2070 = () => {
    this.setIsLoading(true);
    const params = {
      loc: `${this.station.lon}, ${this.station.lat}`,
      sdate: `2070-${format(new Date(), "MM-DD")}`,
      edate: `2099-${format(new Date(), "MM-DD")}`,
      grid: 23,
      elems: [
        {
          name: "maxt",
          interval: [1, 0, 0],
          duration: "std",
          season_start: "01-01",
          reduce: `cnt_ge_${this.temperature}`
        }
      ]
    };

    // console.log(params);

    return axios
      .post(`${this.protocol}//grid.rcc-acis.org/GridData`, params)
      .then(res => {
        if (!res.data.hasOwnProperty("error")) {
          // return res.data.data;
          this.setProjectedData2070(res.data.data);
          this.setIsLoading(false);
          return;
        }
        console.log(res.data.error);
      })
      .catch(err => {
        console.log(err);
      });
  };

  @computed get projection2070Index() {
    if (this.projectedData2070.length > 0) {
      const values = this.projectedData2070.map(year => Number(year[1]));
      const min = Math.min(...values);
      const quantiles = jStat.quantiles(values, [0.25, 0.5, 0.75, 1]);
      const minPlusQuantiles = [min, ...quantiles];
      const sorted = [...minPlusQuantiles];
      const d = this.daysAboveLastYear;
      // const quantile = closest(quantiles, d);
      const quantile = sorted.sort(
        (a, b) => Math.abs(d - a) - Math.abs(d - b)
      )[0];
      const index = minPlusQuantiles.indexOf(quantile);

      console.log(values.toString(), d, minPlusQuantiles, quantile, index);
      return index;
    }
  }

  @computed get projection2070() {
    let results = [];
    let barColor = "";
    const index = this.projection2070Index;
    if (index === 0) {
      barColor = "#292F36";
    } else if (index === 1) {
      barColor = "#0088FE";
    } else if (index === 2) {
      barColor = "#7FB069";
    } else if (index === 3) {
      barColor = "#FFBB28";
    } else if (index === 4) {
      barColor = "#E63B2E";
    }
    this.projectedData2070.forEach(d => {
      results.push({
        year: format(d[0], "YYYY"),
        "days above": Number(d[1]),
        barColor: barColor
      });
    });

    return results;
  }
}
