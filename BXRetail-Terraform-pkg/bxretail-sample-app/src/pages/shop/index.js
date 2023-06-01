import React from 'react';
import PropTypes from 'prop-types';
import {
    Container,
    Row,
    Col,
    Button,
    Modal,
    TabContent,
    TabPane,
    Badge,
    ModalBody,
    FormGroup,
    CustomInput,
    Input,
} from 'reactstrap';
import { NavLink, withRouter } from 'react-router-dom';

// Components
import NavbarMain from '../../components/UI/NavbarMain';
import WelcomeBar from '../../components/UI/WelcomeBar';
import FooterMain from '../../components/UI/FooterMain';
import AccountsSubnav from '../../components/UI/AccountsSubnav';
import AccountsDropdown from '../../components/UI/AccountsDropdown';
import Session from '../../components/Utils/Session';
import Users from '../../components/Controller/Users';

// Content
import content from '../../content/shop/index.json';

// Styles
import '../../styles/pages/shop.scss';
// import { tsImportEqualsDeclaration } from '@babel/types';

class Shop extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      activeTab: '1',
      selectedItem: {
        protection: {},
        mounting: {}
      }
    };
    this.session = new Session();
    this.users = new Users();
    this.envVars = window._env_;
    this.hasCartInStorage = false;
  }
  onClosed() {
    this.setState({
      activeTab: '1'
    });
  }
  toggle() {
      this.setState({
        isOpen: !this.state.isOpen
      });
  }
  addToCart(item) {
    this.setState({
      isOpen: !this.state.isOpen,
      selectedItem: item
    }, () => {
      this.session.setAuthenticatedUserItem("cart", JSON.stringify(this.state.selectedItem), "session");
      this.hasCartInStorage = true;
    });
  }

  toggleTab(tab) {
    this.setState({
      activeTab: tab
    });
  }

  clearShoppingCart() {
    this.session.removeAuthenticatedUserItem("cart", "session");
    this.session.removeAuthenticatedUserItem("cartCheckoutType", "session");
    this.hasCartInStorage = false;
    this.setState({
      selectedItem: {
        protection: {},
        mounting: {}
      }});
    this.toggle();
  }

    checkout() {
        this.props.history.push({ pathname: 'shop/checkout', cartState: this.state.selectedItem });
    }

    componentDidMount() {
        this.hasCartInStorage =
            this.session.getAuthenticatedUserItem('cart', 'session') === null ||
            this.session.getAuthenticatedUserItem('cart', 'session') === 'undefined'
                ? false
                : true;
        const cartItem = JSON.parse(this.session.getAuthenticatedUserItem('cart', 'session'));
        if (this.hasCartInStorage) {
            this.setState({ selectedItem: cartItem });
        }
        // This is for the cart icon
        if (this.props.location.state?.action === 'showCart' && this.hasCartInStorage) {
            this.toggle();
        } else {
            console.warn('Cart Empty:', 'Nothing to display.');
        }
        if (this.session.getAuthenticatedUserItem('authMode', 'session') === 'signInToCheckout') {
            this.props.history.push('/shop/checkout');
        }
    }

    render() {
        // Temp. "thanks for registration msg"
        let regMessage;
        if (this.session.getAuthenticatedUserItem('regMessage', 'session')) {
            regMessage = this.session.getAuthenticatedUserItem('regMessage', 'session');
            this.session.removeAuthenticatedUserItem('regMessage', 'session');
        }

        if (this.session.getAuthenticatedUserItem('userData', 'session') && !this.session.getAuthenticatedUserItem('bxRetailUserType', 'session')) {
            this.session.removeAuthenticatedUserItem('userData', 'session');
            this.session.removeAuthenticatedUserItem('email', 'session');
        }
    
        return (
            <div className='dashboard accounts accounts-overview shop'>
                <NavbarMain toggleCart={this.toggle.bind(this)} />
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
                                <h1>{content.title}</h1>
                                <AccountsDropdown text={content.dropdown} />
                            </div>
                            <div className='module'>
                                <Row>
                                    {content.productsClickable.map((item, i) => {
                                        return (
                                            <Col md={4} key={i}>
                                                <div className='product'>
                                                    {item.featured && <Badge color='primary'>Best Value</Badge>}
                                                    <img
                                                        alt=''
                                                        src={window._env_.PUBLIC_URL + '/images/products/' + item.img}
                                                        className='img-fluid'
                                                    />
                                                    <h5>{item.title}</h5>
                                                    <img
                                                        alt=''
                                                        src={
                                                            window._env_.PUBLIC_URL +
                                                            '/images/icons/stars-' +
                                                            item.stars +
                                                            '.svg'
                                                        }
                                                    />
                                                    <p className='price'>
                                                        {item.price} <small>{item.tax}</small>
                                                    </p>
                                                    <p dangerouslySetInnerHTML={{ __html: item.content }}></p>
                                                    <Button color='primary' onClick={() => this.addToCart(item)}>
                                                        <img
                                                            alt=''
                                                            src={window._env_.PUBLIC_URL + '/images/icons/cart.svg'}
                                                        />{' '}
                                                        {item.button}
                                                    </Button>
                                                </div>
                                            </Col>
                                        );
                                    })}
                                    {content.products.map((item, i) => {
                                        return (
                                            <Col md={4} key={i}>
                                                <div className='product'>
                                                    {item.featured && <Badge color='primary'>Best Value</Badge>}
                                                    <img
                                                        alt=''
                                                        src={window._env_.PUBLIC_URL + '/images/products/' + item.img}
                                                        className='img-fluid'
                                                    />
                                                    <h5>{item.title}</h5>
                                                    <img
                                                        alt=''
                                                        src={
                                                            window._env_.PUBLIC_URL +
                                                            '/images/icons/stars-' +
                                                            item.stars +
                                                            '.svg'
                                                        }
                                                    />
                                                    <p className='price'>
                                                        {item.price} <small>{item.tax}</small>
                                                    </p>
                                                    <p dangerouslySetInnerHTML={{ __html: item.content }}></p>
                                                    <Button color='primary'>
                                                        <img
                                                            alt=''
                                                            src={window._env_.PUBLIC_URL + '/images/icons/cart.svg'}
                                                        />{' '}
                                                        {item.button}
                                                    </Button>
                                                </div>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            </div>
                            <img
                                alt=''
                                src={window._env_.PUBLIC_URL + '/images/products/pagination.png'}
                                className='img-fluid mb-3'
                            />
                        </div>
                    </div>
                </Container>
                <FooterMain />
                {/* Shopping Cart */}
                <Modal
                    isOpen={this.state.isOpen}
                    toggle={this.toggle.bind(this)}
                    onClosed={this.onClosed.bind(this)}
                    className='modal-xl modal-shop'
                    centered={true}>
                    <ModalBody>
                        <TabContent activeTab={this.state.activeTab}>
                            <TabPane tabId='1'>
                                {' '}
                                {/* Cart details */}
                                <Row>
                                    <Col>
                                        <h4>
                                            <img
                                                alt=''
                                                src={window._env_.PUBLIC_URL + '/images/icons/check-blue-circle.svg'}
                                                className='mx-3'
                                            />
                                            {content.modal.product.title}
                                        </h4>
                                    </Col>
                                    <Col className='text-right'>
                                        <div>
                                            <Button type='button' color='link'>
                                                {content.modal.product.buttons.cart}
                                            </Button>
                                        </div>
                                        <div>
                                            <Button type='button' color='link' onClick={this.toggle.bind(this)}>
                                                {content.modal.product.buttons.continue}
                                            </Button>
                                        </div>
                                        <div>
                                            <Button
                                                type='button'
                                                color='link'
                                                onClick={this.clearShoppingCart.bind(this)}>
                                                {content.modal.product.buttons.clearCart}
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>
                                <Row className='p-4 pt-md-0'>
                                    <Col md={5} className='text-center'>
                                        <img
                                            alt=''
                                            src={
                                                window._env_.PUBLIC_URL +
                                                '/images/products/' +
                                                this.state.selectedItem.img
                                            }
                                            className='img-fluid img-product'
                                        />
                                    </Col>
                                    <Col md={7} className='my-auto'>
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
                                            <p className='price'>
                                                {this.state.selectedItem.price}{' '}
                                                <small>{this.state.selectedItem.tax}</small>
                                            </p>
                                            <div>
                                                <Button type='button' color='link'>
                                                    {content.modal.product.buttons.details}
                                                </Button>
                                            </div>
                                            <div>
                                                <Button type='button' color='link'>
                                                    {content.modal.product.buttons.calculate}
                                                </Button>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                {/* Cart: Protection Section Settings */}
                                <Row className='bg-light p-4'>
                                    <Col md={7}>
                                        <h4>{this.state.selectedItem.protection.title}</h4>
                                        <p
                                            dangerouslySetInnerHTML={{
                                                __html: this.state.selectedItem.protection.content,
                                            }}></p>
                                    </Col>
                                    <Col md={5} className='my-auto'>
                                        <FormGroup className='mt-3'>
                                            <CustomInput
                                                id='protection_options'
                                                readOnly
                                                type='radio'
                                                name='protection_options'
                                                checked={this.state.selectedItem.mounting == null}
                                                className='mt-2'
                                                label={this.state.selectedItem.protection.option1}
                                            />
                                            <CustomInput
                                                id='protection_options'
                                                type='radio'
                                                name='protection_options'
                                                className='mt-2'
                                                label={this.state.selectedItem.protection.option2}
                                            />
                                        </FormGroup>
                                        {this.state.selectedItem.mounting == null && (
                                            <div className='text-right mt-4' style={{ paddingTop: '70px' }}>
                                                <Button type='button' color='link'>
                                                    {content.modal.product.buttons.skip}
                                                </Button>
                                                <Button
                                                    type='button'
                                                    color='primary'
                                                    className='ml-3'
                                                    onClick={() => {
                                                        this.toggleTab('2');
                                                    }}>
                                                    {this.state.selectedItem.servicesButton}
                                                </Button>
                                            </div>
                                        )}
                                    </Col>
                                </Row>
                                {/* Cart: Mounting Section Settings */}
                                {this.state.selectedItem.mounting != null && (
                                    <Row className='p-4'>
                                        <Col md={7}>
                                            <h4>{this.state.selectedItem.mounting.title}</h4>
                                            <p
                                                dangerouslySetInnerHTML={{
                                                    __html: this.state.selectedItem.mounting.content,
                                                }}></p>
                                            <img
                                                alt=''
                                                src={
                                                    window._env_.PUBLIC_URL +
                                                    '/images/any-tv-partner-photo-services.jpg'
                                                }
                                                className='img-services'
                                            />
                                        </Col>
                                        <Col md={5} className='my-auto'>
                                            <FormGroup className='mt-3'>
                                                <CustomInput
                                                    readOnly
                                                    id='mounting_options'
                                                    type='radio'
                                                    name='mounting_options'
                                                    checked
                                                    label={this.state.selectedItem.mounting.option1}
                                                />
                                                <NavLink to='#' className='ml-4'>
                                                    <small>{this.state.selectedItem.mounting.included}</small>
                                                </NavLink>
                                                <CustomInput
                                                    id='mounting_options'
                                                    type='radio'
                                                    name='mounting_options'
                                                    className='mt-2'
                                                    label={this.state.selectedItem.mounting.option2}
                                                />
                                                <NavLink to='#' className='ml-4'>
                                                    <small>{this.state.selectedItem.mounting.included}</small>
                                                </NavLink>
                                            </FormGroup>
                                            <div className='text-right mt-4'>
                                                <Button type='button' color='link'>
                                                    {content.modal.product.buttons.skip}
                                                </Button>
                                                <Button
                                                    type='button'
                                                    color='primary'
                                                    className='ml-3'
                                                    onClick={() => {
                                                        this.toggleTab('2');
                                                    }}>
                                                    {this.state.selectedItem.servicesButton}
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>
                                )}
                            </TabPane>
                            {/* Order Summary */}
                            <TabPane tabId='2'>
                                <Row>
                                    <Col>
                                        <h4 className='pl-4'>{content.modal.cart.title}</h4>
                                    </Col>
                                    <Col className='text-right'>
                                        <div>
                                            <Button type='button' color='link' onClick={this.toggle.bind(this)}>
                                                {content.modal.product.buttons.continue}
                                            </Button>
                                        </div>
                                        <div>
                                            <Button
                                                type='button'
                                                color='link'
                                                onClick={this.clearShoppingCart.bind(this)}>
                                                {content.modal.product.buttons.clearCart}
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
                                        <FormGroup>
                                            <Input readOnly type='number' value='1' />
                                        </FormGroup>
                                    </Col>
                                    <Col md={1}>
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
                                                        {this.state.selectedItem.mounting.included}
                                                    </Button>
                                                </div>
                                            </div>
                                        </Col>
                                    )}
                                    <Col md={1}>
                                        <FormGroup>
                                            <Input readOnly type='number' value='1' />
                                        </FormGroup>
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
                                            <Col md={6}></Col>
                                            <Col md={3} className='text-right'>
                                                <p>{content.modal.cart.labels.subtotal}</p>
                                                <p className='mt-2'>{content.modal.cart.labels.salesTax}</p>
                                                <p className='mt-2'>
                                                    <strong>{content.modal.cart.labels.finalTotal}</strong>
                                                </p>
                                            </Col>
                                            <Col md={2}>
                                                <p>{this.state.selectedItem.subtotal}</p>
                                                <p className='mt-2'>{this.state.selectedItem.salesTax}</p>
                                                <p className='mt-2'>
                                                    <strong>{this.state.selectedItem.finalTotal}</strong>
                                                </p>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                                {this.state.selectedItem.mounting != null ? (
                                    <div className='text-right mt-2 mr-4 mb-4'>
                                        <Button type='button' color='link'>
                                            {content.modal.cart.buttons.update}
                                        </Button>
                                        <Button
                                            type='button'
                                            color='primary'
                                            className='ml-3'
                                            onClick={() => {
                                                this.checkout();
                                            }}>
                                            {content.modal.cart.buttons.checkout}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className='text-right mt-2 mr-4 mb-4'>
                                        <Button type='button' color='link'>
                                            {content.modal.cart.buttons.update}
                                        </Button>
                                        <Button
                                            type='button'
                                            color='primary'
                                            className='ml-3'
                                            onClick={() => {
                                                this.checkout();
                                            }}>
                                            {content.modal.cart.buttons.checkout}
                                        </Button>
                                    </div>
                                )}
                            </TabPane>
                        </TabContent>
                    </ModalBody>
                </Modal>
                {/* <ModalRegister ref={this.modalRegister} /> */}
            </div>
        );
    }
}

Shop.propTypes = {
    location: PropTypes.shape({
      state: PropTypes.string
    }),
    history: PropTypes.shape({
      push: PropTypes.func.isRequired
    }).isRequired
}

export default withRouter(Shop);
