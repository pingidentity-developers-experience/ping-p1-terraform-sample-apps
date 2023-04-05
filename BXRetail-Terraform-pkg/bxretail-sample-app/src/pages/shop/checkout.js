import React from 'react';
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
import NavbarMain from '../../components/NavbarMain';
import WelcomeBar from '../../components/WelcomeBar';
import FooterMain from '../../components/FooterMain';
import AccountsSubnav from '../../components/AccountsSubnav';
import AccountsDropdown from '../../components/AccountsDropdown';
import PaymentTypeForm from '../../components/PaymentTypeForm';
import Session from '../../components/Utils/Session';
import AuthZ from '../../components/Controller/AuthZ';
import Registration from '../../components/Controller/Registration';
import Users from '../../components/Controller/Users';

// Data
import data from '../../data/shop/index.json';
import profileData from '../../data/dashboard/settings/profile.json';

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
            orderProcessingMsg: data.modal.loading.title,
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
                    orderProcessingMsg: data.modal.loading.finalizeOrder,
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

    openBankingRedirect() {
        // Make OAuth PAR request to BXFinance OAuth AS.
        // Take response of request_uri and redirect user to BXFinance authorization endpoint
        const cart = JSON.parse(this.session.getAuthenticatedUserItem('cart', 'session'));
        const price = cart.finalTotal.replace(/\$|,/g, '');
        this.session.setAuthenticatedUserItem('price', price, 'session');

        if (!this.state.acctFound) {
            // Store user id and email for account creation is user is a guest
            this.session.setAuthenticatedUserItem('storedUserId', this.state.userId, 'session');
            this.session.setAuthenticatedUserItem('storedEmail', this.state.email, 'session');
        }

        this.authz.pushAuthzRequest(price).then((response) => {
            const res = JSON.parse(response.additionalProperties.body);
            window.location.assign(this.envVars.REACT_APP_FINANCE_APP + '/as/authorization.oauth2?client_id=OB-PAR&request_uri=' + res.request_uri + '&scope=urn:banking:initiate_payment');
        });
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

        const checkoutType = this.session.getAuthenticatedUserItem('cartCheckoutType', 'session');

        if (checkoutType === 'bankAccount') {
            this.openBankingRedirect();
        } else {
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
    }

    async changeUIStep(stepNumber) {
        let IdP, userId;
        const authMode = this.session.getAuthenticatedUserItem('authMode', 'session');

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
            // this.setState({ step: stepNumber });
            this.setState({ lookupPending: true });
            const email = this.state.email ? this.state.email : this.session.getAuthenticatedUserItem('email', 'session');
            this.customerLookup(email)
                .then((lookupResponse) => {
                    //Promise will only resolve if there is a user record found. See customerLookup().
                    this.setState((state) => {
                        return { recordFound: true };
                    });
                    IdP = lookupResponse._embedded.users[0].identityProvider.type;
                    userId = lookupResponse._embedded.users[0].id;
                    this.setState({ userId: userId });
                    if (!this.session.isLoggedOut) {
                        this.getProfile(userId);
                        this.setState({ step: stepNumber, detailsPending: false, acctFound: true });
                    } else if (IdP.length && IdP === 'PING_ONE') {
                        this.signInToCheckout(email);
                    } else if (IdP.length && IdP !== 'PING_ONE') {
                        console.info('Customer has an external IdP (federated identity).');
                        // TODO UX question: Do we need to automate this federated login so when we kick off signin, we automatically redirect to their idp upon return with a flowId.
                        if (authMode === 'signInToCheckout' || authMode === 'login') {
                            this.getProfile(userId);
                            this.setState({ step: stepNumber, acctFound: true });
                        } else {
                            this.signInToCheckout();
                        }
                    }
                })
                .catch((error) => {
                    console.warn("We didn't find any user records with that email address/userName.");
                    this.setState({ step: stepNumber });
                    this.setState({ lookupPending: false, detailsPending: false, profilePending: false });
                });
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
            // TODO For #182366216 If sessionVar offerToCreateAcct = yes,
            // remove that session var, bounce back to checkOut() and all should fall in line.
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
        const redirectURI = this.envVars.REACT_APP_HOST + this.envVars.PUBLIC_URL + '/';
        this.authz.initAuthNFlow({
            grantType: 'authCode',
            clientId: this.envVars.REACT_APP_CLIENT,
            redirectURI: redirectURI,
            scopes: 'openid profile email p1:read:user p1:update:user p1:read:sessions p1:update:userMfaEnabled p1:create:device',
        });
    }

    customerLookup(email) {
        return new Promise((resolve, reject) => {
            this.users.userLookup(email).then((lookupResponse) => {
                // If user with password found in P1, resolve promise.
                if (lookupResponse.additionalProperties.existingUser === true) {
                    let response = lookupResponse.additionalProperties.rawResponse;
                    let jsonResponse = JSON.parse(response);
                    resolve(jsonResponse.matchedUsers);
                } else {
                    reject(lookupResponse);
                }
            });
        });
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
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.get('OpenBankingTransactionId')) {
            console.info('OpenBanking transaction approval completed in BXFinance');
            this.setState({
                orderProcessingMsg: data.modal.loading.finalizeOrder,
                isOpenLoading: true,
                userId: this.session.getAuthenticatedUserItem('storedUserId', 'session'),
            });
            // TODO For #182366216 Somewhere in here,
            // If session var offerToCreateAcct = true,
            // setState stepNumber = 5.
            //Else, continue on below as per usual.
            this.session.removeAuthenticatedUserItem('storedUserId', 'session');

            setTimeout(
                function () {
                    this.setState({ isOpenLoading: false });
                    this.toggleConfirmation();
                    this.clearShoppingCart();
                }.bind(this),
                3000
            );
        } else {
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
    }

    createAccount() {
        this.session.setAuthenticatedUserItem('authMode', 'registration', 'session');
        const redirectURI = this.envVars.REACT_APP_HOST + this.envVars.PUBLIC_URL + "/";
        this.authz.initAuthNFlow({ grantType: "authCode", clientId: this.envVars.REACT_APP_CLIENT, redirectURI: redirectURI, scopes: "openid profile email p1:read:user p1:update:user p1:read:sessions p1:update:userMfaEnabled p1:create:device" });
    }

    componentDidMount() {
        // clear abandoned/failed banking account payment key
        this.session.removeAuthenticatedUserItem('cartCheckoutType', 'session');

        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get('code');

        if (code) {
            const price = parseFloat(this.session.getAuthenticatedUserItem('price', 'session'));

            this.authz.swapCodeForTokenOB(code).then((response) => {
                console.info('Open Banking Payment Token -  you can use this token on the admin page to attempt to make an additional payment.', response.access_token);
                this.authz.openBankingApi(response.access_token, price).then((response) => {
                    if (response.success) {
                        this.toggleConfirmation();
                        this.clearShoppingCart();
                        if (!this.state.acctFound) {
                            this.setState({
                                userId: this.session.getAuthenticatedUserItem('storedUserId', 'session'),
                                email: this.session.getAuthenticatedUserItem('storedEmail', 'session'),
                            }, () => {
                                this.changeUIStep('5');
                                this.session.removeAuthenticatedUserItem('storedUserId', 'session');
                                this.session.removeAuthenticatedUserItem('storedEmail', 'session');
                            });
                        }
                    } else {
                        console.error('Bank payment failed', response);
                    }
                });
            });
        }

        // Checking if BXFinance payment authorization failed.
        if (queryParams.get('error') && queryParams.get('error') === 'access_denied') {
            console.info('Payment authorization at BXFinance was denied or failed.');
            this.addToCart(JSON.parse(this.session.getAuthenticatedUserItem('cart', 'session')));
            this.setState({
                step: '4',
                paymentError: true,
            });
            // Setting to true for subsequent attempts with BXFinance, user acct verified with first attempt
            this.acctVerified = true;
        } else {
        // Otherwise continue normal checkout process.
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
                            {Object.keys(data.subnav).map((key) => {
                                return <AccountsSubnav key={data.subnav[key].title} subnav={data.subnav[key]} />;
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
                                    {this.state.selectedItem.title} &raquo; {data.checkoutTitle}
                                </h4>
                                <AccountsDropdown text={data.dropdown} />
                            </div>
                            <div className='module'>
                                {/* Guest or sign in prompt */}
                                {this.state.step === '1' && (
                                    <div>
                                        <h4>{data.modal.prompt.title}</h4>
                                        <div dangerouslySetInnerHTML={{ __html: data.content }}></div>
                                        <Button color='link' onClick={this.signInToCheckout.bind(this)}>
                                            {data.modal.prompt.buttons.signin}
                                        </Button>
                                        <Button
                                            color='link'
                                            onClick={() => {
                                                this.changeUIStep('2');
                                            }}>
                                            {data.modal.prompt.buttons.checkout}
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
                                            <h4>{data.modal.emailPrompt.title}</h4>
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
                                                        __html: data.modal.emailPrompt.acctFound,
                                                    }}></div>
                                            )}
                                            {/* <FormGroup className="form-group-light"> */}
                                            <Label for='email'>{profileData.form.fields.email.label}</Label>
                                            <Input
                                                onChange={this.handleUserInput.bind(this)}
                                                required
                                                autoFocus={true}
                                                autoComplete='off'
                                                type='email'
                                                name='email'
                                                id='email'
                                                placeholder={profileData.form.fields.email.placeholder}
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
                                                    {profileData.form.buttons.submit}
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
                                                                {profileData.form.fields.firstname.label}
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
                                                                    profileData.form.fields.firstname.placeholder
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
                                                                {profileData.form.fields.lastname.label}
                                                            </Label>
                                                            <Input
                                                                onChange={this.handleUserInput.bind(this)}
                                                                required
                                                                type='text'
                                                                name='lastname'
                                                                id='lastname'
                                                                autoComplete='off'
                                                                placeholder={
                                                                    profileData.form.fields.lastname.placeholder
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
                                                                <Label for="fullname">{profileData.form.fields.fullname.label}</Label>
                                                                <Input onChange={this.handleUserInput.bind(this)} type="text" name="fullname" id="fullname" placeholder={profileData.form.fields.fullname.placeholder} value={this.state.fullname} />
                                                                </FormGroup>
                                                            </Col> */}
                                                    </Row>
                                                    <Row form>
                                                        <Col md={6} className="checkout-form">
                                                            {/* <FormGroup> */}
                                                            <Label for='email'>
                                                                {profileData.form.fields.email.label}
                                                            </Label>
                                                            <Input
                                                                readOnly
                                                                type='email'
                                                                name='email'
                                                                id='email'
                                                                autoComplete='off'
                                                                placeholder={profileData.form.fields.email.placeholder}
                                                                value={this.state.email}
                                                            />
                                                            {/* </FormGroup> */}
                                                        </Col>
                                                        <Col md={6} className="checkout-form">
                                                            {/* <FormGroup> */}
                                                            <Label for='phone'>
                                                                {profileData.form.fields.phone.label}
                                                            </Label>
                                                            <Input
                                                                onChange={this.handleUserInput.bind(this)}
                                                                required
                                                                type='tel'
                                                                name='phone'
                                                                id='phone'
                                                                autoComplete='off'
                                                                placeholder={profileData.form.fields.phone.placeholder}
                                                                value={this.state.phone}
                                                                pattern="^\+?([0-9]+){1,3}\.?([0-9]+){4,14}$"
                                                                maxLength="30"
                                                                title="US numbers must include area code with no special characters (e.g. 8778982905). International numbers should include their country code in the following format: +44.2071909105"
                                                            />
                                                            {/* </FormGroup> */}
                                                        </Col>
                                                        {/* <Col md={6}>
                                                                <FormGroup>
                                                                <Label for="birthdate">{profileData.form.fields.birthdate.label}</Label>
                                                                <Input onChange={this.handleUserInput.bind(this)} type="text" name="birthdate" id="birthdate" placeholder={profileData.form.fields.birthdate.placeholder} value={this.state.birthdate} />
                                                                </FormGroup>
                                                            </Col> */}
                                                    </Row>
                                                    <Row form>
                                                        <Col md={12} className="checkout-form">
                                                            {/* <FormGroup> */}
                                                            <Label for='street'>
                                                                {profileData.form.fields.street.label}
                                                            </Label>
                                                            <Input
                                                                onChange={this.handleUserInput.bind(this)}
                                                                required
                                                                type='text'
                                                                name='street'
                                                                id='street'
                                                                autoComplete='off'
                                                                placeholder={profileData.form.fields.street.placeholder}
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
                                                                {profileData.form.fields.city.label}
                                                            </Label>
                                                            <Input
                                                                onChange={this.handleUserInput.bind(this)}
                                                                required
                                                                type='text'
                                                                name='city'
                                                                id='city'
                                                                autoComplete='off'
                                                                placeholder={profileData.form.fields.city.placeholder}
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
                                                                {profileData.form.fields.zipcode.label}
                                                            </Label>
                                                            <Input
                                                                onChange={this.handleUserInput.bind(this)}
                                                                required
                                                                type='text'
                                                                name='zipcode'
                                                                id='zipcode'
                                                                autoComplete='off'
                                                                placeholder={
                                                                    profileData.form.fields.zipcode.placeholder
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
                                                                    <Label for="city">{profileData.form.fields.login.label}</Label>
                                                                    <Input type="select" name="login" id="login">
                                                                    <option value="mobile">{profileData.form.fields.login.options.mobile}</option>
                                                                    <option value="password">{profileData.form.fields.login.options.password}</option>
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
                                                                    {profileData.form.buttons.cancel}
                                                                </Button>
                                                                {/* <Button type="button" color="primary" onClick={this.props.onSubmit}>{profileData.form.buttons.submit}</Button> */}
                                                                <Button
                                                                    type='button'
                                                                    color='primary'
                                                                    onClick={() => {
                                                                        this.changeUIStep('4');
                                                                    }}>
                                                                    {profileData.form.buttons.submit}
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
                                                    {data.paymentProcessing.paymentErrorMsg}
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
                                                            {profileData.form.buttons.cancel}
                                                        </Button>
                                                        {/* <Button type="button" color="primary" onClick={this.props.onSubmit}>{profileData.form.buttons.submit}</Button> */}
                                                        <Button
                                                            type='button'
                                                            color='primary'
                                                            onClick={() => {
                                                                this.checkout();
                                                            }}>
                                                            {profileData.form.buttons.submit}
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
                                            {data.modal.acctPrompt.title}
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
                                                    {data.modal.acctPrompt.buttons.createAcct}
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
                                                {data.modal.acctPrompt.buttons.backToShop}
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
                                {data.modal.loading.help}
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
                                        <h4 className='pl-4'>{data.modal.confirmation.title}</h4>
                                        <p className='pl-4'>{this.state.selectedItem.confirmationSubtitle}</p>
                                    </Col>
                                    <Col md={2} className='text-right'>
                                        <div>
                                            <Button
                                                type='button'
                                                color='link'
                                                onClick={this.toggleConfirmation.bind(this)}>
                                                {this.state.acctFound ? data.modal.product.buttons.continue : data.modal.product.buttons.close}
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
                                                    {data.modal.product.buttons.details}
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
                                                <p>{data.modal.cart.labels.subtotal}</p>
                                                <p className='mt-2'>{data.modal.cart.labels.salesTax}</p>
                                                {  (this.state.selectedItem.finalTotal === data.productsClickable[0].discountTotal) && <p className='mt-2'>{data.modal.cart.labels.discount}</p>}
                                                <p className='mt-2'>
                                                    <strong>{data.modal.cart.labels.finalTotal}</strong>{' '}
                                                    {data.modal.confirmation.paymentMethod}
                                                </p>
                                            </Col>
                                            <Col md={2}>
                                                <p>{this.state.selectedItem.subtotal}</p>
                                                <p className='mt-2'>{this.state.selectedItem.salesTax}</p>
                                                { (this.state.selectedItem.finalTotal === data.productsClickable[0].discountTotal) && <p className='mt-2'>{data.productsClickable[0].discountAmount}</p>}
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
                                            <h4>{data.modal.confirmation.subtitle}</h4>
                                            <p>
                                                {data.modal.confirmation.scheduleDescription +
                                                    ' ' +
                                                    this.state.zipcode +
                                                    '.'}
                                            </p>
                                        </Col>
                                        <Col md={5}>
                                            <div className='text-right mt-4' style={{ paddingTop: '70px' }}>
                                                <Button type='button' color='link'>
                                                    {data.modal.confirmation.scheduleButtons.call}
                                                </Button>
                                                {/* <Button type="button" color="primary" className="ml-3" onClick={() => { this.toggleTabConfirmation("2"); }}>{data.modal.confirmation.scheduleButtons.online}</Button> */}
                                                <Button
                                                    type='button'
                                                    color='primary'
                                                    className='ml-3'>
                                                    {data.modal.confirmation.scheduleButtons.online}
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
                                            <p>{data.modal.confirmation.consents.description1}</p>
                                            <p>{data.modal.confirmation.consents.description2}</p>
                                            <p>{data.modal.confirmation.consents.description3}</p>
                                        </div>
                                        <h5 className="mb-4">{data.modal.confirmation.consents.iAgree}</h5>
                                        {/* If you're getting delivery/installation, not sharing address doesn't make sense.
                                        <FormGroup>
                                        <Label>My Ship To/Installation Address</Label>
                                        <CustomInput type="radio" name="address" label="Yes" />
                                        <CustomInput type="radio" name="address" checked label="No" />
                                        </FormGroup>
                                        <FormGroup>
                                            <Label>{data.modal.confirmation.consents.phoneLabel}</Label>
                                            <CustomInput type="radio" name="phone" label="Yes" />
                                            <CustomInput type="radio" name="phone" checked label="No" />
                                        </FormGroup>
                                        <FormGroup>
                                            <Label>{data.modal.confirmation.consents.emailLabel}</Label>
                                            <CustomInput type="radio" name="email" label="Yes" />
                                            <CustomInput type="radio" name="email" checked label="No" />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <div className="text-right mt-2 mr-4 mb-4">
                                    <Button type="button" color="link" onClick={() => { this.toggleTabConfirmation("1"); }}>{data.modal.confirmation.consentButtons.cancel}</Button>
                                    <Button type="button" color="primary" className="ml-3" onClick={() => { this.toggleTabConfirmation("3"); }}>{data.modal.confirmation.consentButtons.save}</Button>
                                </div>
                            </TabPane> */}
                            {/* <TabPane tabId="3"> // Consent mgmt. confirmation - NOT USED. CONSENT MGMT DEMO'D IN PROFILE UPDATES
                                <p className="text-center mt-4">
                                    <img src={window._env_.PUBLIC_URL + "/images/logo.svg"} alt="logo" />
                                </p>
                                <div className="radio-form p-5">
                                    <div className="product mb-4">
                                        <p>{data.modal.confirmation.consents.confirmation}</p>
                                    </div>
                                    <FormGroup>
                                        <Label>My Ship To/Installation Address</Label>
                                        <CustomInput type="radio" name="address2" label="Yes" />
                                        <CustomInput type="radio" name="address2" checked label="No" />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>{data.modal.confirmation.consents.phoneLabel}</Label>
                                        <CustomInput type="radio" name="phone2" label="Yes" />
                                        <CustomInput type="radio" name="phone2" checked label="No" />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>{data.modal.confirmation.consents.emailLabel}</Label>
                                        <CustomInput type="radio" name="email2" label="Yes" />
                                        <CustomInput type="radio" name="email2" checked label="No" />
                                    </FormGroup>
                                    <div className="text-right mt-3">
                                        <Button type="button" color="primary" onClick={() => { this.toggleTabConfirmation("2"); }}>{data.modal.confirmation.consentButtons.changeSettings}</Button>
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
export default withRouter(Checkout);
