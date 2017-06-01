import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import { PieChart, Pie, Sector, Cell } from "recharts";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

// components
import CustomLabels from "./CustomLabels";

import { Spin } from "antd";

// const RADIAN = Math.PI / 180;
// const renderCustomizedLabel = ({
//   cx,
//   cy,
//   startAngle,
//   midAngle,
//   endAngle,
//   innerRadius,
//   outerRadius,
//   percent,
//   index,
//   payload
// }) => {
//   const radius = innerRadius + (outerRadius - innerRadius) * 0.3;
//   const x = cx + radius * Math.cos(-midAngle * RADIAN);
//   const y = cy + radius * Math.sin(-midAngle * RADIAN);
//   console.log(startAngle, midAngle, endAngle);
//   return (
//     <text
//       x={x}
//       y={y}
//       fill="white"
//       textAnchor={x > cx ? "start" : "end"}
//       dominantBaseline="central"
//     >
//       {`${(percent * 100).toFixed(0)}%`}
//     </text>
//   );
// };

const renderActiveShape = props => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload
    // percent,
    // value
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 20) * cos;
  const my = cy + (outerRadius + 20) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text x={cx} y={cy} dy={-8} textAnchor="middle" fill="#333">
        {/* {payload.name} */}
        Observed
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill={fill}
      >
        {payload.name}
      </text>
      {/* <text
        x={ex + (cos >= 0 ? 1 : -1) * 18}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
      >
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text> */}
    </g>
  );
};

@inject("store")
@observer
export default class Observed extends Component {
  render() {
    const { observed, observedIndex, observedSectors } = this.props.store.app;
    const height = 300;

    let data = [];
    let COLORS;
    if (observedSectors.length === 5) {
      data = [
        { name: "Not Observed", value: 2 },
        { name: "Below", value: 2 },
        { name: "Slightly Below", value: 2 },
        { name: "Slightly Above", value: 2 },
        { name: "Above", value: 2 }
      ];
      COLORS = ["#292F36", "#0088FE", "#7FB069", "#FFBB28", "#E63B2E"];
    }

    if (observedSectors.length === 4) {
      data = [
        { name: "Not Observed", value: 2.5 },
        { name: "Below", value: 2.5 },
        { name: "Normal", value: 2.5 },
        { name: "Above", value: 2.5 }
      ];
      COLORS = ["#292F36", "#0088FE", "#7FB069", "#E63B2E"];
    }

    if (observedSectors.length === 3) {
      data = [
        { name: "Not Observed", value: 3 },
        { name: "Slightly Below", value: 3 },
        { name: "Slightly Above", value: 3 }
      ];
      COLORS = ["#292F36", "#0088FE", "#7FB069"];
    }

    if (observedSectors.length === 2) {
      data = [{ name: "Normal", value: 500 }, { name: "Above", value: 500 }];
      COLORS = ["#7FB069", "#E63B2E"];
    }

    if (observedSectors.length === 1) {
      data = [{ name: "Not Observed", value: 1 }];
      COLORS = ["#292F36"];
    }

    let cell = null;
    if (data.length > 0) {
      cell = data.map((entry, index) => {
        return <Cell key={index} fill={COLORS[index % COLORS.length]} />;
      });
    }

    return (
      <div>
        {data.length > 0
          ? <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <PieChart
                // style={{ border: "1px solid red" }}
                width={500}
                height={height}
                onMouseEnter={this.onPieEnter}
              >
                <Pie
                  data={data}
                  cx={250}
                  cy={height / 1.6}
                  activeIndex={observedIndex}
                  activeShape={renderActiveShape}
                  startAngle={220}
                  endAngle={-40}
                  labelLine={false}
                  // label={renderCustomizedLabel}
                  outerRadius={110}
                  innerRadius={90}
                  paddingAngle={2}
                >
                  {cell}
                </Pie>
                <Legend />
              </PieChart>

              <BarChart
                // style={{ border: "1px solid green" }}
                width={600}
                height={height}
                data={observed}
                // margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
              >
                <XAxis dataKey="year" tick={<CustomLabels />} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={36}
                  iconSize={18}
                  iconType="rect"
                  payload={[
                    {
                      value: "Days above selected temperature",
                      type: "rect",
                      color: "#ddd"
                    }
                  ]}
                />
                <Bar dataKey="days above">
                  {observed.map((e, i) => {
                    if (i === observed.length - 1) {
                      return <Cell key={i} fill={COLORS[observedIndex]} />;
                    }
                    return <Cell key={i} fill="#ddd" />;
                  })}
                </Bar>
              </BarChart>
            </div>
          : <Spin />}
      </div>
    );
  }
}
