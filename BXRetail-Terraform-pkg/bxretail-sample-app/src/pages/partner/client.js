// // Packages
// import React from 'react';
// import {
//   Button, Row, Col, Card, CardBody,
//   Container,
//   Media
// } from 'reactstrap';
// import { useHistory, withRouter } from 'react-router-dom';

// // Components
// import NavbarMain from '../../components/NavbarMain';
// import FooterMain from '../../components/FooterMain';
// import Consents from '../../components/Controller/Consents';
// import Session from '../../components/Utils/Session';
// import Users from '../../components/Controller/Users';

// // Data
// import data from '../../data/partner.json';

// // Styles
// import '../../styles/pages/partner.scss';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

// // Autocomplete Suggestion List
// const SuggestionsList = props => {
//   const {
//     suggestions,
//     inputValue,
//     onSelectSuggestion,
//     displaySuggestions,
//     selectedSuggestion
//   } = props;

//   if (inputValue && displaySuggestions) {
//     if (suggestions.length > 0) {
//       return (
//         <ul className="suggestions-list" style={{overflow: "hidden"}}>
//           {suggestions.map((suggestion, index) => {
//             const isSelected = selectedSuggestion === index;
//             const classname = `suggestion ${isSelected ? "selected" : ""}`;
//             return (
//               <li
//                 key={index}
//                 className={classname}
//                 onClick={() => onSelectSuggestion(index)}
//               >
//                 {suggestion.username}
//               </li>
//             );
//           })}
//         </ul>
//       );
//     } else {
//       return <ul className="suggestions-list"><li className="suggestion">No suggestions available...</li></ul>;
//     }
//   }
//   return <div></div>;
// };

// // Search Autocomplete
// const SearchAutocomplete = (props) => {
//   const users = new Users();

//   const history = useHistory();
//   const [inputValue, setInputValue] = React.useState("");
//   const [filteredSuggestions, setFilteredSuggestions] = React.useState([]);
//   const [selectedSuggestion, setSelectedSuggestion] = React.useState(0);
//   const [displaySuggestions, setDisplaySuggestions] = React.useState(false);

//   const onChange = event => {
//     const value = event.target.value;
//     setInputValue(value);

//     if (value.length > 1) {
//       users.getAllUsers({limit: 20, email: value})
//       .then(jsonSearchResults => {
//       setFilteredSuggestions(jsonSearchResults.users ?? []);
//       setDisplaySuggestions(true);
//       })
//       .catch(e => {
//         console.error("getSearchableUsers Exception", e)
//       });
//     } else {
//       setFilteredSuggestions([]);
//       setDisplaySuggestions(false);
//     }
//   };
//   const onSelectSuggestion = index => {
//     setSelectedSuggestion(index);
//     setInputValue("");
//     setFilteredSuggestions([]);
//     setDisplaySuggestions(false);

//     history.replace({ pathname: "/partner/client", state: { userId: filteredSuggestions[index].id}});
//     // Load consent records every time a user is selected
//     props.fetchEnforceConsents({userId: filteredSuggestions[index].id});
//   };

//   return (
//     <div>
//       <form onSubmit={e => e.preventDefault()} className="form-search form-inline float-right">
//         <input className="form-control user-input" type="text" placeholder={data.clients.search_placeholder} onChange={onChange} value={inputValue} />
//         <SuggestionsList
//           inputValue={inputValue}
//           selectedSuggestion={selectedSuggestion}
//           onSelectSuggestion={onSelectSuggestion}
//           displaySuggestions={displaySuggestions}
//           suggestions={filteredSuggestions}
//         />
//         <img src={window._env_.PUBLIC_URL + "/images/icons/search.svg"} className="img-search" alt="" />
//       </form>
//     </div>
//   );
// };

// // PartnerClient Page  
// class PartnerClient extends React.Component {

