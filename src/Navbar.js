import React from 'react';
import { Button, Nav, Navbar, NavItem, MenuItem, NavDropdown, Modal} from 'react-bootstrap';
import Fund from '../build/contracts/Fund.json';
import ipfs from './ipfs';
import getWeb3 from './utils/getWeb3';

export default class myNav extends React.Component {
    constructor(props, context) {
      super(props, context);

      this.handleShow = this.handleShow.bind(this);
      this.handleClose = this.handleClose.bind(this);
      this.onSubmit = this.onSubmit.bind(this);
      this.captureUpload = this.captureUpload.bind(this);
      this.addHash = this.addHash.bind(this);

      this.state = {
        show: false,
        web3: null,
        ipfsBuffer: null,
        ipfsDocumentHash: null,
        account: null,
      };
    }

    componentWillMount() {
      getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        })
        this.instantiateContract()
      })
      .catch(() => {
        console.log('Error finding web3.')
      })
    }

    instantiateContract() {
      const contract = require('truffle-contract')
      const fund = contract(Fund)
      fund.setProvider(this.state.web3.currentProvider)

      this.state.web3.eth.getAccounts((error, accounts) => {
        fund.deployed().then((instance) => {
          this.fundInstance = instance
          this.setState({ account: accounts[0] });
        })
      })
    };

    captureUpload(event) {
      event.preventDefault()
      const file = event.target.files[0]
      const reader = new window.FileReader()

      reader.readAsArrayBuffer(file)
      reader.onloadend = () => {
        this.setState({ ipfsBuffer: Buffer(reader.result) })
      }
    }

    handleClose() {
      this.setState({ show: false });
    }

    handleShow() {
      this.setState({ show: true });
    }

    addHash(hash) {
      this.fundInstance.setHash(hash, {from: this.state.account});
    }

    showPhotos() {
      this.props.parentMethod();
    }

    onSubmit(e) {
      e.preventDefault()
      var results = new Promise((resolve, reject) => {
        ipfs.files.add(this.state.ipfsBuffer, (err, result) => {
          if (err) {
            console.error(err)
            return
          }

          const url = `https://ipfs.io/ipfs/${result[0].hash}`;
          console.log(`${url}`);

          this.setState({ ipfsDocumentHash: result[0].hash });

          resolve();
        })
      })

      results.then(() => {
          const hashData = JSON.stringify({
            address: this.state.account,
            photo: this.state.ipfsDocumentHash,
          });

          ipfs.add(Buffer.from(hashData), (err, result) => {
            if (err) {
              console.error(err);
              return;
            }

            this.addHash(result[0].hash);
            this.showPhotos();
            this.handleClose();
          });
      })
    }

    render() {
      return (
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              <a href="/">Blockgram</a>
            </Navbar.Brand>
          </Navbar.Header>
          <Nav pullRight>
            <Button bsSize="sm" className="add-photo-button" onClick={this.handleShow}>
               +
            </Button>
          <Modal show={this.state.show} onHide={this.handleClose}>
            <Modal.Body>
              <Button onClick={this.handleClose}>Close</Button>

              <form onSubmit={this.onSubmit}>
                <input type="file" onChange={this.captureUpload} />
                <input type="submit" />
              </form>
            </Modal.Body>
          </Modal>
          </Nav>
        </Navbar>
      );
    }
}
