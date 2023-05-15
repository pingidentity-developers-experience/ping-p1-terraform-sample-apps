import React from 'react';
import PropTypes from 'prop-types';
import { Col, CustomInput, FormGroup, Row } from 'reactstrap';

import CreditCardForm from '../CreditCardForm';

import './PaymentTypeForm.scss';
import content from './content.json'
import DiscoverIcon from './DiscoverIcon';
import VisaIcon from './VisaIcon';
import AmericanExpressIcon from './AmericanExpressIcon';
import MasterCardIcon from './MasterCardIcon';

class PaymentTypeForm extends React.Component {
    render() {
        return (
            <FormGroup className="select-payment-type">
                <h4>{content.title}</h4>
                <div className="payment-type" style={{ backgroundColor: this.props.checkoutType === 'creditCard' ? '#f3f3f3' : '#ffffff'}}>
                    <Row>
                        <Col className="credit-card-radio">
                            <CustomInput id="cart_options1" type="radio" name="cart_options" value="creditCard" onChange={this.props.onCheckoutTypeChange} checked={this.props.checkoutType === 'creditCard'} label={content.option1} />
                        </Col>
                        <Col className='credit-card-icons align-right'>
                            <VisaIcon />
                            <MasterCardIcon />
                            <DiscoverIcon />
                            <AmericanExpressIcon />
                        </Col>
                    </Row>
                    {this.props.checkoutType === 'creditCard' &&
                    <>
                        {this.props.guestUser ?
                            <CreditCardForm postalCode={this.props.postalCode} /> :
                            <FormGroup className="mt-3 ml-2">
                                <CustomInput id="cart_card_option1" type="radio" name="card_options" value="newCard" readOnly checked label={content.cardOnFile}></CustomInput>
                                <CustomInput id="cart_card_option1" type="radio" name="card_options" value="newCard" readOnly label={content.newCreditCard}></CustomInput>
                            </FormGroup>}
                    </>}
                </div>
                <div className="payment-type">
                    <CustomInput id="cart_options3" type="radio" name="cart_options" readOnly onClick={(event) => event.preventDefault()} className="mt-2" label={content.option3} />
                </div>
                <div className="payment-type">
                    <CustomInput id="cart_options4" type="radio" name="cart_options" readOnly onClick={(event) => event.preventDefault()} className="mt-2" label={content.option4} />
                </div>
            </FormGroup>
        );
    }
}

PaymentTypeForm.propType = {
    checkoutType: PropTypes.oneOf(['', 'creditCard', 'bankAccount']).isRequired,
    onCheckoutTypeChange: PropTypes.func.isRequired,
    guestUser: PropTypes.bool.isRequired,
    postalCode: PropTypes.string.isRequired
}

export default PaymentTypeForm;