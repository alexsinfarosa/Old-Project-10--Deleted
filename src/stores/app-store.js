import { observable, action, computed } from 'mobx';
import { stations } from 'stations';
import { jStat } from 'jStat';
import format from 'date-fns/format';
import axios from 'axios';

// import Uniq from "lodash/uniq";

export default class AppStore {
  // logic-------------------------------------------------------------------------
  @observable protocol = window.location.protocol;

  @observable isLoading = false;
  @action setIsLoading = d => (this.isLoading = d);

  @observable isPLoading = false;
  @action setIsPLoading = d => (this.isPLoading = d);

  @observable selectedProjection = 'projection2040';
  @action setProjection = d => (this.selectedProjection = d);

  // Stations -----------------------------------------------------------------------
  @observable
  station = JSON.parse(localStorage.getItem('gauge-stations')) || stations[0];
  @action
  setStation = d => {
    localStorage.removeItem('gauge-stations');
    this.station = stations.find(s => s.name === d);
    localStorage.setItem('gauge-stations', JSON.stringify(this.station));
  };

  // Slider -------------------------------------------------------------------------
  @observable
  temperature = JSON.parse(localStorage.getItem('temperature')) || 75;
  @action
  setTemperature = d => {
    this.temperature = d;
    localStorage.setItem('temperature', JSON.stringify(this.temperature));
  };

  // Observed ----------------------------------------------------------------------
  @observable observedData = [];
  @action
  setObservedData = d => {
    this.observedData.clear();
    this.observedData = d;
  };

  @action
  loadObservedData = () => {
    this.setIsLoading(true);
    const params = {
      sid: this.station.sid,
      // you can change back this to 1980-08-01
      sdate: `1980-${format(new Date(), 'MM-DD')}`,
      edate: format(new Date(), 'YYYY-MM-DD'),
      elems: [
        {
          name: 'maxt',
          interval: [1, 0, 0],
          duration: 'std',
          season_start: '01-01',
          reduce: `cnt_ge_${this.temperature}`
        }
      ]
    };

    // console.log(params);

    return axios
      .post(`${this.protocol}//data.rcc-acis.org/StnData`, params)
      .then(res => {
        this.setObservedData(res.data.data);
        this.setMean();
        this.setIsLoading(false);
      })
      .catch(err => {
        console.log('Failed to load observed data ', err);
      });
  };

  @computed
  get daysAboveLastYear() {
    const values = this.observedData.map(year => Number(year[1]));
    return values[values.length - 1];
  }

  @observable mean;
  @action
  setMean() {
    const values = this.observedData.map(year => Number(year[1]));
    this.mean = Math.round(jStat.quantiles(values, [0.5]));
  }

  @computed
  get observedQ() {
    const values = this.observedData.map(year => Number(year[1]));
    let Q = jStat.quantiles(values, [0, 0.25, 0.5, 0.75, 1]); // min,25,50,75,100
    Q = Q.map(q => Math.round(q));
    console.log(`Original ${Q}`);
    if (Q[0] === Q[1] && Q[1] === Q[2] && Q[2] === Q[3] && Q[3] === Q[4]) {
      console.log(`100 ${Q}`);
      return [Q[4]]; // 100
    }

    if (Q[0] === Q[1] && Q[1] === Q[2] && Q[2] === Q[3]) {
      console.log(`50,100 ${Q}`);
      return [Q[2], Q[4]]; // 50,100
    }

    if (Q[0] === Q[1] && Q[1] === Q[2]) {
      console.log(`50,75,100 ${Q}`);
      return [Q[2], Q[3], Q[4]]; // 50,75,100
    }

    if (Q[0] === Q[1]) {
      console.log(`25,50,75,100 ${Q}`);
      return [Q[1], Q[2], Q[3], Q[4]]; // 25,50,75,100
    }
    return Q;
  }

  @computed
  get observedIndex() {
    const d = this.daysAboveLastYear;
    const Q = this.observedQ;

    if (Q.length === 5) {
      if (d <= Q[0]) return 0;
      if (d > Q[0] && d <= Q[1]) return 1;
      if (d > Q[1] && d < Q[2]) return 2;
      if (d === Q[2]) return 3;
      if (d > Q[2] && d <= Q[3]) return 3;
      if (d > Q[3]) return 4;
    }

    if (Q.length === 4) {
      if (d <= Q[0]) return 0;
      if (d > Q[0] && d < Q[1]) return 1;
      if (d === Q[1]) return 2;
      if (d > Q[1] && d <= Q[2]) return 2;
      if (d > Q[2]) return 3;
    }

    if (Q.length === 3) {
      if (d < Q[0]) return 0;
      if (d === Q[0]) return 0;
      if (d > Q[0] && d <= Q[1]) return 1;
      if (d > Q[1]) return 2;
    }

    if (Q.length === 2) {
      if (d < Q[0]) return 0;
      if (d === Q[0]) return 1;
      if (d > Q[0]) return 1;
    }

    if (Q.length === 1) return 0;
  }

