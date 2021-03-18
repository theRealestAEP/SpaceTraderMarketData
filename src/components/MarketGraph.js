import React, { useState, useEffect, setState } from "react";
import { Line } from "react-chartjs-2";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { Row, Card } from "reactstrap";
import { Parser as HtmlToReactParser } from 'html-to-react';


const MarketGraph = (data, inputInterval, inputWindow) => {

    console.log(data);
  const colorMap = {
    CONSTRUCTION_MATERIALS: "grey",
    CONSUMER_GOODS: "yellow",
    ELECTROINICS: "blue",
    FOOD: "brown",
    FUEL: "black",
    MACHINERY: "red",
    RESEARCH: "green",
    SHIP_PARTS: "purple",
    WORKERS: "cyan",
    METALS: "silver",
    CHEMICALS: "pink",
    SHIP_PLATING: "navy",
  };

  const [chartDataAvail, setChartDataAvail] = useState({});
  const [chartDataPrice, setChartDataPrice] = useState({});

  const [chartLegend, setChartLegend] = useState({})

  let chartName = data.curCollection;
  let interval = data.curInterval
  let window = data.curWindow * 60

  let datasetsAvail = [];
  let datasetsPrice = [];
  let cleanedAvailData = {};
  let cleanedPriceData = {};
  let labels = [];
  // let legends =  this.myRef = React.createRef();

  // console.log(legend)
  const chart = () => {
    const firestore = firebase.firestore();
    const DataRef = firestore.collection(chartName);
    const query = DataRef.orderBy("date", "desc").limit(window);

    query
      .get()
      .then((res) => {
        // console.log(res);
        let counter = 0;
        res.forEach((item) => {
          counter++;

          if (counter % interval == 0) {
            let date = new Date(item.data().date);
            var hours = date.getHours();
            // Minutes part from the timestamp
            var minutes = "0" + date.getMinutes();
            // Seconds part from the timestamp
            // Will display time in 10:30:23 format
            var formattedTime = hours + ":" + minutes.substr(-2);

            // let Alldate = date.split(' ')
            labels.push(formattedTime);
            Object.entries(item.data()).forEach((symb, index) => {
              //   console.log(index);
              //Available
              if (symb[0] != "date") {
                if (typeof cleanedAvailData[symb[0]] == "undefined") {
                  cleanedAvailData[symb[0]] = [];
                  // console.log(cleanedAvailData)
                  cleanedAvailData[symb[0]].push(symb[1].available);
                } else {
                  //   console.log(symb)
                  cleanedAvailData[symb[0]].push(symb[1].available);
                }
                //Price
                if (typeof cleanedPriceData[symb[0]] == "undefined") {
                  cleanedPriceData[symb[0]] = [];
                  // console.log(cleanedAvailData)
                  cleanedPriceData[symb[0]].push(symb[1].price);
                } else {
                  // console.log(symb)
                  cleanedPriceData[symb[0]].push(symb[1].price);
                }
              }
            });
          }
        });

        Object.entries(cleanedAvailData).forEach((symbol) => {
          let dataToEnter = cleanedAvailData[symbol[0]].reverse();

          datasetsAvail.push({
            label: symbol[0], //         fill: false
            fill: false,
            lineTension: 0.1,
            backgroundColor: "rgba(225,0,0,0.4)",
            borderColor: colorMap[symbol[0]], // The main line color
            borderDash: [], // try [5, 15] for instance
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderColor: "grey",
            pointBackgroundColor: "white",
            pointBorderWidth: 1,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: "grey",
            pointHoverBorderColor: "black",
            pointHoverBorderWidth: 2,
            pointRadius: 0,
            pointHitRadius: 10,
            spanGaps: true,
            data: dataToEnter,
          });
        });

        Object.entries(cleanedPriceData).forEach((symbol) => {
          let dataToEnter = cleanedPriceData[symbol[0]].reverse();

          datasetsPrice.push({
            label: symbol[0], //         fill: false
            fill: false,
            lineTension: 0.1,
            backgroundColor: "rgba(225,0,0,0.4)",
            borderColor: colorMap[symbol[0]], // The main line color
            borderDash: [], // try [5, 15] for instance
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderColor: "grey",
            pointBackgroundColor: "white",
            pointBorderWidth: 1,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: "grey",
            pointHoverBorderColor: "black",
            pointHoverBorderWidth: 2,
            pointRadius: 0,
            pointHitRadius: 10,
            spanGaps: true,
            data: dataToEnter,
          });
        });



        let finishedLabels = labels.reverse();
        setChartDataAvail({
          labels: finishedLabels,
          datasets: datasetsAvail,
        });
        setChartDataPrice({
          labels: finishedLabels,
          datasets: datasetsPrice,
        });
        // console.log(datasets)
      })
      .catch((err) => {
        console.log(err);
      });
  };
  // var legend
  useEffect(() => {
    chart()
  }, [chartName, interval, window]);

  return (
    <div>
      <h2>{data.curCollection} Data</h2>
      <div class="graphs">
        {/* <Card> */}
        <Row>
          <Line
            data={chartDataAvail}
            options={{
              responsive: true,
              title: { text: "Availability Data", display: true },
              legend: {
                display: true,
              },
              scales: {
                yAxes: [
                  {
                    ticks: {
                      autoSkip: true,
                      maxTicksLimit: 10,
                      beginAtZero: false,
                    },
                    scaleLabel: {
                      display: true,
                      labelString: "Quantiy",
                      fontSize: 20,
                    },
                    gridLines: {
                      display: true,
                    },
                  },
                ],
                xAxes: [
                  {
                    gridLines: {
                      display: true,
                    },
                  },
                ],
              },
            }}
            // ref="chart" 
          />
          {/* {this.refs.chart && htmlToReactParser.parse(this.refs.chart.chart_instance.generateLegend())} */}
        </Row>
        {/* </Card> */}
        {/* <Card> */}
        <Row>
          <Line
            data={chartDataPrice}
            options={{
              responsive: true,
              title: { text: "Price Data", display: true },
              legend: {
                display: true,
              },
              scales: {
                yAxes: [
                  {
                    ticks: {
                      autoSkip: true,
                      maxTicksLimit: 10,
                      beginAtZero: false,
                    },
                    scaleLabel: {
                      display: true,
                      labelString: "Price",
                      fontSize: 20,
                    },
                    gridLines: {
                      display: true,
                    },
                  },
                ],
                xAxes: [
                  {
                    gridLines: {
                      display: true,
                    },
                  },
                ],
              },
            }}
            
          />
        </Row>
        {/* </Card> */}
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
