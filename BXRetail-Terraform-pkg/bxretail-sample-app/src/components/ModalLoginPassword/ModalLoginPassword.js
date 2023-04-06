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
import { faCircleNotch, faLink } from '@fortawesome/free-solid-svg-icons';

// Components
import FormPassword from '../../components/FormPassword';
// import LoginLinkButton from '../LoginLinkButton';
import AuthN from '../Controller/AuthN';
import AuthZ from '../Controller/AuthZ';
import Session from '../Utils/Session';

// Styles
import "./ModalLoginPassword.scss";

// Data
import data from './data.json';
import Registration from '../Controller/Registration';
import Users from '../Controller/Users';

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
      loginPending: false
    };
    this.authn = new AuthN();
    this.authz = new AuthZ();
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
  toggle(tab) {
    this.setState({
      isOpen: !this.state.isOpen
    });
    //TODO this needs to go away I think. Usage deprecated by moving tab 7 back to reg where it belongs. Verify that before removing.
    // toggle() is only about show/hide modal UIs. Added tab arg
    // and call to toggleTab() because 
    // some uses cases require us to show a different default tabPane.
    if (tab) {
      this.toggleTab(tab);
    }
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
    if (tab === "5") { document.getElementById("email").focus(); } // FIXME This is not working and I can't figure out why.

  }
  setLoginMethod() {
    this.setState({
      loginMethodUnset: false,
      loginMethodFormGroupClass: 'form-group-light'
    });
  }
  // TODO is this redundant code or is the method name just not intuitive enough???
  startRequest() {
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
        this.startRequest();
        this.authn.loginUser({ loginData: this.state, flowId: this.props.flowId })
          .then(response => {
            this.setState({ loginPending: false });
            if (response.status === "COMPLETED") {
              window.location.replace(response.resumeUrl); //Using replace() because we don't want the user to go "back" to the middle of the login process.
            } 
            // else if (response.status === "VERIFICATION_CODE_REQUIRED") {
            //   this.continueVerification();
            // } else if (response.status === "OTP_REQUIRED") {
            //   this.toggleTab("2");
            // } 
            else if (response.code) { //Error case.
              this.handleResponseError(response);
            } else if (response.status === "EXTERNAL_AUTHENTICATION_REQUIRED") {
              let authenticateHref;
              //FIXME shuoldnt hardcode authenticate.href value from env file. See tracker story #179596670
              if (response._embedded.identityProvider.name === "AnyTVPartner") {
                authenticateHref = this.envVars.REACT_APP_ATVP_PORTAL;
              }
              else {
                authenticateHref = response._embedded.identityProvider._links.authenticate.href;
              }
              this.setState({
                loginStatus: response.status,
                haveError: true,
                errorTitle: response.status.replaceAll("_", " "),
                errorMsg: "",
                authNUrl: authenticateHref,
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
          this.startRequest();
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
          this.startRequest();
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
            this.startRequest();
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
      // case "Extraordinary Club":
      // case "Google":
      // case "Magic Link":
      //   this.authn.getRequestedSocialProvider({ IdP: authMode, flowId: this.props.flowId })
      //     .then(idpURL => {
      //       this.session.setAuthenticatedUserItem("federatedUser", true, "session");
      //       let redirectUrl = idpURL;
      //       if (authMode === "Magic Link") redirectUrl = idpURL.concat('&loginHint='+this.state.username);
      //       window.location.assign(redirectUrl)
      //     });
      //   break;
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
                  <h4>{data.titles.welcome}</h4>
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
                      <Label for="username">{data.form.fields.email.label}</Label>
                      <Input autoFocus={true} autoComplete="off" required onChange={this.handleFormInput.bind(this)} type="email" name="username" id="username" value={this.state.username} pattern="^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$" title="Must be a valid email address."/>
                    </FormGroup>
                      <FormPassword autoComplete="off" handleFormInput={this.handleFormInput.bind(this)} name="password" label={data.form.fields.password.label} placeholder={data.form.fields.password.placeholder} />
                      <FormGroup className="form-group-light">
                        <CustomInput onChange={this.handleFormInput.bind(this)} type="checkbox" id="rememberme" label={data.form.fields.rememberme.label} checked={this.state.rememberme} />
                      </FormGroup>
                      <div className="mb-3">
                        <Button data-selenium="login_modal_next" type="button" color="primary" onClick={() => { this.toggleTab('3'); this.state.rememberme && this.session.setAuthenticatedUserItem('rememberMe', this.state.username, 'local') }}>{data.form.buttons.next}</Button>
                      </div>
                      <div>
                        <Button type="button" color="link" size="sm" className="text-info pl-0" onClick={() => { this.toggleTab('5'); }}>{data.form.buttons.reset_password}</Button>
                      </div>
                      {/* <div className="login-link-container">
                        <LoginLinkButton color="#211012" backgroundColor="#F9C646" text="Tired of Passwords?" clickHandler={() => this.handleUserAction("Magic Link")} icon={
                          <FontAwesomeIcon size="2x" icon={faLink} />
                        } />
                      </div>
                      <div className="login-link-container">
                        <LoginLinkButton backgroundColor="#F66D0B" text="Sign In with ExtraordinaryClub" clickHandler={() => this.handleUserAction("Extraordinary Club")} icon={
                          <img src={window._env_.PUBLIC_URL + "/images/extraordinary-club-icon.png"} alt="ExtraordinaryClub" />
                        } />
                      </div>
                      <div className="login-link-container">
                        <LoginLinkButton backgroundColor="#2A84FC" text="Sign In with Google" clickHandler={() => this.handleUserAction("Google")} icon={
                          <img src={window._env_.PUBLIC_URL + "/images/google-icon.png"} alt="Google" />
                        } />
                      </div> */}
                    </div>}
                </form>
              </TabPane>
              <TabPane tabId="2"> {/* MFA OTP IF ON */}
                <form ref={this.formref2} onSubmit={e => e.preventDefault()}>
                  <h4>{data.mfa.buttons.login_verification}</h4>
                  {this.state.loginPending &&
                    <div className="spinner" style={{ textAlign: "center", paddingBottom: '10px' }}>
                      <FontAwesomeIcon icon={faCircleNotch} size="3x" className="fa-spin" />
                    </div>
                  }
                  {this.state.haveError && <div style={{ color: 'red', paddingBottom: '10px' }}>{this.state.errorTitle}<br />{this.state.errorMsg}</div>}
                  <FormGroup className="form-group-light">
                    <Label for="OTP">{data.mfa.login_verification.label}</Label>
                    <Input onChange={this.handleFormInput.bind(this)} required autoFocus={true} autoComplete="off" type="text" name="OTP" id="OTP" value={this.state.OTP} />
                  </FormGroup>
                  <div className="mb-3">
                    <Button type="button" color="primary" onClick={() => { this.handleUserAction("OTP") }}>{data.mfa.buttons.login_verification}</Button>
                  </div>
                </form>
              </TabPane>
              {/* <TabPane tabId="2"> PASSWORDLESS UI. NOT SUPPORTED IN BXRetail USE CASES YET.
                  <h4>{data.titles.login_method}</h4>
                  <FormGroup className={this.state.loginMethodFormGroupClass}>
                    <div>
                      <CustomInput type="radio" id="login_method_email" name="login_method" label={data.form.fields.login_method.options.email} className="form-check-inline" onClick={this.setLoginMethod.bind(this)} />
                      <CustomInput type="radio" id="login_method_text" name="login_method" label={data.form.fields.login_method.options.text} className="form-check-inline" onClick={this.setLoginMethod.bind(this)} />
                      <CustomInput type="radio" id="login_method_faceid" name="login_method" label={data.form.fields.login_method.options.faceid} className="form-check-inline" onClick={this.setLoginMethod.bind(this)} />}
                    </div>
                  </FormGroup>
                  <div className="mb-4 text-center">
                    <Button type="button" color="primary" disabled={this.state.loginMethodUnset} onClick={() => { this.toggleTab('3'); }}>{data.form.buttons.login}</Button>
                  </div>
                  <div className="text-center">
                    <Button type="button" color="link" size="sm" className="text-info" onClick={this.toggle.bind(this)}>{data.form.buttons.help}</Button>
                  </div>
                </TabPane> */}
              <TabPane tabId="3"> {/* Progress spinner UI */}
                <form ref={this.formref3} onSubmit={e => e.preventDefault()}>
                  <div className="mobile-loading" style={{ backgroundImage: `url(${window._env_.PUBLIC_URL}/images/login-device-outline.jpg)` }}>
                    <div className="spinner">
                      <FontAwesomeIcon icon={faCircleNotch} size="3x" className="fa-spin" />
                    </div>
                    <p>{data.mobile.loading}</p>
                  </div>
                  <div className="mt-4 text-center">
                    <Button type="button" color="link" size="sm" className="text-info">{data.form.buttons.help}</Button>
                  </div>
                </form>
              </TabPane>
              {/* <TabPane tabId="4"> USERNAME RECOVERY UI. PINGONE DOESN'T SUPPORT THIS TODAY.
                  <h4>{data.form.buttons.recover_username}</h4>
                  <FormGroup className="form-group-light">
                    <Label for="email">{data.form.fields.email.label}</Label>
                    <Input type="text" name="email" id="email" placeholder={data.form.fields.email.placeholder} />
                  </FormGroup>
                  <div className="mb-3">
                    <Button type="button" color="primary" onClick={() => { this.toggleTab('6'); }}>{data.form.buttons.recover_username}</Button>
                  </div>
                </TabPane> */}
              <TabPane tabId="5"> {/* Password reset UI - enter username. */}
                <form ref={this.formref5} onSubmit={e => e.preventDefault()}>
                  <h4>{data.form.buttons.reset_password}</h4>
                  {this.state.loginPending &&
                    <div className="spinner" style={{ textAlign: "center", paddingBottom: '10px' }}>
                      <FontAwesomeIcon icon={faCircleNotch} size="3x" className="fa-spin" />
                    </div>
                  }
                  <p>{data.forgotPassword.labels.usernameWarning}</p>
                  <FormGroup className="form-group-light">
                    <Label for="email">{data.form.fields.email.label}</Label>
                    <Input onChange={this.handleFormInput.bind(this)} required autoFocus={true} autoComplete="off" type="email" name="email" id="email" placeholder={data.form.fields.email.placeholder} />
                  </FormGroup>
                  <div className="mb-3">
                    <Button type="button" color="primary" onClick={() => { this.handleUserAction("forgotPassword"); }}>{data.form.buttons.recover_password}</Button>
                  </div>
                  {/* this.state.showForgotPasswordError && <p>Email is required.</p> */}
                </form>
              </TabPane>
              {/* <TabPane tabId="6"> USERNAME RECOVERY SUCCESS UI. SAME ISSUE AS TABID 4.
                  <h4>{data.titles.recover_username_success}</h4>
                  <div className="mb-3 text-center">
                    <Button type="button" color="primary" onClick={() => { this.toggleTab('1'); }}>{data.form.buttons.login}</Button>
                  </div>
                </TabPane> */}
              <TabPane tabId="7"> {/* Password reset UI - enter code and new password. */}
                <h4>{data.form.buttons.reset_password}</h4>
                {this.state.loginPending &&
                  <div className="spinner" style={{ textAlign: "center", paddingBottom: "10px" }}>
                    <FontAwesomeIcon icon={faCircleNotch} size="3x" className="fa-spin" />
                  </div>
                }
                <form ref={this.formref7} onSubmit={e => e.preventDefault()}>
                  <FormGroup className="form-group-light">
                    {this.state.haveError && <div style={{ color: 'red', paddingBottom: '10px' }}>{this.state.errorTitle}<br />{this.state.errorMsg}</div>}
                    <Label for="recoveryCode">{data.forgotPassword.labels.recoveryCode}</Label>
                    <Input onChange={this.handleFormInput.bind(this)} required autoFocus={true} autoComplete="off" type="text" name="recoveryCode" id="recoveryCode" placeholder="Enter recovery code" value={this.state.recoveryCode} />
                    <div>
                      <p> </p>
                    </div>
                    <FormPassword handleFormInput={this.handleFormInput.bind(this)} autoComplete="off" name="newPassword" id="newPassword" value={this.state.newPassword} label={data.forgotPassword.labels.newPassword} placeholder="Enter new password" />
                  </FormGroup>
                  <div className="mb-3">
                    <Button type="button" color="primary" onClick={() => { this.handleUserAction("setNewPassword"); }}>{data.forgotPassword.buttons.submit}</Button>
                  </div>
                </form>
              </TabPane>
              <TabPane tabId="8"> {/* Password reset UI - enter new password and confirm password. */}
                <form ref={this.formref8} onSubmit={e => e.preventDefault()}>
                  <h4>{data.expiredPassword.title}</h4>
                  <p>{data.expiredPassword.description}</p>
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
                <h4>{data.resetPassword.title}</h4>
                <p>{data.resetPassword.description}</p>
              </TabPane>
              <TabPane tabId="10"> {/* Account locked out - continue to try sign in again */}
                <h4>{data.accountLockout.title}</h4>
                <p>{data.accountLockout.description}</p>
                <div className="mb-3 text-center">
                    <Button type="button" color="primary" onClick={this.props.restartLogin}>{data.accountLockout.button}</Button>
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