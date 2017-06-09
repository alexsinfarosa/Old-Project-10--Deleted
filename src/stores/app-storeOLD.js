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
  @observable station = JSON.parse(localStorage.getItem('gauge-stations')) ||
    stations[0];
  @action setStation = d => {
    localStorage.removeItem('gauge-stations');
    this.station = stations.find(s => s.name === d);
    localStorage.setItem('gauge-stations', JSON.stringify(this.station));
  };

  // Slider -------------------------------------------------------------------------
  @observable temperature = JSON.parse(localStorage.getItem('temperature')) ||
    75;
  @action setTemperature = d => {
    this.temperature = d;
    localStorage.setItem('temperature', JSON.stringify(this.temperature));
  };

  // Observed ----------------------------------------------------------------------
  @observable observedData = [];
  @action setObservedData = d => {
    this.observedData.clear();
    this.observedData = d;
  };

  @action loadObservedData = () => {
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

  @computed
  get observedQ() {
    const values = this.observedData.map(year => Number(year[1]));
    let Q1 = jStat.quantiles(values, [0, 0.25, 0.5, 0.75, 1]);
    let Q2 = jStat.quantiles(values, [0, 0.33, 0.66, 1]);
    let Q3 = jStat.quantiles(values, [0, 0.5, 1]);
    let Q4 = jStat.quantiles(values, [0.5, 1]);
    let Q5 = jStat.quantiles(values, [1]);

    let Q1U = [...new Set(Q1)];
    if (Q1U.length === Q1.length) return Q1U.map(d => Math.round(d));

    let Q2U = [...new Set(Q2)];
    if (Q2U.length === Q2.length) return Q2U.map(d => Math.round(d));

    let Q3U = [...new Set(Q3)];
    if (Q3U.length === Q3.length) return Q3U.map(d => Math.round(d));

    let Q4U = [...new Set(Q4)];
    if (Q4U.length === Q4.length) return Q4U.map(d => Math.round(d));

    let Q5U = [...new Set(Q5)];
    if (Q5U.length === Q5.length) return Q5U.map(d => Math.round(d));
  }

  @computed
  get observedIndex() {
    // if (this.observedData.length > 0) {
    const d = this.daysAboveLastYear;
    const Q = this.observedQ;

    if (Q.length === 5) {
      console.log(Q);
      if (d < Q[0]) return 0;
      if (d >= Q[0] && d < Q[1]) return 1;
      if (d >= Q[1] && d < Q[2]) return 2;
      if (d >= Q[2] && d < Q[3]) return 3;
      if (d >= Q[3] && d <= Q[4]) return 4;
    }

    if (Q.length === 4) {
      console.log(Q);
      if (d < Q[0]) return 0;
      if (d >= Q[0] && d < Q[1]) return 1;
      if (d >= Q[1] && d < Q[2]) return 2;
      if (d >= Q[2] && d <= Q[3]) return 3;
    }

    if (Q.length === 3) {
      console.log(Q);
      if (d < Q[0]) return 0;
      if (d >= Q[0] && d < Q[1]) return 1;
      if (d >= Q[1] && d <= Q[2]) return 2;
    }

    if (Q.length === 2) {
      console.log(Q);
      if (d <= Q[0]) return 0;
      if (d > Q[0]) return 1;
    }

    if (Q.length === 1) {
      console.log(Q);
      return 0;
    }
    // }
  }

  @computed
  get observed() {
    let results = [];
    this.observedData.forEach(d => {
      results.push({
        year: format(d[0], 'YYYY'),
        'days above': Number(d[1]),
        i: this.observedIndex,
        q: this.observedQ,
        colors: ['#292F36', '#0088FE', '#7FB069']
      });
    });
    console.log(results);
    return results;
  }

  // Projection 2040-2069 ----------------------------------------------------------
  @observable projectedData2040 = [];
  @action setProjectedData2040 = d => {
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
        this.setIsPLoading(false);
      })
      .catch(err => {
        console.log('Failed to load projection 2040-2069 ', err);
      });
  }

  @computed
  get projectedData2040Q() {
    // if (this.projectedData2040.length > 0) {
    const values = this.projectedData2040.map(year => Number(year[1]));
    let Q1 = jStat.quantiles(values, [0, 0.25, 0.5, 0.75, 1]);
    let Q2 = jStat.quantiles(values, [0, 0.33, 0.66, 1]);
    let Q3 = jStat.quantiles(values, [0, 0.5, 1]);
    let Q4 = jStat.quantiles(values, [0.5, 1]);
    let Q5 = jStat.quantiles(values, [1]);

    let Q1U = [...new Set(Q1)];
    if (Q1U.length === Q1.length) return Q1U.map(d => Math.round(d));

    let Q2U = [...new Set(Q2)];
    if (Q2U.length === Q2.length) return Q2U.map(d => Math.round(d));

    let Q3U = [...new Set(Q3)];
    if (Q3U.length === Q3.length) return Q3U.map(d => Math.round(d));

    let Q4U = [...new Set(Q4)];
    if (Q4U.length === Q4.length) return Q4U.map(d => Math.round(d));

    let Q5U = [...new Set(Q5)];
    if (Q5U.length === Q5.length) return Q5U.map(d => Math.round(d));
    // }
  }

  @computed
  get projection2040Index() {
    // if (this.projectedData2040.length > 0) {
    const d = this.daysAboveLastYear;
    const Q = this.projectedData2040Q;

    if (Q.length === 5) {
      console.log(Q, d);
      if (d < Q[0]) return 0;
      if (d >= Q[0] && d < Q[1]) return 1;
      if (d >= Q[1] && d < Q[2]) return 2;
      if (d >= Q[2] && d < Q[3]) return 3;
      if (d >= Q[3] && d <= Q[4]) return 4;
    }

    if (Q.length === 4) {
      console.log(Q, d);
      if (d < Q[0]) return 0;
      if (d >= Q[0] && d < Q[1]) return 1;
      if (d >= Q[1] && d < Q[2]) return 2;
      if (d >= Q[2] && d <= Q[3]) return 3;
    }

    if (Q.length === 3) {
      console.log(Q, d);
      if (d < Q[0]) return 0;
      if (d >= Q[0] && d < Q[1]) return 1;
      if (d >= Q[1] && d <= Q[2]) return 2;
    }

    if (Q.length === 2) {
      console.log(Q, d);
      if (d <= Q[0]) return 0;
      if (d > Q[0]) return 1;
    }

    if (Q.length === 1) {
      console.log(Q, d);
      return 0;
    }
    // }
  }

  @computed
  get projection2040() {
    let results = [];
    this.projectedData2040.forEach(d => {
      results.push({
        year: format(d[0], 'YYYY'),
        'days above': Number(d[1])
      });
    });

    return results;
  }

  // Projection 2070-2099 ----------------------------------------------------------
  @observable projectedData2070 = [];
  @action setProjectedData2070 = d => {
    this.projectedData2070.clear();
    this.projectedData2070 = d;
  };

  @action loadProjection2070 = () => {
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
        this.setIsPLoading(false);
      })
      .catch(err => {
        console.log('Failed to load projection 2070-2099', err);
      });
  };

  @computed
  get projectedData2070Q() {
    const values = this.projectedData2070.map(year => Number(year[1]));
    let Q1 = jStat.quantiles(values, [0, 0.25, 0.5, 0.75, 1]);
    let Q2 = jStat.quantiles(values, [0, 0.33, 0.66, 1]);
    let Q3 = jStat.quantiles(values, [0, 0.5, 1]);
    let Q4 = jStat.quantiles(values, [0.5, 1]);
    let Q5 = jStat.quantiles(values, [1]);

    let Q1U = [...new Set(Q1)];
    if (Q1U.length === Q1.length) return Q1U.map(d => Math.round(d));

    let Q2U = [...new Set(Q2)];
    if (Q2U.length === Q2.length) return Q2U.map(d => Math.round(d));

    let Q3U = [...new Set(Q3)];
    if (Q3U.length === Q3.length) return Q3U.map(d => Math.round(d));

    let Q4U = [...new Set(Q4)];
    if (Q4U.length === Q4.length) return Q4U.map(d => Math.round(d));

    let Q5U = [...new Set(Q5)];
    if (Q5U.length === Q5.length) return Q5U.map(d => Math.round(d));
  }

  @computed
  get projection2070Index() {
    // if (this.projectedData2070.length > 0) {
    const d = this.daysAboveLastYear;
    const Q = this.projectedData2070Q;

    if (Q.length === 5) {
      console.log(Q, d);
      if (d < Q[0]) return 0;
      if (d >= Q[0] && d < Q[1]) return 1;
      if (d >= Q[1] && d < Q[2]) return 2;
      if (d >= Q[2] && d < Q[3]) return 3;
      if (d >= Q[3] && d <= Q[4]) return 4;
    }

    if (Q.length === 4) {
      console.log(Q, d);
      if (d < Q[0]) return 0;
      if (d >= Q[0] && d < Q[1]) return 1;
      if (d >= Q[1] && d < Q[2]) return 2;
      if (d >= Q[2] && d <= Q[3]) return 3;
    }

    if (Q.length === 3) {
      console.log(Q, d);
      if (d < Q[0]) return 0;
      if (d >= Q[0] && d < Q[1]) return 1;
      if (d >= Q[1] && d <= Q[2]) return 2;
    }

    if (Q.length === 2) {
      console.log(Q, d);
      if (d <= Q[0]) return 0;
      if (d > Q[0]) return 1;
    }

    if (Q.length === 1) {
      console.log(Q, d);
      return 0;
    }
    // }
  }

  @computed
  get projection2070() {
    let results = [];
    this.projectedData2070.forEach(d => {
      results.push({
        year: format(d[0], 'YYYY'),
        'days above': Number(d[1])
      });
    });
    return results;
  }
}
