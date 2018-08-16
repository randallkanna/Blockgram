import React, { Component } from 'react';
import SimpleStorageContract from '../../../build/contracts/SimpleStorage.json';
import Photo from '../Photo/index.js';
import ipfs from '../../ipfs';
import getWeb3 from '../../utils/getWeb3';
import firebase from '../../firebase.js'

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

    this.captureUpload = this.captureUpload.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.showPhotos = this.showPhotos.bind(this);
    this.addHash = this.addHash.bind(this);
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

  captureUpload(event) {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()

    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ ipfsBuffer: Buffer(reader.result) })
    }
  }

  addHash(hash) {
    this.photosRef.push({
      hash,
    })
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
        console.log(`Url: ${url}`)
        this.addHash(result[0].hash);

        resolve();
      })
    })

    results.then(() => {
      this.showPhotos();
    })
  }

  render() {
    const photos = this.state.completePhotosList.map((photo, index) =>
      <Photo photo={photo} index={index} key={index} />
    );

    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Ethos Social</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <div className="upload-placeholder">Upload Image</div>
              <form onSubmit={this.onSubmit}>
                <input type="file" onChange={this.captureUpload} />
                <input type="submit" />
              </form>

              <h3>Photos</h3>
                {photos}
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
