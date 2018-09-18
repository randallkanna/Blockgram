import React, { Component } from 'react';
import Fund from '../../../build/contracts/Fund.json';
import ipfs from '../../ipfs';
import getWeb3 from '../../utils/getWeb3';
import Nav from '../../Navbar.js';
import Photo from '../Photo/index.js';
import { Button, Row, Grid, Col, Media, Modal, } from 'react-bootstrap'
import './style.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      ipfsBuffer: null,
      completePhotosList: [],
      photo: '',
    }

    this.showPhotos = this.showPhotos.bind(this);
    this.setPhoto = this.setPhoto.bind(this);
  }

  componentWillMount() {
    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })
      this.instantiateContract();
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  setPhoto() {
    const account = this.state.account
    this.fundInstance.getHash(account).then((result) => {
      this.setState({
        photo: result
      });

      this.showPhotos();
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
        this.setPhoto();
      })
    })
  }

  showPhotos() {
    const photos = [];
    const currentComponent = this;

    let hash;
    var hashResults = new Promise((resolve, reject) => {
      this.fundInstance.getHash(this.state.account).then((result) => {
        hash = result
        resolve();
      })
    })

    hashResults.then(() => {
      this.setState({photo: hash})
    });

    var results = new Promise((resolve, reject) => {
      ipfs.files.cat(this.state.photo, function(err, files) {
        if (err) {
          console.error(err);
          return;
        }

        const photo = JSON.parse(files);

        photos.push(photo);
        resolve();
      })
    })

    results.then(() => {
      this.setState({ completePhotosList: photos });
    });
  }

  render() {
    const photos = this.state.completePhotosList.map((photo, index) =>
      <Photo photo={photo} index={index} key={index} />
    );

    return (
      <div>
        <Nav parentMethod={this.showPhotos} />
        <div>
          <Grid>
            <Row className="show-grid">
              <Col>
                  {photos}
              </Col>
            </Row>
          </Grid>
      </div>
      </div>
    );
  }
}

export default App
