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
    Initialize the OIDC client
    @return {object} oidcClient Returns the OIDC client
    */
    async initSdk() {
        console.info('Controller.AuthZ', 'Initializing OIDC SDK.');
        const redirectURI = this.envVars.REACT_APP_HOST + this.envVars.PUBLIC_URL + "/";
        // Configure OIDC SDK client options
        const clientOptions = {
            client_id: this.envVars.REACT_APP_CLIENT,
            redirect_uri: redirectURI,
            scope: 'openid profile email p1:read:user p1:update:user p1:read:sessions p1:update:userMfaEnabled p1:create:device',
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
    Use authZ code to get access and id tokens.
    */
    async getToken() {
        console.info('Controller.AuthZ', 'Swap auth code for an access token.');
        const oidcClient = await this.initSdk();
        // Get the access and id tokens from OIDC SDK
        const tokens = await oidcClient.getToken();
        return tokens;
    }
}

export default AuthZ;
