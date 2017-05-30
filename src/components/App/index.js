import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { when } from "mobx";

// components
import AppMenu from "components/AppMenu";
import AppSlider from "components/AppSlider";
import Observed from "components/Observed";

// styled-components
import { Page } from "./styles";

// utils
import { fetchObservedData, fetchProjections } from "utils/api";

@inject("store")
@observer
class App extends Component {
  constructor(props) {
    super(props);
    when(() => this.props.store.app.isLoading === false, () => this.getData());
  }

  getData = () => {
    const { station, getTemperature } = this.props.store.app;
    this.props.store.app.loadObservedData(station, getTemperature);
  };

  render() {
    const { station, temperature, daysAboveLastYear } = this.props.store.app;
    return (
      <Page>
        <AppMenu />
        <br />

        <AppSlider />
        <br />

        {station && <h2>{daysAboveLastYear} Days above {temperature}˚F </h2>}
        {/* <h3>Number of days {daysAboveLastYear}</h3> */}
        <br />

        <Observed />
        <br />

      </Page>
    );
  }
}

export default App;
