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

  notification = () => {
    const { daysAboveLastYear, temperature } = this.props.store.app;
    switch (daysAboveLastYear) {
      case 0:
        return (
          <Header>
            This year there have been no days above {temperature}˚F{' '}
          </Header>
        );
      case 1:
        return (
          <Header>
            This year there has been {daysAboveLastYear} day above {temperature}˚F{' '}
          </Header>
        );
      default:
        return (
          <Header>
            This year there have been {daysAboveLastYear} days above{' '}
            {temperature}˚F{' '}
          </Header>
        );
    }
  };

  render() {
    const { isLoading, isPLoading } = this.props.store.app;

    return (
      <Page>
        <AppMenu />
        <br />

        <AppSlider />
        <br />

        {this.notification()}

        {/* <h3>Number of days {daysAboveLastYear}</h3> */}
        <br />
        {isLoading ? null : <Observed />}

        <br />
        {isLoading ? null : <ProjectionButtons />}

        <br />
        {isPLoading ? <Spin /> : <Projections />}

      </Page>
    );
  }
}

export default App;
