import React, { Component } from 'react';
import SimpleStorageContract from '../../../build/contracts/SimpleStorage.json';
import ipfs from '../../ipfs';
import getWeb3 from '../../utils/getWeb3';
import firebase from '../../firebase.js'

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
      photos: {},
    }

    this.photosRef = firebase.database().ref('photos');

    this.showPhotos = this.showPhotos.bind(this);
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

  componentDidMount() {
    const photosRef = firebase.database().ref('photos');
     this.photosRef.on('value', (snapshot) => {
       let photos = snapshot.val();
       let newState = [];
       for (let photo in photos) {
         newState.push({
           hash: photos[photo].hash
         });
       }

       this.setState({
         photos: newState
       });

       this.showPhotos();
     });
  }

  instantiateContract() {
    const contract = require('truffle-contract')
    const simpleStorage = contract(SimpleStorageContract)
    simpleStorage.setProvider(this.state.web3.currentProvider)
    var simpleStorageInstance

    this.state.web3.eth.getAccounts((error, accounts) => {
      simpleStorage.deployed().then((instance) => {
        simpleStorageInstance = instance

        // Stores a given value, 5 by default.
        return simpleStorageInstance.set(5, {from: accounts[0]})
      }).then((result) => {
        // Get the value from the contract to prove it worked.
        return simpleStorageInstance.get.call(accounts[0])
      }).then((result) => {
        // Update state with the result.
        return this.setState({ storageValue: result.c[0] })
      })
    })
  }

  componentWillUnmount() {
    firebase.removeBinding(this.photosRef);
  }

  showPhotos() {
    const photoHashList = this.state.photos;
    const photos = [];
    const currentComponent = this;

    if (photoHashList.length > 0) {
      var results = new Promise((resolve, reject) => {
        photoHashList.map(function(ipfsHash) {
          var hash = ipfsHash.hash;

          photos.push(hash);
        })

        resolve();
      })

      results.then(() => {
        this.setState({ completePhotosList: photos });
      });
    }
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
              <Col md={8}>
                <h3>Photos</h3>
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
