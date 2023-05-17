// Packages
import React from 'react';
import { Link, NavLink, withRouter } from 'react-router-dom';
import { Button, Jumbotron, Container, Row, Col } from 'reactstrap';

// Components
import NavbarMain from '../components/UI/NavbarMain';
import ModalBirthday from '../components/UI/ModalBirthday';
import FooterMain from '../components/UI/FooterMain';

// Content
import content from '../content/home.json';

// Styles
import '../styles/pages/home.scss';


class Home extends React.Component {
  triggerModalBirthday() {
    this.refs.modalBirthday.toggle();
  }

  render() {
    return (
      <div className="home">
        <NavbarMain></NavbarMain>
        <Jumbotron fluid className="jumbotron-hero-home">
          <Container>
            <Row>
              <Col md="5" className="electronics" style={{backgroundImage: `url(${window._env_.PUBLIC_URL}/images/home-hero-electronics-bg.jpg)`}}>
                <h2>{content.hero.electronics.title}</h2>
                <p>{content.hero.electronics.content}</p>
                <Link to="/shop" className="btn btn-primary">{content.hero.electronics.button}</Link>
              </Col>
              <Col md="7" className="office" style={{backgroundImage: `url(${window._env_.PUBLIC_URL}/images/home-hero-office-bg.png)`}}>
                <div className="office-content">
                  <h2>{content.hero.office.title}</h2>
                  <p className="lead">{content.hero.office.subtitle}</p>
                  <p>{content.hero.office.content}</p>
                  <NavLink to="#" className="btn btn-primary">{content.hero.office.button}</NavLink>
                </div>
              </Col>
            </Row>
          </Container>
        </Jumbotron>
        <section className="section-home-cta-bar">
          <Container>
            <Row>
              <Col lg="7">
                <h4 dangerouslySetInnerHTML={{__html: content.cta_bar}}></h4>
              </Col>
              <Col lg="5">
                <Row className="align-items-center">
                  <Col><img src={window._env_.PUBLIC_URL + "/images/logo-bxclothes.svg"} alt="BXClothes" /></Col>
                  <Col><img src={window._env_.PUBLIC_URL + "/images/logo-bxhome.svg"} alt="BXHome" /></Col>
                  <Col><img src={window._env_.PUBLIC_URL + "/images/logo-bxoffice.svg"} alt="BXOffice" /></Col>
                  <Col><img src={window._env_.PUBLIC_URL + "/images/logo-bxtech.svg"} alt="BXTech" /></Col>
                </Row>
              </Col>
            </Row>
          </Container>
        </section>
        <section className="section-home-features">
          <Container>
            <Row>
              {content.features.map((item, i) => {
                return (
                  <Col md="4" key={i}>
                    <img src={window._env_.PUBLIC_URL + "/images/" + item.image} alt={item.title} className="img-fluid" />
                    <h4>{item.title}</h4>
                    <p>{item.content}</p>
                    <Button color="link">{item.button}</Button>
                  </Col>
                );
              })}
            </Row>
          </Container>
        </section>
        <FooterMain></FooterMain>
        <ModalBirthday ref="modalBirthday" />
      </div>
    );
  }
}

export default withRouter(Home);
