// Import OIDC SDK
import { OidcClient } from '@pingidentity-developers-experience/ping-oidc-client-sdk';
import Session from "../Utils/Session";
import Tokens from "../Utils/Tokens";

/**
 Class representing authorization business logic and payload prep for PingOne authorization API
 calls using the Ping Identity OIDC SDK.
 This demo-specific class is developed and maintained by Ping Identity Technical Enablement.
 Implements methods to integrate with the Ping Identity OIDC SDK.
 @author Ping Identity Technical Enablement
 @see https://www.npmjs.com/package/@pingidentity-developers-experience/ping-oidc-client-sdk
*/

class AuthZ {
    /**
    Class constructor
    Declares and sets demo environment variables from our window object.
    */
    constructor() {
        this.envVars = window._env_;
        this.session = new Session();
        this.tokens = new Tokens();
    }

    /**
    Initialize an authorization request. Process the request to call the authorization endpoint.
    @param {string} grantType The OAuth grant type to be used.
    @param {string} clientId The OAuth client from which you want to authorize.
    @param {string} redirectURI The URI the OAuth client should send you back to after completing OAuth authZ.
    @param {string} scopes The app or OIDC scopes being requested by the client.
    */
    async initSdk(tokenAvailableCallback = null) {
        console.info('Controller.AuthZ', 'Initializing OIDC SDK.');
        const redirectURI = this.envVars.REACT_APP_HOST + this.envVars.PUBLIC_URL + "/";
        // Configure OIDC SDK client options
        const clientOptions = {
            clientId: this.envVars.REACT_APP_CLIENT,
            redirectUri: redirectURI,
            scope: 'openid profile email p1:read:user p1:update:user p1:read:sessions p1:update:userMfaEnabled p1:create:device',
            tokenAvailableCallback: tokenAvailableCallback
        };
        // Initialize the library using an authentication server's well-known endpoint. Note this takes in the base url of the auth server, not the well-known endpoint itself. '/.well-known/openid-configuration' will be appended to the url by the SDK.
        const oidcClient = await OidcClient.initializeFromOpenIdConfig(`https://auth.pingone.com/${this.envVars.REACT_APP_ENVID}/as`, clientOptions);
        return oidcClient;
    }

    /**
    Initialize an authorization request. Process the request to call the authorization endpoint.
    */
    async initAuthNFlow() {
        console.info('Controller.AuthZ', 'Initializing an authorization flow using OIDC SDK.');
        const oidcClient = await this.initSdk();
        oidcClient.authorize(/* optional login_hint */);
    }

    /**
    Get OAuth Token:
    Use authZ code to get an access and ID token.
    @param {function} historyPush React router function to manipulate history stack.
    @param {object} content JSON object containing content strings.
    */
    async getToken(historyPush, content) {
        console.info('Controller.AuthZ', 'Swap auth code for an access token.');
        const oidcClient = await this.initSdk(this.getTokenAvailableCallback(historyPush, content));
        await oidcClient.getToken();
    }

    /**
    Generate token callback function
    @param {function} historyPush React router function to manipulate history stack.
    @param {object} content JSON object containing content strings.
    @return {function: void} - Callback function to be executed after token is retrieved from authorization server
    */
    getTokenAvailableCallback(historyPush, content) {
        console.info('Controller.AuthZ', 'Create token callback function');
        return (response, _) => {
            const authMode = this.session.getAuthenticatedUserItem("authMode", "session");
            this.session.setAuthenticatedUserItem("AT", response.access_token, "session");
            this.session.setAuthenticatedUserItem("IdT", response.id_token, "session");

            const email = this.tokens.getTokenValue({ token: response.id_token, key: "email" });
            this.session.setAuthenticatedUserItem("email", email, "session");

            const userType = "Customer"; // We don't have any other user types in the sample package
            this.session.setAuthenticatedUserItem("bxRetailUserType", userType, "session");

            // Set temp reg thank you message.
            if (authMode === "registration") {
                this.session.setAuthenticatedUserItem("regMessage", content.menus.utility.register_done, "session");
            }
            // It's a customer.
            if (authMode === "login" || authMode === "registration") {
                if (this.session.getAuthenticatedUserItem("targetReferrer", "session")) {
                    this.session.removeAuthenticatedUserItem("targetReferrer", "session");
                    historyPush("/dashboard/settings");
                } else {
                    historyPush("/shop");
                }
            } else if (authMode === "signInToCheckout") {
                historyPush({ pathname: '/shop/checkout', state: { acctFound: true }});
            }
        }     
    }
}

export default AuthZ;
