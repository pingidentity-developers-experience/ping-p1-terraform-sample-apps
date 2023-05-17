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
import Session from '../../Utils/Session';
import AuthZ from '../../Controller/AuthZ';
import Registration from '../../Controller/Registration';
import Users from '../../Controller/Users';
import Tokens from '../../Utils/Tokens';

// Styles
import './NavbarMain.scss';

// Content
import content from './content.json';

class NavbarMain extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
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
    // Initialize OIDC SDK and start authorization flow
    this.authz.initAuthNFlow().catch(err => console.error(err));
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
    // Initialize OIDC SDK and start authorization flow
    this.authz.initAuthNFlow().catch(err => console.error(err));
    
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  logout() {
    this.setState({
      msgTitle: content.logout.msgTitle,
      msgDetail: content.logout.msgDetail
    });

    this.modalMessage.current.toggle();
    const userType = this.session.getAuthenticatedUserItem("bxRetailUserType", "session");
    
    this.session.clearUserAppSession('all');
    if (userType === "Customer") {
      window.location.assign(`${this.envVars.REACT_APP_AUTHPATH}/${this.envVars.REACT_APP_ENVID}/as/signoff?post_logout_redirect_uri=${this.envVars.REACT_APP_HOST}/app/`);
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
      this.session.removeAuthenticatedUserItem('authMode', 'session');
      const userId = this.tokens.getTokenValue({ token: this.session.getAuthenticatedUserItem('IdT', 'session'), key: "sub" });
      if (this.session.getAuthenticatedUserItem('userData', 'session')) {
        const userData = JSON.parse(this.session.getAuthenticatedUserItem('userData', 'session'));
        this.users.updateUserProfile({ userState: userData, userId: userId })
        .then(response => {
          this.session.setAuthenticatedUserItem('firstName', userData.firstname, 'session');
          this.session.removeAuthenticatedUserItem('userData', 'session');
        })
      }
    }

    if (window.location.search) {
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
          // Call OIDC SDK to get access/id tokens
          this.authz.getToken(this.props.history.push,content);
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
            <Link to="/" className="navbar-brand"><img src={window._env_.PUBLIC_URL + "/images/logo-white.svg"} alt={content.brand} /></Link>
            <NavbarToggler onClick={this.toggle.bind(this)} />
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className="justify-content-end ml-auto navbar-nav-utility" navbar>
                <NavItem className="customer-collection">
                  <span>{this.props.location.state?.action}</span>          
                  {/* <NavLink><img src={window._env_.PUBLIC_URL + "/images/navbar-search.png"} alt={content.menus.utility.search} className="searchbar" /></NavLink> */}
                  <form>
                    <Input className="prospect" autoComplete="off" type="text" name="prospect" id="prospect" placeholder={content.menus.utility.gaCustomer} />
                  </form>
                </NavItem>
                <NavItem>
                  <NavLink><img src={window._env_.PUBLIC_URL + "/images/icons/map-marker.svg"} alt={content.menus.utility.locations} /></NavLink>
                </NavItem>
                <NavItem>
                  <NavLink style={{ cursor: "pointer" }} onClick={() => { this.showCart(this.props) }}><img src={window._env_.PUBLIC_URL + "/images/icons/cart.svg"} alt={content.menus.utility.cart} /></NavLink>
                </NavItem>
                {this.session.isLoggedOut &&
                  <NavItem className="">
                    <NavLink data-selenium="nav_signin" href="#" onClick={this.triggerModalLoginPassword.bind(this)}><img src={window._env_.PUBLIC_URL + "/images/icons/user.svg"} alt={content.menus.utility.login} className="mr-1" /> {content.menus.utility.login}</NavLink>
                  </NavItem>}
                {!this.session.isLoggedOut &&
                  <NavItem className="">
                    <NavLink href="#" onClick={this.logout.bind(this)}><img src={window._env_.PUBLIC_URL + "/images/icons/user.svg"} alt={content.menus.utility.logout} className="mr-1" /> {content.menus.utility.logout}</NavLink>
                  </NavItem>}
                {this.session.isLoggedOut &&
                  <NavItem className="register">
                    <NavLink href="#" onClick={this.triggerModalRegister.bind(this)}>{content.menus.utility.register_intro} <strong>{content.menus.utility.register}</strong></NavLink>
                  </NavItem>}
              </Nav>
            </Collapse>
          </Container>
        </Navbar>
        <Navbar color="dark" dark expand="md" className="navbar-desktop">
          <Container>
            <Nav className="mr-auto navbar-nav-main" navbar>
              {this.props && this.props.data && this.props.content.menus && this.props.content.menus.primary ? (
                this.props.content.menus.primary.map((item, i) => {
                  return (
                    <NavItem key={i}>
                      <NavLink to={item.url} activeClassName="active" exact tag={RRNavLink}>{item.title}</NavLink>
                    </NavItem>
                  );
                })
              ) : (
                content.menus.primary.map((item, i) => {
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
            <Link to="/" className="navbar-brand"><img src={window._env_.PUBLIC_URL + "/images/logo-white.svg"} alt={content.brand} /></Link>
          </div>
          
          <div className="mobilenav-login">
            {this.session.isLoggedOut ?
            <NavLink href="#" className="login" onClick={this.triggerModalLoginPassword.bind(this)}>Sign In</NavLink> :
            <NavLink href="#" className="logout" onClick={this.logout.bind(this)}> {content.menus.utility.logout}</NavLink>
            }
          </div>
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="navbar-nav-main navbar-light bg-light" navbar>
              {this.props && this.props.data && this.props.content.menus && this.props.content.menus.primary ? (
                this.props.content.menus.primary.map((item, i) => {
                  return (
                    <NavItem key={i}>
                      <NavLink to={item.url} activeClassName="active" exact tag={RRNavLink}>{item.title}</NavLink>
                    </NavItem>
                  );
                })
              ) : (
                content.menus.primary.map((item, i) => {
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
                  <Input className="prospect" autoComplete="off" type="text" name="prospect" id="prospect" placeholder={content.menus.utility.gaCustomer} />
                </form>
              </NavItem>
              <br/>
              <NavItem>
                <NavLink><img src={window._env_.PUBLIC_URL + "/images/icons/map-marker.svg"} alt={content.menus.utility.locations} className="mr-1" /> {content.menus.utility.locations}</NavLink>
              </NavItem>
              <NavItem>
                <NavLink><img src={window._env_.PUBLIC_URL + "/images/icons/cart.svg"} alt={content.menus.utility.cart} className="mr-1" /> {content.menus.utility.support}</NavLink>
              </NavItem>
              {this.session.isLoggedOut &&
              <NavItem className="login">
                <NavLink href="#" onClick={this.triggerModalLoginPassword.bind(this)}><img src={window._env_.PUBLIC_URL + "/images/icons/user.svg"} alt={content.menus.utility.login} className="mr-1" /> {content.menus.utility.login}</NavLink>
              </NavItem>}
              {!this.session.isLoggedOut &&
              <NavItem className="logout d-none">
                <NavLink href="#" onClick={this.logout.bind(this)}><img src={window._env_.PUBLIC_URL + "/images/icons/user.svg"} alt={content.menus.utility.logout} className="mr-1" /> {content.menus.utility.logout}</NavLink>
              </NavItem>}
              {this.session.isLoggedOut &&
              <NavItem className="register">
                <NavLink href="#" onClick={this.triggerModalRegister.bind(this)}><img src={window._env_.PUBLIC_URL + "/images/icons/user.svg"} alt={content.menus.utility.login} className="mr-1" /> {content.menus.utility.register}</NavLink>
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