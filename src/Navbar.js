import React from 'react';
import { Button, Nav, Navbar, NavItem, MenuItem, NavDropdown} from 'react-bootstrap'

export default class myNav extends React.Component {
    render() {
      return (
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              <a href="/">Ethos Social</a>
            </Navbar.Brand>
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      );
    }
}
