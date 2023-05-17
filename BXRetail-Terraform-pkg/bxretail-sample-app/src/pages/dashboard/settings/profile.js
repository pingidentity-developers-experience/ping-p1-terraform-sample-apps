import React from 'react';
import { Container, Button, FormGroup, Label, Input, Row, Col } from 'reactstrap';

// Components
// import { DaVinciWidget } from '../../../components/DaVinci/DaVinciWidget.js';
import NavbarMain from '../../../components/UI/NavbarMain';
import WelcomeBar from '../../../components/UI/WelcomeBar';
import FooterMain from '../../../components/UI/FooterMain';
import AccountsSubnav from '../../../components/UI/AccountsSubnav';
import AccountsDropdown from '../../../components/UI/AccountsDropdown';
import Users from '../../../components/Controller/Users';
import Session from '../../../components/Utils/Session';
import Tokens from '../../../components/Utils/Tokens.js';

// Content
import content from '../../../content/dashboard/settings/profile.json';

// Styles
import '../../../styles/pages/dashboard/settings/profile.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

class DashboardSettingsProfile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            step: 1,
            firstname: '',
            lastname: '',
            email: '',
            phone: '',
            birthdate: '',
            street: '',
            city: '',
            zipcode: '',
            success: false,
            mfaEnabled: false,
            profilePending: true,
            isOpen: false,
            firstNameRequired: false,
            lastNameRequired: false,
            phoneRequired: false,
            birthDateRequired: false,
            streetRequired: false,
            cityRequired: false,
            zipcodeRequired: false,
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.close = this.close.bind(this);
        this.users = new Users();
        this.session = new Session();
        this.tokens = new Tokens();
        this.toggle = this.toggle.bind(this);
        this.profileForm = React.createRef();
    }

    handleSubmit() {
        if (!this.profileForm.current.reportValidity()) {
            return;
        }

        this.users
            .updateUserProfile({ IdT: this.session.getAuthenticatedUserItem('IdT', 'session'), userState: this.state })
            .then((result) => {
                if (result.success) {
                    const newState = {
                        step: 2,
                        success: true,
                    };

                    // Can't update first name to empty string so check for a value
                    if (this.state.firstname) {
                        this.session.setAuthenticatedUserItem('firstName', this.state.firstname, 'session');
                        newState.userFirstName = this.state.firstname;
                    }

                    this.setState(newState, () => {
                        this.setSavedUser({
                            firstname: this.state.firstname,
                            lastname: this.state.lastname,
                            email: this.state.email,
                            phone: this.state.phone,
                            birthdate: this.state.birthdate,
                            street: this.state.street,
                            city: this.state.city,
                            zipcode: this.state.zipcode
                        });                    
                    });

                    setTimeout(() => {
                        this.setState({ success: false });
                    }, 2500);
                } else {
                    console.error('Update user profile error', result);
                }
            })
            .catch((e) => {
                console.error('Update user profile error', e);
            });
    }

    close() {
        this.setState({ step: 1 });
    }

    handleUserInput(e) {
        let formData = {};
        formData[e.target.id] = e.target.value;
        this.setState(formData);
    }

    handleCheckbox() {
        //TODO It's probably better practice to use setState with prevState instead of a separate variable, in case state hasn't update in time.
        const enabled = !this.state.mfaEnabled;
        this.users.toggleMFA({ IdT: this.session.getAuthenticatedUserItem('IdT', 'session'), toggleState: enabled });
        this.setState({ mfaEnabled: enabled });
    }

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen,
        });
    }

    setSavedUser({firstname, lastname, phone, email, birthdate, street, city, zipcode}) {
        this.setState({
            firstname,
            lastname,
            email,
            phone,
            birthdate,
            street,
            city,
            zipcode,
            firstNameRequired: !!firstname,
            lastNameRequired: !!lastname,
            phoneRequired: !!phone,
            birthDateRequired: !!birthdate,
            streetRequired: !!street,
            cityRequired: !!city,
            zipcodeRequired: !!zipcode,
        });
    }

    componentDidMount() {
        this.setState({
            userFirstName: this.session.getAuthenticatedUserItem('firstName', 'session'),
            userEmail: this.session.getAuthenticatedUserItem('email', 'session'),
            federatedUser: this.session.getAuthenticatedUserItem('federatedUser', 'session'),
        });
        
        const idt = this.session.getAuthenticatedUserItem('IdT', 'session');

        // If this is false it means there is no user logged in and protectPage will redirect them back home
        if (idt) {
            this.users
                .getUserProfile({ IdT: idt })
                .then((userProfile) => {
                    this.setSavedUser({
                        firstname: userProfile.name?.given ?? '',
                        lastname: userProfile.name?.family ?? '',
                        phone: userProfile.mobilePhone ?? '',
                        email: userProfile.email,
                        birthdate: userProfile.BXRetailCustomAttr1 ?? '',
                        street: userProfile.address?.streetAddress ?? '',
                        city: userProfile.address?.locality ?? '',
                        zipcode: userProfile.address?.postalCode ?? '',
                    });

                    this.setState({
                        mfaEnabled: userProfile.mfaEnabled,
                        profilePending: false,
                    });
                });
            }
        }
        
        render() {
        return (
            <>
                {/* PingOne Fraud Use Case - Add Credit Card
                    <Modal show={this.state.isOpen} onHide={() => this.toggle()}>
                    <DaVinciWidget
                        companyKey={window._env_.REACT_APP_DAVINCI_COMPANY_ID}
                        policyKey={window._env_.REACT_APP_ADDCARD_DAVINCI_POLICY_ID}
                        apiKey={window._env_.REACT_APP_ADDCARD_DAVINCI_API_KEY}
                        toggle={this.toggle}
                        userId={userUUID}
                        stSessionId={stSessionId}
                        fraudToken={fraudToken}
                        accessToken={accessToken}
                    />
                </Modal> */}
                <div className='accounts profile'>
                    <NavbarMain />
                    <WelcomeBar
                        title='My Account: '
                        firstName={this.state.userFirstName}
                        email={this.state.userEmail}
                    />
                    <Container>
                        <div className='inner'>
                            <div className='sidebar'>
                                {Object.keys(content.subnav).map((key) => {
                                    return <AccountsSubnav key={content.subnav[key].title} subnav={content.subnav[key]} />;
                                })}
                            </div>
                            <div className='content'>
                                <div className='accounts-hdr'>
                                    <h1>{content.title}</h1>
                                    <AccountsDropdown text={content.dropdown} />
                                </div>
                                <div className='module'>
                                    <h3>Profile Details</h3>
                                    {this.state.profilePending && (
                                        <div className='spinner' style={{ textAlign: 'center' }}>
                                            <FontAwesomeIcon icon={faCircleNotch} size='3x' className='fa-spin' />
                                        </div>
                                    )}
                                    <form class="profile-updates-form" ref={this.profileForm} onSubmit={e => e.preventDefault()}>
                                        <Row form>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for='firstname'>{content.form.fields.firstname.label}</Label>
                                                    <Input
                                                        onChange={this.handleUserInput.bind(this)}
                                                        type='text'
                                                        autoComplete='new-firstname'
                                                        name='firstname'
                                                        id='firstname'
                                                        placeholder={content.form.fields.firstname.placeholder}
                                                        value={this.state.firstname}
                                                        required={this.state.firstNameRequired}
                                                        maxLength="50"
                                                        pattern="^(?=.*[a-zA-Z])(?!.*[^ \-a-zA-Z]).*$"
                                                        title="Your first name may only include letters, spaces and hyphens and must include at least 1 letter."

                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for='lastname'>{content.form.fields.lastname.label}</Label>
                                                    <Input
                                                        onChange={this.handleUserInput.bind(this)}
                                                        type='text'
                                                        autoComplete='new-lastname'
                                                        name='lastname'
                                                        id='lastname'
                                                        placeholder={content.form.fields.lastname.placeholder}
                                                        value={this.state.lastname}
                                                        required={this.state.lastNameRequired}
                                                        maxLength="50"
                                                        pattern="^(?=.*[a-zA-Z])(?!.*[^ \-a-zA-Z]).*$"
                                                        title="Your last name may only include letters, spaces and hyphens and must include at least 1 letter."
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for='phone'>{content.form.fields.phone.label}</Label>
                                                    <Input
                                                        onChange={this.handleUserInput.bind(this)}
                                                        type='tel'
                                                        autoComplete='new-phone'
                                                        name='phone'
                                                        id='phone'
                                                        placeholder={content.form.fields.phone.placeholder}
                                                        value={this.state.phone}
                                                        required={this.state.phoneRequired}
                                                        pattern="^\+?([0-9]+){1,3}\.?([0-9]+){4,14}$"
                                                        maxLength="30"
                                                        title="US numbers must include area code with no special characters (e.g. 8778982905). International numbers should include their country code in the following format: +44.2071909105"
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for='birthdate'>{content.form.fields.birthdate.label}</Label>
                                                    <Input
                                                        onChange={this.handleUserInput.bind(this)}
                                                        type='text'
                                                        autoComplete='new-birthdate'
                                                        name='birthdate'
                                                        id='birthdate'
                                                        placeholder={content.form.fields.birthdate.placeholder}
                                                        value={this.state.birthdate}
                                                        required={this.state.birthDateRequired}
                                                        pattern="\d{1,2}/\d{1,2}/\d{4}"
                                                        maxLength="10"
                                                        title="Birth date must be in MM/DD/YYYY format."
                                                    
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for='street'>{content.form.fields.street.label}</Label>
                                                    <Input
                                                        onChange={this.handleUserInput.bind(this)}
                                                        type='text'
                                                        autoComplete='new-street'
                                                        name='street'
                                                        id='street'
                                                        placeholder={content.form.fields.street.placeholder}
                                                        value={this.state.street}
                                                        required={this.state.streetRequired}
                                                        pattern="^(?=.*[a-zA-Z])(?!.*[^ \-a-zA-Z0-9\.#]).*$"
                                                        maxLength="50"
                                                        title="Street address may only include letters, numbers, spaces, periods, hyphens, and pound signs and must contain at least 1 letter."
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for='city'>{content.form.fields.city.label}</Label>
                                                    <Input
                                                        onChange={this.handleUserInput.bind(this)}
                                                        type='text'
                                                        autoComplete='new-city'
                                                        name='city'
                                                        id='city'
                                                        placeholder={content.form.fields.city.placeholder}
                                                        value={this.state.city}
                                                        required={this.state.cityRequired}
                                                        pattern="^(?=.*[a-zA-Z])(?!.*[^ \-a-zA-Z]).*$"
                                                        maxLength="50"
                                                        title="City may only include letters, spaces, and hyphens and must contain at least 1 letter."
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for='zipCode'>{content.form.fields.zipcode.label}</Label>
                                                    <Input
                                                        onChange={this.handleUserInput.bind(this)}
                                                        type='text'
                                                        autoComplete='new-zipcode'
                                                        name='zipcode'
                                                        id='zipcode'
                                                        placeholder={content.form.fields.zipcode.placeholder}
                                                        value={this.state.zipcode}
                                                        required={this.state.zipcodeRequired}
                                                        pattern="^(?=.*[a-zA-Z0-9])(?!.*[^ \-a-zA-Z0-9]).*$"
                                                        maxLength="10"
                                                        title="Zip code may only include letters, numbers, spaces, and hyphens and must contain at least 1 letter or 1 number."
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Row form>
                                            <Col>
                                                <div className='text-right'>
                                                    {this.state.success && <p>Updated!</p>}
                                                    <Button type='button' color='link' className='ml-3'>
                                                        {content.form.buttons.cancel}
                                                    </Button>
                                                    <Button type='button' color='primary' onClick={this.handleSubmit}>
                                                        {content.form.buttons.submit}
                                                    </Button>
                                                </div>
                                            </Col>
                                        </Row>
                                    </form>
                                </div>
                                {/* Add MFA section */}
                                {/* {!this.state.federatedUser && (
                                    <div className='module'>
                                        <h3>Authentication Preferences</h3>
                                        <Col>
                                            <Row>
                                                <p>{content.form.fields.login.description}</p>
                                            </Row>
                                        </Col>
                                        <Col md={{ span: 1, offset: 1 }}>
                                            <Row form>
                                                <FormGroup>
                                                    <Input
                                                        type='checkbox'
                                                        checked={this.state.mfaEnabled}
                                                        onChange={this.handleCheckbox.bind(this)}
                                                    />
                                                    <Label>
                                                        {this.state.mfaEnabled
                                                            ? 'Turn off two-factor authentication.'
                                                            : 'Turn on two-factor authentication.'}
                                                    </Label>
                                                </FormGroup>
                                            </Row>
                                        </Col>
                                    </div>
                                )} */}
                                {/* Add Device Management section */}
                                {/* {!this.state.federatedUser && (
                                <div className='module'>     
                                    <h3>Device Management</h3>
                                    <p>To access your My Account portal to add or remove multi-factor authentication devices used for sign-in, <a href={window._env_.REACT_APP_AUTHPATH + "/myaccount/"} target="_blank" rel="noreferrer">click here</a>.</p>
                                </div>
                                )} */}
                                    
                            </div>
                        </div>
                    </Container>
                    <FooterMain />
                </div>
            </>
        );
    }
}
export default DashboardSettingsProfile;
