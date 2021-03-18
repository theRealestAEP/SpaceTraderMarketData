import "../App.css";
import { Button, ListGroup } from "reactstrap";
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
  NavItem,
  NavLink,
  UncontrolledDropdown,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  NavbarText,
  Card,
  CardTitle,
  Container,
  Row,
  Col,
  Table,
} from "reactstrap";
import { getFCP } from "web-vitals";

// import MarketGraph from "./MarketGraph";

import MarketGraphV2 from "./MarketGraphV2"
// import  from './MarketGraph'

firebase.initializeApp({
  apiKey: "AIzaSyD3Y5Z_5-TA9OgxpWSazIQNjuetXngk6SA",
  authDomain: "spacetrader-38625.firebaseapp.com",
  projectId: "spacetrader-38625",
  storageBucket: "spacetrader-38625.appspot.com",
  messagingSenderId: "892379670992",
  appId: "1:892379670992:web:3b27117142a6bf1d7171d5",
  measurementId: "G-99KY7RHY38",
});

export default class SingleMarket extends React.Component {
  state = {
    open: false,
    Data: [],
    curCollection: this.props.curCollection,
    dropdownOpen: false,
    dropdownOpenWindow: false,
    curInterval: 10, //minutes
    curWindow: 5, //hrs
    curItem: 'FUEL'
  };

  // [dropdownOpen, setOpen] =
  setOpenInterval = () => {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  };

  setOpenWindow = () => {
    this.setState({
      dropdownOpenWindow: !this.state.dropdownOpenWindow,
    });
  };

  componentDidMount() {
    // if(this.state.curCollection != this.props.curCollection){
    this.setState(
      { ...this.state, curCollection: this.props.curCollection },
      this.getData
      //   this.getGraph
    );

    this.refreshData = setInterval(this.getData, 60000);
    // }
  }
  componentDidUpdate() {
    if (this.state.curCollection != this.props.curCollection) {
      this.setState(
        { ...this.state, curCollection: this.props.curCollection },
        this.getData
        // this.getGraph
      );
    }
  }

  componentWillUnmount() {
    clearInterval(this.refreshData);
  }

  updateWindow = (time) => {
    this.setState({
      ...this.state,
      curWindow: time,
    });
  };

  updateInterval = (time) => {
    this.setState({
      ...this.state,
      curInterval: time,
    });
  };

  applyToGraph = (item) => {
    this.setState({...this.state, curItem:item})
  }

  getData = () => {
    // console.log(this.state);
    const firestore = firebase.firestore();
    const DataRef = firestore.collection(this.state.curCollection);
    const query = DataRef.orderBy("date", "desc").limit(1);

    query.get().then((data) => {
      this.setState({ ...this.state, Data: [], isFetching: true }, () => {
        let list = [];
        data.forEach((item) => {
          //   console.log(item.data());

          let dat = item.data();
          delete dat["date"];
          list.push(dat);
        });
        //   console.log(list);
        this.setState({ ...this.state, Data: list, isFetching: false });
      });
    });
  };
  render() {
    return (
      <div class="containerIndi">
        <Row>
          <Col>
            <h2>{this.props.curCollection}</h2>
            <Container>
              <Card>
                  <Container>
                <Table>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Good</th>
                      <th>Cost</th>
                      <th>Volume/Unit</th>
                      <th>Quantity</th>
                    </tr>
                  </thead>
                    <tbody>
                      {this.state.Data.map((data, index1) =>
                        Object.entries(data)
                          .sort()
                          .map((entry, index) => (
                            //   console.log(entry),
                            <tr>
                              <th scope="row">
                                <Button onClick={()=>{this.applyToGraph(entry[0])}}>Graph</Button>
                              </th>
                              <td>{entry[0]}</td>
                              <td>{entry[1].price}</td>
                              <td>{entry[1].volume}</td>
                              <td>{entry[1].available}</td>
                            </tr>
                          ))
                      )}
                    </tbody>
                </Table>
                  </Container>
              </Card>
            </Container>
            <div class="refreshButton">
              <Row>
                <Container>
                  <div class="interval">
                    <Button onClick={this.getData}>Refresh</Button>
                  </div>
                </Container>
              </Row>
            </div>
            <div class="refreshButton">
              <Row>
                <Container>
                  <Card>
                    <CardTitle>Graph Options</CardTitle>
                    <div>
                      <Row>
                        <Col>
                          <div class="intervalButtons">
                            <p>Current Interval: {this.state.curInterval}Min</p>
                          </div>
                          <div class="intervalButtons">
                            <ButtonDropdown
                              isOpen={this.state.dropdownOpen}
                              toggle={this.setOpenInterval}
                            >
                              <DropdownToggle caret>
                                Select Interval{" "}
                              </DropdownToggle>
                              <DropdownMenu>
                                <DropdownItem
                                  onClick={() => this.updateInterval(1)}
                                >
                                  1 Min
                                </DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem
                                  onClick={() => this.updateInterval(5)}
                                >
                                  5 Min
                                </DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem
                                  onClick={() => this.updateInterval(10)}
                                >
                                  10 Min
                                </DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem
                                  onClick={() => this.updateInterval(30)}
                                >
                                  30 Min
                                </DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem
                                  onClick={() => this.updateInterval(60)}
                                >
                                  60 Min
                                </DropdownItem>
                              </DropdownMenu>
                            </ButtonDropdown>
                          </div>
                        </Col>
                        <Col>
                          <div class="intervalButtons">
                            <p>Current Window: {this.state.curWindow}Hr</p>
                          </div>
                          <div class="intervalButtons">
                            <ButtonDropdown
                              isOpen={this.state.dropdownOpenWindow}
                              toggle={this.setOpenWindow}
                            >
                              <DropdownToggle caret>
                                Select Window
                              </DropdownToggle>
                              <DropdownMenu>
                                <DropdownItem
                                  onClick={() => this.updateWindow(1)}
                                >
                                  1 Hr
                                </DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem
                                  onClick={() => this.updateWindow(6)}
                                >
                                  6 Hr
                                </DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem
                                  onClick={() => this.updateWindow(12)}
                                >
                                  12 Hr
                                </DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem
                                  onClick={() => this.updateWindow(24)}
                                >
                                  24 Hr
                                </DropdownItem>
                              </DropdownMenu>
                            </ButtonDropdown>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </Card>
                </Container>
              </Row>
            </div>
          </Col>
          <Col>
            {/* <Container> */}
              <MarketGraphV2
                curCollection={this.props.curCollection}
                curInterval={this.state.curInterval}
                curWindow={this.state.curWindow}
                curItem={this.state.curItem}></MarketGraphV2>
            {/* </Container> */}
          </Col>
        </Row>
      </div>
    );
  }
}
