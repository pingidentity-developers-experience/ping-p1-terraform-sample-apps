// Packages
import React from 'react';
import {
  Col,
  Container,
  Nav,
  NavItem,
  NavLink,
  Row,
  Button
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedinIn, faFacebookF, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';

// Styles
import "./FooterMain.scss";

// Data
import data from './data.json';

class FooterMain extends React.Component {
  constructor() {
    super();
    this.state = {
      chatOpen: false
    };
  }
  triggerChat() {
    this.setState({
      chatOpen: !this.state.chatOpen
    });
  }
  render() {
    return (
      <footer className="footer-main">
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
              <p><a href="https://iconify.design/" target="_blank" className="text-muted" rel="noreferrer">Iconify</a></p>
            </Col>
            <Col md="6" lg="8" xl="6" className="order-1 order-md-2">
              <Nav className="nav-main">
                {data.menu.map((item, i) => {
                  return (
                    <NavItem className="nav-item-parent" key={i}>
                      <NavLink href={item.url}>{item.title}</NavLink>
                      <Nav vertical>
                        {item.children.map((item, i) => {
                          return (
                            <NavItem key={i}>
                              <NavLink target="_top" href={item.url}>{item.title}</NavLink>
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
        <div className="chatbot">
          { this.state.chatOpen && 
            <img alt="Open Chat" src={window._env_.PUBLIC_URL + "/images/chatbot-window.png"} className="chatbot-window" onClick={this.triggerChat.bind(this)}  />
          }
          { !this.state.chatOpen && 
            <Button color="primary" onClick={this.triggerChat.bind(this)}>
              <img alt="Chat Window" src={window._env_.PUBLIC_URL + "/images/icons/chatbot.svg"} />
              Chat with us
            </Button>
          }
        </div>
      </footer>
    );
  }
}

export default FooterMain;
