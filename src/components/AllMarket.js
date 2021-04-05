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
  ButtonDropdown,
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
const marketsOE = [
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

const marketsXV = [
  "XV-BN",
  "XV-ST",
  "XV-ST-BG",
  "XV-XA",
  "XV-TLF",
  "XV-OS",
  "XV-SN",
  "XV-CB",
  "XV-CB-NM",
  "XV-CB-IT",
  "XV-OE-2-91"
]

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
  "UNSTABLE_COMPOUNDS",
  "EXOTIC_PLASMA",
  "FUSION_REACTORS",
  "PROTEIN_SYNTHESIZERS"

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
    FUSION_REACTORS: [],
    PROTEIN_SYNTHESIZERS: [],
    UNSTABLE_COMPOUNDS: [],
    EXOTIC_PLASMA: [],
    DISTANCES: {},
    Routes: {},
    FETCHING: true,
    dropdownOpenWindow: false,
    curSystem: [],
    curWindowDisp: 'OE',
    topDeal: {}
  };

  componentDidMount() {
    // if(this.state.curCollection != this.props.curCollection){
    const firestore = firebase.firestore();
    let initPromises = []

    // this.state.curSystem = marketsOE
    this.setState({ ...this.state, curSystem: marketsOE }, () => {
      console.log(this.state.curSystem)
      for (let i = 0; i < this.state.curSystem.length; i++) {
        initPromises.push(
          firestore.collection(this.state.curSystem[i]).doc('00MetaData').get()
        )
      }
      Promise.all(initPromises).then((data) => {
        data.map((dat, index) => {
          console.log(dat)
          // console.log(dat.data())
          let pData = dat.data()
          console.log(pData)
          let obj = {
            xCord: pData.cordinates.x,
            yCord: pData.cordinates.y
          }
          this.state.DISTANCES[this.state.curSystem[index]] = obj
        })
        this.setState({ ...this.state, curCollection: this.props.curCollection }, this.getData)
        // data.map(item => {console.log(item)})
      })
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

  setOpenWindow = () => {
    this.setState({
      dropdownOpenWindow: !this.state.dropdownOpenWindow,
    });
  };

  calculateCreditPerDist() {
    for (let i = 0; i < items.length; i++) {
      let cur = this.state[items[i]]

      if (typeof (cur) != 'undefined') {
        //Check rate 
        console.log(cur)
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

              if (volume == 0) {
                volume = 1;
              }
              let creditDif = (referenceSystem.price - referenceSystem.spread) - (currentSystem.price + currentSystem.spread)
              //Get distance
              console.log(this.state)
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


            let orderedDL = dataList.sort((a, b) => { return b.CreditPerDistance.amount - a.CreditPerDistance.amount })
            // console.log(orderedDL)
            this.state[items[i]][b].credDist = orderedDL

          }
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
        FUSION_REACTORS: [],
        PROTEIN_SYNTHESIZERS: [],
        UNSTABLE_COMPOUNDS: [],
        EXOTIC_PLASMA: [],


        FETCHING: true
      },
      () => {
        const firestore = firebase.firestore();
        let initPromises = []

        for (let i = 0; i < this.state.curSystem.length; i++) {
          // console.log(markets[i])
          initPromises.push(
            firestore.collection(this.state.curSystem[i]).orderBy("date", "desc").limit(1).get()
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
                market: this.state.curSystem[i],
                volume: product[1].volume,
                spread: product[1].spread,
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


  updateDist = () => {
    // if(this.state.curCollection != this.props.curCollection){
    const firestore = firebase.firestore();
    let initPromises = []

    // this.state.curSystem = marketsOE
    // this.setState({...this.state, curSystem:marketsOE}, ()=>{
    console.log(this.state.curSystem)
    for (let i = 0; i < this.state.curSystem.length; i++) {
      initPromises.push(
        firestore.collection(this.state.curSystem[i]).doc('00MetaData').get()
      )
    }
    Promise.all(initPromises).then((data) => {
      data.map((dat, index) => {
        console.log(dat)
        // console.log(dat.data())
        let pData = dat.data()
        console.log(pData)
        let obj = {
          xCord: pData.cordinates.x,
          yCord: pData.cordinates.y
        }
        this.state.DISTANCES[this.state.curSystem[index]] = obj
      })
      this.setState({ ...this.state, curCollection: this.props.curCollection }, this.getData)
      // data.map(item => {console.log(item)})
    })
    // })

  }
  /* ORGINAL FUNC BELOW VVVVVVVVVVVVVVVVVVVVVVVVVVV*/
  updateSystem = (system) => {

    if (system == 'OE') {
      this.setState({
        ...this.state,
        DISTANCES: {},
        Routes: {},
        curSystem: marketsOE,
        curWindowDisp: 'OE'

      }, this.updateDist)
    } else if (system == 'XV') {
      this.setState({
        ...this.state,
        DISTANCES: {},
        Routes: {},
        curSystem: marketsXV,
        curWindowDisp: 'XV'

      }, this.updateDist)
    }


  }

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


      let curated = []
      let isPresent = []
      for (let a = 0; a < items.length; a++) {
        console.log(this.state[items[a]].length)
        if (this.state[items[a]].length > 0) {
          // if( items.state[items[a]].length != 0){
          curated.push(items[a])
          // }
          // if (items.state[items[a]].length != 0) {
          //   isPresent.push(items[a])
          // }
        }
      }

      // curated = items

      console.log(curated)
      console.log(isPresent)

      let bestRoute = {};
      for (let i = 0; i < curated.length; i++) {
        // if(this.state[curated[i]].length >)
        if (ctr == 0) {
          ctr++;
          let htm
          if (typeof (this.state[curated[i + 1]]) == 'undefined') {
            let label = 'Credits Per Distance Volume:'
            // if (curated[i] == 'RESEARCH') {
            //   label = 'Credits Per Distance:'
            // }
            htm = (
              <div class="marketItem">
                <Container fluid="lg">
                  <Row>
                    <Col xs="6">
                      <Card>
                        <CardTitle>{curated[i]}</CardTitle>
                        <Table>
                          <thead>
                            <tr>
                              <th>Planet</th>
                              <th>Cost</th>
                              <th>Spread</th>
                              <th>Quantity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {

                              this.state[curated[i]]
                                .sort((a, b) => (a.credDist[0].CreditPerDistance.amount < b.credDist[0].CreditPerDistance.amount ? 1 : -1))
                                .map((data, index) => {
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
                                      <td>{data.spread}</td>
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
                                <h6>{label} {bestRoute.CPD}  </h6>
                              </Col>
                            </Row>
                          </Container>
                        </div>
                      </Card>

                    </Col>
                  </Row>
                </Container>
              </div>
            )
          }
          else {
            let label = 'Credits Per Distance Volume:'
            let label2 = 'Credits Per Distance Volume:'

            // if (curated[i] == 'RESEARCH') {
            //   label = 'Credits Per Distance:'
            // }
            // if (curated[i+1] == 'RESEARCH') {
            //   label2 = 'Credits Per Distance:'
            // }
            htm = (
              <div class="marketItem">
                <Container fluid="lg">
                  <Row>
                    <Col>
                      <Card>
                        <CardTitle>{curated[i]}</CardTitle>
                        <Table>
                          <thead>
                            <tr>
                              <th>Planet</th>
                              <th>Cost</th>
                              <th>Spread</th>
                              <th>Quantity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {

                              this.state[curated[i]]
                                .sort((a, b) => (a.credDist[0].CreditPerDistance.amount < b.credDist[0].CreditPerDistance.amount ? 1 : -1))
                                .map((data, index) => {
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
                                      <td>{data.spread}</td>
                                      <td>{data.available}</td>

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
                                <h6>{label} {bestRoute.CPD}  </h6>
                              </Col>
                            </Row>
                          </Container>
                        </div>
                      </Card>
                    </Col>
                    <Col>
                      <Card fluid>
                        <CardTitle>{curated[i + 1]}</CardTitle>
                        <Table>
                          <thead>
                            <tr>
                              <th>Planet</th>
                              <th>Cost</th>
                              <th>Spread</th>
                              <th>Quantity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state[curated[i + 1]]
                              .sort((a, b) => (a.credDist[0].CreditPerDistance.amount < b.credDist[0].CreditPerDistance.amount ? 1 : -1))
                              .map((data, index) => {
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
                                    <td>{data.spread}</td>
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
                                <h6 > {label2} {bestRoute.CPD}  </h6>

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
          }

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
          <div class="intervalButtons">
            <p>System: {this.state.curWindowDisp}</p>
          </div>
          <div class="intervalButtons">
            <Row>
              <Col>
                <ButtonDropdown
                  isOpen={this.state.dropdownOpenWindow}
                  toggle={this.setOpenWindow}
                >
                  <DropdownToggle caret>
                    System
                              </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem
                      onClick={() => this.updateSystem('XV')}
                    >
                      XV System
                                </DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem
                      onClick={() => this.updateSystem('OE')}
                    >
                      OE System
                                </DropdownItem>
                  </DropdownMenu>
                </ButtonDropdown>
              </Col>
              <Col>
                <div class="refreshButton">
                  <Button onClick={this.getData}>Refresh</Button>
                </div>
              </Col>
            </Row>
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