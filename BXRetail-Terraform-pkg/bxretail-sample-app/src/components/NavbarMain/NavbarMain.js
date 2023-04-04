// Packages
import React from 'react';
import PropTypes from 'prop-types';
import {
  Collapse,
  Container,
  Navbar,
  NavbarToggler,
  Nav,
  NavItem,
  NavLink, 
  Input
} from 'reactstrap';
import { Link, NavLink as RRNavLink, withRouter } from 'react-router-dom';

// Components
import ModalRegister from '../ModalRegister';
import ModalRegisterConfirm from '../ModalRegisterConfirm';
// import ModalLogin from '../ModalLogin';
import ModalLoginPassword from '../ModalLoginPassword';
import ModalMessage from "../ModalMessage";
import Session from '../Utils/Session';
import AuthZ from '../Controller/AuthZ';
import Registration from '../Controller/Registration';
import Users from '../../components/Controller/Users';
import Tokens from '../Utils/Tokens';
import { Event } from '../Integration/Analytics';

// Styles
import './NavbarMain.scss';

// Data
import data from './data.json';

class NavbarMain extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      prospect: "",
      email: "",            
      password: "",         
      password_confirm: "", 
      flowId: "",            
      regCode: "",           
    };

    this.session = new Session();
    this.envVars = window._env_;
    this.authz = new AuthZ();
    this.registration = new Registration();
    this.tokens = new Tokens();
    this.modalRegister = React.createRef();
    this.modalRegisterConfirm = React.createRef();
    this.modalLoginPassword = React.createRef();
    this.toggleCart = this.props.toggleCart;
    this.modalMessage = React.createRef();
    this.users = new Users();
  }

  triggerModalRegister() {
    this.session.setAuthenticatedUserItem("authMode", "registration", "session");
    const redirectURI = this.envVars.REACT_APP_HOST + this.envVars.PUBLIC_URL + "/";
    //TODO should we move envVars param to controller like get token? Consistent pattern for the things UI shouldn't know or care about?
    this.authz.initAuthNFlow({ grantType: "authCode", clientId: this.envVars.REACT_APP_CLIENT, redirectURI: redirectURI, scopes: "openid profile email p1:read:user p1:update:user p1:read:sessions p1:update:userMfaEnabled p1:create:device" });
    // this.modalRegister.current.toggle(); //Moved to componentDidMount because we have to send them to P1 first.
  }
  // Sent as callback to ModalRegister.js
  onModalRegisterSubmit() {
    if (this.modalRegister.current.validate()) {
      if (this.state.password.includes("'") || this.state.password.includes("\"")) {
        this.setState({ password: "", password_confirm: "" });
        this.modalRegister.current.setError({errorTitle: "PASSWORD ERROR", errorMsg: "Invalid special character used."});
        return;
      } else if (this.state.password !== this.state.password_confirm) {
        this.setState({ password: "", password_confirm: "" });
        this.modalRegister.current.setError({errorTitle: "PASSWORD ERROR", errorMsg: "Passwords do not match."});
        return; 
      }
      this.registration.registerUser({ regData: this.state })
        .then(response => {
          this.modalRegister.current.clearError();
          if (response.status === "VERIFICATION_CODE_REQUIRED") {
            this.modalRegister.current.toggleTab("2");
          } else if (response.details[0].code === "UNIQUENESS_VIOLATION") {
            this.modalRegister.current.setError({errorTitle: "UNIQUENESS VIOLATION", errorMsg: "An account with this username already exists."})
          } else if (response.details[0].code === "INVALID_VALUE") {
            // TODO This is to catch any errors if invalid characters are used (' and "). Input validation is different in mgmt api's - local reg uses mgmt api and progressive profiling uses auth api. 
            this.modalRegister.current.setError({errorTitle: response.details[0].code.replace("_", " "), errorMsg: response.details[0].message})
          } else if (response.details[0].code === "CONSTRAINT_VIOLATION") {
            this.modalRegister.current.setError({errorTitle: response.code.replace("_", " "), errorMsg: response.message + " Please try again."})
          } 
        });
    };
  }
  showRegistrationVerification() {
    this.modalLoginPassword.current.toggle();
    this.modalRegister.current.toggle();
    this.modalRegister.current.toggleTab("2");
  }
  triggerModalRegisterConfirm() {
    this.modalRegisterConfirm.current.toggle();
  }
  // Not doing identifier first in BXRetail
  /* triggerModalLogin() {
    this.refs.modalLogin.toggle();
  } */

  triggerModalLoginPassword() {
    if (this.session.getAuthenticatedUserItem("triggerLogin", "session")) {
      this.session.removeAuthenticatedUserItem("triggerLogin", "session");
    }
    // If user abandoned guest checkout without registering, clear their data from storage. 
    if (this.session.getAuthenticatedUserItem("userData", "session")) {
      this.session.removeAuthenticatedUserItem("userData", "session");
      this.session.removeAuthenticatedUserItem("email", "session");
    }
    this.session.setAuthenticatedUserItem("authMode", "login", "session");
    const redirectURI = this.envVars.REACT_APP_HOST + this.envVars.PUBLIC_URL + "/";
    this.authz.initAuthNFlow({ grantType: "authCode", clientId: this.envVars.REACT_APP_CLIENT, redirectURI: redirectURI, scopes: "openid profile email p1:read:user p1:update:user p1:read:sessions p1:update:userMfaEnabled p1:create:device" });
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  logout() {
    // Google Analytics
    Event("User", "Clicked logout");

    // TODO ideally this UI content should come from a data file. Not hard coded here.
    this.setState({
      msgTitle: "Just a minute please...",
      msgDetail: "We are in the process of logging you out of BXRetail."
    });
    this.modalMessage.current.toggle();
    const userType = this.session.getAuthenticatedUserItem("bxRetailUserType", "session");
    
    this.session.clearUserAppSession('session');
    if (userType === "Customer") {
        window.location.assign(`${this.envVars.REACT_APP_AUTHPATH}/as/signoff?post_logout_redirect_uri=${this.envVars.REACT_APP_HOST}/app/`);
    } else {
      // Federated ATVP users.
      window.location.assign(this.envVars.REACT_APP_ATVP_PORTAL);
    }
  }
  
  handleFormInput(e) {
    //Update state based on the input's Id and value.
    let formData = {};
    formData[e.target.id] = e.target.value;
    this.setState(formData, () => {
    });
  }
  //This is for the cart icon
  showCart(myProps) {
    if (window.location.pathname === "/app/shop" && this.session.getAuthenticatedUserItem("cart", "session")) {
      this.toggleCart();
    } else {
      myProps.history.push({pathname:"/shop", state: {action: "showCart"}})
    }
  }

  //For GA
  captureCustomer(e) {
    this.setState({prospect: e.target.value});
  }
  // For GA
  submitCustomer(e) {
    e.preventDefault();
    if (this.state.prospect) {
      Event("Sales", "Demo", this.state.prospect);
      this.setState({prospect: ""});
    }
  }

  componentDidMount() {
    // For validation/troubleshooting only.
    console.info('DOCKER IMAGE', this.envVars.REACT_APP_IMAGE_NAME);
    
    this.session.protectPage(this.session.isLoggedOut, window.location.pathname, this.session.getAuthenticatedUserItem("bxRetailUserType", "session"), this.props);

    if(this.session.isLoggedOut && this.session.getAuthenticatedUserItem("triggerLogin", "session")) {
      this.session.setAuthenticatedUserItem("targetReferrer", true, "session");
      this.triggerModalLoginPassword();
    }

    if (this.session.getAuthenticatedUserItem('email', 'session')) {
      this.setState({ email: this.session.getAuthenticatedUserItem('email', 'session') });
    }

    // This enrolls an email device & updates user data on the first navigation to navbarMain after reg.
    if (this.session.getAuthenticatedUserItem('AT', 'session') && this.session.getAuthenticatedUserItem('authMode', 'session') === 'registration') {
      const userId = this.tokens.getTokenValue({ token: this.session.getAuthenticatedUserItem('IdT', 'session'), key: "sub" });
      this.registration.enrollDevice({ userId: userId, email: this.session.getAuthenticatedUserItem('email', 'session'), accessToken: this.session.getAuthenticatedUserItem('AT', 'session') })
      .then(() => {
        console.info('Email device enrolled successfully.')
        this.session.removeAuthenticatedUserItem('authMode', 'session');
        if (this.session.getAuthenticatedUserItem('userData', 'session')) {
          const userData = JSON.parse(this.session.getAuthenticatedUserItem('userData', 'session'));
          this.users.updateUserProfile({ userState: userData, userId: userId })
          .then(response => {
            this.session.setAuthenticatedUserItem('firstName', userData.firstname, 'session');
            this.session.removeAuthenticatedUserItem('userData', 'session');
          })
        }
      }).catch(error => {
        console.warn('enrollDevice Exception', error);
      })
    }

    if (window.location.search) {
      const redirectURI = this.envVars.REACT_APP_HOST + this.envVars.PUBLIC_URL + "/";
      const queryParams = new URLSearchParams(window.location.search);
      const ga = queryParams.get("ga");
      const flowId = queryParams.get("flowId");
      const authCode = queryParams.get("code");
      const issuer = queryParams.get("iss");

      // Need to exit this logic early when redirecting from BXFinance with a completed or failed
      // open banking transaction so the UX continues accordingly at checkout.
      if (this.props.location.pathname.includes('/shop/checkout')) {
        console.info('Returning from BXFinance from purchase authorization.');
        return;
      }

      if (queryParams.get("error") && queryParams.get("error") === "access_denied") {
        console.info('Returning from BXFinance from purchase authorization error.');
        return;
      }

      this.setState({ flowId: flowId }, () => {
        console.info("Received flowId " + flowId);
      });

      const authNParam = (flowId) ? "flowId" : (authCode) ? "authCode" : (ga) ? "ga" : (issuer) ? "issuer" : "WTF?";
      const authMode = this.session.getAuthenticatedUserItem("authMode", "session");
      switch (authNParam) {
        case "flowId":
          if (authMode === "login" || authMode === "signInToCheckout") {
            this.modalLoginPassword.current.toggle();
          } else {
            this.modalRegister.current.toggle();
          } 
          break;
        case "authCode":
          // Returned state should match what was passed in
          if ( queryParams.get("state") !== this.session.getAuthenticatedUserItem("state", "session") ) {
            throw new Error("oAuth state parameters do not match.");
          }

          this.authz.swapCodeForToken({ code: authCode, redirectURI: redirectURI, authMode: this.session.getAuthenticatedUserItem("authMode", "session"), clientId: this.envVars.REACT_APP_CLIENT })
            .then(response => {
              // Clean up pkce and state storage
              this.session.removeAuthenticatedUserItem("state", "session");
              this.session.removeAuthenticatedUserItem("code_verifier", "session");

              this.session.setAuthenticatedUserItem("AT", response.access_token, "session");
              this.session.setAuthenticatedUserItem("IdT", response.id_token, "session");
              const firstName = this.tokens.getTokenValue({ token: response.id_token, key: "given_name" });
              if (firstName) {
                this.session.setAuthenticatedUserItem("firstName", firstName, "session");
              }
              const email = this.tokens.getTokenValue({ token: response.id_token, key: "email" });
              const groups = this.tokens.getTokenValue({ token: response.id_token, key: "bxRetailUserType" });
              const userType = (groups) ? groups[0] : "Customer";
              this.session.setAuthenticatedUserItem("email", email, "session");
              this.session.setAuthenticatedUserItem("bxRetailUserType", userType, "session");
              if (userType === "AnyTVPartner") {
                this.props.history.push("/partner");
              } else if (userType === "AnyMarketing") {
                this.props.history.push("/any-marketing");
              } else {
                //Set temp reg thank you message.
                if (authMode === "registration") { this.session.setAuthenticatedUserItem("regMessage", data.menus.utility.register_done, "session"); }
                // It's a customer.
                if (authMode === "login" || authMode === "registration") {
                  if (this.session.getAuthenticatedUserItem("targetReferrer", "session")) {
                    this.session.removeAuthenticatedUserItem("targetReferrer", "session");
                    this.props.history.push("/dashboard/settings");
                  } else {
                    this.props.history.push("/shop");
                  }
                } else if (authMode === "signInToCheckout") {
                  this.props.history.push({ pathname: '/shop/checkout', state: { acctFound: true }});
                } 
              }
            });
          break;
        case "issuer":
          //TODO Does this need to be refactored (remove authPath arg) and instantiate a new object passing in authPath to constructor?????
          this.session.setAuthenticatedUserItem("authMode", "ATVP", "session");
          this.authz.initAuthNFlow({ grantType: "authCode", clientId: this.envVars.REACT_APP_ATVP_CLIENT, redirectURI: redirectURI, scopes: "openid profile email bxretailLowPriv", authPath: this.envVars.REACT_APP_ATVPAUTHPATH });
          break;
        default:
          console.error('AuthN param exception.', 'Received an unknown value. Expecting a flow Id, authorization code, or issuer.' );
      }
    }
  }
  render() {
    return (
      <section className="navbar-main">
        {/* DESKTOP NAV */}
        <Navbar color="dark" dark expand="md" className="navbar-desktop">
          <Container>
            <Link to="/" className="navbar-brand"><img src={window._env_.PUBLIC_URL + "/images/logo-white.svg"} alt={data.brand} /></Link>
            <NavbarToggler onClick={this.toggle.bind(this)} />
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className="justify-content-end ml-auto navbar-nav-utility" navbar>
                <NavItem className="customer-collection">
                  <span>{this.props.location.state?.action}</span>          
                  {/* <NavLink><img src={window._env_.PUBLIC_URL + "/images/navbar-search.png"} alt={data.menus.utility.search} className="searchbar" /></NavLink> */}
                  <form>
                    <Input className="prospect" autoComplete="off" type="text" name="prospect" id="prospect" placeholder={data.menus.utility.gaCustomer} value={this.state.prospect} />
                  </form>
                </NavItem>
                <NavItem>
                  <NavLink><img src={window._env_.PUBLIC_URL + "/images/icons/map-marker.svg"} alt={data.menus.utility.locations} /></NavLink>
                </NavItem>
                <NavItem>
                  <NavLink style={{ cursor: "pointer" }} onClick={() => { this.showCart(this.props) }}><img src={window._env_.PUBLIC_URL + "/images/icons/cart.svg"} alt={data.menus.utility.cart} /></NavLink>
                </NavItem>
                {this.session.isLoggedOut &&
                  <NavItem className="">
                    <NavLink data-selenium="nav_signin" href="#" onClick={this.triggerModalLoginPassword.bind(this)}><img src={window._env_.PUBLIC_URL + "/images/icons/user.svg"} alt={data.menus.utility.login} className="mr-1" /> {data.menus.utility.login}</NavLink>
                  </NavItem>}
                {!this.session.isLoggedOut &&
                  <NavItem className="">
                    <NavLink href="#" onClick={this.logout.bind(this)}><img src={window._env_.PUBLIC_URL + "/images/icons/user.svg"} alt={data.menus.utility.logout} className="mr-1" /> {data.menus.utility.logout}</NavLink>
                  </NavItem>}
                {this.session.isLoggedOut &&
                  <NavItem className="register">
                    <NavLink href="#" onClick={this.triggerModalRegister.bind(this)}>{data.menus.utility.register_intro} <strong>{data.menus.utility.register}</strong></NavLink>
                  </NavItem>}
              </Nav>
            </Collapse>
          </Container>
        </Navbar>
        <Navbar color="dark" dark expand="md" className="navbar-desktop">
          <Container>
            <Nav className="mr-auto navbar-nav-main" navbar>
              {this.props && this.props.data && this.props.data.menus && this.props.data.menus.primary ? (
                this.props.data.menus.primary.map((item, i) => {
                  return (
                    <NavItem key={i}>
                      <NavLink to={item.url} activeClassName="active" exact tag={RRNavLink}>{item.title}</NavLink>
                    </NavItem>
                  );
                })
              ) : (
                data.menus.primary.map((item, i) => {
                  return (
                    <NavItem key={i}>
                      <NavLink to={item.url} activeClassName="active" tag={RRNavLink}>{item.title}</NavLink>
                    </NavItem>
                  );
                })
              )}
            </Nav>
          </Container>
        </Navbar>
        {/* MOBILE NAV */}
        <Navbar color="dark" dark expand="md" className="navbar-mobile">
          <div className="mobilenav-menu">
            <NavbarToggler onClick={this.toggle.bind(this)} />
          </div>
          <div className="mobilenav-brand">
            <Link to="/" className="navbar-brand"><img src={window._env_.PUBLIC_URL + "/images/logo-white.svg"} alt={data.brand} /></Link>
          </div>
          
          <div className="mobilenav-login">
            {this.session.isLoggedOut ?
            <NavLink href="#" className="login" onClick={this.triggerModalLoginPassword.bind(this)}>Sign In</NavLink> :
            <NavLink href="#" className="logout" onClick={this.logout.bind(this)}> {data.menus.utility.logout}</NavLink>
            }
          </div>
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="navbar-nav-main navbar-light bg-light" navbar>
              {this.props && this.props.data && this.props.data.menus && this.props.data.menus.primary ? (
                this.props.data.menus.primary.map((item, i) => {
                  return (
                    <NavItem key={i}>
                      <NavLink to={item.url} activeClassName="active" exact tag={RRNavLink}>{item.title}</NavLink>
                    </NavItem>
                  );
                })
              ) : (
                data.menus.primary.map((item, i) => {
                  return (
                    <NavItem key={i}>
                      <NavLink to={item.url} activeClassName="active" exact tag={RRNavLink}>{item.title}</NavLink>
                    </NavItem>
                  );
                })
              )}
            </Nav>
            <Nav className="navbar-nav-utility" navbar>
              <NavItem className="customer-collection">
                <span>{this.props.location.state?.action}</span>          
                <form>
                  <Input className="prospect" autoComplete="off" type="text" name="prospect" id="prospect" placeholder={data.menus.utility.gaCustomer} value={this.state.prospect} />
                </form>
              </NavItem>
              <br/>
              <NavItem>
                <NavLink><img src={window._env_.PUBLIC_URL + "/images/icons/map-marker.svg"} alt={data.menus.utility.locations} className="mr-1" /> {data.menus.utility.locations}</NavLink>
              </NavItem>
              <NavItem>
                <NavLink><img src={window._env_.PUBLIC_URL + "/images/icons/cart.svg"} alt={data.menus.utility.cart} className="mr-1" /> {data.menus.utility.support}</NavLink>
              </NavItem>
              {this.session.isLoggedOut &&
              <NavItem className="login">
                <NavLink href="#" onClick={this.triggerModalLoginPassword.bind(this)}><img src={window._env_.PUBLIC_URL + "/images/icons/user.svg"} alt={data.menus.utility.login} className="mr-1" /> {data.menus.utility.login}</NavLink>
              </NavItem>}
              {!this.session.isLoggedOut &&
              <NavItem className="logout d-none">
                <NavLink href="#" onClick={this.logout.bind(this)}><img src={window._env_.PUBLIC_URL + "/images/icons/user.svg"} alt={data.menus.utility.logout} className="mr-1" /> {data.menus.utility.logout}</NavLink>
              </NavItem>}
              {this.session.isLoggedOut &&
              <NavItem className="register">
                <NavLink href="#" onClick={this.triggerModalRegister.bind(this)}><img src={window._env_.PUBLIC_URL + "/images/icons/user.svg"} alt={data.menus.utility.login} className="mr-1" /> {data.menus.utility.register}</NavLink>
              </NavItem>}
            </Nav>
          </Collapse>
        </Navbar>
        <ModalRegister ref={this.modalRegister} onSubmit={this.onModalRegisterSubmit.bind(this)} 
          handleFormInput={this.handleFormInput.bind(this)} flowId={this.state.flowId}
          email={this.state.email} passwordValue={this.state.password} passwordConfirmValue={this.state.password_confirm}
          history={this.props.history} 
          />
        <ModalRegisterConfirm ref={this.modalRegisterConfirm} />
        {/* <ModalLogin ref="modalLogin" /> */}
        <ModalLoginPassword ref={this.modalLoginPassword} flowId={this.state.flowId} needsVerification={this.showRegistrationVerification.bind(this)} restartLogin={this.triggerModalLoginPassword.bind(this)} history={this.props.history} />
        <ModalMessage ref={this.modalMessage} msgTitle={this.state.msgTitle} msgDetail={this.state.msgDetail} />
      </section>
    );
  }
}

NavbarMain.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string
  }),
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired

}

export default withRouter(NavbarMain);