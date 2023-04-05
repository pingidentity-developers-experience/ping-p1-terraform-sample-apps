/* eslint react/no-multi-comp: 0, react/prop-types: 0 */

// Packages
import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  TabContent, TabPane
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'

// Styles
import "./ModalRegister.scss";

// Data
import data from './data.json';

// Components
import FormPassword from '../../components/FormPassword';
import Registration from '../Controller/Registration';
import AuthN from '../Controller/AuthN';
import Session from '../Utils/Session';

class ModalRegister extends React.Component {

  constructor() {
    super();
    this.state = {
      isOpen: false,
      isPopoverOpen: false,
      activeTab: "1", 
      codeConfirmPending: false,
      errorTitle: "Oh snap!",
      errorMsg: "There was a problem. Sorry.",
      haveError: false
    };
    this.envVars = window._env_;
    this.registration = new Registration();
    this.authn = new AuthN();
    this.validate = this.validate.bind(this);
    this.form = React.createRef();
    this.formref2 = React.createRef();
    this.session = new Session();
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  toggleTab(tab) {
    this.setState({
      activeTab: tab
    });
  }
  togglePopover() {
    this.setState({
      isPopoverOpen: !this.state.isPopoverOpen
    });
  }
  validate() {
    return this.form.current.reportValidity();
  }
  setError({errorTitle, errorMsg}) {
    this.setState({
      haveError: true,
      errorTitle: errorTitle,
      errorMsg: errorMsg
    })
  }
  clearError(){
    this.setState({
      haveError: false,
      errorTitle: "",
      errorMsg: ""
    })
  }

  handleFormInput(e) {
    //Update state based on the input's Id and value.
    let formData = {};
    formData[e.target.id] = e.target.value;
    this.setState(formData);
  }

  handleUserAction(authMode) {
    switch (authMode) {
      case "registration":
        if (!this.formref2.current.reportValidity()) {
          return;
        }
        this.setState({ codeConfirmPending: true });
        this.clearError();
        this.registration.verifyRegEmailCode({ regEmailCode: this.state.regCode, flowId: this.props.flowId })
          .then(response => {
            if (response.status === "COMPLETED") {
              const url = response.resumeUrl;
              window.location.replace(url)
            } else if (response.code === "INVALID_DATA") {
              this.setState({
                haveError: true,
                errorTitle: response.details[0].code.replace("_", " "),
                errorMsg: response.details[0].message,
                regCode: "",
                codeConfirmPending: false
              })
            } else {
              console.warn("UNEXPECTED STATUS", response);
            }
          });
        break;
      // case "Extraordinary Club":
      // case "Google":
      //   this.authn.getRequestedSocialProvider({ IdP: authMode, flowId: this.props.flowId })
      //     .then(idpURL => {
      //       window.location.assign(idpURL)
      //     });
      //   break;
      default:
        throw new Error("Unexpected authMode for ModalLoginPassword.handleUserAction.");
    }
  }

  onClosed() {
    // Remove flow/env id from url
    this.props.history.push('/');
  }

  render() {
    return (
      <div>
        <Modal autoFocus={false} isOpen={this.state.isOpen} toggle={this.toggle.bind(this)} onClosed={this.onClosed.bind(this)} className="modal-xl modal-register">
          <ModalHeader toggle={this.toggle.bind(this)}><img src={window._env_.PUBLIC_URL + "/images/logo.svg"} alt="logo" /></ModalHeader>
          <ModalBody>
            <h2>{data.title}</h2>
            <TabContent activeTab={this.state.activeTab}>
              <TabPane tabId="1"> {/* Registration UI. */}
                <form ref={this.form} onSubmit={e => e.preventDefault()}>
                  {this.state.haveError && <div style={{ color: 'red', paddingBottom: '10px' }}>{this.state.errorTitle}<br />{this.state.errorMsg}</div>}
                  <Row form className="form-row-light">
                    <Col md={12}>
                      <FormGroup>
                        <Label for="email">{data.form.fields.email.label}</Label>
                        <Input maxLength="50" onChange={this.props.handleFormInput} required autoFocus={true} autoComplete="off" type="email" name="email" id="email" value={this.props.email} placeholder={data.form.fields.email.placeholder} pattern= "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$"/>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row form className="form-row-light">
                    <Col md={12}>
                      <FormPassword handleFormInput={this.props.handleFormInput} autoComplete="off" name="password" label={data.form.fields.password.label} value={this.props.passwordValue} placeholder={data.form.fields.password.placeholder} />
                    </Col>
                  </Row>
                  <Row form className="form-row-light">
                    <Col md={12}>
                      <FormPassword handleFormInput={this.props.handleFormInput} autoComplete="off" name="password_confirm" label={data.form.fields.password_confirm.label} value={this.props.passwordConfirmValue} placeholder={data.form.fields.password_confirm.placeholder} />
                    </Col>
                  </Row>
                  <Row form className="form-row-light">
                    <Col md={12}>
                      <div className="text-center">
                        <Button type="button" color="primary" onClick={this.props.onSubmit}>{data.form.buttons.submit}</Button>
                        <Button type="button" color="link" className="ml-3" onClick={this.toggle.bind(this)}>{data.form.buttons.cancel}</Button>
                      </div>
                    </Col>
                  </Row>
                  {/* <Row form className="form-row-light">
                    <Col className="text-center">
                      <img src={window._env_.PUBLIC_URL + "/images/home-login-or.png"} alt="or" className="or" />
                    </Col>
                  </Row> */}
                  {/* <Row form className="form-row-light">
                    <Col className="text-center">
                      <img onClick={() => { this.handleUserAction("Extraordinary Club") }} src={window._env_.PUBLIC_URL + "/images/SignUpEOC-500x109.png"} alt="Extraordinary Club" className="social-signup mr-1" />
                    </Col>
                  </Row> */}
                </form>
              </TabPane>
              <TabPane tabId="2"> {/* Registration email verification code UI. */}
                <form ref={this.formref2} onSubmit={e => e.preventDefault()}>
                  <h4>{data.form.buttons.reg_verification}</h4>
                  {this.state.codeConfirmPending &&
                    <div className="spinner" style={{ textAlign: "center" }}>
                      <FontAwesomeIcon icon={faCircleNotch} size="3x" className="fa-spin" />
                    </div>}
                  {this.state.haveError && <div style={{ color: 'red', paddingBottom: '10px' }}>{this.state.errorTitle}<br />{this.state.errorMsg}</div>}
                  <FormGroup className="form-group-light">
                    <Label for="regCode">{data.form.fields.regVerification.label}</Label>
                    <Input onChange={this.handleFormInput.bind(this)} required autoFocus={true} autoComplete="off" type="text" name="regCode" id="regCode" value={this.state.regCode} />
                  </FormGroup>
                  <div className="mb-3">
                    <Button type="button" color="primary" onClick={() => { this.handleUserAction("registration") }}>{data.form.buttons.reg_verification}</Button>
                  </div>
                </form>
              </TabPane>
            </TabContent>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

ModalRegister.propTypes = {
  flowId: PropTypes.string,
  handleFormInput: PropTypes.func.isRequired,
  passwordValue: PropTypes.string.isRequired,
  passwordConfirmValue: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired

}

export default ModalRegister;