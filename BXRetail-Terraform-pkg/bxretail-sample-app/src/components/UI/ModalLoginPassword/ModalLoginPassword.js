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
  CustomInput,
  TabContent, TabPane
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

// Components
import FormPassword from '../FormPassword';
import AuthN from '../../Controller/AuthN';
import Session from '../../Utils/Session';
import Registration from '../../Controller/Registration';
import Users from '../../Controller/Users';

// Styles
import "./ModalLoginPassword.scss";

// Content
import content from './content.json';


class ModalLoginPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      activeTab: '1',
      loginMethodUnset: true,
      loginMethodFormGroupClass: '',
      regCode: 0,
      username: "",
      password: "",
      rememberme: false,
      errorTitle: "Oh snap!",
      errorMsg: "There was a problem. Sorry.",
      haveError: false,
      OTP: "",
      ref: "",
      loginPending: false,
      recoveryCode: "",
      newPassword: "",
    };
    this.authn = new AuthN();
    this.users = new Users();
    this.registration = new Registration();
    this.session = new Session();
    this.envVars = window._env_;
    this.formref1 = React.createRef();
    this.formref2 = React.createRef();
    this.formref3 = React.createRef();
    this.formref5 = React.createRef();
    this.formref7 = React.createRef();
    this.formref8 = React.createRef();
  }
  onClosed() {
    this.setState({
      activeTab: '1',
      loginMethodUnset: true,
      loginMethodFormGroupClass: ''
    });

    if (this.session.getAuthenticatedUserItem('authMode', 'session') === 'signInToCheckout') {
      // User declined to complete login, clear out the stored email (since they indeed have not logged in) and navigate back to checkout
      this.session.removeAuthenticatedUserItem('authMode', 'session');
      this.session.removeAuthenticatedUserItem('email', 'session');
      this.props.history.push('/shop/checkout');
    } else {
      // Remove flow/env id from url
      this.props.history.push('/');
    }
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen,
      haveError: false,
      activeTab: '1',
    });
  }

  toggleTab(tab) {
    this.setState({ haveError: false });
    // Tab 3 is the progress spinner.
    if (tab === "3") {
      if (this.formref1.current.reportValidity()) {
      this.handleUserAction(this.session.getAuthenticatedUserItem("authMode", "session"));
      }
    } else {
      this.setState({
        activeTab: tab
      });
    }
    // HACK for getting focus on subsequent tab fields.... because reactstrap. :-(
    if (tab === "5") { 
      setTimeout(() => {
        document.getElementById("email").focus(); 
      }, 10)
    }

  }
  setLoginMethod() {
    this.setState({
      loginMethodUnset: false,
      loginMethodFormGroupClass: 'form-group-light'
    });
  }
  resetErrorState() {
    this.setState({
      haveError: false,
      errorTitle: "",
      errorMsg: "",
      loginPending: true
    })
  }
  handleResponseError(response) {
    console.warn("UNEXPECTED STATUS", JSON.stringify(response));
    let errorCode, errorDetails;
    if (response.details) {
      if (response.details[0].code === "INVALID_CREDENTIALS") { errorCode = response.details[0].code.replace("_", " "); errorDetails = response.details[0].message; }
      if (response.details[0].code === "INVALID_VALUE") { errorCode = response.details[0].code.replace("_", " "); errorDetails = response.details[0].message; }
      if (response.details[0].code === "CONSTRAINT_VIOLATION") { errorCode = response.code.replace("_", " "); errorDetails = response.message + " Please try again."; }
    } else {
      if (response === "password_compare") { errorCode = "PASSWORD ERROR"; errorDetails= "New password cannot be the same as current password"}
      if (response === "password_match") { errorCode = "PASSWORD ERROR"; errorDetails= "Passwords do not match"}
    }

    this.setState({
      haveError: true,
      errorTitle: errorCode,
      errorMsg: errorDetails,
      currentPassword: "",
      newPasswordExpired: "",
      confirmPasswordExpired: ""
    })
  }
  continueVerification() {
    // For users who have not verified, look up user by username then resend verification code.
    this.users.userLookup(this.state.username)
      .then(lookupResponse => {
        let response = lookupResponse.additionalProperties.rawResponse;
        let jsonResponse = JSON.parse(response);
        if (!jsonResponse.matchedUsers._embedded.users || jsonResponse.matchedUsers._embedded.users.length === 0) {
          this.setState({
            haveError: true,
            errorTitle: "NO USERS FOUND",
            errorMsg: "There are no registered users with that email."
          });
          return;
        }
        const userId = jsonResponse.matchedUsers._embedded.users[0].id;
        this.registration.sendUserVerificationCode({ userId: userId })
          .then(response => {
            this.props.needsVerification();
          })
      })
  }
  handleFormInput(e) {
    //Update state based on the input's Id and value.
    let formData = {};
    //If rememberme checkbox, just flip its value.
    if (e.target.id === "rememberme") {
      if (e.target.checked) {
        this.session.setAuthenticatedUserItem("rememberMe", this.state.username, "local")
      } else {
        this.session.removeAuthenticatedUserItem("rememberMe", "local");
      }
      this.setState({
        rememberme: e.target.checked
      });
    } else if (e.target.id === "OTP") {
      this.setState({
        OTP: e.target.value
      })
    } else {
      formData[e.target.id] = e.target.value;
      this.setState(formData);
    }
  }
  handleUserAction(authMode) {
    switch (authMode) {
      case "signInToCheckout":
      case "login":
        this.session.removeAuthenticatedUserItem("federatedUser", "session");
        this.resetErrorState();
        this.authn.loginUser({ loginData: this.state, flowId: this.props.flowId })
          .then(response => {
            this.setState({ loginPending: false });
            if (response.status === "COMPLETED") {
              window.location.replace(response.resumeUrl); //Using replace() because we don't want the user to go "back" to the middle of the login process.
            }
            else if (response.code) { //Error case.
              this.handleResponseError(response);
            } else if (response.status === "EXTERNAL_AUTHENTICATION_REQUIRED") {
              this.setState({
                loginStatus: response.status,
                haveError: true,
                errorTitle: response.status.replaceAll("_", " "),
                errorMsg: "",
                authNUrl: response._embedded.identityProvider._links.authenticate.href,
                authNName: response._embedded.identityProvider.name
              });
            } else if (response.status === "PASSWORD_EXPIRED") {
              this.toggleTab("8");
            } else if (response.error.code === "PASSWORD_LOCKED_OUT") {
              this.toggleTab("10");
            }
          });
        break;
      case "OTP":
        if (this.formref2.current.reportValidity()) {
          this.resetErrorState();
          this.authn.OTPRequest({ OTP: this.state.OTP, flowId: this.props.flowId })
            .then(response => {
              this.setState({ loginPending: false });
              if (response.status === "COMPLETED") {
                window.location.replace(response.resumeUrl);
              } else if (response.code === "INVALID_DATA") {
                this.setState({
                  haveError: true,
                  errorTitle: response.details[0].code.replace("_", " "),
                  errorMsg: response.details[0].message,
                  OTP: ""
                })
              }
            });
        }
        break;
      case "forgotPassword":
        if (this.formref5.current.reportValidity()) {
          this.resetErrorState();
          this.authn.forgotPassword({ flowId: this.props.flowId, username: this.state.email })
            .then(response => {
              this.setState({ loginPending: false });
              this.toggleTab('7');
            });
        }
        break;
      case "setNewPassword":
        if (this.formref7.current.reportValidity()) {
          if (this.state.newPassword.includes("'") || this.state.newPassword.includes("\"")) {
            this.setState({
              haveError: true,
              errorTitle: "PASSWORD ERROR",
              errorMsg: "Invalid special character used.",
              newPassword: ""
            })
          } else {
            this.resetErrorState();
            this.authn.recoverPasscode({ flowId: this.props.flowId, recoveryCode: this.state.recoveryCode, newPassword: this.state.newPassword })
              .then(response => {
                this.setState({ loginPending: false });
                if (response.status === "OTP_REQUIRED") {
                  this.toggleTab('2');
                } else if (response.status === "COMPLETED") {
                  this.props.restartLogin()
                } else if (response.code) {
                  this.handleResponseError(response);
                  this.setState({ recoveryCode: "" })
                } else {
                  console.warn("Reset Password Attempt Failed", response)
                }
              });
          }
        }
        break;
      case "resetExpiredPassword":
        this.setState({ haveError: false });
        if (this.formref8.current.reportValidity()) {
          if (this.state.newPasswordExpired === this.state.confirmPasswordExpired) {
            if (this.state.currentPassword !== this.state.newPasswordExpired) {
              this.authn.resetPassword({ flowId: this.props.flowId, currentPassword: this.state.currentPassword, newPassword: this.state.newPasswordExpired })
              .then(response => {
                if (response.status === "COMPLETED") {
                  this.toggleTab("9");
                  window.location.replace(response.resumeUrl);
                } else if (response.status === "OTP_REQUIRED") {
                  this.toggleTab('2');
                } else if (response.details[0].code) {
                  this.handleResponseError(response);
                } else {
                  console.error("resetPassword Exception");
                }
              })
            } else {
              this.handleResponseError("password_compare");
            }
          } else {
            this.handleResponseError("password_match");
          }
        }
        break;
      default:
        throw new Error("Unexpected authMode for ModalLoginPassword.handleUserAction.");
    }
  }
  externalLink(URL) {
    if (URL) {
      window.location.assign(URL);
    }
  }

  componentDidMount() {
    if (this.session.getAuthenticatedUserItem("rememberMe", "local")) {
      this.setState({
        rememberme: true,
        username: this.session.getAuthenticatedUserItem("rememberMe", "local")
      });
    }
    if (this.session.getAuthenticatedUserItem("email", "session")) {
      this.setState({
        username: this.session.getAuthenticatedUserItem("email", "session")
      });
    }
  }
  render() {
    const closeBtn = <div />;
    return (
      <div>
        <Modal autoFocus={false} isOpen={this.state.isOpen} toggle={this.toggle.bind(this)} onClosed={this.onClosed.bind(this)} className="modal-login">
          <ModalHeader toggle={this.toggle.bind(this)} close={closeBtn}><img src={window._env_.PUBLIC_URL + "/images/logo.svg"} alt="logo" /></ModalHeader>
          <ModalBody>
            <TabContent activeTab={this.state.activeTab}>
              <TabPane tabId="1"> {/* Username/password UI. */}
                <form ref={this.formref1} onSubmit={e => e.preventDefault()}>
                  <h4>{content.titles.welcome}</h4>
                  {this.state.loginPending &&
                    <div className="spinner" style={{ textAlign: "center", paddingBottom: "10px" }}>
                      <FontAwesomeIcon icon={faCircleNotch} size="3x" className="fa-spin" />
                    </div>
                  }
                  {this.state.haveError && <div style={{ color: 'red', paddingBottom: '10px' }}>{this.state.errorTitle}<br />{this.state.errorMsg}</div>}
                  {this.state.loginStatus === "EXTERNAL_AUTHENTICATION_REQUIRED" &&
                    <div>
                      <div><Button type="button" color="primary" onClick={() => { this.externalLink(this.state.authNUrl); this.session.setAuthenticatedUserItem("federatedUser", true, "session") }}>Log in with {this.state.authNName}</Button></div>
                      <br />
                      <div><Button type="button" color="primary" onClick={this.props.restartLogin}>Log in with different user</Button></div>
                    </div>
                  }
                  {this.state.loginStatus !== "EXTERNAL_AUTHENTICATION_REQUIRED" &&
                    <div><FormGroup className="form-group-light">
                      <Label for="username">{content.form.fields.email.label}</Label>
                      <Input autoFocus={true} autoComplete="off" required onChange={this.handleFormInput.bind(this)} type="email" name="username" id="username" value={this.state.username} pattern="^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]+$" title="Must be a valid email address."/>
                    </FormGroup>
                      <FormPassword autoComplete="off" handleFormInput={this.handleFormInput.bind(this)} name="password" label={content.form.fields.password.label} placeholder={content.form.fields.password.placeholder} />
                      <FormGroup className="form-group-light">
                        <CustomInput onChange={this.handleFormInput.bind(this)} type="checkbox" id="rememberme" label={content.form.fields.rememberme.label} checked={this.state.rememberme} />
                      </FormGroup>
                      <div className="mb-3">
                        <Button data-selenium="login_modal_next" type="button" color="primary" onClick={() => { this.toggleTab('3'); this.state.rememberme && this.session.setAuthenticatedUserItem('rememberMe', this.state.username, 'local') }}>{content.form.buttons.next}</Button>
                      </div>
                      <div>
                        <Button type="button" color="link" size="sm" className="text-info pl-0" onClick={() => { this.toggleTab('5'); }}>{content.form.buttons.reset_password}</Button>
                      </div>
                    </div>}
                </form>
              </TabPane>
              <TabPane tabId="2"> {/* MFA OTP IF ON */}
                <form ref={this.formref2} onSubmit={e => e.preventDefault()}>
                  <h4>{content.mfa.buttons.login_verification}</h4>
                  {this.state.loginPending &&
                    <div className="spinner" style={{ textAlign: "center", paddingBottom: '10px' }}>
                      <FontAwesomeIcon icon={faCircleNotch} size="3x" className="fa-spin" />
                    </div>
                  }
                  {this.state.haveError && <div style={{ color: 'red', paddingBottom: '10px' }}>{this.state.errorTitle}<br />{this.state.errorMsg}</div>}
                  <FormGroup className="form-group-light">
                    <Label for="OTP">{content.mfa.login_verification.label}</Label>
                    <Input onChange={this.handleFormInput.bind(this)} required autoFocus={true} autoComplete="off" type="text" name="OTP" id="OTP" value={this.state.OTP} pattern="^[0-9]{6,6}$" title="Code must be 6 digits" />
                  </FormGroup>
                  <div className="mb-3">
                    <Button type="button" color="primary" onClick={() => { this.handleUserAction("OTP") }}>{content.mfa.buttons.login_verification}</Button>
                  </div>
                </form>
              </TabPane>
              <TabPane tabId="3"> {/* Progress spinner UI */}
                <form ref={this.formref3} onSubmit={e => e.preventDefault()}>
                  <div className="mobile-loading" style={{ backgroundImage: `url(${window._env_.PUBLIC_URL}/images/login-device-outline.jpg)` }}>
                    <div className="spinner">
                      <FontAwesomeIcon icon={faCircleNotch} size="3x" className="fa-spin" />
                    </div>
                    <p>{content.mobile.loading}</p>
                  </div>
                  <div className="mt-4 text-center">
                    <Button type="button" color="link" size="sm" className="text-info">{content.form.buttons.help}</Button>
                  </div>
                </form>
              </TabPane>
              <TabPane tabId="5"> {/* Password reset UI - enter username. */}
                <form ref={this.formref5} onSubmit={e => e.preventDefault()}>
                  <h4>{content.form.buttons.reset_password}</h4>
                  {this.state.loginPending &&
                    <div className="spinner" style={{ textAlign: "center", paddingBottom: '10px' }}>
                      <FontAwesomeIcon icon={faCircleNotch} size="3x" className="fa-spin" />
                    </div>
                  }
                  <p>{content.forgotPassword.labels.usernameWarning}</p>
                  <FormGroup className="form-group-light">
                    <Label for="email">{content.form.fields.email.label}</Label>
                    <Input onChange={this.handleFormInput.bind(this)} required autoFocus={true} autoComplete="off" type="email" name="email" id="email" placeholder={content.form.fields.email.placeholder} pattern= "^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]+$" />
                  </FormGroup>
                  <div className="mb-3">
                    <Button type="button" color="primary" onClick={() => { this.handleUserAction("forgotPassword"); }}>{content.form.buttons.recover_password}</Button>
                  </div>
                  {/* this.state.showForgotPasswordError && <p>Email is required.</p> */}
                </form>
              </TabPane>
              <TabPane tabId="7"> {/* Password reset UI - enter code and new password. */}
                <h4>{content.form.buttons.reset_password}</h4>
                {this.state.loginPending &&
                  <div className="spinner" style={{ textAlign: "center", paddingBottom: "10px" }}>
                    <FontAwesomeIcon icon={faCircleNotch} size="3x" className="fa-spin" />
                  </div>
                }
                <form ref={this.formref7} onSubmit={e => e.preventDefault()}>
                  <FormGroup className="form-group-light">
                    {this.state.haveError && <div style={{ color: 'red', paddingBottom: '10px' }}>{this.state.errorTitle}<br />{this.state.errorMsg}</div>}
                    <Label for="recoveryCode">{content.forgotPassword.labels.recoveryCode}</Label>
                    <Input onChange={this.handleFormInput.bind(this)} required autoFocus={true} autoComplete="off" type="text" name="recoveryCode" id="recoveryCode" placeholder="Enter recovery code" value={this.state.recoveryCode} />
                    <div>
                      <p> </p>
                    </div>
                    <FormPassword handleFormInput={this.handleFormInput.bind(this)} autoComplete="off" name="newPassword" id="newPassword" value={this.state.newPassword} label={content.forgotPassword.labels.newPassword} placeholder="Enter new password" />
                  </FormGroup>
                  <div className="mb-3">
                    <Button type="button" color="primary" onClick={() => { this.handleUserAction("setNewPassword"); }}>{content.forgotPassword.buttons.submit}</Button>
                  </div>
                </form>
              </TabPane>
              <TabPane tabId="8"> {/* Password reset UI - enter new password and confirm password. */}
                <form ref={this.formref8} onSubmit={e => e.preventDefault()}>
                  <h4>{content.expiredPassword.title}</h4>
                  <p>{content.expiredPassword.description}</p>
                  {this.state.haveError && <div style={{ color: 'red', paddingBottom: '10px' }}>{this.state.errorTitle}<br />{this.state.errorMsg}</div>}
                  <FormGroup className="form-group-light">
                    <FormPassword handleFormInput={this.handleFormInput.bind(this)} autoComplete="off" name="currentPassword" id="currentPassword" label="Current Password" value={this.state.currentPassword} />  
                    <FormPassword handleFormInput={this.handleFormInput.bind(this)} autoComplete="off" name="newPasswordExpired" id="newPasswordExpired" label="New Password" value={this.state.newPasswordExpired} />  
                    <FormPassword handleFormInput={this.handleFormInput.bind(this)} autoComplete="off" name="confirmPasswordExpired" id="confirmPasswordExpired" label="Confirm Password" value={this.state.confirmPasswordExpired} />                
                  </FormGroup>
                  <div className="mb-3">
                    <Button type="button" color="primary" onClick={() => { this.handleUserAction("resetExpiredPassword"); }}>Reset Password</Button>
                  </div>
                </form>
              </TabPane>
              <TabPane tabId="9"> {/* Password reset success UI */}
                <h4>{content.resetPassword.title}</h4>
                <p>{content.resetPassword.description}</p>
              </TabPane>
              <TabPane tabId="10"> {/* Account locked out - continue to try sign in again */}
                <h4>{content.accountLockout.title}</h4>
                <p>{content.accountLockout.description}</p>
                <div className="mb-3 text-center">
                    <Button type="button" color="primary" onClick={this.props.restartLogin}>{content.accountLockout.button}</Button>
                </div>
              </TabPane>
            </TabContent>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

ModalLoginPassword.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  needsVerification: PropTypes.func.isRequired,
  flowId: PropTypes.string,
  restartLogin: PropTypes.func.isRequired,
}

export default ModalLoginPassword;