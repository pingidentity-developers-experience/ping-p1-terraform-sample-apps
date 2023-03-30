/**
 * Demo Admin UI
 *
 * This class renders admin controls to assist sales in setting up certain demo use cases.
 *
 * @author Michael Sanchez
 */

import React from 'react';

// Packages
import { Button, Form, FormGroup, Input, Label, Table } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

//Imports
import AuthZ from '../components/Controller/AuthZ';
import DaVinciFlows from '../components/Controller/DavinciFlows';
import NavbarMain from '../components/NavbarMain';
import Session from '../components/Utils/Session';
import WelcomeBar from '../components/WelcomeBar';

//Data
// Styles
import '../styles/pages/admin.scss';

class DemoAdmin extends React.Component {
    constructor() {
        super();

        this.envVars = window._env_;
        this.session = new Session();
        this.demoAction.bind(this);
        this.state = {
            actionSuccess: false, // Whether to display the success message.
            actionFailure: false, // Whether to display the fail message.
            errorMessage: 'There was an unexpected error.', // Default failure message. Your admin function should update this accordingly.
            actionInProgress: false, //Managed by demoAction().
            buttonDisabled: false, // Managed by demoAction(). We want other admin action buttons disabled while another action executes.
            paymentToken: '', // OB Payment Token to make a call
            paymentAmount: '',
            paymentSuccessful: false,
            paymentResponse: '',
        };

        this.session = new Session();
        this.authz = new AuthZ();
        this.davinciFlows = new DaVinciFlows(window._env_);

        // TODO Concept: Developers can simply add an admin feature name with details and action key/value pairs then implement a method with a matching name.
        // This page will build the UI for every feature listed in this object and wire it up to buttons to execute.
        // See componentDidMount.
        // this.AdminFeatures = {
        //     obliterateUser: {
        //         details:
        //             'This option deletes the entire existence of the user you are logged in as, from all subsystems for BXFinance. This allows you to recycle this user and start fresh with your user persona and journey, from unknown to authorized. This cannot be undone.',
        //         action: 'Delete Me',
        //     },
        //     setBalanceTransferThresholds: {
        //         details:
        //             'This is a potential feature we will implement soon to make the balance transfer demo more dynamic. This could have a method that would pop a modal UI to collect dollar thresholds; min/max for CIBA, max for denial.',
        //         action: 'Set Transfer Thresholds',
        //     },
        // };
    }

    /**
     * demoAction
     * Handles execution of any admin features implemented as well as the UI updates.
     * Action buttons for your admin feature just need to call this method wtih an onClick. Don't need to pass anything.
     * Your action button needs an id attribute where the value is the same as your method that implements your admin feature.
     * Search for "obliterateUser" in the code for an example.
     * @param {object} e event object natively sent by event handler on your action button.
     */
    demoAction(e) {
        console.info('admin.js', 'Executing action: ' + e.target.id);

        const bxHost = this.envVars.REACT_APP_HOST;

        const targetFeature = e.target.id.trim();
        let actionStates = {};
        actionStates[targetFeature] = true;
        actionStates['buttonDisabled'] = true;
        this.setState(actionStates);

        switch (targetFeature) {
            case 'obliterateUser':
                this.obliterateUser(bxHost);
                break;
            default:
                console.warn('Unexpected case: ', 'We received "' + targetFeature + '"');
        }
    }

    //  All demo admin functions should end with calling this method to send the user
    // back from whence they came, or where they need to be.
    redirectOnSuccess(URI, delayInMilliseconds) {
        console.info('admin.js', 'Redirecting user to ' + URI);
        window.setTimeout(() => {
            window.location.assign(URI);
        }, delayInMilliseconds);
    }

    // Removes all existence of the user from all BXF subsystems.
    obliterateUser(bxHost) {
        this.setState({ actionInProgress: true });
        let payload;

        //Unlike PD for BXH and BXF, there is no concept of escalated scopes to delete a user in P1 for BXR. It's done with WorkerApps.
        // So we just use the bearer token we already have.
        const accessToken = this.session.getAuthenticatedUserItem('AT', 'session');

        payload = { accessToken: accessToken, bxHost: bxHost };
        // You can swap the above line for this one for fault injection. Test a DV fail in final user delete.
        // payload = { accessToken: this.session.getAuthenticatedUserItem('AT'), bxHost: bxHost };
        this.davinciFlows.callDaVinciAPIFlow(
                this.envVars.REACT_APP_DAVINCI_DELETE_USER_API_KEY,
                this.envVars.REACT_APP_DAVINCI_DELETE_USER_POLICYID,
                payload
            ).then((deleteResponse) => {
                console.log('deleteResponse', JSON.stringify(deleteResponse));
                if (deleteResponse?.success) {
                    this.setState({ actionSuccess: true, actionInProgress: false });
                    this.session.clearUserAppSession('all');
                    const url = window._env_.REACT_APP_HOST + window._env_.PUBLIC_URL + '/';
                    this.redirectOnSuccess(url, 5000);
                } else {
                    this.setState({
                        actionFailure: true,
                        errorMessage: deleteResponse.additionalProperties.errorBody.message,
                    });
                    console.warn(
                        deleteResponse.additionalProperties.errorBody.details[0].code,
                        deleteResponse.additionalProperties.errorBody.details[0].message
                    );
                }
            });
    }

