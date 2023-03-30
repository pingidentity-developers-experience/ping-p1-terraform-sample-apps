import React from 'react'
import { Container } from 'reactstrap';

// Components
import NavbarMain from '../../../components/NavbarMain';
import WelcomeBar from '../../../components/WelcomeBar';
import FooterMain from '../../../components/FooterMain';
import AccountsSubnav from '../../../components/AccountsSubnav';
import AccountsDropdown from '../../../components/AccountsDropdown';
import AccountsSectionNav from '../../../components/AccountsSectionNav';
import Session from '../../../components/Utils/Session';

// Data
import data from '../../../data/dashboard/settings/index.json';
 
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
                Object.keys(data.subnav).map(key => {
                  return (
                    <AccountsSubnav key={data.subnav[key].title} subnav={data.subnav[key]} />
                  );
                })      
              }
            </div>
            <div className="content">
              <div className="accounts-hdr">
                <h1>{data.title}</h1>
                <AccountsDropdown text={data.dropdown} />
              </div>
              {
                Object.keys(data.sections).map(key => {
                  return <AccountsSectionNav key={key} data={data.sections[key]} />;
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