  @computed
  get observed() {
    const values = this.observedData.map(year => Number(year[1]));
    let results = [];
    this.observedData.forEach(d => {
      results.push({
        year: format(d[0], 'YYYY'),
        'days above': Number(d[1]),
        mean: Math.round(jStat.quantiles(values, [0.5]))
      });
    });

    return results;
  }

  // Projection 2040-2069 ----------------------------------------------------------
  @observable projectedData2040 = [];
  @action
  setProjectedData2040 = d => {
    this.projectedData2040.clear();
    this.projectedData2040 = d;
  };

  @action
  loadProjection2040() {
    this.setIsPLoading(true);
    const params = {
      loc: `${this.station.lon}, ${this.station.lat}`,
      sdate: `2040-${format(new Date(), 'MM-DD')}`,
      edate: `2069-${format(new Date(), 'MM-DD')}`,
      grid: 23,
      elems: [
        {
          name: 'maxt',
          interval: [1, 0, 0],
          duration: 'std',
          season_start: '01-01',
          reduce: `cnt_ge_${this.temperature}`
        }
      ]
    };

    // console.log(params);

    return axios
      .post(`${this.protocol}//grid.rcc-acis.org/GridData`, params)
      .then(res => {
        this.setProjectedData2040(res.data.data);
        this.setp2040Mean();
        this.setIsPLoading(false);
      })
      .catch(err => {
        console.log('Failed to load projection 2040-2069 ', err);
      });
  }

  @observable p2040Mean;
  @action
  setp2040Mean() {
    const values = this.projectedData2040.map(year => Number(year[1]));
    this.p2040Mean = Math.round(jStat.quantiles(values, [0.5]));
  }

  @computed
  get projectedData2040Q() {
    const values = this.projectedData2040.map(year => Number(year[1]));
    let Q = jStat.quantiles(values, [0, 0.25, 0.5, 0.75, 1]); // min,25,50,75,100
    Q = Q.map(q => Math.round(q));
    console.log(`projection2040 ${Q}`);
    if (Q[0] === Q[1] && Q[1] === Q[2] && Q[2] === Q[3] && Q[3] === Q[4]) {
      console.log(`100 ${Q}`);
      return [Q[4]]; // 100
    }

    if (Q[0] === Q[1] && Q[1] === Q[2] && Q[2] === Q[3]) {
      console.log(`75,100 ${Q}`);
      return [Q[3], Q[4]]; // 75,100
    }

    if (Q[0] === Q[1] && Q[1] === Q[2]) {
      console.log(`50,75,100 ${Q}`);
      return [Q[2], Q[3], Q[4]]; // 50,75,100
    }

    if (Q[0] === Q[1]) {
      console.log(`25,50,75,100 ${Q}`);
      return [Q[1], Q[2], Q[3], Q[4]]; // 25,50,75,100
    }
    return Q;
  }

  @computed
  get projection2040Index() {
    const d = this.daysAboveLastYear;
    const Q = this.projectedData2040Q;

    if (Q.length === 5) {
      if (d <= Q[0]) return 0;
      if (d > Q[0] && d <= Q[1]) return 1;
      if (d > Q[1] && d < Q[2]) return 2;
      if (d === Q[2]) return 3;
      if (d > Q[2] && d <= Q[3]) return 3;
      if (d > Q[3]) return 4;
    }

    if (Q.length === 4) {
      if (d <= Q[0]) return 0;
      if (d > Q[0] && d < Q[1]) return 1;
      if (d === Q[1]) return 2;
      if (d > Q[1] && d <= Q[2]) return 2;
      if (d > Q[2]) return 3;
    }

    if (Q.length === 3) {
      if (d < Q[0]) return 0;
      if (d === Q[0]) return 0;
      if (d > Q[0] && d <= Q[1]) return 1;
      if (d > Q[1]) return 2;
    }

    if (Q.length === 2) {
      if (d < Q[0]) return 0;
      if (d === Q[0]) return 1;
      if (d > Q[0]) return 1;
    }

    if (Q.length === 1) return 0;
  }

