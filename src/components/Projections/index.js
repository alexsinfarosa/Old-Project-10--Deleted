import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import { PieChart, Pie, Sector, Cell } from "recharts";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line
} from "recharts";

// components
import CustomLabels from "./CustomLabels";

const COLORS = ["#292F36", "#0088FE", "#7FB069", "#FFBB28", "#E63B2E"];

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
        Projection
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
export default class Projections extends Component {
  render() {
    const {
      projection2040,
      projection2040Index,
      projection2070,
      projection2070Index,
      selectedProjection
    } = this.props.store.app;

    const height = 300;

    const data = [
      { name: "Not Observed", value: 200 },
      { name: "Below", value: 200 },
      { name: "Slightly Below", value: 200 },
      { name: "Slightly Above", value: 200 },
      { name: "Above", value: 200 }
    ];

    const cell = data.map((entry, index) => {
      return <Cell key={index} fill={COLORS[index % COLORS.length]} />;
    });

    return (
      <div style={{ display: "flex", justifyContent: "flex-start" }}>
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
            activeIndex={
              selectedProjection === "projection2040"
                ? projection2040Index
                : projection2070Index
            }
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
        </PieChart>

        <ComposedChart
          // style={{ border: "1px solid green" }}
          width={600}
          height={height}
          data={
            selectedProjection === "projection2040"
              ? projection2040
              : projection2070
          }
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
          <Bar dataKey="days above" fill="#ddd">
            {/* {projection2040.map((e, i) => {
              if (i === projection2040.length - 1) {
                return <Cell key={i} fill={e.barColor} />;
              }
              return <Cell key={i} fill="#ddd" />;
            })} */}
          </Bar>
          <Line
            type="monotone"
            dataKey="daysAboveLastYear"
            stroke="#8884d8"
            dot={false}
          />
        </ComposedChart>
      </div>
    );
  }
}
