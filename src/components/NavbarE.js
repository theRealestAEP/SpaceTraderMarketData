import "../App.css";
import { Button, ListGroup } from "reactstrap";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import React, { useState, setState, useEffect } from "react";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

import IndividualMarkets from "./IndividualMarket.js";
import AllMarkets from "./AllMarket.js";

export default class Everything extends React.Component {
//   constructor(props) {
//     super(props);

//     // console.log(this.props.test);
    state = {
      open: false,
      Data: [],
      curCollection: "OE-BO",
      curComponent: "SingleMarket",
    };
//   }


  toggle = () => setState({ open: !this.state.open });

  upDateSystem = (sys) => {
    this.setState({ ...this.state, Data: [], curCollection: sys,  curComponent: "SingleMarket"  });
  };

  showSystem = () => {
    // console.log('changing State')
    this.setState({ ...this.state, curComponent: "SystemMarket" });
  };

  returnCurrentComp = () => {
    console.log("getting state");
    if (this.state.curComponent == "SingleMarket") {
        console.log(this.state.curComponent)
      return (
        <IndividualMarkets
          curCollection={this.state.curCollection}
        ></IndividualMarkets>
      );
    } else if (this.state.curComponent == "SystemMarket") {
        console.log(this.state.curComponent)

      return <AllMarkets curCollection={this.state.curCollection}></AllMarkets>;
    }
  };


  render() {


    return (
      <div>
        <div>
          <Navbar color="light" light expand="sm">
            <NavbarBrand href="/">Spacetrader Market Data</NavbarBrand>
            <NavbarToggler onClick={this.toggle} />
            <Collapse isOpen={this.toggle} navbar>
              <Nav className="me-auto" navbar>
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret>
                    Markets
                  </DropdownToggle>
                  <DropdownMenu right>
                    <DropdownItem onClick={() => this.upDateSystem("OE-BO")}>
                      OE-BO
                    </DropdownItem>
                    <DropdownItem onClick={() => this.upDateSystem("OE-CR")}>
                      OE-CR
                    </DropdownItem>
                    <DropdownItem onClick={() => this.upDateSystem("OE-KO")}>
                      OE-KO
                    </DropdownItem>
                    <DropdownItem onClick={() => this.upDateSystem("OE-NY")}>
                      OE-NY
                    </DropdownItem>
                    <DropdownItem onClick={() => this.upDateSystem("OE-PM")}>
                      OE-PM
                    </DropdownItem>
                    <DropdownItem onClick={() => this.upDateSystem("OE-PM-TR")}>
                      OE-PM-TR
                    </DropdownItem>
                    <DropdownItem onClick={() => this.upDateSystem("OE-UC")}>
                      OE-UC
                    </DropdownItem>
                    <DropdownItem onClick={() => this.upDateSystem("OE-UC-AD")}>
                      OE-UC-AD
                    </DropdownItem>
                    <DropdownItem onClick={() => this.upDateSystem("OE-UC-OB")}>
                      OE-UC-OB
                    </DropdownItem>
                    <DropdownItem onClick={() => this.upDateSystem("OE-XV-91-2")}>
                      OE-XV-91-2
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
                <NavItem>
                  <NavLink onClick={() => this.showSystem()} href="#">
                    System
                  </NavLink>
                </NavItem>
              </Nav>
            </Collapse>
          </Navbar>
        </div>
        <div>{this.returnCurrentComp()}</div>
      </div>
    );
  }
}

// export default Example;