  @computed
  get projection2040() {
    const values = this.projectedData2040.map(year => Number(year[1]));
    let results = [];
    this.projectedData2040.forEach(d => {
      results.push({
        year: format(d[0], 'YYYY'),
        'days above': Number(d[1]),
        mean: Math.round(jStat.quantiles(values, [0.5]))
      });
    });

    return results;
  }

  // Projection 2070-2099 ----------------------------------------------------------
  @observable projectedData2070 = [];
  @action
  setProjectedData2070 = d => {
    this.projectedData2070.clear();
    this.projectedData2070 = d;
  };

  @action
  loadProjection2070 = () => {
    this.setIsPLoading(true);
    const params = {
      loc: `${this.station.lon}, ${this.station.lat}`,
      sdate: `2070-${format(new Date(), 'MM-DD')}`,
      edate: `2099-${format(new Date(), 'MM-DD')}`,
      grid: 23,
      elems: [
        {
          name: 'maxt',
          interval: [1, 0, 0],
          duration: 'std',
          season_start: '01-01',
          reduce: `cnt_ge_${this.temperature}`
        }
      ]
    };

    // console.log(params);

    return axios
      .post(`${this.protocol}//grid.rcc-acis.org/GridData`, params)
      .then(res => {
        this.setProjectedData2070(res.data.data);
        this.setp2070Mean();
        this.setIsPLoading(false);
      })
      .catch(err => {
        console.log('Failed to load projection 2070-2099', err);
      });
  };

  @observable p2070Mean;
  @action
  setp2070Mean() {
    const values = this.projectedData2070.map(year => Number(year[1]));
    this.p2070Mean = Math.round(jStat.quantiles(values, [0.5]));
  }

  @computed
  get projectedData2070Q() {
    const values = this.projectedData2070.map(year => Number(year[1]));
    let Q = jStat.quantiles(values, [0, 0.25, 0.5, 0.75, 1]); // min,25,50,75,100
    Q = Q.map(q => Math.round(q));
    console.log(`projection2070 ${Q}`);
    if (Q[0] === Q[1] && Q[1] === Q[2] && Q[2] === Q[3] && Q[3] === Q[4]) {
      console.log(`100 ${Q}`);
      return [Q[4]]; // 100
    }

    if (Q[0] === Q[1] && Q[1] === Q[2] && Q[2] === Q[3]) {
      console.log(`75,100 ${Q}`);
      return [Q[3], Q[4]]; // 75,100
    }

    if (Q[0] === Q[1] && Q[1] === Q[2]) {
      console.log(`50,75,100 ${Q}`);
      return [Q[2], Q[3], Q[4]]; // 50,75,100
    }

    if (Q[0] === Q[1]) {
      console.log(`25,50,75,100 ${Q}`);
      return [Q[1], Q[2], Q[3], Q[4]]; // 25,50,75,100
    }
    return Q;
  }

  @computed
  get projection2070Index() {
    const d = this.daysAboveLastYear;
    const Q = this.projectedData2070Q;

    if (Q.length === 5) {
      if (d <= Q[0]) return 0;
      if (d > Q[0] && d <= Q[1]) return 1;
      if (d > Q[1] && d < Q[2]) return 2;
      if (d === Q[2]) return 3;
      if (d > Q[2] && d <= Q[3]) return 3;
      if (d > Q[3]) return 4;
    }

    if (Q.length === 4) {
      if (d <= Q[0]) return 0;
      if (d > Q[0] && d < Q[1]) return 1;
      if (d === Q[1]) return 2;
      if (d > Q[1] && d <= Q[2]) return 2;
      if (d > Q[2]) return 3;
    }

    if (Q.length === 3) {
      if (d < Q[0]) return 0;
      if (d === Q[0]) return 0;
      if (d > Q[0] && d <= Q[1]) return 1;
      if (d > Q[1]) return 2;
    }

    if (Q.length === 2) {
      if (d < Q[0]) return 0;
      if (d === Q[0]) return 1;
      if (d > Q[0]) return 1;
    }

    if (Q.length === 1) return 0;
  }

  @computed
  get projection2070() {
    const values = this.projectedData2070.map(year => Number(year[1]));
    let results = [];
    this.projectedData2070.forEach(d => {
      results.push({
        year: format(d[0], 'YYYY'),
        'days above': Number(d[1]),
        mean: Math.round(jStat.quantiles(values, [0.5]))
      });
    });
    return results;
  }
}
