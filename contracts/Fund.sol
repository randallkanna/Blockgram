pragma solidity ^0.4.18;

contract Fund {
  constructor() {
    owner = msg.sender;
  }

  /** @dev Stores a ipfsHash of the users fund in a struct
  * @param addr address of the fund the user wants to send funds to
  */
  function sendToPhoto(address addr) public payable {
    addr.transfer(msg.value);
  }
}
