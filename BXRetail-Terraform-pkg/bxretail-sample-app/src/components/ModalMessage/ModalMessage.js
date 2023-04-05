/* eslint react/no-multi-comp: 0, react/prop-types: 0 */

// Packages
import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
} from 'reactstrap';

// Styles
import "./ModalMessage.scss";

// Data
import data from './data.json';

class ModalMessage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  render() {
    const closeBtn = <div />;
    return (
      <div>
        <Modal isOpen={this.state.isOpen} toggle={this.toggle.bind(this)} className="modal-error">
          <ModalHeader toggle={this.toggle.bind(this)} close={closeBtn}><img src={window._env_.PUBLIC_URL + "/images/logo.svg"} alt="logo" /></ModalHeader>
          <ModalBody>
            <h4>{this.props.msgTitle || data.title}</h4>
            <div>{this.props.msgDetail || data.content}</div>
            <div>
              <p></p>
            </div>
            <Button color="primary" onClick={this.toggle.bind(this)}>{data.button}</Button>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

ModalMessage.propTypes = {
  msgTitle: PropTypes.string,
  msgDetail: PropTypes.string
}

export default ModalMessage;