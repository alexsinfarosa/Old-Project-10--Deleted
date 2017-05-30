import { observable, action, computed } from "mobx";
import { stations } from "stations";
import { jStat } from "jStat";
import format from "date-fns/format";
import axios from "axios";
import { closest } from "utils";

// import Uniq from "lodash/uniq";

export default class AppStore {
  // logic------------------------------------------------------------------------------------
  @observable protocol = window.location.protocol;

  @observable isLoading = false;
  @action setIsLoading = d => (this.isLoading = d);

  // Stations ---------------------------------------------------------------------------------
  @observable station = JSON.parse(localStorage.getItem("gauge-stations")) ||
    stations[0];
  @action setStation = d => {
    localStorage.removeItem("gauge-stations");
    this.station = stations.find(s => s.name === d);
    localStorage.setItem("gauge-stations", JSON.stringify(this.station));
  };

  // Data -----------------------------------------------------------------------------------
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
        }
        console.log(res.data.error);
      })
      .catch(err => {
        console.log(err);
      });
  };

  @computed get daysAboveLastYear() {
    const values = this.observedData.map(year => Number(year[1]));
    return values[values.length - 1];
  }

  @computed get ObservedIndex() {
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

      console.log(values, d, minPlusQuantiles, quantile, index);
      return index;
    }
  }

  @computed get observed() {
    let results = [];
    this.observedData.forEach(d => {
      results.push({
        year: format(d[0], "YYYY"),
        daysAbove: Number(d[1])
      });
    });

    return results;
  }

  // Projection 2040-2069 ----------------------------------------------------------
  @observable projectedData2040 = [];
  @action setProjectedData2040 = d => (this.projectedData2040 = d);

  @computed get projectedData2040Values() {
    return this.projectedData2040.map(year => Number(year[1]));
  }
  @computed get projectedData2040Min() {
    return Math.min(...this.projectedData2040Values);
  }
  @computed get projectedData2040Max() {
    return Math.max(...this.projectedData2040Values);
  }
  @computed get projectedData2040Quantile() {
    return jStat.quantiles(this.projectedData2040Values, [0.25, 0.5, 0.75, 1]);
  }
  @computed get projectedData2040ToGraph() {
    const results = [
      this.projectedData2040Min,
      ...this.projectedData2040Quantile
    ];
    return results.map(e => Math.round(e));
  }

  // Projection 2070-2099 ----------------------------------------------------------
  @observable projectedData2070 = [];
  @action setProjectedData2070 = d => (this.projectedData2070 = d);

  @computed get projectedData2070Values() {
    return this.projectedData2070.map(year => Number(year[1]));
  }
  @computed get projectedData2070Min() {
    return Math.min(...this.projectedData2070Values);
  }
  @computed get projectedData2070Max() {
    return Math.max(...this.projectedData2070Values);
  }
  @computed get projectedData2070Quantile() {
    return jStat.quantiles(this.projectedData2070Values, [0.25, 0.5, 0.75, 1]);
  }
  @computed get projectedData2070ToGraph() {
    let results = [
      this.projectedData2070Min,
      ...this.projectedData2070Quantile
    ];
    return results.map(e => Math.round(e));
  }

  // Slider ---------------------------------------------------------------------------
  @observable temperature = JSON.parse(localStorage.getItem("temperature")) ||
    75;
  @action setTemperature = d => {
    this.temperature = d;
    localStorage.setItem("temperature", JSON.stringify(this.temperature));
  };
}
