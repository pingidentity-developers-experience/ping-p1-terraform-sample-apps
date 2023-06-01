import React from 'react';
import PropTypes from 'prop-types';
import { Col, FormGroup, Input, Label, Row} from 'reactstrap';

import content from './content.json'

class CreditCardForm extends React.Component {

    constructor() {
        super();

        // Create a CC expiration date 2 years from now so we don't have to maintain this.
        const currentYear = new Date().getFullYear();
        const expYear = currentYear + 2;
        const expYearStr = expYear.toString();
        const twoDigitExpYear = expYearStr.substring(2);
        const newExpDate = "02/" + twoDigitExpYear;

        this.state = {
            expDate: newExpDate,
        };
    }

    render() {
        return (
            <FormGroup>
                <Row className="mt-3 ml-2">
                    <Col>
                        <Label for="creditCardNumber">{content.creditCardNumberLabel}</Label>
                        <Input id="creditCardNumber" onChange={e => e.preventDefault()} value="4111 1111 1111 1111" />
                    </Col>
                </Row>
                <Row className="mt-1 ml-2">
                    <Col xs={12} sm={4}>
                        <Label for="creditCardExpiration">{content.expirationLabel}</Label>
                        <Input id="creditCardExpiration" onChange={e => e.preventDefault()} value={this.state.expDate} />
                    </Col>
                    <Col xs={12} sm={4}>
                        <Label for="creditCardCvv">{content.cvvLabel}</Label>
                        <Input id="creditCardCvv" onChange={e => e.preventDefault()} value="123" />
                    </Col>
                    <Col xs={12} sm={4}>
                        <Label for="creditCardPostalCode">{content.postalCodeLabel}</Label>
                        <Input id="creditCardPostalCode" onChange={e => e.preventDefault()} value={this.props.postalCode || "12345"} />
                    </Col>
                </Row>
            </FormGroup>
        );
    }
}

CreditCardForm.propTypes = {
    postalCode: PropTypes.string
}

export default CreditCardForm;