import React from 'react';
import PropTypes from 'prop-types';
import {
    Container,
    Row,
    Col,
    Button,
    Modal,
    ModalHeader,
    TabContent,
    TabPane,
    ModalBody,
    FormGroup,
    Input,
    Label,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { withRouter } from 'react-router-dom';

// Components
import NavbarMain from '../../components/UI/NavbarMain';
import WelcomeBar from '../../components/UI/WelcomeBar';
import FooterMain from '../../components/UI/FooterMain';
import AccountsSubnav from '../../components/UI/AccountsSubnav';
import AccountsDropdown from '../../components/UI/AccountsDropdown';
import PaymentTypeForm from '../../components/UI/PaymentTypeForm';
import Session from '../../components/Utils/Session';
import AuthZ from '../../components/Controller/AuthZ';
import Registration from '../../components/Controller/Registration';
import Users from '../../components/Controller/Users';

// Content
import content from '../../content/shop/index.json';
import profileContent from '../../content/dashboard/settings/profile.json';

// Styles
import '../../styles/pages/shop.scss';

class Checkout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            activeTab: '1',
            isOpenLoading: false,
            isOpenConfirmation: false,
            activeTabConfirmation: '1',
            profilePending: true,
            lookupPending: false,
            orderProcessingMsg: content.modal.loading.title,
            acctFound: props.location.state?.acctFound || false,
            recordFound: false,
            step: '1',
            selectedItem: {
                protection: {},
                mounting: {},
            },
            haveError: false,
            checkoutType: 'creditCard',
            firstname: '',
            lastname: '',
            email: '',
            phone: '',
            street: '',
            city: '',
            zipcode: '',
            paymentError: false,
            isEmailVerified: false,
            password: '',
            passwordConfirm: ''
        };

        this.session = new Session();
        this.authz = new AuthZ();
        this.registration = new Registration();
        this.users = new Users();
        this.envVars = window._env_;
        this.acctVerified = false; 
        this.formref1 = React.createRef();
        this.formref2 = React.createRef();
        this.formref3 = React.createRef();
        this.formref4 = React.createRef();
    }
    onClosed() {
        if (this.state.acctFound) {
            this.props.history.push('/shop');
            this.setState({
                activeTab: '1',
            });
        } 
    }
    toggle() {
        this.setState({
            isOpen: !this.state.isOpen,
        });
    }
    addToCart(item) {
        this.setState(
            {
                isOpen: !this.state.isOpen,
                selectedItem: item,
            },
            () => {
                this.session.setAuthenticatedUserItem('cart', JSON.stringify(this.state.selectedItem), 'session');
            }
        );
    }
    toggleLoading() {
        this.setState({
            isOpenLoading: !this.state.isOpenLoading,
        });
        setTimeout(
            function () {
                this.setState({
                    orderProcessingMsg: content.modal.loading.finalizeOrder,
                });
            }.bind(this),
            3000
        );
    }

    toggleCheckoutType(event) {
        const validPaymentOptions = ['bankAccount', 'creditCard'];
        if (validPaymentOptions.includes(event.target.value)) {
            this.setState({
                checkoutType: event.target.value,
            });

            if (event.target.value === 'bankAccount') {
                this.session.setAuthenticatedUserItem('cartCheckoutType', event.target.value, 'session');
            } else {
                this.session.removeAuthenticatedUserItem('cartCheckoutType', 'session');
            }
        }
    }

    toggleConfirmation() {
        this.setState({
            isOpenConfirmation: !this.state.isOpenConfirmation,
        });
    }

    toggleTabConfirmation(tab) {
        this.setState({
            activeTabConfirmation: tab,
        });
    }
    onApproval() {
        let self = this;

        let cost;
        if (this.state.selectedItem.price) {
            cost = this.state.selectedItem.price;
        } else {
            let cart = JSON.parse(this.session.getAuthenticatedUserItem('cart', 'session'));
            cost = cart.price
        }
        cost = cost.replace(/\$|,/gi, '');
        console.info('cost', cost);

        // Need transaction approval.
        if (parseFloat(cost) >= 1000.0) {
            console.info('Need purchase approval');
            this.toggleLoading();

            setTimeout(() => {
                self.toggleLoading();
                self.toggleConfirmation();
                if (!this.state.acctFound) {
                    this.changeUIStep('5');
                }
            }, 6000);
        } else {
            console.info('No purchase approval needed');
            self.toggleConfirmation();
            if (!this.state.acctFound) {
                this.changeUIStep('5');
            }
        }

        this.clearShoppingCart();
    }

    async changeUIStep(stepNumber) {
        /* Guest email lookup */
        if (stepNumber === '2') {
            this.setState({ step: stepNumber });
        }
        /* Checkout profile verify/update */
        if (stepNumber === '3') {
            // If we are logged in, we jump straight to the profile form skipping
            // email lookup form. So we can't test formRef1 in that case.
            if (this.session.isLoggedOut && !this.formref1.current.reportValidity()) {
                return false;
            }

            if (!this.session.isLoggedOut) {
                this.setState({ acctFound: true });
                this.getProfile();
            }

            this.setState({ step: stepNumber, profilePending: false });
        }

        /* Choose billing option */
        if (stepNumber === '4') {
            if (this.formref2.current.reportValidity()) {
                this.updateProfile(this.state);
                this.setState({ step: stepNumber });
            }
        }

        /* Create an account prompt */
        if (stepNumber === '5') {
            if (this.session.isLoggedOut) {
                this.setState({ step: stepNumber });
            }
        }

        /* Trigger account creation */
        if (stepNumber === '6') {
            this.setState({ haveError: false });
            this.createAccount();
        }
    }

    handleUserInput(e) {
        let formData = {};
        formData[e.target.id] = e.target.value;
        this.setState(formData);
    }

    clearShoppingCart() {
        this.session.removeAuthenticatedUserItem('cart', 'session');
        // Reset acctVerified to make sure the demo always goes through progressive profiling (verify acct/shipping details)
        this.acctVerified = false;
        // And remove authMode. It impacts the checkout process.
        this.session.removeAuthenticatedUserItem('authMode', 'session');
        this.session.removeAuthenticatedUserItem('cartCheckoutType', 'session');
    }
    cancelCheckout() {
        this.clearShoppingCart();
        this.props.history.push('/shop');
    }

    signInToCheckout(email, postCheckoutAccountCreation = false) {
        if (postCheckoutAccountCreation) {
            this.session.setAuthenticatedUserItem('authMode', 'login', 'session');
        } else {
            this.session.setAuthenticatedUserItem('authMode', 'signInToCheckout', 'session');
        }

        if (typeof email === 'string') {
            // We are checking that the email is a string. If no email, we get an object passed in that we don't want to display in the login modal.
            this.session.setAuthenticatedUserItem('email', email, 'session');
        }
        
        // Initialize OIDC SDK and start authorization flow
        this.authz.initAuthNFlow().catch(err => console.error(err));
    }

    /**
     * Get user profile
     * @param {String} userId Optional argument to pass if an ID Token is not available.
     */
    getProfile(userId) {
        this.setState({ detailsPending: false });

        let response;
        if (userId) {
            response = this.users.getUserProfile({ userId: userId });
        } else {
            response = this.users.getUserProfile({ IdT: this.session.getAuthenticatedUserItem('IdT', 'session') });
        }
        response.then((userProfile) => {
            this.setState({
                firstname: userProfile.name?.given ?? '',
                lastname: userProfile.name?.family ?? '',
                email: userProfile.email ?? '',
                phone: userProfile.mobilePhone ?? '',
                birthdate: userProfile.BXRetailCustomAttr1 ?? '',
                street: userProfile.address?.streetAddress ?? '',
                city: userProfile.address?.locality ?? '',
                zipcode: userProfile.address?.postalCode ?? '',
                userId: userProfile.id,
                profilePending: false,
                lookupPending: false,
            });
        });
    }

    updateProfile(stateData) {
        this.acctVerified = true;
        this.setState({
            profilePending: true,
        });

        //user is logged in so we have a token to get the user ID.
        if (!this.session.isLoggedOut) {
            this.users.updateUserProfile({
                IdT: this.session.getAuthenticatedUserItem('IdT', 'session'),
                userState: stateData,
            });
        } else {
            this.session.setAuthenticatedUserItem('userData', JSON.stringify(stateData), 'session');
            this.session.setAuthenticatedUserItem('email', stateData.email, 'session');
        }
    }

    checkout() {
        //REFACTOR this is horribly written. It's better than before but it can be improved I think.
        // I.e. can probably have the first check only be for this.acctVerified and call this.onApproval since that is always the case.
        // And just handle the logged in/logged out scenarios separately.
        console.info('Starting the checkout process.');
        if (this.session.isLoggedOut) {
            if (this.acctVerified) {
                this.onApproval();
            }
        }

        if (!this.session.isLoggedOut) {
            if (this.acctVerified) {
                this.onApproval();
            } else {
                //Read user attributes and Display UI step 3. User adds/updates profile.
                this.changeUIStep('3');
            }
        }
    }

    createAccount() {
        this.session.setAuthenticatedUserItem('authMode', 'registration', 'session');
        // Initialize OIDC SDK and start authorization flow
        this.authz.initAuthNFlow().catch(err => console.error(err));
    }

    componentDidMount() {
        // clear abandoned/failed banking account payment key
        this.session.removeAuthenticatedUserItem('cartCheckoutType', 'session');

        // Checkout process
        if (!this.session.isLoggedOut) {
            this.setState({ step: 3, detailsPending: true });
        }
        const hasCartInStorage = this.session.getAuthenticatedUserItem('cart', 'session') === null || this.session.getAuthenticatedUserItem('cart', 'session') === 'undefined' ? false : true;
        if (hasCartInStorage) {
            // Returning from BXFinance, OpenBanking transaction
            console.info('Items found in shopping cart.', 'Starting checkout process.');
            this.addToCart(JSON.parse(this.session.getAuthenticatedUserItem('cart', 'session')));
            this.checkout();
        } else {
            // You need to shop before you can checkout.
            this.props.history.push('/shop');
        }
    }

    render() {
        // Temp. "thanks for registration msg"
        let regMessage;
        if (this.session.getAuthenticatedUserItem('regMessage', 'session')) {
            regMessage = this.session.getAuthenticatedUserItem('regMessage', 'session');
            this.session.removeAuthenticatedUserItem('regMessage', 'session');
        }
        const closeBtn = <div />;
        return (
            <div className='dashboard accounts accounts-overview shop'>
                <NavbarMain toggleCart={this.toggleTab} />
                <WelcomeBar
                    firstName={this.session.getAuthenticatedUserItem('firstName', 'session')}
                    email={this.session.getAuthenticatedUserItem('bxRetailUserType', 'session') ? this.session.getAuthenticatedUserItem('email', 'session') : ''}
                    regMessage={regMessage}
                />
                <Container>
                    <div className='inner'>
                        <div className='sidebar'>
                            {Object.keys(content.subnav).map((key) => {
                                return <AccountsSubnav key={content.subnav[key].title} subnav={content.subnav[key]} />;
                            })}
                            <div className='text-center mt-4'>
                                <p>
                                    <strong>Shop at our Extraordinary Club Partners</strong>
                                </p>
                            </div>
                            <Row className='sites align-items-center'>
                                <Col>
                                    <img src={window._env_.PUBLIC_URL + '/images/logo-bxclothes.svg'} alt='BXClothes' />
                                </Col>
                                <Col>
                                    <img src={window._env_.PUBLIC_URL + '/images/logo-bxhome.svg'} alt='BXHome' />
                                </Col>
                                <Col>
                                    <img src={window._env_.PUBLIC_URL + '/images/logo-bxoffice.svg'} alt='BXOffice' />
                                </Col>
                                <Col>
                                    <img src={window._env_.PUBLIC_URL + '/images/logo-bxtech.svg'} alt='BXTech' />
                                </Col>
                            </Row>
                        </div>
                        <div className='content'>
                            <div className='accounts-hdr'>
                                <h4>
                                    {this.state.selectedItem.title} &raquo; {content.checkoutTitle}
                                </h4>
                                <AccountsDropdown text={content.dropdown} />
                            </div>
                            <div className='module'>
                                {/* Guest or sign in prompt */}
                                {this.state.step === '1' && (
                                    <div>
                                        <h4>{content.modal.prompt.title}</h4>
                                        <div dangerouslySetInnerHTML={{ __html: content.content }}></div>
                                        <Button color='link' onClick={this.signInToCheckout.bind(this)}>
                                            {content.modal.prompt.buttons.signin}
                                        </Button>
                                        <Button
                                            color='link'
                                            onClick={() => {
                                                this.changeUIStep('2');
                                            }}>
                                            {content.modal.prompt.buttons.checkout}
                                        </Button>
                                    </div>
                                )}
                                {/* Guest email lookup */}
                                {this.state.step === '2' && (
                                    <div>
                                        <form
                                            ref={this.formref1}
                                            onSubmit={(e) => e.preventDefault()}
                                            style={{ padding: ' 0px 30px' }}>
                                            <h4>{content.modal.emailPrompt.title}</h4>
                                            {this.state.lookupPending && (
                                                <div className='spinner' style={{ textAlign: 'center' }}>
                                                    <FontAwesomeIcon
                                                        icon={faCircleNotch}
                                                        size='3x'
                                                        className='fa-spin'
                                                    />
                                                </div>
                                            )}
                                            {this.state.acctFound && (
                                                <div
                                                    style={{ color: '#FF0000', fontWeight: 'bold' }}
                                                    dangerouslySetInnerHTML={{
                                                        __html: content.modal.emailPrompt.acctFound,
                                                    }}></div>
                                            )}
                                            {/* <FormGroup className="form-group-light"> */}
                                            <Label for='email'>{profileContent.form.fields.email.label}</Label>
                                            <Input
                                                onChange={this.handleUserInput.bind(this)}
                                                required
                                                autoFocus={true}
                                                autoComplete='off'
                                                type='email'
                                                name='email'
                                                id='email'
                                                placeholder={profileContent.form.fields.email.placeholder}
                                                pattern='^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$'
                                            />
                                            <div className='mb-3' style={{ paddingTop: '15px' }}>
                                                <Button
                                                    type='button'
                                                    color='primary'
                                                    size='sm'
                                                    onClick={() => {
                                                        this.changeUIStep('3');
                                                    }}>
                                                    {profileContent.form.buttons.submit}
                                                </Button>
                                            </div>
                                            {/* </FormGroup> */}
                                        </form>
                                    </div>
                                )}
                                {/* Checkout profile verify/update */}
                                {this.state.detailsPending && (
                                    <div className='spinner' style={{ textAlign: 'center' }}>
                                        <FontAwesomeIcon icon={faCircleNotch} size='3x' className='fa-spin' />
                                    </div>
                                )}
                                {this.state.step === '3' && (
                                    <form
                                        ref={this.formref2}
                                        onSubmit={(e) => e.preventDefault()}
                                        style={{ padding: '0px 30px' }}>
                                        <div>
                                            <h4 style={{ maxWidth: '100%' }}>
                                                Confirm or update your account and shipping details
                                            </h4>
                                            {this.state.profilePending ? (
                                                <div className='spinner' style={{ textAlign: 'center' }}>
                                                    <FontAwesomeIcon
                                                        icon={faCircleNotch}
                                                        size='3x'
                                                        className='fa-spin'
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <Row form>
                                                        <Col md={6} className="checkout-form">
                                                            {/* <FormGroup > */}
                                                            <Label for='firstname'>
                                                                {profileContent.form.fields.firstname.label}
                                                            </Label>
                                                            <Input
                                                                onChange={this.handleUserInput.bind(this)}
                                                                required
                                                                autoFocus={true}
                                                                type='text'
                                                                name='firstname'
                                                                id='firstname'
                                                                autoComplete='off'
                                                                placeholder={
                                                                    profileContent.form.fields.firstname.placeholder
                                                                }
                                                                value={this.state.firstname}
                                                                maxLength="50"
                                                                pattern="^(?=.*[a-zA-Z])(?!.*[^ \-a-zA-Z]).*$"
                                                                title="Your first name may only include letters, spaces and hyphens and must include at least 1 letter."
                                                            />
                                                            {/* </FormGroup> */}
                                                        </Col>
                                                        <Col md={6} className="checkout-form">
                                                            {/* <FormGroup > */}
                                                            <Label for='lastname'>
                                                                {profileContent.form.fields.lastname.label}
                                                            </Label>
                                                            <Input
                                                                onChange={this.handleUserInput.bind(this)}
                                                                required
                                                                type='text'
                                                                name='lastname'
                                                                id='lastname'
                                                                autoComplete='off'
                                                                placeholder={
                                                                    profileContent.form.fields.lastname.placeholder
                                                                }
                                                                value={this.state.lastname}
                                                                maxLength="50"
                                                                pattern="^(?=.*[a-zA-Z])(?!.*[^ \-a-zA-Z]).*$"
                                                                title="Your last name may only include letters, spaces and hyphens and must include at least 1 letter."
                                                            />
                                                            {/* </FormGroup> */}
                                                        </Col>
                                                        {/* <Col md={5}>
                                                                <FormGroup>
                                                                <Label for="fullname">{profileContent.form.fields.fullname.label}</Label>
                                                                <Input onChange={this.handleUserInput.bind(this)} type="text" name="fullname" id="fullname" placeholder={profileContent.form.fields.fullname.placeholder} value={this.state.fullname} />
                                                                </FormGroup>
                                                            </Col> */}
                                                    </Row>
                                                    <Row form>
                                                        <Col md={6} className="checkout-form">
                                                            {/* <FormGroup> */}
                                                            <Label for='email'>
                                                                {profileContent.form.fields.email.label}
                                                            </Label>
                                                            <Input
                                                                readOnly
                                                                type='email'
                                                                name='email'
                                                                id='email'
                                                                autoComplete='off'
                                                                placeholder={profileContent.form.fields.email.placeholder}
                                                                value={this.state.email}
                                                            />
                                                            {/* </FormGroup> */}
                                                        </Col>
                                                        <Col md={6} className="checkout-form">
                                                            {/* <FormGroup> */}
                                                            <Label for='phone'>
                                                                {profileContent.form.fields.phone.label}
                                                            </Label>
                                                            <Input
                                                                onChange={this.handleUserInput.bind(this)}
                                                                required
                                                                type='tel'
                                                                name='phone'
                                                                id='phone'
                                                                autoComplete='off'
                                                                placeholder={profileContent.form.fields.phone.placeholder}
                                                                value={this.state.phone}
                                                                pattern="^\+?([0-9]+){1,3}\.?([0-9]+){4,14}$"
                                                                maxLength="30"
                                                                title="US numbers must include area code with no special characters (e.g. 8778982905). International numbers should include their country code in the following format: +44.2071909105"
                                                            />
                                                            {/* </FormGroup> */}
                                                        </Col>
                                                        {/* <Col md={6}>
                                                                <FormGroup>
                                                                <Label for="birthdate">{profileContent.form.fields.birthdate.label}</Label>
                                                                <Input onChange={this.handleUserInput.bind(this)} type="text" name="birthdate" id="birthdate" placeholder={profileContent.form.fields.birthdate.placeholder} value={this.state.birthdate} />
                                                                </FormGroup>
                                                            </Col> */}
                                                    </Row>
                                                    <Row form>
                                                        <Col md={12} className="checkout-form">
                                                            {/* <FormGroup> */}
                                                            <Label for='street'>
                                                                {profileContent.form.fields.street.label}
                                                            </Label>
                                                            <Input
                                                                onChange={this.handleUserInput.bind(this)}
                                                                required
                                                                type='text'
                                                                name='street'
                                                                id='street'
                                                                autoComplete='off'
                                                                placeholder={profileContent.form.fields.street.placeholder}
                                                                value={this.state.street}
                                                                pattern="^(?=.*[a-zA-Z])(?!.*[^ \-a-zA-Z0-9\.#]).*$"
                                                                maxLength="50"
                                                                title="Street address may only include letters, numbers, spaces, periods, hyphens, and pound signs and must contain at least 1 letter."
                                                            />
                                                            {/* </FormGroup> */}
                                                        </Col>
                                                    </Row>
                                                    <Row form>
                                                        <Col md={6} className="checkout-form">
                                                            {/* <FormGroup> */}
                                                            <Label for='city'>
                                                                {profileContent.form.fields.city.label}
                                                            </Label>
                                                            <Input
                                                                onChange={this.handleUserInput.bind(this)}
                                                                required
                                                                type='text'
                                                                name='city'
                                                                id='city'
                                                                autoComplete='off'
                                                                placeholder={profileContent.form.fields.city.placeholder}
                                                                value={this.state.city}
                                                                pattern="^(?=.*[a-zA-Z])(?!.*[^ \-a-zA-Z]).*$"
                                                                maxLength="50"
                                                                title="City may only include letters, spaces, and hyphens and must contain at least 1 letter."
                                                            />
                                                            {/* </FormGroup> */}
                                                        </Col>
                                                        <Col md={6} className="checkout-form">
                                                            {/* <FormGroup> */}
                                                            <Label for='zipcode'>
                                                                {profileContent.form.fields.zipcode.label}
                                                            </Label>
                                                            <Input
                                                                onChange={this.handleUserInput.bind(this)}
                                                                required
                                                                type='text'
                                                                name='zipcode'
                                                                id='zipcode'
                                                                autoComplete='off'
                                                                placeholder={
                                                                    profileContent.form.fields.zipcode.placeholder
                                                                }
                                                                value={this.state.zipcode}
                                                                pattern="^(?=.*[a-zA-Z0-9])(?!.*[^ \-a-zA-Z0-9]).*$"
                                                                maxLength="10"
                                                                title="Zip code may only include letters, numbers, spaces, and hyphens and must contain at least 1 letter or 1 number."
                                                            />
                                                            {/* </FormGroup> */}
                                                        </Col>
                                                    </Row>
                                                    {/* <Row form> Not doing passwordless in v1. 
                                                                <Col md={5}>
                                                                <FormGroup>
                                                                    <Label for="city">{profileContent.form.fields.login.label}</Label>
                                                                    <Input type="select" name="login" id="login">
                                                                    <option value="mobile">{profileContent.form.fields.login.options.mobile}</option>
                                                                    <option value="password">{profileContent.form.fields.login.options.password}</option>
                                                                    </Input>
                                                                </FormGroup>
                                                                </Col>
                                                            </Row> */}
                                                    <Row form>
                                                        <Col style={{ marginBottom: '1rem' }} lg={7} md={12}>
                                                            <FormGroup check>
                                                                <Label check>
                                                                    <Input type='checkbox' readOnly checked />
                                                                    Billing Address is the same?
                                                                </Label>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col lg={5} md={12}>
                                                            <div className='text-right'>
                                                                <Button
                                                                    onClick={this.cancelCheckout.bind(this)}
                                                                    type='button'
                                                                    color='link'
                                                                    className='ml-3'>
                                                                    {profileContent.form.buttons.cancel}
                                                                </Button>
                                                                {/* <Button type="button" color="primary" onClick={this.props.onSubmit}>{profileContent.form.buttons.submit}</Button> */}
                                                                <Button
                                                                    type='button'
                                                                    color='primary'
                                                                    onClick={() => {
                                                                        this.changeUIStep('4');
                                                                    }}>
                                                                    {profileContent.form.buttons.submit}
                                                                </Button>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </>
                                            )}
                                        </div>
                                    </form>
                                )}
                                {
                                    /* Choose billing method prompt */
                                    this.state.step === '4' && (
                                        <>
                                            {this.state.paymentError && (
                                                <div className='paymentError' id='paymentError'>
                                                    {content.paymentProcessing.paymentErrorMsg}
                                                </div>
                                            )}

                                            <PaymentTypeForm
                                                onCheckoutTypeChange={this.toggleCheckoutType.bind(this)}
                                                guestUser={this.session.isLoggedOut}
                                                checkoutType={this.state.checkoutType}
                                                postalCode={this.state.zipcode}
                                            />
                                            <Row form>
                                                <Col>
                                                    <div className='text-right'>
                                                        <Button
                                                            onClick={this.cancelCheckout.bind(this)}
                                                            type='button'
                                                            color='link'
                                                            className='ml-3'>
                                                            {profileContent.form.buttons.cancel}
                                                        </Button>
                                                        {/* <Button type="button" color="primary" onClick={this.props.onSubmit}>{profileContent.form.buttons.submit}</Button> */}
                                                        <Button
                                                            type='button'
                                                            color='primary'
                                                            onClick={() => {
                                                                this.checkout();
                                                            }}>
                                                            {profileContent.form.buttons.submit}
                                                        </Button>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </>
                                    )
                                }
                                {/* Create an account prompt */}
                                {this.state.step === '5' && (
                                    <div>
                                        <h4 style={{ maxWidth: '100%', paddingBottom: '10px' }}>
                                            {content.modal.acctPrompt.title}
                                        </h4>
                                        {/* <FormGroup className="form-group-light"> */}
                                        <form
                                            ref={this.formref3}
                                            onSubmit={(e) => e.preventDefault()}
                                            style={{ margin: '0px', padding: '0px' }}>
                                            {this.state.haveError && (
                                                <div style={{ color: 'red', paddingBottom: '10px' }}>
                                                    {this.state.errorTitle}
                                                    <br />
                                                    {this.state.errorMsg}
                                                </div>
                                            )}
                                            <div style={{ margin: '15px 0px 15px' }}>
                                                <Button
                                                    type='button'
                                                    color='primary'
                                                    size='sm'
                                                    onClick={() => {
                                                        this.changeUIStep('6');
                                                    }}>
                                                    {content.modal.acctPrompt.buttons.createAcct}
                                                </Button>
                                            </div>
                                        </form>
                                        <div>
                                            <Button
                                                type='button'
                                                color='link'
                                                size='sm'
                                                onClick={() => {
                                                    this.props.history.push('/shop')
                                                }}>
                                                {content.modal.acctPrompt.buttons.backToShop}
                                            </Button>
                                        </div>
                                        {/* </FormGroup> */}
                                    </div>
                                )}
                            </div>
                            {/* <img alt="" src={window._env_.PUBLIC_URL + "/images/products/pagination.png"} className="img-fluid mb-3" /> */}
                        </div>
                    </div>
                </Container>
                <FooterMain />
                {/* Loading - awaiting transaction approval */}
                <Modal isOpen={this.state.isOpenLoading} toggle={this.toggleLoading.bind(this)} className='modal-login'>
                    <ModalHeader toggle={this.toggleLoading.bind(this)} close={closeBtn}>
                        <img src={window._env_.PUBLIC_URL + '/images/logo.svg'} alt='logo' />
                    </ModalHeader>
                    <ModalBody>
                        {/* <div className="mobile-loading" style={{ backgroundImage: `url(${window._env_.PUBLIC_URL}/images/login-device-outline.jpg)` }}> */}
                        <div style={{ textAlign: 'center' }}>
                            <div className='spinner'>
                                <img
                                    src={window._env_.PUBLIC_URL + '/images/icons/pingy.gif'}
                                    alt='loading...'
                                    height='130'
                                    width='130'
                                    style={{ textAlign: 'center' }}
                                />
                            </div>
                            <h4>{this.state.orderProcessingMsg}</h4>
                        </div>
                        <div className='mt-4 text-center'>
                            <Button type='button' color='link' size='sm'>
                                {content.modal.loading.help}
                            </Button>
                        </div>
                    </ModalBody>
                </Modal>
                {/* Order Confirmation */}
                <Modal
                    isOpen={this.state.isOpenConfirmation}
                    toggle={this.toggleConfirmation.bind(this)}
                    onClosed={this.onClosed.bind(this)}
                    className='modal-xl modal-shop'
                    centered={true}>
                    <ModalBody>
                        <TabContent activeTab={this.state.activeTabConfirmation}>
                            <TabPane tabId='1'>
                                {' '}
                                {/* Order Details */}
                                <Row>
                                    <Col md={10}>
                                        <h4 className='pl-4'>{content.modal.confirmation.title}</h4>
                                        <p className='pl-4'>{this.state.selectedItem.confirmationSubtitle}</p>
                                    </Col>
                                    <Col md={2} className='text-right'>
                                        <div>
                                            <Button
                                                type='button'
                                                color='link'
                                                onClick={this.toggleConfirmation.bind(this)}>
                                                {this.state.acctFound ? content.modal.product.buttons.continue : content.modal.product.buttons.close}
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>
                                <Row className='p-3'>
                                    <Col md={4} className='text-center'>
                                        <img
                                            alt=''
                                            src={
                                                window._env_.PUBLIC_URL +
                                                '/images/products/' +
                                                this.state.selectedItem.img
                                            }
                                            className='img-services'
                                        />
                                    </Col>
                                    <Col md={5}>
                                        <div className='product'>
                                            <h5>{this.state.selectedItem.title}</h5>
                                            <p>{this.state.selectedItem.model}</p>
                                            <img
                                                alt=''
                                                src={
                                                    window._env_.PUBLIC_URL +
                                                    '/images/icons/stars-' +
                                                    this.state.selectedItem.stars +
                                                    '.svg'
                                                }
                                            />
                                            <div>
                                                <Button type='button' color='link'>
                                                    {content.modal.product.buttons.details}
                                                </Button>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={1}>
                                        <FormGroup></FormGroup>
                                    </Col>
                                    <Col md={2}>
                                        <h5>{this.state.selectedItem.price}</h5>
                                    </Col>
                                </Row>
                                <Row className='p-3'>
                                    {/* Order Summary: Services Section Settings */}
                                    {this.state.selectedItem.mounting != null ? (
                                        <Col md={4} className='text-center'>
                                            <img
                                                alt=''
                                                src={
                                                    window._env_.PUBLIC_URL +
                                                    '/images/any-tv-partner-photo-services.jpg'
                                                }
                                                className='img-services'
                                            />
                                        </Col>
                                    ) : (
                                        <Col md={4} className='text-center'></Col>
                                    )}
                                    {this.state.selectedItem.mounting == null ? (
                                        <Col md={5}>
                                            <div className='product'>
                                                <h5>BXRetail Protection Plan</h5>
                                                <p>(2 Year)</p>
                                                <div>
                                                    <Button type='button' color='link'>
                                                        {this.state.selectedItem.protection.included}
                                                    </Button>
                                                </div>
                                            </div>
                                        </Col>
                                    ) : (
                                        <Col md={5}>
                                            <div className='product'>
                                                <h5>Delivery + Premium TV Mounting 56" and larger</h5>
                                                <p>(Mount, Connect, and Setup included)</p>
                                                <div>
                                                    <Button type='button' color='link'>
                                                        {this.state.selectedItem.protection.included}
                                                    </Button>
                                                </div>
                                            </div>
                                        </Col>
                                    )}
                                    <Col md={1}>
                                        <FormGroup></FormGroup>
                                    </Col>
                                    <Col md={1}>
                                        <h5>{this.state.selectedItem.servicesPrice}</h5>
                                    </Col>
                                </Row>
                                <Row className='p-3'>
                                    <Col md={4}></Col>
                                    <Col md={8}>
                                        <hr />
                                        <Row>
                                            <Col md={9} className='text-right'>
                                                <p>{content.modal.cart.labels.subtotal}</p>
                                                <p className='mt-2'>{content.modal.cart.labels.salesTax}</p>
                                                {  (this.state.selectedItem.finalTotal === content.productsClickable[0].discountTotal) && <p className='mt-2'>{content.modal.cart.labels.discount}</p>}
                                                <p className='mt-2'>
                                                    <strong>{content.modal.cart.labels.finalTotal}</strong>{' '}
                                                    {content.modal.confirmation.paymentMethod}
                                                </p>
                                            </Col>
                                            <Col md={2}>
                                                <p>{this.state.selectedItem.subtotal}</p>
                                                <p className='mt-2'>{this.state.selectedItem.salesTax}</p>
                                                { (this.state.selectedItem.finalTotal === content.productsClickable[0].discountTotal) && <p className='mt-2'>{content.productsClickable[0].discountAmount}</p>}
                                                <p className='mt-2'>
                                                    <strong>{this.state.selectedItem.finalTotal}</strong>
                                                </p>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col md={4}></Col>
                                </Row>
                                {this.state.selectedItem.mounting !== null && (
                                    <Row className='bg-light p-4'>
                                        <Col md={7}>
                                            <h4>{content.modal.confirmation.subtitle}</h4>
                                            <p>
                                                {content.modal.confirmation.scheduleDescription +
                                                    ' ' +
                                                    this.state.zipcode +
                                                    '.'}
                                            </p>
                                        </Col>
                                        <Col md={5}>
                                            <div className='text-right mt-4' style={{ paddingTop: '70px' }}>
                                                <Button type='button' color='link'>
                                                    {content.modal.confirmation.scheduleButtons.call}
                                                </Button>
                                                {/* <Button type="button" color="primary" className="ml-3" onClick={() => { this.toggleTabConfirmation("2"); }}>{content.modal.confirmation.scheduleButtons.online}</Button> */}
                                                <Button
                                                    type='button'
                                                    color='primary'
                                                    className='ml-3'>
                                                    {content.modal.confirmation.scheduleButtons.online}
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>
                                )}
                            </TabPane>
                            {/* <TabPane tabId="2"> // Consent mgmt. - NOT USED. CONSENT MGMT DEMO'D IN PROFILE UPDATES
                                <p className="text-center mt-4">
                                    <img src={window._env_.PUBLIC_URL + "/images/logo.svg"} alt="logo" />
                                </p>
                                <Row className="p-3">
                                    <Col md={4} className="text-center">
                                        <img alt="" src={window._env_.PUBLIC_URL + "/images/any-tv-partner-photo-services.jpg"} className="img-services mb-4" />
                                    </Col>
                                    <Col md={8} className="radio-form">
                                        <div className="product mb-4">
                                            <p>{content.modal.confirmation.consents.description1}</p>
                                            <p>{content.modal.confirmation.consents.description2}</p>
                                            <p>{content.modal.confirmation.consents.description3}</p>
                                        </div>
                                        <h5 className="mb-4">{content.modal.confirmation.consents.iAgree}</h5>
                                        {/* If you're getting delivery/installation, not sharing address doesn't make sense.
                                        <FormGroup>
                                        <Label>My Ship To/Installation Address</Label>
                                        <CustomInput type="radio" name="address" label="Yes" />
                                        <CustomInput type="radio" name="address" checked label="No" />
                                        </FormGroup>
                                        <FormGroup>
                                            <Label>{content.modal.confirmation.consents.phoneLabel}</Label>
                                            <CustomInput type="radio" name="phone" label="Yes" />
                                            <CustomInput type="radio" name="phone" checked label="No" />
                                        </FormGroup>
                                        <FormGroup>
                                            <Label>{content.modal.confirmation.consents.emailLabel}</Label>
                                            <CustomInput type="radio" name="email" label="Yes" />
                                            <CustomInput type="radio" name="email" checked label="No" />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <div className="text-right mt-2 mr-4 mb-4">
                                    <Button type="button" color="link" onClick={() => { this.toggleTabConfirmation("1"); }}>{content.modal.confirmation.consentButtons.cancel}</Button>
                                    <Button type="button" color="primary" className="ml-3" onClick={() => { this.toggleTabConfirmation("3"); }}>{content.modal.confirmation.consentButtons.save}</Button>
                                </div>
                            </TabPane> */}
                            {/* <TabPane tabId="3"> // Consent mgmt. confirmation - NOT USED. CONSENT MGMT DEMO'D IN PROFILE UPDATES
                                <p className="text-center mt-4">
                                    <img src={window._env_.PUBLIC_URL + "/images/logo.svg"} alt="logo" />
                                </p>
                                <div className="radio-form p-5">
                                    <div className="product mb-4">
                                        <p>{content.modal.confirmation.consents.confirmation}</p>
                                    </div>
                                    <FormGroup>
                                        <Label>My Ship To/Installation Address</Label>
                                        <CustomInput type="radio" name="address2" label="Yes" />
                                        <CustomInput type="radio" name="address2" checked label="No" />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>{content.modal.confirmation.consents.phoneLabel}</Label>
                                        <CustomInput type="radio" name="phone2" label="Yes" />
                                        <CustomInput type="radio" name="phone2" checked label="No" />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>{content.modal.confirmation.consents.emailLabel}</Label>
                                        <CustomInput type="radio" name="email2" label="Yes" />
                                        <CustomInput type="radio" name="email2" checked label="No" />
                                    </FormGroup>
                                    <div className="text-right mt-3">
                                        <Button type="button" color="primary" onClick={() => { this.toggleTabConfirmation("2"); }}>{content.modal.confirmation.consentButtons.changeSettings}</Button>
                                    </div>
                                </div>
                                <a alt="Confirmation Footer" href="/app/any-tv-partner"><img src={window._env_.PUBLIC_URL + "/images/shop-confirmation-footer-2.png"} className="confirmation-footer" alt="confirmation" /></a>
                            </TabPane> */}
                        </TabContent>
                    </ModalBody>
                </Modal>
                {/* <ModalRegister ref={this.modalRegister} /> */}
            </div>
        );
    }
}

Checkout.propTypes = {
    history: PropTypes.shape({
        push: PropTypes.func.isRequired
    }).isRequired

}

export default withRouter(Checkout);
