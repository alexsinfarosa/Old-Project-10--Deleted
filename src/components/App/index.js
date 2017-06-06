import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { when } from 'mobx';

import { Spin } from 'antd';

// components
import AppMenu from 'components/AppMenu';
import AppSlider from 'components/AppSlider';
import Observed from 'components/Observed';
import ProjectionButtons from 'components/ProjectionButtons';
import Projections from 'components/Projections';

// styled-components
import { Page, Header } from './styles';

@inject('store')
@observer
class App extends Component {
  constructor(props) {
    super(props);
    when(() => this.props.store.app.isLoading === false, () => this.getData());
  }

  getData = () => {
    // const { station, getTemperature } = this.props.store.app;
    this.props.store.app.loadObservedData();
    this.props.store.app.loadProjection2040();
    this.props.store.app.loadProjection2070();
  };

  render() {
    const {
      temperature,
      daysAboveLastYear,
      projectedData2040,
      projectedData2070
    } = this.props.store.app;

    let displayProjection = true;
    if (projectedData2040.length > 0 || projectedData2070.length > 0) {
      displayProjection = false;
    }

    return (
      <Page>
        <AppMenu />
        <br />

        <AppSlider />
        <br />

        {daysAboveLastYear > 0
          ? <Header>{daysAboveLastYear} Days above {temperature}˚F </Header>
          : <Header>{daysAboveLastYear} Day above {temperature}˚F </Header>}

        {/* <h3>Number of days {daysAboveLastYear}</h3> */}
        <br />
        <Observed />

        <br />
        {displayProjection ? null : <ProjectionButtons />}

        <br />
        {displayProjection ? <Spin /> : <Projections />}

      </Page>
    );
  }
}

export default App;
