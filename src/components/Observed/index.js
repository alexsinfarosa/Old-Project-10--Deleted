import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { PieChart, Pie, Sector, Cell, Line } from 'recharts';
import { ComposedChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// components
import CustomLabels from 'components/Graph/CustomLabels';

import { Spin } from 'antd';

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
  const textAnchor = cos >= 0 ? 'start' : 'end';

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
        {`(Days Above ${payload.Q})`}
      </text> */}
    </g>
  );
};

@inject('store')
@observer
export default class Observed extends Component {
  render() {
    const {
      temperature,
      mean,
      observed,
      observedIndex,
      observedQ,
      daysAboveLastYear
    } = this.props.store.app;
    const height = 300;

    let normal = false;

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
      payload,
      fill
    }) => {
      const sin = Math.sin(-RADIAN * endAngle);
      const cos = Math.cos(-RADIAN * endAngle);
      const x = cx + (innerRadius - 23) * cos;
      const y = cy + (innerRadius - 23) * sin;

      const sx = cx + (innerRadius + 19) * cos;
      const sy = cy + (innerRadius + 19) * sin;
      const mx = cx + (innerRadius - 10) * cos;
      const my = cy + (innerRadius - 10) * sin;

      return (
        <g>
          <text
            x={!normal ? x : x + 4}
            y={y}
            fill="black"
            textAnchor={x > cx ? 'middle' : 'middle'}
            dominantBaseline="central"
          >
            {payload.Q}
          </text>
          {!normal &&
            <path d={`M${sx},${sy} L${mx},${my}`} stroke={fill} fill="none" />}
        </g>
      );
    };

    let data = [];
    let COLORS;
    if (observedQ.length === 5) {
      if (daysAboveLastYear === observedQ[2]) {
        normal = true;
        data = [
          { name: 'Not Observed', value: 1, Q: observedQ[0] },
          { name: 'Below', value: 1, Q: observedQ[1] },
          { name: 'Slightly Below', value: 1, Q: observedQ[2] },
          { name: 'Normal' },
          { name: 'Slightly Above', value: 1, Q: observedQ[3] },
          { name: 'Above', value: 1, Q: observedQ[4] }
        ];
        COLORS = [
          '#292F36',
          '#0088FE',
          '#7FB069',
          '#BFB649',
          '#FFBB28',
          '#E63B2E'
        ];
      } else {
        data = [
          { name: 'Not Observed', value: 1, Q: observedQ[0] },
          { name: 'Below', value: 1, Q: observedQ[1] },
          { name: 'Slightly Below', value: 1, Q: observedQ[2] },
          { name: 'Slightly Above', value: 1, Q: observedQ[3] },
          { name: 'Above', value: 1, Q: observedQ[4] }
        ];
        COLORS = ['#292F36', '#0088FE', '#7FB069', '#FFBB28', '#E63B2E'];
      }
    }

    if (observedQ.length === 4) {
      if (daysAboveLastYear === observedQ[1]) {
        normal = true;
        data = [
          { name: 'Below', value: 1, Q: observedQ[0] },
          { name: 'Slightly Below', value: 1, Q: observedQ[1] },
          { name: 'Normal' },
          { name: 'Slightly Above', value: 1, Q: observedQ[2] },
          { name: 'Above', value: 1, Q: observedQ[3] }
        ];
        COLORS = ['#0088FE', '#7FB069', '#BFB649', '#FFBB28', '#E63B2E'];
      } else {
        data = [
          { name: 'Below', value: 1, Q: observedQ[0] },
          { name: 'Slightly Below', value: 1, Q: observedQ[1] },
          { name: 'Slightly Above', value: 1, Q: observedQ[2] },
          { name: 'Above', value: 1, Q: observedQ[3] }
        ];
        COLORS = ['#0088FE', '#7FB069', '#FFBB28', '#E63B2E'];
      }
    }

    if (observedQ.length === 3) {
      if (daysAboveLastYear === observedQ[0]) {
        normal = true;
        data = [
          { name: 'Slightly Below', value: 1, Q: observedQ[0] },
          { name: 'Normal' },
          { name: 'Slightly Above', value: 1, Q: observedQ[1] },
          { name: 'Above', value: 1, Q: observedQ[2] }
        ];
        COLORS = ['#7FB069', '#BFB649', '#FFBB28', '#E63B2E'];
      } else {
        data = [
          { name: 'Slightly Below', value: 1, Q: observedQ[0] },
          { name: 'Slightly Above', value: 1, Q: observedQ[1] },
          { name: 'Above', value: 1, Q: observedQ[2] }
        ];
        COLORS = ['#7FB069', '#FFBB28', '#E63B2E'];
      }
    }

    if (observedQ.length === 2) {
      if (daysAboveLastYear === observedQ[0]) {
        normal = true;
        data = [
          { name: 'Slightly Below', value: 1, Q: observedQ[0] },
          { name: 'Normal' },
          { name: 'Slightly Above', value: 1, Q: observedQ[1] }
        ];
        COLORS = ['#7FB069', '#BFB649', '#FFBB28'];
      } else {
        data = [
          { name: 'Slightly Below', value: 1, Q: observedQ[0] },
          { name: 'Slightly Above', value: 1, Q: observedQ[1] }
        ];
        COLORS = ['#7FB069', '#FFBB28'];
      }
    }

    if (observedQ.length === 1) {
      data = [{ name: 'Not Observed', value: 1 }];
      COLORS = ['#292F36'];
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
          ? <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
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
                  label={renderCustomizedLabel}
                  outerRadius={110}
                  innerRadius={90}
                  paddingAngle={3}
                  // label
                >
                  {cell}
                </Pie>
                <Legend />
              </PieChart>

              <ComposedChart
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
                      value: `Days above ${temperature} ˚F`,
                      type: 'rect',
                      color: '#ddd'
                    },
                    {
                      value: `Mean ${mean}`,
                      type: 'line',
                      color: '#ff7300'
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
                <Line
                  type="monotone"
                  dataKey="mean"
                  stroke="#ff7300"
                  dot={false}
                />
              </ComposedChart>
            </div>
          : <Spin />}
      </div>
    );
  }
}
