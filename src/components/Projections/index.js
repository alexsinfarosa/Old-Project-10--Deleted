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
import CustomLabels from "components/Graph/CustomLabels";

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  startAngle,
  midAngle,
  endAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  payload
}) => {
  const sin = Math.sin(-RADIAN * endAngle);
  const cos = Math.cos(-RADIAN * endAngle);
  const x = cx + (innerRadius - 15) * cos;
  const y = cy + (innerRadius - 15) * sin;
  return (
    <text
      x={x}
      y={y}
      fill="black"
      textAnchor={x > cx ? "middle" : "middle"}
      dominantBaseline="central"
    >
      {payload.Q}
    </text>
  );
};

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
      <text
        x={cx}
        y={cy}
        dy={-8}
        textAnchor="middle"
        fill="#333"
        fontSize=".8rem"
      >
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
      temperature,
      selectedProjection,
      p2040Mean,
      p2070Mean,
      projection2070Index,
      projection2070,
      projectedData2070Q,
      projection2040Index,
      projection2040,
      projectedData2040Q,
      daysAboveLastYear
    } = this.props.store.app;
    const height = 300;

    let data = [];
    let COLORS;

    let Q = projectedData2040Q;
    let mean = p2040Mean;
    if (selectedProjection === "projection2070") {
      Q = projectedData2070Q;
      mean = p2070Mean;
    }

    if (Q.length === 5) {
      if (daysAboveLastYear === Q[0]) {
        data = [
          { name: "Not Observed", value: 1, Q: Q[0] },
          { name: "Min" },
          { name: "Below", value: 1, Q: Q[1] },
          { name: "Slightly Below", value: 1, Q: Q[2] },
          { name: "Slightly Above", value: 1, Q: Q[3] },
          { name: "Above", value: 1, Q: Q[4] }
        ];
        COLORS = [
          "#292F36",
          "#155C9A",
          "#0088FE",
          "#7FB069",
          "#FFBB28",
          "#E63B2E"
        ];
      } else if (daysAboveLastYear === Q[1]) {
        data = [
          { name: "Not Observed", value: 1, Q: Q[0] },
          { name: "Below", value: 1, Q: Q[1] },
          { name: "25%" },
          { name: "Slightly Below", value: 1, Q: Q[2] },
          { name: "Slightly Above", value: 1, Q: Q[3] },
          { name: "Above", value: 1, Q: Q[4] }
        ];
        COLORS = [
          "#292F36",
          "#0088FE",
          "#409CB4",
          "#7FB069",
          "#FFBB28",
          "#E63B2E"
        ];
      } else if (daysAboveLastYear === Q[2]) {
        data = [
          { name: "Not Observed", value: 1, Q: Q[0] },
          { name: "Below", value: 1, Q: Q[1] },
          { name: "Slightly Below", value: 1, Q: Q[2] },
          { name: "Normal" },
          { name: "Slightly Above", value: 1, Q: Q[3] },
          { name: "Above", value: 1, Q: Q[4] }
        ];
        COLORS = [
          "#292F36",
          "#0088FE",
          "#7FB069",
          "#BFB649",
          "#FFBB28",
          "#E63B2E"
        ];
      } else if (daysAboveLastYear === Q[3]) {
        data = [
          { name: "Not Observed", value: 1, Q: Q[0] },
          { name: "Below", value: 1, Q: Q[1] },
          { name: "Slightly Below", value: 1, Q: Q[2] },
          { name: "Slightly Above", value: 1, Q: Q[3] },
          { name: "75%" },
          { name: "Above", value: 1, Q: Q[4] }
        ];
        COLORS = [
          "#292F36",
          "#0088FE",
          "#7FB069",
          "#FFBB28",
          "#F37B2B",
          "#E63B2E"
        ];
      } else if (daysAboveLastYear === Q[4]) {
        data = [
          { name: "Not Observed", value: 1, Q: Q[0] },
          { name: "Below", value: 1, Q: Q[1] },
          { name: "Slightly Below", value: 1, Q: Q[2] },
          { name: "Slightly Above", value: 1, Q: Q[3] },
          { name: "Above", value: 1, Q: Q[4] },
          { name: "Max" }
        ];
        COLORS = ["#292F36", "#0088FE", "#7FB069", "#FFBB28", "#E63B2E", "red"];
      } else {
        data = [
          { name: "Not Observed", value: 1, Q: Q[0] },
          { name: "Below", value: 1, Q: Q[1] },
          { name: "Slightly Below", value: 1, Q: Q[2] },
          { name: "Slightly Above", value: 1, Q: Q[3] },
          { name: "Above", value: 1, Q: Q[4] }
        ];
        COLORS = ["#292F36", "#0088FE", "#7FB069", "#FFBB28", "#E63B2E"];
      }
    }

    if (Q.length === 4) {
      if (daysAboveLastYear === Q[0]) {
        data = [
          { name: "Below", value: 1, Q: Q[0] },
          { name: "25%" },
          { name: "Slightly Below", value: 1, Q: Q[1] },
          { name: "Slightly Above", value: 1, Q: Q[2] },
          { name: "Above", value: 1, Q: Q[3] }
        ];
        COLORS = ["#0088FE", "#409CB4", "#7FB069", "#FFBB28", "#E63B2E"];
      } else if (daysAboveLastYear === Q[1]) {
        data = [
          { name: "Below", value: 1, Q: Q[0] },
          { name: "Slightly Below", value: 1, Q: Q[1] },
          { name: "Normal" },
          { name: "Slightly Above", value: 1, Q: Q[2] },
          { name: "Above", value: 1, Q: Q[3] }
        ];
        COLORS = ["#0088FE", "#7FB069", "#BFB649", "#FFBB28", "#E63B2E"];
      } else if (daysAboveLastYear === Q[2]) {
        data = [
          { name: "Below", value: 1, Q: Q[0] },
          { name: "Slightly Below", value: 1, Q: Q[1] },
          { name: "Slightly Above", value: 1, Q: Q[2] },
          { name: "75%" },
          { name: "Above", value: 1, Q: Q[3] }
        ];
        COLORS = ["#0088FE", "#7FB069", "#FFBB28", "#F37B2B", "#E63B2E"];
      } else if (daysAboveLastYear === Q[3]) {
        data = [
          { name: "Below", value: 1, Q: Q[0] },
          { name: "Slightly Below", value: 1, Q: Q[1] },
          { name: "Slightly Above", value: 1, Q: Q[2] },
          { name: "Above", value: 1, Q: Q[3] },
          { name: "Max" }
        ];
        COLORS = ["#0088FE", "#7FB069", "#FFBB28", "#E63B2E", "red"];
      } else {
        data = [
          { name: "Below", value: 1, Q: Q[0] },
          { name: "Slightly Below", value: 1, Q: Q[1] },
          { name: "Slightly Above", value: 1, Q: Q[2] },
          { name: "Above", value: 1, Q: Q[3] }
        ];
        COLORS = ["#0088FE", "#7FB069", "#FFBB28", "#E63B2E"];
      }
    }

    if (Q.length === 3) {
      if (daysAboveLastYear === Q[0]) {
        data = [
          { name: "Slightly Below", value: 1, Q: Q[0] },
          { name: "Normal" },
          { name: "Slightly Above", value: 1, Q: Q[1] },
          { name: "Above", value: 1, Q: Q[2] }
        ];
        COLORS = ["#7FB069", "#BFB649", "#FFBB28", "#E63B2E"];
      } else if (daysAboveLastYear === Q[1]) {
        data = [
          { name: "Slightly Below", value: 1, Q: Q[0] },
          { name: "Slightly Above", value: 1, Q: Q[1] },
          { name: "75%" },
          { name: "Above", value: 1, Q: Q[2] }
        ];
        COLORS = ["#7FB069", "#FFBB28", "#F37B2B", "#E63B2E"];
      } else if (daysAboveLastYear === Q[2]) {
        data = [
          { name: "Slightly Below", value: 1, Q: Q[0] },
          { name: "Slightly Above", value: 1, Q: Q[1] },
          { name: "Above", value: 1, Q: Q[2] },
          { name: "Max" }
        ];
        COLORS = ["#7FB069", "#FFBB28", "#E63B2E", "red"];
      } else {
        data = [
          { name: "Slightly Below", value: 1, Q: Q[0] },
          { name: "Slightly Above", value: 1, Q: Q[1] },
          { name: "Above", value: 1, Q: Q[2] }
        ];
        COLORS = ["#7FB069", "#FFBB28", "#E63B2E"];
      }
    }

    if (Q.length === 2) {
      if (daysAboveLastYear === Q[0]) {
        data = [
          { name: "Slightly Below", value: 1, Q: Q[0] },
          { name: "Normal" },
          { name: "Slightly Above", value: 1, Q: Q[1] }
        ];
        COLORS = ["#7FB069", "#BFB649", "#FFBB28"];
      } else if (daysAboveLastYear === Q[1]) {
        data = [
          { name: "Slightly Below", value: 1, Q: Q[0] },
          { name: "Slightly Above", value: 1, Q: Q[1] },
          { name: "Max" }
        ];
        COLORS = ["#7FB069", "#FFBB28", "red"];
      } else {
        data = [
          { name: "Slightly Below", value: 1, Q: Q[0] },
          { name: "Slightly Above", value: 1, Q: Q[1] }
        ];
        COLORS = ["#7FB069", "#FFBB28"];
      }
    }

    if (Q.length === 1) {
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
            label={renderCustomizedLabel}
            outerRadius={110}
            innerRadius={90}
            paddingAngle={1}
          >
            {cell}
          </Pie>
          <Legend />
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
                value: `Days above ${temperature} ˚F`,
                type: "rect",
                color: "#ddd"
              },
              {
                value: `Mean ${mean}`,
                type: "line",
                color: "#ff7300"
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
          <Line type="monotone" dataKey="mean" stroke="#ff7300" dot={false} />
        </ComposedChart>
      </div>
    );
  }
}
