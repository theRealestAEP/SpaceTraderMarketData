import React, { useState, useEffect, setState } from "react";
// import { Line } from "react-chartjs-2";
import "../App.css";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { Row, Card, Container, CardTitle } from "reactstrap";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const MarketGraph = (data) => {
  let chartName = data.curCollection;
  let interval = data.curInterval;
  let window = data.curWindow * 60;
  let itemDisplay = data.curItem;

  const [availData, setChartDataAvail] = useState([]);
  const [priceData, setChartDataPrice] = useState([]);

  // const priceData = []
  // const availData = []

  const getData = () => {
    // console.log(state);
    const firestore = firebase.firestore();
    const DataRef = firestore.collection(chartName);
    const query = DataRef.orderBy("date", "desc").limit(window);

    query.get().then((data) => {
      // setState({ ...this.state, Data: [], isFetching: true }, () => {
      let list = [];
      let cnt = 0;
      let localPrice = [];
      let localAvail = [];

      data.forEach((item) => {
        // console.log("am I sync?");
        cnt++;
        if (cnt % interval == 0) {
          let date = new Date(item.data().date);
          let hours = date.getHours();
          let minutes = "0" + date.getMinutes();
          let formattedTime = hours + ":" + minutes.substr(-2);

          let dat = item.data();

          dat.date = formattedTime;

          let wanted = dat[itemDisplay];

          wanted.date = formattedTime;
          // console.log(dat)
          // list.push(wanted);

          let priceObj = {
            date: wanted.date,
            price: wanted.price,
          };

          let availObj = {
            date: wanted.date,
            avail: wanted.available,
          };

          localAvail.push(availObj);
          localPrice.push(priceObj);
        }
      });
      // console.log(priceData)
      // console.log(availData)
      setChartDataAvail(localAvail.reverse());
      setChartDataPrice(localPrice.reverse());
    });
  };

  useEffect(() => {
    getData();
  }, [chartName, interval, window, itemDisplay]);

  // console.log(data);
  // const colorMap = {
  //   CONSTRUCTION_MATERIALS: "grey",
  //   CONSUMER_GOODS: "yellow",
  //   ELECTROINICS: "blue",
  //   FOOD: "brown",
  //   FUEL: "black",
  //   MACHINERY: "red",
  //   RESEARCH: "green",
  //   SHIP_PARTS: "purple",
  //   WORKERS: "cyan",
  //   METALS: "silver",
  //   CHEMICALS: "pink",
  //   SHIP_PLATING: "navy",
  // };

  return (
    <div class="graphs">
      <h2>{itemDisplay} Data</h2>
      <div class="availGraph">
        <Row>
          <Card>
            <CardTitle>Availability</CardTitle>
            {/* <ResponsiveContainer width={800} height="70%"> */}
            <LineChart
              width={650}
              height={250}
              data={availData}
              margin={{ top: 20, right: 30, bottom: 5, left: 5 }}
            >
              <Line type="monotone" dataKey="avail" stroke="#8884d8"  dot={false} />
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis
                dataKey="date"
                label={{ fontSize: 12 }}
                className="graphLabel"
              />
              <YAxis type="number" domain={['auto', 'auto']} />
              <Tooltip />
            </LineChart>
            {/* </ResponsiveContainer> */}
          </Card>
        </Row>
      </div>
      <div class="priceGraph">
        <Row>
          {/* <ResponsiveContainer width={800} height="70%"> */}
          <Card>
            <CardTitle>Price</CardTitle>
            <LineChart
              width={650}
              height={250}
              data={priceData}
              margin={{ top: 20, right: 30, bottom: 5, left: 5 }}
            >
              <Line type="monotone" dataKey="price" stroke="#8884d8"  dot={false} />
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="date" label />
              <YAxis type="number" domain={['auto', 'auto']} />
              <Tooltip />
            </LineChart>
          </Card>
          {/* </ResponsiveContainer> */}
        </Row>
      </div>
    </div>
  );
};

export default MarketGraph;

//Why do friends
//Never let friends
//Be in video game
//Competitions
//With them

//When they know they
//would want to be in it

//They probably just
//dont want to win it
