import React from 'react'
import { Container } from 'reactstrap';

// Components
import NavbarMain from '../../../components/UI/NavbarMain';
import WelcomeBar from '../../../components/UI/WelcomeBar';
import FooterMain from '../../../components/UI/FooterMain';
import AccountsSubnav from '../../../components/UI/AccountsSubnav';
import AccountsDropdown from '../../../components/UI/AccountsDropdown';
import AccountsSectionNav from '../../../components/UI/AccountsSectionNav';
import Session from '../../../components/Utils/Session';

// Content
import content from '../../../content/dashboard/settings/index.json';
 
// Styles
import "../../../styles/pages/accounts.scss";

class DashboardSettings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userFirstName: '',
      userEmail: ''
    };

    this.session = new Session();
  }

  componentDidMount() {
    this.setState({ userFirstName: this.session.getAuthenticatedUserItem("firstName", "session"), userEmail: this.session.getAuthenticatedUserItem("email", "session")});
  }

  render() {
    return(
      <div className="dashboard accounts accounts-overview">
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
              {
                Object.keys(content.sections).map(key => {
                  return <AccountsSectionNav key={key} content={content.sections[key]} />;
                })      
              }
            </div>
          </div>
        </Container>
        <FooterMain />
      </div>
    )
  }
}
export default DashboardSettings