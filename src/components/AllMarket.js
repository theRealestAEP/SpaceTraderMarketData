import "../App.css";
import { Button, ListGroup, Spinner } from "reactstrap";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import React, { useState, setState } from "react";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  Badge,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  NavbarText,
  CardTitle,
  Card,
  Container,
  Row,
  Col,
  Table,
} from "reactstrap";
import { getFCP } from "web-vitals";
const markets = [
  "OE-BO",
  "OE-KO",
  "OE-NY",
  "OE-PM",
  "OE-PM-TR",
  "OE-UC",
  "OE-UC-AD",
  "OE-UC-OB",
  "OE-CR",
  "OE-XV-91-2",

];

const items = [
  "CHEMICALS",
  "ELECTRONICS",
  "FUEL",
  "MACHINERY",
  "RESEARCH",
  "WORKERS",
  "FOOD",
  "TEXTILES",
  "CONSTRUCTION_MATERIALS",
  "METALS",
  "SHIP_PLATING",
  "SHIP_PARTS",
  "RARE_METALS",
  "CONSUMER_GOODS",
];

export default class SingleMarket extends React.Component {
  state = {
    open: false,
    markets: [],
    curCollection: this.props.curCollection,
    CHEMICALS: [],
    ELECTRONICS: [],
    FUEL: [],
    MACHINERY: [],
    RESEARCH: [],
    WORKERS: [],
    FOOD: [],
    TEXTILES: [],
    CONSTRUCTION_MATERIALS: [],
    METALS: [],
    SHIP_PLATING: [],
    SHIP_PARTS: [],
    RARE_METALS: [],
    CONSUMER_GOODS: [],
    DISTANCES: {},
    Routes: {},
    FETCHING: true
  };

  componentDidMount() {
    // if(this.state.curCollection != this.props.curCollection){
    const firestore = firebase.firestore();
    let initPromises = []

    for (let i = 0; i < markets.length; i++) {
      initPromises.push(
        firestore.collection(markets[i]).doc('00MetaData').get()
      )
    }

    Promise.all(initPromises).then((data) => {
      data.map((dat, index) => {
        // console.log(dat)
        // console.log(dat.data())
        let pData = dat.data()
        // console.log(pData)
        let obj = {
          xCord: pData.cordinates.x,
          yCord: pData.cordinates.y
        }
        this.state.DISTANCES[markets[index]] = obj
      })
      this.setState({ ...this.state, curCollection: this.props.curCollection }, this.getData)
      // data.map(item => {console.log(item)})
    })
  }


  componentDidUpdate() {
    if (this.state.curCollection != this.props.curCollection) {
      this.setState(
        { ...this.state, curCollection: this.props.curCollection },
        this.getData,
        // this.buildTables
        // this.getGraph
      );
    }
  }

  componentWillUnmount() {
    clearInterval(this.refreshData);
  }

  calculateCreditPerDist() {
    for (let i = 0; i < items.length; i++) {
      let cur = this.state[items[i]]
      //Check rate 
      for (let b = 0; b < cur.length; b++) { //ITERATE OVER EVERY ITEM 
        //get current 
        let currentSystem = this.state[items[i]][b]
        let dataList = []
        for (let c = 0; c < cur.length; c++) {
          //get reference
          let referenceSystem = this.state[items[i]][c]
          // console.log(referenceSystem)
          if (currentSystem.market != referenceSystem.market) {
            //Get credit diff

            let volume = currentSystem.volume

            if(volume == 0 ){
              volume = 1;
            }
            let creditDif = referenceSystem.price - currentSystem.price  
            //Get distance
            let curDistance = this.state.Routes[currentSystem.market][referenceSystem.market].distance
            // console.log(curDistance)
            let cPd = creditDif / curDistance / volume

            let obj = {
              CreditPerDistance: {
                market: referenceSystem.market,
                amount: cPd,
                distance: curDistance
              }
            }

            dataList.push(obj)

            //end
          }


          let orderedDL = dataList.sort((a, b) => {return b.CreditPerDistance.amount - a.CreditPerDistance.amount})
          // console.log(orderedDL)
          this.state[items[i]][b].credDist = orderedDL

        }
      }
    }

    this.setState({ ...this.state, FETCHING: false }, () => { console.log(this.state) })
  }