//   constructor() {
//     super();
//     this.state = {
//       userId: "",
//       formattedName: "",
//       street: "",
//       city: "",
//       zipcode: "",
//       email: "",
//       phone: "",
//       consentsPending: false,
//     };

//     this.consents = new Consents();
//     this.session = new Session();
//     this.users = new Users();
//   }

//   fetchEnforceConsents({userId}) {
//     this.setState({consentsPending: true});
//     this.consents.enforceConsent({userId: userId, AT: this.session.getAuthenticatedUserItem("AT", "session")})
//     .then(response => {
//       var firstName = "";
//       var lastName = "";
//       var name = "";
//       var street = "";
//       var city = "";
//       var zipcode = "";
//       var email = "";
//       var phone = "";

//       if (response.name !== undefined && response.name.given !== undefined && response.name.family) {
//         firstName = response.name.given;
//         lastName = response.name.family;

//         name = firstName + " " + lastName;
//       }

//       if (response.address !== undefined) {
//         street = response.address.streetAddress
//         city = response.address.locality
//         zipcode = response.address.postalCode
//       }

//       if (response.email !== undefined) {
//         email = response.email
//       }

//       if (response.mobilePhone !== undefined) {
//         phone = response.mobilePhone
//       } 

//       this.setState({
//         formattedName: name,
//         street: street,
//         city: city,
//         zipcode: zipcode,
//         email: email,
//         phone: phone,
//         consentsPending: false,
//         userId
//       })
//     });
//   }

//   hasNoData() {
//     return this.state.street === "" &&
//            this.state.city === "" &&
//            this.state.zipcode === "" &&
//            this.state.email === "" &&
//            this.state.phone === ""
//   }

//   componentDidMount() {
//     if (!this.props.location || !this.props.location.state || !this.props.location.state.userId) {
//       return;
//     }
//     const userId = this.props.location.state.userId;
//     this.setState({
//       userId: userId
//     });
//     this.fetchEnforceConsents({userId});
//   }