    attemptOpenBankingPayment(e) {
        e.preventDefault();
        this.setState({paymentSuccessful: false, paymentResponse: ''});

        this.authz.openBankingApi(this.state.paymentToken, +this.state.paymentAmount)
            .then(response => {
                if (response.success) {
                    // Should never be hit unless we allow users to not complete a payment after redirect to back to BXR
                    this.setState({paymentSuccessful: true, paymentResponse: 'Payment successful!'})
                } else {
                    let reason = ''
                    const reasonJson = JSON.parse(response.additionalProperties?.reason);
                    for (const [, value] of Object.entries(reasonJson)) {
                        if (value?.[0]?.payload) {
                            reason = value[0].payload;
                            break;
                        }
                    }
                    this.setState({paymentSuccessful: false, paymentResponse: 'Payment failed: ' + reason})
                }
            });
    }

    componentDidMount() {
        this.setState({ userFirstName: this.session.getAuthenticatedUserItem('firstName', 'session') || 'Guest' });
        // TODO Implementation goes here for this.AdminFeatures object above. See comments.
    }

    render() {
        return (
            <div id='jsxContainer'>
                <NavbarMain />
                <WelcomeBar welcomeMessage='Welcome to The Demo Admin' firstName={this.state.userFirstName} />
                <div className='content'>
                    {!this.session.isLoggedOut &&
                        <div className='module-admin'>
                            {/* Success msg is just generic standard message. Didn't see need for customizing */}
                            {this.state.actionSuccess && (
                                <div className='successMsg'>
                                    Success! Your administrative action was completed. We're sending you home.
                                </div>
                            )}
                            {this.state.actionFailure && <div className='successMsg'>{this.state.errorMessage}</div>}
                            <Table hover size='sm' responsive>
                                <thead>
                                    <tr>
                                        <th style={{ width: '20%' }}>Option</th>
                                        <th style={{ width: '65%' }}>Details</th>
                                        <th style={{ width: '15%' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Obliterate My User</td>
                                        <td>
                                            This option deletes the entire existence of the user you are logged in as, from
                                            all subsystems for this BX application. This allows you to recycle this user and start
                                            fresh with your user persona and journey, from unknown to authorized.
                                            <span style={{ fontWeight: 'bold', color: 'red' }}>
                                                {' '}
                                                This cannot be undone.
                                            </span>
                                        </td>
                                        <td>
                                            {(this.state.actionInProgress && (
                                                <div
                                                    className='spinner'
                                                    style={{ textAlign: 'center', paddingBottom: '15px' }}>
                                                    <FontAwesomeIcon icon={faCircleNotch} size='3x' className='fa-spin' />
                                                </div>
                                            )) || (
                                                <Button
                                                    disabled={this.state.buttonDisabled}
                                                    className='adminBtn'
                                                    id='obliterateUser'
                                                    onClick={this.demoAction.bind(this)}
                                                    color='primary'>
                                                    Delete Me
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    }
                    <div className='module-admin'>
                        <h4>Manual Open Banking Payment</h4>
                        <p>
                            Use this form to attempt to make a payment against the Open Banking API DaVinci flow manually.
                            This will normally fail and is used to demo if a bad actor hijacks a Payment Token and tries to 
                            use it to make an additional payment after a transaction is claimed. You can get a payment token
                            by opening dev tools and completing an Open Banking transaction, when you come back to BXRetail from 
                            BXFinance you should see payment token printed in the console.
                        </p>
                        <Form onSubmit={this.attemptOpenBankingPayment.bind(this)}>
                            <FormGroup>
                                <Label for='payment-token'>Open Banking Payment Token</Label>
                                <Input type='textarea'
                                    id='payment-token'
                                    name='payment-token'
                                    value={this.state.paymentToken}
                                    onChange={e => this.setState({paymentToken: e.target.value})} 
                                    required            
                                    />
                            </FormGroup>
                            <FormGroup>
                                <Label for='payment-amount'>Payment Amount</Label>
                                <Input type='number'
                                    id='payment-amount'
                                    name='payment-amount'
                                    value={this.state.paymentAmount}
                                    onChange={e => this.setState({paymentAmount: e.target.value})} 
                                    title='Payment amount should be greater than .01 to submit a payment'
                                    min='0.01'
                                    step='0.01'
                                    required            
                                    />
                            </FormGroup>
                            <Button color='primary' className='adminBtn mb-3' type='submit'>Make Payment</Button>
                            {this.state.paymentResponse && 
                                <p className={this.state.paymentSuccessful ? 'text-success' : 'text-danger'}>{this.state.paymentResponse}</p>
                            }
                        </Form>
                    </div>
                </div>
            </div>
        );
    }
}
export default DemoAdmin;
