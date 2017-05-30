import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import { Slider } from "antd";

@inject("store")
@observer
class AppSlider extends Component {
  onChange = e => {
    this.props.store.app.setTemperature(e);
    this.props.store.app.loadObservedData();
  };

  render() {
    const { temperature } = this.props.store.app;
    const marks = {
      75: "75°F",
      80: "80°F",
      85: "85°F",
      90: "90°F",
      95: "95°F",
      100: {
        style: {
          color: "#f50"
        },
        label: <strong>100°F</strong>
      }
    };
    return (
      <Slider
        style={{ width: "60%" }}
        min={75}
        marks={marks}
        defaultValue={temperature}
        onChange={this.onChange}
      />
    );
  }
}

export default AppSlider;
