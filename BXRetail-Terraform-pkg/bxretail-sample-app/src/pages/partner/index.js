// Packages
import React from 'react';
import {
  Button, Row, Col, Card, CardBody,
  Container,
  Media
} from 'reactstrap';
import { useHistory } from 'react-router-dom';

// Components
import NavbarMain from '../../components/NavbarMain';
import FooterMain from '../../components/FooterMain';
import Session from '../../components/Utils/Session';
import JSONSearch from '../../components/Utils/JSONSearch';
import Users from '../../components/Controller/Users';

// Data
import data from '../../data/partner.json';

// Styles
import '../../styles/pages/partner.scss';

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
        <ul className="suggestions-list" style={{overflow: "hidden"}}>
          {suggestions.map((suggestion, index) => {
            const isSelected = selectedSuggestion === index;
            const classname = `suggestion ${isSelected ? "selected" : ""}`;
            return (
              <li
                key={index}
                className={classname}
                onClick={() => onSelectSuggestion(index)}
              >
                {suggestion.username}
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
  const users = new Users();

  const history = useHistory();
  const [inputValue, setInputValue] = React.useState("");
  const [filteredSuggestions, setFilteredSuggestions] = React.useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = React.useState(0);
  const [displaySuggestions, setDisplaySuggestions] = React.useState(false);
  const onChange = event => {
    const value = event.target.value;
    setInputValue(value);
    
    if (value.length > 1) {
      users.getAllUsers({limit: 20, email: value})
      .then(jsonSearchResults => {
      setFilteredSuggestions(jsonSearchResults.users ?? []);
      setDisplaySuggestions(true);
      })
      .catch(e => {
          console.error("getSearchableUsers Exception", e)
        });
    } else {
      setFilteredSuggestions([]);
      setDisplaySuggestions(false);
    }
    
  };
  
  const onSelectSuggestion = index => {
    setSelectedSuggestion(index);
    setInputValue(filteredSuggestions[index].username);
    setFilteredSuggestions([]);
    setDisplaySuggestions(false);
    
    // go to client 
    history.push({ pathname: "/partner/client", state: { userId: filteredSuggestions[index].id}});
    
  };
  return (
    <div>
      <form onSubmit={e => e.preventDefault()} className="form-search form-inline float-right">
        <input className="form-control user-input" type="text" placeholder={data.clients.search_placeholder} onChange={onChange} value={inputValue} />
        <SuggestionsList
          inputValue={inputValue}
          selectedSuggestion={selectedSuggestion}
          onSelectSuggestion={onSelectSuggestion}
          displaySuggestions={displaySuggestions}
          suggestions={filteredSuggestions}
        />
        <img src={window._env_.PUBLIC_URL + "/images/icons/search.svg"} className="img-search" alt="Search for Clients"/>
      </form>
    </div>
  );
};

// Partner Page
class Partner extends React.Component {
  constructor () {
    super();
    this.session = new Session();
    this.users = new Users();
    this.JSONSearch = new JSONSearch();
  }

  render() {
    return (
      <div className="accounts advisor">
        <NavbarMain data={data} />
        <section className="welcome-bar">
          <Container>
            <Row>
              <Col lg="12">
                <h3>{data.welcome_bar}</h3>
              </Col>
            </Row>
          </Container>
        </section>
        <section className="section-content">
          <Container>
            <Row>
              <Col lg="4">
                <h5>{data.profile.partner.title}</h5>
                <Card>
                  <CardBody>
                    <Media>
                      <Media left href="#">
                        <Media object src={window._env_.PUBLIC_URL + "/images/anywealthadvisor-photo.png"} alt="Generic placeholder image" />
                      </Media>
                      <Media body>
                        <p dangerouslySetInnerHTML={{__html: data.profile.partner.content}}></p>
                        <Button color="link">{data.profile.partner.button}</Button>
                      </Media>
                    </Media>
                  </CardBody>
                </Card>
                <h5 className="mt-5">{data.alerts.title}</h5>
                <Card className="mb-5">
                  <CardBody>
                    {
                      Object.keys(data.alerts.messages).map(key => {
                        return (
                          <p key={key} dangerouslySetInnerHTML={{__html: data.alerts.messages[key]}}></p>
                        );
                      })      
                    }
                    <Button color="link">{data.alerts.button}</Button>
                  </CardBody>
                </Card>
              </Col>
              <Col lg="8">
                <div>
                  <Row>
                    <Col lg="4">
                      <h5 className="mb-4">
                        {data.clients.title}
                      </h5>
                    </Col>
                    <Col lg="8">
                      <SearchAutocomplete />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <img src={window._env_.PUBLIC_URL + "/images/advisor-table.png"} className="img-fluid mt-3 mb-5" alt="Table of Clients"/>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
        <FooterMain />
      </div>
    );
  }
}

export default Partner;
