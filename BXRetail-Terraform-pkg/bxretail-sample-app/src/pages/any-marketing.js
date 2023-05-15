// Packages
import React from 'react';
import {
  Button, Row, Col,
  Collapse,
  Container,
  Navbar,
  NavbarToggler,
  Nav,
  NavItem,
  NavLink,
  Modal,
  ModalHeader,
  ModalBody
} from 'reactstrap';
import { Link, NavLink as RRNavLink, withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedinIn, faFacebookF, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';

// Components
import AccountsSubnav from '../components/UI/AccountsSubnav';
import Session from '../components/Utils/Session';

// Content
import content from '../content/any-marketing.json';

// Styles
import '../styles/pages/any-marketing.scss';

// Autocomplete Suggestion List
const SuggestionsList = props => {
  const {
    suggestions,
    inputValue,
    onSelectSuggestion,
    displaySuggestions,
    selectedSuggestion
  } = props;

  if (inputValue && displaySuggestions) {
    if (suggestions.length > 0) {
      return (
        <ul className="suggestions-list">
          {suggestions.map((suggestion, index) => {
            const isSelected = selectedSuggestion === index;
            const classname = `suggestion ${isSelected ? "selected" : ""}`;
            return (
              <li
                key={index}
                className={classname}
                onClick={() => onSelectSuggestion(index)}
              >
                {suggestion}
              </li>
            );
          })}
        </ul>
      );
    } else {
      return <ul className="suggestions-list"><li className="suggestion">No suggestions available...</li></ul>;
    }
  }
  return <div></div>;
};

// Search Autocomplete
const SearchAutocomplete = () => {
  const [inputValue, setInputValue] = React.useState("");
  const [filteredSuggestions, setFilteredSuggestions] = React.useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = React.useState(0);
  const [displaySuggestions, setDisplaySuggestions] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const onChange = event => {
    const value = event.target.value;
    setInputValue(value);
    const filteredSuggestions = data.dashboard.suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSuggestions(filteredSuggestions);
    setDisplaySuggestions(true);
  };
  const onSelectSuggestion = index => {
    setSelectedSuggestion(index);
    setInputValue(filteredSuggestions[index]);
    setFilteredSuggestions([]);
    setDisplaySuggestions(false);
    setIsModalOpen(true);
  };
  const triggerModal = index => {
    setIsModalOpen(false);
    setInputValue('');
  };
  return (
    <div>
      <form className="form-search form-inline float-right">
        <input className="form-control user-input" type="text" placeholder={content.dashboard.search_placeholder} onChange={onChange} value={inputValue} />
        <SuggestionsList
          inputValue={inputValue}
          selectedSuggestion={selectedSuggestion}
          onSelectSuggestion={onSelectSuggestion}
          displaySuggestions={displaySuggestions}
          suggestions={filteredSuggestions}
        />
        <img src={window._env_.PUBLIC_URL + "/images/icons/search.svg"} className="img-search" alt="Search for a Client"/>
      </form>
      <Modal isOpen={isModalOpen} toggle={triggerModal} className="modal-lg any-marketing modal-record" centered="true" backdropClassName="modal-backdrop-record">
        <ModalHeader toggle={triggerModal}>Record Overview</ModalHeader>
        <ModalBody>
          {content.record.fields.map((item, i) => {
            return (
              <Row className="mb-3" key={i}>
                <Col md="3">{item.label}:</Col>
                <Col md="6">
                  { item.value ? item.value : <div className="bg-dark">test</div> }
                </Col>
              </Row>
            );
          })}
          <div className="float-right">
            <Button color="primary" className="mr-3">{content.record.buttons.inspect}</Button>
            <Button color="primary">{content.record.buttons.modify}</Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

// Main AnyMarketing Page
class AnyMarketing extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
    this.session = new Session();
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  componentDidMount() {
    this.session.protectPage(this.session.isLoggedOut, window.location.pathname, this.session.getAuthenticatedUserItem("bxRetailUserType", "session"), this.props);
  }
  render() {
    return (
      <div className="any-marketing">
        <section className="navbar-awa">
          {/* DESKTOP NAV */}
          <Navbar color="light" light expand="md" className="navbar-desktop">
            <Container>
              <Link to="/" className="navbar-brand"><img src={window._env_.PUBLIC_URL + "/images/any-marketing-logo.svg"} alt={content.brand} /></Link>
              <NavbarToggler onClick={this.toggle.bind(this)} />
              <Collapse isOpen={this.state.isOpen} navbar>
                <Nav className="justify-content-end ml-auto navbar-nav-utility" navbar>
                  <NavItem>
                    <NavLink><img src={window._env_.PUBLIC_URL + "/images/icons/search.svg"} alt={content.menus.utility.search} /></NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink><img src={window._env_.PUBLIC_URL + "/images/icons/map-marker.svg"} alt={content.menus.utility.locations} /></NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink><img src={window._env_.PUBLIC_URL + "/images/icons/support.svg"} alt={content.menus.utility.support} /></NavLink>
                  </NavItem>
                  <NavItem className="logout">
                    <NavLink><img src={window._env_.PUBLIC_URL + "/images/icons/user.svg"} alt={content.menus.utility.logout} className="mr-1" /> {content.menus.utility.logout}</NavLink>
                  </NavItem>
                </Nav>
              </Collapse>
            </Container>
          </Navbar>
          <Navbar color="light" light expand="md" className="navbar-desktop">
            <Container>
              <Nav className="mr-auto navbar-nav-main" navbar>
                {content.menus.primary.map((item, i) => {
                  return (
                    <NavItem key={i}>
                      <NavLink to={item.url} activeClassName="active" exact tag={RRNavLink}>{item.title}</NavLink>
                    </NavItem>
                  );
                })}
              </Nav>
            </Container>
          </Navbar>
          {/* MOBILE NAV */}
          <Navbar color="light" light expand="md" className="navbar-mobile">
            <div className="mobilenav-menu">
              <NavbarToggler onClick={this.toggle.bind(this)} />
            </div>
            <div className="mobilenav-brand">
              <Link to="/" className="navbar-brand"><img src={window._env_.PUBLIC_URL + "/images/any-marketing-logo.svg"} alt={content.brand} /></Link>
            </div>
            <div className="mobilenav-login">
              <Link to="/" className="nav-link logout">Sign Out</Link>
            </div>
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className="navbar-nav-main navbar-light bg-light" navbar>
                {content.menus.primary.map((item, i) => {
                  return (
                    <NavItem key={i}>
                      <NavLink to={item.url} activeClassName="active" exact tag={RRNavLink}>{item.title}</NavLink>
                    </NavItem>
                  );
                })}
              </Nav>
              <Nav className="navbar-nav-utility" navbar>
                <NavItem>
                  <NavLink><img src={window._env_.PUBLIC_URL + "/images/icons/search.svg"} alt={content.menus.utility.search} className="mr-1" /> {content.menus.utility.search}</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink><img src={window._env_.PUBLIC_URL + "/images/icons/map-marker.svg"} alt={content.menus.utility.locations} className="mr-1" /> {content.menus.utility.locations}</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink><img src={window._env_.PUBLIC_URL + "/images/icons/support.svg"} alt={content.menus.utility.support} className="mr-1" /> {content.menus.utility.support}</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink><img src={window._env_.PUBLIC_URL + "/images/icons/user.svg"} alt={content.menus.utility.logout} className="mr-1" /> {content.menus.utility.logout}</NavLink>
                </NavItem>
              </Nav>
            </Collapse>
          </Navbar>
        </section>
        <section className="welcome-bar">
          <Container>
            <Row>
              <Col lg="12">
                <p><strong>{content.welcome_bar}</strong></p>
              </Col>
            </Row>
          </Container>
        </section>
        <section className="section-content">
          <Container>
            <Row>
              <Col lg="3">
                {
                  Object.keys(data.subnav).map(key => {
                    return (
                      <AccountsSubnav key={content.subnav[key].title} subnav={content.subnav[key]} />
                    );
                  })      
                }
                <h5 className="mt-5">{content.alerts.title}</h5>
                {
                  Object.keys(data.alerts.messages).map(key => {
                    return (
                      <p key={key} dangerouslySetInnerHTML={{__html: data.alerts.messages[key]}}></p>
                    );
                  })      
                }
                <Button color="link" className="mb-4">{content.alerts.button}</Button>
              </Col>
              <Col lg="9">
                <div>
                  <Row>
                    <Col>
                      <h4 className="mb-4">{content.dashboard.title}</h4>
                    </Col>
                    <Col>
                      <SearchAutocomplete />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <img src={window._env_.PUBLIC_URL + "/images/any-marketing-table.png"} className="img-fluid mb-5" alt="Table of AnyMarketing Clients"/>
                    </Col>
                  </Row>
                </div>
                <div className="bg-light p-4">
                  <div className="float-right">
                    <Button color="link">{content.metrics.buttons.insights}</Button>
                    <Button color="link">{content.metrics.buttons.data}</Button>
                  </div>
                  <h4 className="mb-4">{content.metrics.title}</h4>
                  <Row>
                    <Col md="4">
                      <img src={window._env_.PUBLIC_URL + "/images/any-marketing-pie-chart.png"} className="img-fluid" alt="AnyMarketing Pie Chart"/>
                    </Col>
                    <Col md="8">
                      <img src={window._env_.PUBLIC_URL + "/images/any-marketing-graph-chart.png"} className="img-fluid" alt="AnyMarketing Graph Chart"/>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
        <footer className="footer-awa">
          <Container>
            <Row>
              <Col md="6" lg="4" xl="6" className="order-2 order-md-1">
                <Nav className="nav-social">
                  <NavItem>
                    <NavLink href="#"><FontAwesomeIcon icon={faLinkedinIn} size="2x" /></NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink href="#"><FontAwesomeIcon icon={faFacebookF} size="2x" /></NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink href="#"><FontAwesomeIcon icon={faTwitter} size="2x" /></NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink href="#"><FontAwesomeIcon icon={faInstagram} size="2x" /></NavLink>
                  </NavItem>
                </Nav>
                <p dangerouslySetInnerHTML={{__html: data.copyright}}></p>
              </Col>
              <Col md="6" lg="8" xl="6" className="order-1 order-md-2">
                <Nav className="nav-main">
                  {content.menus.footer.map((item, i) => {
                    return (
                      <NavItem className="nav-item-parent" key={i}>
                        <NavLink href={item.url}>{item.title}</NavLink>
                        <Nav vertical>
                          {item.children.map((item, i) => {
                            return (
                              <NavItem key={i}>
                                <NavLink target="_blank" href={item.url}>{item.title}</NavLink>
                              </NavItem>
                            );
                          })}
                        </Nav>
                      </NavItem>
                    );
                  })}
                </Nav>
              </Col>
            </Row>
          </Container>
        </footer>
      </div>
    );
  }
}

export default withRouter(AnyMarketing);
