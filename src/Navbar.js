import React from 'react';
import { Button, Nav, Navbar, NavItem, MenuItem, NavDropdown, Modal} from 'react-bootstrap';
import ipfs from './ipfs';
import getWeb3 from './utils/getWeb3';
import firebase from './firebase.js';

export default class myNav extends React.Component {
    constructor(props, context) {
      super(props, context);

      this.handleShow = this.handleShow.bind(this);
      this.handleClose = this.handleClose.bind(this);
      this.onSubmit = this.onSubmit.bind(this);
      this.captureUpload = this.captureUpload.bind(this);
      this.addHash = this.addHash.bind(this);

      this.photosRef = firebase.database().ref('photos');

      this.state = {
        show: false,
        web3: null,
        ipfsBuffer: null,
        ipfsDocumentHash: null,
      };
    }

    componentWillUnmount() {
      firebase.removeBinding(this.photosRef);
    }

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
      this.photosRef.push({
        hash,
      })
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

          // this.addHash(result[0].hash);
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

            debugger;

            this.addHash(result[0].hash);
            this.showPhotos();
            this.handleClose();

            // randall figure out how to fix this I need to save the right info here
            //   // return this.setState({ipfsHash: result[0].hash});
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
