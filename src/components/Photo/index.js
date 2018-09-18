import React, { Component } from 'react'
import './style.css'
import Fund from '../../../build/contracts/Fund.json';
import getWeb3 from '../../utils/getWeb3'
import { Button, Row, Grid, Col, Media, Modal } from 'react-bootstrap'

class Photo extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      fundAmount: 0,
      account: null,
    }

    this.setStateValues = this.setStateValues.bind(this);
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
  }

  sendFunds(event) {
    event.preventDefault();
    var inWei = this.state.web3.toWei(this.state.fundAmount, 'ether');

    this.fundInstance.sendToPhoto(this.props.photo.address, {
        from: this.state.account,
        value: inWei,
        gas: 470000,
        gasPrice: this.state.web3.toWei(1, 'gwei')}).then(() => {
      alert('Funds sent!');
    })
  }

  setStateValues(event) {
    this.setState({[event.target.name]: event.target.value})
  }

  render() {
    return (
      <div>
        <div className="photo">
          <img src={`https://ipfs.io/ipfs/${this.props.photo.photo}`} alt="" />
        </div>
        <div className="send-funds">
          <form onSubmit={(e) => {this.sendFunds(e)}}>
            <input type="number" name="fundAmount" value={this.state.fundAmount} onChange={(e) => this.setStateValues(e)} />
            <input type="submit" / >
          </form>
        </div>
      </div>
    )
  }
}

export default Photo