//   render() {
//     return (
//       <div className="accounts advisor">
//         <NavbarMain data={data} />
//         <section className="welcome-bar">
//           <Container>
//             <Row>
//               <Col lg="12">
//                 <h3>{data.welcome_bar}</h3>
//               </Col>
//             </Row>
//           </Container>
//         </section>
//         <section className="section-content">
//           <Container>
//             <Row>
//               <Col lg="4">
//                 <h5>{data.profile.partner.title}</h5>
//                 <Card>
//                   <CardBody>
//                     <Media>
//                       <Media left href="#">
//                         <Media object src={window._env_.PUBLIC_URL + "/images/anywealthadvisor-photo.png"} alt="Generic placeholder image" />
//                       </Media>
//                       <Media body>
//                         <p dangerouslySetInnerHTML={{__html: data.profile.partner.content}}></p>
//                         <Button color="link">{data.profile.partner.button}</Button>
//                       </Media>
//                     </Media>
//                   </CardBody>
//                 </Card>
//                 <h5 className="mt-5">{data.alerts.title}</h5>
//                 <Card className="mb-5">
//                   <CardBody>
//                     {
//                       Object.keys(data.alerts.messages).map(key => {
//                         return (
//                           <p key={key} dangerouslySetInnerHTML={{__html: data.alerts.messages[key]}}></p>
//                         );
//                       })      
//                     }
//                     <Button color="link">{data.alerts.button}</Button>
//                   </CardBody>
//                 </Card>
//               </Col>
//               <Col lg="8">
//                 <div>
//                   <Row>
//                     <Col>
//                       <h5 className="mb-4">{data.clients.title}</h5>
//                     </Col>
//                     <Col>
//                       <SearchAutocomplete fetchEnforceConsents={this.fetchEnforceConsents.bind(this)}/>
//                     </Col>
//                   </Row>
//                   <Row>
//                     <Col>
//                       {data.clients.orders.map((order) => (
//                         <div className="module">
//                           <Container>
//                             <Row className="pt-4 pb-3 pl-2 pr-2">
//                               <Col>
//                                 <span className="client-order_title">
//                                   {order.name} {order.id} | <Button color="link" className="pl-1">{order.tracking_link}</Button> {this.state.consentsPending && <div><FontAwesomeIcon icon={faCircleNotch} size="3x" className="fa-spin"/> </div>}
//                                 </span>
//                               </Col>
//                             </Row>
//                             <Row className="pb-4 pl-2 pr-2">
//                               <Col sm="4">
//                                 {this.state.formattedName !== "" && 
//                                   <div className="client-order_name">
//                                     {this.state.formattedName}
//                                   </div>
//                                 }
//                                 {(this.hasNoData() && this.state.userId !== "") && 
//                                   <p style={{fontWeight: "bold", fontStyle: "italic"}}>This user has not consented to share any data.</p>
//                                 }
//                                 <div className="client-order_address">
//                                   <div style={{fontWeight: "bold"}}>
//                                     {order.contact_details.address.title}
//                                   </div>
//                                   {this.state.street !== "" &&
//                                     <div>
//                                       {this.state.street}
//                                     </div>
//                                   }
//                                   {this.state.city !== "" &&
//                                     <div>
//                                       {this.state.city} {this.state.zipcode}
//                                     </div>
//                                   }
//                                   <Button color="link">
//                                     {order.contact_details.address.edit_link}
//                                   </Button>
//                                 </div>
//                                 <div className="client-order_phone">
//                                   <div style={{fontWeight: "bold"}}>
//                                     {order.contact_details.phone_numbers.title}
//                                   </div>
//                                   {this.state.phone !== "" &&
//                                     <div>Mobile: {this.state.phone}</div>
//                                   }
//                                   <Button color="link">
//                                     {order.contact_details.address.edit_link}
//                                   </Button>
//                                 </div>
//                                 <div className="client-order_email">
//                                   <div style={{fontWeight: "bold"}}>
//                                     {order.contact_details.email.title}
//                                   </div>
//                                   {this.state.email !== "" &&
//                                     <div>
//                                       {this.state.email}
//                                     </div>
//                                   }
//                                   <Button color="link">
//                                     {order.contact_details.address.edit_link}
//                                   </Button>
//                                 </div>
//                               </Col>
//                               <Col sm="8">
//                                 {order.order_details.products.map((product) => (
//                                   <Row>
//                                     <Col>
//                                       <img
//                                         src={window._env_.PUBLIC_URL + product.image_url}
//                                         className="img-fluid"
//                                         alt=""
//                                       />
//                                     </Col>
//                                     <Col>
//                                       <div>
//                                         {product.title}
//                                       </div>
//                                       <ul className="client-order_list">
//                                         {product.names.map((name) => (
//                                           <li>{name}</li>
//                                         ))}
//                                       </ul>
//                                       <Button className="mt-3" color="link">
//                                         {product.product_link}
//                                       </Button>
//                                     </Col>
//                                   </Row>
//                                 ))}
//                                 <Row className="mt-4">
//                                   <Col>
//                                     <div>
//                                       {order.order_details.services.title}:
//                                     </div>
//                                     <ul className="client-order_list mt-3">
//                                       {order.order_details.services.data.map((order) => (
//                                         <li>{order}</li>
//                                       ))}
//                                     </ul>
//                                     <Button className="mt-3" color="link">
//                                       {order.order_details.services.instructions_link}
//                                     </Button>
//                                   </Col>
//                                 </Row>
//                               </Col>
//                             </Row>
//                           </Container>
//                         </div>
//                       ))}
//                     </Col>
//                   </Row>
//                 </div>
//               </Col>
//             </Row>
//           </Container>
//         </section>
//         <FooterMain />
//       </div>
//     );
//   }
// }

// export default withRouter(PartnerClient);
