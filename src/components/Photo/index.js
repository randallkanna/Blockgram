import React, { Component } from 'react'
// import ipfs from './ipfs';
// import getWeb3 from './utils/getWeb3'

class Photo extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
    }
  }

  componentWillMount() {
  }

  render() {
    return (
      <div>
        <img src={`https://ipfs.io/ipfs/${this.props.photo}`} alt=""/>
      </div>
    )
  }
}

export default Photo
