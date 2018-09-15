import React, { Component } from 'react';
import Fund from '../../../build/contracts/Fund.json';
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
    const fund = contract(Fund)
    fund.setProvider(this.state.web3.currentProvider)

    this.state.web3.eth.getAccounts((error, accounts) => {
      fund.deployed().then((instance) => {
        this.fundInstance = instance
        this.setState({ account: accounts[0] });
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

          ipfs.files.cat(hash, function(err, files) {
            if (err) {
              console.error(err);
              return;
            }

            const photo = JSON.parse(files);

            photos.push(photo);

            resolve();
          })
        })
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
