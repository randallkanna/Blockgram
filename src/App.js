import React, { Component } from 'react'
import SimpleStorageContract from '../build/contracts/SimpleStorage.json'
import ipfs from './ipfs';
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      ipfsBuffer: null,
    }

    this.captureUpload = this.captureUpload.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.showPhotos = this.showPhotos.bind(this);
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

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

  showPhotos() {
    
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
      })
    })

    results.then(() => {
      // TODO: add hash to firebase
      this.showPhotos();
    })
  }

  render() {
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
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
