import React from 'react';
import PropTypes from 'prop-types';
import { Col, CustomInput, FormGroup, Row } from 'reactstrap';

import CreditCardForm from '../CreditCardForm';

import './PaymentTypeForm.scss';
import data from './data.json'
import DiscoverIcon from './DiscoverIcon';
import VisaIcon from './VisaIcon';
import AmericanExpressIcon from './AmericanExpressIcon';
import MasterCardIcon from './MasterCardIcon';

class PaymentTypeForm extends React.Component {
    render() {
        return (
            <FormGroup className="select-payment-type">
                <h4>{data.title}</h4>
                <div className="payment-type" style={{ backgroundColor: this.props.checkoutType === 'creditCard' ? '#f3f3f3' : '#ffffff'}}>
                    <Row>
                        <Col className="credit-card-radio">
                            <CustomInput id="cart_options1" type="radio" name="cart_options" value="creditCard" onChange={this.props.onCheckoutTypeChange} checked={this.props.checkoutType === 'creditCard'} label={data.option1} />
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
                                <CustomInput id="cart_card_option1" type="radio" name="card_options" value="newCard" readOnly checked label={data.cardOnFile}></CustomInput>
                                <CustomInput id="cart_card_option1" type="radio" name="card_options" value="newCard" readOnly label={data.newCreditCard}></CustomInput>
                            </FormGroup>}
                    </>}
                </div>
                <div className="payment-type">
                    <CustomInput id="cart_options3" type="radio" name="cart_options" readOnly onClick={(event) => event.preventDefault()} className="mt-2" label={data.option3} />
                </div>
                <div className="payment-type">
                    <CustomInput id="cart_options4" type="radio" name="cart_options" readOnly onClick={(event) => event.preventDefault()} className="mt-2" label={data.option4} />
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