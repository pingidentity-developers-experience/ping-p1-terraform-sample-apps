import React from 'react';
import {
  Container,
  Button,
  Form,
  FormGroup,
  Label,
  CustomInput
} from 'reactstrap';

// Components
import NavbarMain from '../../../components/UI/NavbarMain';
import WelcomeBar from '../../../components/UI/WelcomeBar';
import FooterMain from '../../../components/UI/FooterMain';
import AccountsSubnav from '../../../components/UI/AccountsSubnav';
import AccountsDropdown from '../../../components/UI/AccountsDropdown';
// import Consents from '../../../components/Controller/Consents';
import Session from '../../../components/Utils/Session';
import Users from '../../../components/Controller/Users';

// Content
import content from '../../../content/dashboard/settings/privacy-security.json';
 
// Styles
import "../../../styles/pages/dashboard/settings/privacy-security.scss";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

class PrivacySecurity extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      phone: false,         
      deliveryPhoneChecked: false,  
      email: false,         
      deliveryEmailChecked: false,   
      commSmsChecked: false,  
      commEmailChecked: false,  
      commMailChecked: false,  
      userPhone: "",
      userEmail: "",
      settingsPending: true,
    };

    this.showStep2 = this.showStep2.bind(this);
    this.close = this.close.bind(this);
    this.toggleConsent = this.toggleConsent.bind(this);
    // this.consents = new Consents();
    this.session = new Session();
    this.users = new Users();
  }

  showStep2() {
    // Sends the user's consent selections to state to be sent to FlowHandler.
    // this.consents.userUpdateConsent({ consentData: this.state, IdT: this.session.getAuthenticatedUserItem("IdT", "session") });
    // this.setState({step: 2});
  }

  close() {
    this.setState({step: 1});
  }

  toggleConsent(event) {
    let consentState = {};
    let checkedState = {};
    const delimiterPos = event.target.id.indexOf("_");
    consentState[event.target.id.substring(0, delimiterPos)] = event.target.id.substring(delimiterPos + 1) === "yes" ? true : false;
    this.setState(consentState);
    checkedState[event.target.id.substring(0, delimiterPos) + "Checked"] = event.target.id.substring(delimiterPos + 1) === "yes" ? true : false;
    this.setState(checkedState);
  }

  makeCommDetails(index) {
    if (content.steps[0].communication_types[index].name === "deliveryPhone" && this.state.userPhone !== undefined) {
      return this.state.userPhone.length === 0 ? "" : " (" + this.state.userPhone + ")"
    } else if (content.steps[0].communication_types[index].name === "deliveryEmail" && this.state.userEmail !== undefined) {
      return this.state.userEmail.length === 0 ? "" : " (" + this.state.userEmail + ")"
    } else {
      return ""
    }
  }

  componentDidMount() {
    this.setState({ userFirstName: this.session.getAuthenticatedUserItem("firstName", "session"), userEmail: this.session.getAuthenticatedUserItem("email", "session")});

    this.users.getUserProfile({ IdT: this.session.getAuthenticatedUserItem("IdT", "session") })
      .then(response => {
        this.setState({
          userPhone: response.mobilePhone,
          userEmail: response.email,
          settingsPending: false
        })
        if (response.consent) {
          const deliveryConsent = response.consent.find(consent => consent["definition"]["id"] === "tv-delivery-preferences");
          if (deliveryConsent) {
            this.setState({deliveryEmailChecked: deliveryConsent.data.email === "true"});
            this.setState({deliveryPhoneChecked: deliveryConsent.data.mobile === "true"});
          } 
          const commConsent = response.consent.find(consent => consent["definition"]["id"] === "communication-preferences");
          if (commConsent) {
            this.setState({commSmsChecked: commConsent.data.sms === "true"});
            this.setState({commEmailChecked: commConsent.data.email === "true"});
            this.setState({commMailChecked: commConsent.data.mail === "true"});
          }
        }
      });
  }

  render() {
    let commDetails, commType;
    return(
      <div className="accounts privacy-security">
        <NavbarMain />
        <WelcomeBar title="My Account: " firstName={this.state.userFirstName} email={this.state.userEmail} />
        <Container>
        <div className="inner">
            <div className="sidebar">
              {
                Object.keys(content.subnav).map(key => {
                  return (
                    <AccountsSubnav key={content.subnav[key].title} subnav={content.subnav[key]} />
                  );
                })      
              }
            </div>
            <div className="content">
              <div className="accounts-hdr">
                <h1>{content.title}</h1>
                <AccountsDropdown text={content.dropdown} />
              </div>
              { this.state.step === 1 && 
                <div className="module module-step1">
                  <h2>{content.steps[0].title}</h2>
                  <p>{content.steps[0].description}</p>
                  {this.state.settingsPending &&
                      <div className="spinner" style={{ textAlign: "center" }}>
                        <FontAwesomeIcon icon={faCircleNotch} size="3x" className="fa-spin" />
                      </div>}
                  <h3>{content.steps[0].table_title}</h3>
                  <Form>
                    {
                      Object.keys(content.steps[0].communication_types).map(index => {
                        commDetails = this.makeCommDetails(index);
                        commType = content.steps[0].communication_types[index].name;
                        return (
                          <div key={index}>
                            <FormGroup>
                              <Label for={content.steps[0].communication_types[index].name}>{content.steps[0].communication_types[index].label + commDetails}</Label>
                              <CustomInput onChange={(event) => this.toggleConsent(event)} type="radio" id={`${content.steps[0].communication_types[index].name}_yes`} name={content.steps[0].communication_types[index].name} label="Yes" checked={this.state[commType + "Checked"]}/>
                              <CustomInput onChange={(event) => this.toggleConsent(event)} type="radio" id={`${content.steps[0].communication_types[index].name}_no`} name={content.steps[0].communication_types[index].name} label="No" checked={!this.state[commType + "Checked"]}/>
                            </FormGroup>
                          </div>
                        );
                      })      
                    }
                    <FormGroup className="buttons submit-buttons">
                      <Button color="primary" onClick={ this.showStep2 }>Save</Button>
                      <a href={window._env_.PUBLIC_URL + "/dashboard/settings"} className="cancel">Cancel</a>
                    </FormGroup>
                  </Form>
                </div>
              }
              { this.state.step === 2 && 
                <div className="module module-step2">
                  <h2 className="confirmation">{content.steps[1].title}</h2>
                  <p>{content.steps[1].description}</p>
                  <h3>{content.steps[0].table_title}</h3>
                  <Form>
                    {
                      Object.keys(content.steps[1].communication_types).map(index => {
                        commDetails = this.makeCommDetails(index);
                        commType = content.steps[0].communication_types[index].name;
                        return (
                          <FormGroup key={index}>
                            <Label for={content.steps[1].communication_types[index].name}>{content.steps[0].communication_types[index].label + commDetails}</Label>
                            <CustomInput type="radio" id={`${content.steps[0].communication_types[index].name}_yes`} name={content.steps[0].communication_types[index].name} label="Yes" disabled checked={this.state[commType + "Checked"]}/>
                            <CustomInput type="radio" id={`${content.steps[0].communication_types[index].name}_no`} name={content.steps[0].communication_types[index].name} label="No" disabled checked={!this.state[commType + "Checked"]}/>
                          </FormGroup>
                        );
                      })
                    }
                    <div dangerouslySetInnerHTML={{__html:content.steps[1].other_things}} />
                    <FormGroup className="buttons submit-buttons">
                      <Button color="primary" onClick={ this.close }>{content.steps[1].btn_back}</Button>
                    </FormGroup>
                  </Form>
                </div>
              }
            </div>
          </div>
        </Container>
        <FooterMain />
      </div>
    )
  }
}
export default PrivacySecurity;

