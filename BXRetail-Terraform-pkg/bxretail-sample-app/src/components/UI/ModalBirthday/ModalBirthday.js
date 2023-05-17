/* eslint react/no-multi-comp: 0, react/prop-types: 0 */

// Packages
import React from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  Input,
} from 'reactstrap';

// Styles
import "./ModalBirthday.scss";

// Content
import content from './content.json';

class ModalBirthday extends React.Component {
  constructor() {
    super();
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
    return (
      <div>
        <Modal isOpen={this.state.isOpen} toggle={this.toggle.bind(this)} className="modal-lg modal-birthday">
          <ModalHeader toggle={this.toggle.bind(this)}><img src={window._env_.PUBLIC_URL + "/images/logo.svg"} alt="logo" /></ModalHeader>
          <ModalBody>
            <h4>{content.title}</h4>
            <div dangerouslySetInnerHTML={{__html: content.content}}></div>
            <FormGroup>
              <Input type="text" name="birthdate" id="birthdate" value="02/25/1987" />
            </FormGroup>
            <Button color="primary" onClick={this.toggle.bind(this)}>{content.button}</Button>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

export default ModalBirthday;
