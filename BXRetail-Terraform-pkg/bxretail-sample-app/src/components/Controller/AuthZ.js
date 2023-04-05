// Components
import DaVinci from "../Integration/DaVinci";
import PingOneAuthZ from "../Integration/PingOneAuthZ";
import Session from "../Utils/Session";
import Tokens from "../Utils/Tokens";

/**
 Class representing authorization flows via PingOne.
 This demo-specific class is developed and maintained by Ping Identity Technical Enablement.
 Implements methods to integrate with PingOne and PingAuthorize-related API endpoints.
*/

class AuthZ {
    /**
    Class constructor
    */
    constructor() {
        this.envVars = window._env_;
        this.ping1AuthZ = new PingOneAuthZ(this.envVars.REACT_APP_AUTHPATH, this.envVars.REACT_APP_ENVID, this.envVars.REACT_APP_PROXYAPIPATH);
        // this.atvpPath = this.envVars.REACT_APP_ATVPAUTHPATH + '/' + this.envVars.REACT_APP_ATVP_ENVID;
        // this.ping1AuthZATVP = new PingOneAuthZ(this.atvpPath, this.envVars.REACT_APP_ENVID);
        this.session = new Session();
        this.tokens = new Tokens();
        this.davinci = new DaVinci();
    }

    /**
    Authentication Flow:
    Initializes the authentication flow.

    @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#openid-connectoauth-2
    @param {string} grantType The OAuth grant type to be used.
    @param {string} clientId The OAuth client from which you want to authorize.
    @param {string} redirectURI The URI the OAuth client should send you back to after completing OAuth authZ.
    @param {string} scopes The app or OIDC scopes being requested by the client.
    */
    initAuthNFlow({ grantType, clientId, redirectURI, scopes, authPath }) {
        console.info('Controller.AuthZ', 'Initializing an authorization flow with PingOne.');

        if (grantType !== 'implicit' && grantType !== 'authCode') {
            throw new Error('Invalid grant type provided. Controller.AuthZ.');
        }

        const responseType = grantType === 'implicit' ? 'token' : 'code';
        if (!authPath) {
            this.ping1AuthZ.authorize({
                responseType: responseType,
                clientId: clientId,
                redirectURI: redirectURI,
                scopes: scopes,
            });
        } 
        // else {
        //     this.ping1AuthZATVP.authorize({
        //         responseType: responseType,
        //         clientId: clientId,
        //         redirectURI: redirectURI,
        //         scopes: scopes,
        //     });
        // }
    }

    /**
    OAuth Token:
    Swap an authZ code for an access and ID token.

    @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#post-token-authorization_code
    @param {string} code authorization code from AS.
    @param {string} redirectURI App URL user should be redirected to after swap for token.
    @returns {object} response
    */

    async swapCodeForToken({ code, redirectURI, authMode, clientId }) {
        console.info('Controller.AuthZ', 'Swapping an auth code for an access token.');

        let authPath;

        // if (authMode === 'ATVP') {
        //     authPath = this.envVars.REACT_APP_ATVPAUTHPATH;
        // }
        
        let bauth;
        if (!authPath) {
            bauth = this.envVars.REACT_APP_CLIENT + ':' + this.envVars.REACT_APP_RECSET;
        } else {
            bauth = this.envVars.REACT_APP_ATVP_CLIENT + ':' + this.envVars.REACT_APP_ATVP_RECSET;
        }
        const swaprods = btoa(bauth);

        let response;
        if (!authPath) {
            response = await this.ping1AuthZ.getToken({ code: code, redirectURI: redirectURI, swaprods: swaprods, clientId: clientId });
        } 
        // else {
        //     response = await this.ping1AuthZATVP.getToken({ code: code, redirectURI: redirectURI, swaprods: swaprods });
        // }
        return response;
    }

    /**
    Pushed Authorization Endpoint
    Get the request_uri from the PAR endpoint.

    @see https://docs.pingidentity.com/bundle/pingfederate-110/page/xhc1600191675423.html
    @param {string} price Price of item user is purchasing.
    @returns {object} Response object containing request_uri.
    */
    async pushAuthzRequest(price) {
        console.info('Controller.AuthZ', 'Getting request_uri from the PAR endpoint.');

        let body = {
            financeHost: this.envVars.REACT_APP_FINANCE_APP,
            response_type: 'code',
            scope: 'urn:banking:initiate_payment',
            authorization_request: {
                paymentAmount: price,
                audience: 'https://api.bxfinance.org/payments',
                creditorName: 'BXRetail',
                bxrApp: this.envVars.REACT_APP_HOST
            },
        };

        const rawPayload = JSON.stringify(body);

        const response = await this.davinci.pushAuthzRequest({ rawPayload: rawPayload });
        return response;
    }

    /**
    Swap Code for Token (BXF PingFederate - OpenBanking):
    Swaps an OAuth code for an OAuth access token.

    @param {string}  base64 encoded client credentials. 
    @return {string} JSON web token.
    */
    async swapCodeForTokenOB(code) {
        console.info('Controller.AuthZ', 'Swapping authorization code for access token');

        const token = await this.ping1AuthZ.swapCodeForToken(
            code,
            this.envVars.REACT_APP_FINANCE_APP,
            this.envVars.REACT_APP_HOST
        );
        return token;
    }

    /**
    OpenBanking API Flow :
    OpenBanking API flow updates the account balances.

    @param {string} token Access token
    @param {string} price Amount to be deducted from account
    @returns {object} Response object
    */
    async openBankingApi(token, price) {
        console.info('Controller.AuthZ', 'Getting request_uri from the PAR endpoint.');

        let body = {
            financeHost: this.envVars.REACT_APP_FINANCE_APP,
            token: token,
            audience: 'https://api.bxfinance.org/payments',
            creditorName: 'BXRetail',
            price: price,
        };

        const rawPayload = JSON.stringify(body);

        const response = await this.davinci.openBankingApi({ rawPayload: rawPayload });
        return response;
    }
}

export default AuthZ;