  calculateDistance() {

    for (const [originKey, originValue] of Object.entries(this.state.DISTANCES)) {
      // console.log(`${key}: ${value}`);
      let originX = originValue.xCord
      let originY = originValue.yCord

      let obj = {}
      for (const [receiverKey, receiverValue] of Object.entries(this.state.DISTANCES)) {
        let receiverX = receiverValue.xCord
        let receiverY = receiverValue.yCord
        let a = originX - receiverX;
        let b = originY - receiverY;
        let distanceC = Math.ceil(Math.sqrt(a * a + b * b))

        if (distanceC != 0) {

          obj[receiverKey] = {
            distance: distanceC
          }
        }
        this.state.Routes[originKey] = obj
      }

    }

    this.setState({ ...this.state }, () => {
      this.calculateCreditPerDist()
    })

    //insert distance calc equations here 

  }
  getData = () => {
    console.log(this.state);
    this.setState(
      {
        ...this.state,
        CHEMICALS: [],
        ELECTRONICS: [],
        FUEL: [],
        MACHINERY: [],
        RESEARCH: [],
        WORKERS: [],
        FOOD: [],
        TEXTILES: [],
        CONSTRUCTION_MATERIALS: [],
        METALS: [],
        SHIP_PLATING: [],
        SHIP_PARTS: [],
        RARE_METALS: [],
        CONSUMER_GOODS: [],
        FETCHING: true
      },
      () => {
        const firestore = firebase.firestore();
        let initPromises = []

        for (let i = 0; i < markets.length; i++) {
          // console.log(markets[i])
          initPromises.push(
            firestore.collection(markets[i]).orderBy("date", "desc").limit(1).get()
          )
        }
        let reqData = []
        Promise.all(initPromises).then((data) => {
          data.map((dat, index) => {
            dat.forEach((doc) => {
              // console.log(doc.data())
              reqData.push(doc.data())
            })
          })
        }).then(() => {
          for (let i = 0; i < reqData.length; i++) {
            let dat = reqData[i]
            // console.log(dat)
            // res.map((item, index) => {
            delete dat["date"];
            // list.push(dat);
            Object.entries(dat).forEach((product) => {
              // console.log(product);
              let nameP = product[0];

              let obj = {
                available: product[1].available,
                price: product[1].price,
                market: markets[i],
                volume: product[1].volume,
                credDist: []
              };
              if (typeof this.state[nameP] == "undefined") {
                let arr = [obj];

                this.state[nameP] = arr;
              } else {
                this.state[nameP].push(obj);
              }

            });
          }

          this.setState({ ...this.state },
            // console.log(this.state),
            this.calculateDistance
          )


        })

      }
    );
  };
  /* ORGINAL FUNC BELOW VVVVVVVVVVVVVVVVVVVVVVVVVVV*/

  bsCheck = (index, len) => {
    if (index == 0) {
      return <Badge color="success">Buy</Badge>;
    }
    if (index == len) {
      return <Badge color="danger">Sell</Badge>;
    } else {
      return;
    }
  };

  getGrid = () => {

    if (this.state.FETCHING == true) {
      return (

        <>
          <h2>
            Loading...
        </h2>
          <Spinner color="primary" />
        </>
      )

    }
    else if (this.state.FETCHING == false) {

      let grid = [];
      let ctr = 0;

      let bestRoute = {};
      for (let i = 0; i < items.length - 1; i++) {
        if (ctr == 0) {
          ctr++;
          let htm = (
            <div class="marketItem">
              <Container fluid="lg">
                <Row>
                  <Col>
                    <Card>
                      <CardTitle>{items[i]}</CardTitle>
                      <Table>
                        <thead>
                          <tr>
                            <th>Planet</th>
                            <th>Cost</th>
                            <th>Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            console.log(this.state[items[i]]),
                            this.state[items[i]]
                              .sort((a, b) => (a.credDist[0].CreditPerDistance.amount < b.credDist[0].CreditPerDistance.amount ? 1 : -1))
                              .map((data, index) => {
                                console.log(data)

                                if (data.market == 'SHIP_PLATING') {
                                  console.log(data)
                                }
                                if (index == 0) {
                                  if (data.credDist.length == 0) {
                                    // console.log(data)
                                    bestRoute.buy = data.market;

                                    bestRoute.sell = data.market;

                                    bestRoute.CPD = 0
                                  }

                                  else {
                                    bestRoute.buy = data.market;
                                    bestRoute.sell = data.credDist[0].CreditPerDistance.market
                                    bestRoute.CPD = Math.abs(data.credDist[0].CreditPerDistance.amount);
                                  }

                                }
                                // if (index == this.state[items[i]].length - 1) {
                                //   bestRoute.sell = data.market;
                                // }
                                return (
                                  <tr>
                                    <th scope="row">{data.market}</th>
                                    <td>{data.price}</td>
                                    <td>{data.available}</td>
                                    {/* {this.bsCheck(index, this.state[items[i]].length-1)} */}
                                  </tr>
                                );
                                // )
                                // );
                              })}
                        </tbody>
                      </Table>
                      <div class="bestRoute">
                        <Container>
                          <Row>
                            <Col>Best Route</Col>
                            <Col>
                              <Badge color="success">Buy {bestRoute.buy}</Badge>
                            </Col>
                            <Col>
                              <Badge color="danger">Sell {bestRoute.sell}</Badge>
                            </Col>

                          </Row>
                          <Row>
                            <Col>
                              <h6>Credits Per Unit Distance: {bestRoute.CPD}  </h6>
                            </Col>
                          </Row>
                        </Container>
                      </div>
                    </Card>
                  </Col>
                  <Col>
                    <Card fluid>
                      <CardTitle>{items[i + 1]}</CardTitle>
                      <Table>
                        <thead>
                          <tr>
                            <th>Planet</th>
                            <th>Cost</th>
                            <th>Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state[items[i + 1]]
                            .sort((a, b) => (a.credDist[0].CreditPerDistance.amount < b.credDist[0].CreditPerDistance.amount ? 1 : -1))
                            .map((data, index) => {

                              console.log(data)
                              if (data.market == 'SHIP_PLATING') {
                                console.log(data)
                              }
                              if (index == 0) {
                                if (data.credDist.length == 0) {
                                  // console.log(data)
                                  bestRoute.buy = data.market;
                                  bestRoute.sell = data.market;
                                  bestRoute.CPD = 0


                                }
                                else {
                                  bestRoute.buy = data.market;
                                  bestRoute.sell = data.credDist[0].CreditPerDistance.market
                                  bestRoute.CPD = Math.abs(data.credDist[0].CreditPerDistance.amount);
                                }
                                // bestRoute.sell = this.state[items[i + 1]].credDist[0];
                                // bestRoute.CPD = Math.abs(this.state[items[i + 1]].credDist[0].CreditPerDistance.amount);
                              }

                              return (
                                <tr>
                                  <th scope="row">{data.market}</th>
                                  <td>{data.price}</td>
                                  <td>{data.available}</td>
                                  {/* {this.bsCheck(
                                index,
                                this.state[items[i + 1]].length-1
                              )} */}
                                </tr>
                              );
                            })}
                        </tbody>
                      </Table>
                      <div class="bestRoute">
                        <Container>
                          <Row>
                            <Col>Best Route</Col>
                            <Col>
                              <Badge color="success">Buy {bestRoute.buy}</Badge>
                            </Col>
                            <Col>
                              <Badge color="danger">Sell {bestRoute.sell}</Badge>
                            </Col>
                          </Row>
                          <Row>
                            <Col>
                              <h6 >Credits Per Distance Volume: {bestRoute.CPD}  </h6>

                            </Col>
                          </Row>
                        </Container>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </Container>
            </div>
          );

          grid.push(htm);
        } else {
          ctr++;
          if (ctr == 2) {
            ctr = 0;
          }
        }
      }
      return grid;
    }

  };
  render() {
    console.log("component loaded!");
    return (
      <div>
        <Container fluid>
          <div class="refreshButton">
            <Button onClick={this.getData}>Refresh</Button>
          </div>
        </Container>

        <Container fluid>
          {this.getGrid()}
        </Container>
      </div>
    );
  }
}



// 00MetaData


// cordinates
// x
// 16
// y
// 17
// name
// "Carth"
// type
// "PLANET"