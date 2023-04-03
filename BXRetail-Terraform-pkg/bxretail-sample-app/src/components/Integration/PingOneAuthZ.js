/**
Class representing PingOne Authorization API's integration.
This demo-specific class is developed and maintained by Ping Identity Technical Enablement.
Implements methods to integrate with PingOne authentication-related API endpoints.

@author Michael Sanchez
@see https://apidocs.pingidentity.com/pingone/platform/v1/api/#authentication-apis
*/
import OAuthUtils from '../Utils/OAuthUtils';
import Session from "../Utils/Session";

class PingOneAuthZ {
    authzEndpoint = '/as/authorize';
    tokenEndpoint = '/as/token';

    /**
    Class constructor
     * @param {string} authPath PingOne auth path for your regions tenant. (For BXR, could be the DG (PAZ) proxy host.)
     * @param {string} envId PingOne environment ID needed for authZ integrations. 
     */
    constructor(authPath, envId) {
        this.authPath = authPath;
        this.envId = envId;
        this.OAuthUtils = new OAuthUtils();
        this.Session = new Session();
    }

    /**
    Authorization Flow:
    Start an authorization flow.
    
    @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#openid-connectoauth-2
    @param {string} responseType The OAuth grant type. Options are "code" and "token".
    @param {string} clientId The client ID of the OAuth application.
    @param {string} redirectURI The URL to which the OAuth AS should redirect the user with a flowId.
    @param {string} scopes The OAuth scopes needed for the given for which the user is being authorized.
    @return {string} The flowId extracted from the 302 redirect URL.
    */
    async authorize({ responseType, clientId, redirectURI, scopes }) {
        console.info(
            'Integration.PingOneAuthZ.js',
            'Sending user to the authorize endpoint to start an authN flow and get a flowId.'
        );

        let url = this.authPath + '/as/authorize?response_type=' + responseType + '&client_id=' + clientId + '&redirect_uri=' + redirectURI + '&scope=' + scopes;

        // Add pkce support for auth code grant types
        if (responseType === 'code') {
            const state = this.OAuthUtils.getRandomString(20);
            const code_verifier = this.OAuthUtils.getRandomString(128);
            let code_challenge;

            try {
                code_challenge = await this.OAuthUtils.generateCodeChallenge(code_verifier);
            } catch (e) {
                console.error('Integration.PingOneAuthZ.js', 'Error generating code challenge', e);
                throw new Error('Integration.PingOneAuthZ.js', 'Unexpected exception in generateCodeChallenge().');
            }

            // Save pkce code_verifier and state values
            this.Session.setAuthenticatedUserItem('state', state, 'session');
            this.Session.setAuthenticatedUserItem('code_verifier', code_verifier, 'session');

            url += '&state=' + state + '&code_challenge=' + code_challenge + '&code_challenge_method=S256';
        }

        window.location.assign(url);
    }

    /**
    OAuth Token:
    Swaps an OAuth code for an OAuth access token.

    @param {string} code Authorization code from AS.
    @param {string} redirectURI App URL user should be redirected to after swap for token.
    @returns {object} JSON formatted response object.
    */
    async getToken({ code, redirectURI, swaprods }) {
        console.info('Integration.PingOneAuthZ.js', 'Swapping an authorization code for an access token.');

        let myHeaders = new Headers();
        myHeaders.append('Authorization', 'Basic ' + swaprods);
        myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

        let urlencoded = new URLSearchParams();
        urlencoded.append('grant_type', 'authorization_code'); //grant type should be a param passed in. But in the demos we're only doing auth code.
        urlencoded.append('code', code);
        urlencoded.append('redirect_uri', redirectURI);
        urlencoded.append('code_verifier', this.Session.getAuthenticatedUserItem('code_verifier', 'session'));
        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlencoded,
            redirect: 'manual',
        };
        const url = this.authPath + '/as/token';
        const response = await fetch(url, requestOptions);
        const jsonResponse = await response.json();
        return jsonResponse;
    }

    /**
    Introspect a Token:
    Introspect a token. This is not in use today.
    
    @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#post-token-introspection-id-token
    @param {string} token an OAuth token
    @return {string} JSON web token.
    */

    // TODO not implemented or tested. Not used. Maybe remove???
    /* tokenIntrospect({ token }) {
        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
        myHeaders.append("Authorization", "Basic MGI1MDEyNzQtMzZjMC00YzFmLTg3MWYtMjRiY2FiZDBhNDc5OkFOOWtQdHdDeUlrRkxNVndtfmVYRDFxeC1CZkRDZkNha0ZOb1hDOHR+QUdFZS1JeVRaYnYuRElSZmVWbHRRTUw=");

        let urlencoded = new URLSearchParams();
        urlencoded.append("token", "eyJpc3MiOiJodHRwczovL2RlbW8tYnhyZXRhaWwtYXV0aC1xYS5waW5nLWRldm9wcy5jb20vYXMiLCJzdWIiOiJhZDE2M2I3ZC1kNDMzLTQ5NWUtOTczYi1jNWIyMzllMjcwODAiLCJhdWQiOiIwYjUwMTI3NC0zNmMwLTRjMWYtODcxZi0yNGJjYWJkMGE0NzkiLCJpYXQiOjE2MjQ1NjgyNzQsImV4cCI6MTYyNDU3MTg3NCwiYWNyIjoiRGVmYXVsdFBvbGljeSIsImFtciI6WyJwd2QiXSwiYXV0aF90aW1lIjoxNjI0NTY0MjkzLCJhdF9oYXNoIjoiLVZTSXktd0RBMjd0bnpkOE5OeUhJdyIsInNpZCI6IjYxZTcyMmEyLWU3ODEtNGQyMy1hMmRjLTIyOTdjYWNhOTBjNyIsImdpdmVuX25hbWUiOiJEYXZpZCIsInpvbmVpbmZvIjoiRXVyb3BlL1BhcmlzIiwiZmFtaWx5X25hbWUiOiJXZWJiIiwiZW1haWwiOiJkYXZpZHdlYmJAbWFpbGluYXRvci5jb20iLCJ1cGRhdGVkX2F0IjoxNjI0NTY1ODA1LCJuaWNrbmFtZSI6Ikphc29uIEJvdXJuZSIsInByZWZlcnJlZF91c2VybmFtZSI6ImRhdmlkd2ViYkBtYWlsaW5hdG9yLmNvbSIsImZpcnN0TmFtZSI6IkRhdmlkIiwibGFzdE5hbWUiOiJXZWJiIiwic3RyZWV0IjoiMTA0IEF2ZW51ZSBLbGViZXIiLCJwb3N0Y29kZSI6Ijc1MTE2IiwiZW52IjoiNDBmNzQ1ZjYtM2Y5MS00Zjg4LWEzMDUtOTNjMGE0MzY5MjkzIiwib3JnIjoiNGVhZGE1NTAtOTZlYi00NDI1LWE1NDEtMDQ2YWI4YWU3MTBjIiwicDEucmVnaW9uIjoiTkEifQ");

        let requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlencoded,
            redirect: 'manual'
        };

        fetch("https://auth.pingone.com/{{envID}}/as/introspect", requestOptions)
            .then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));
    } */

    /**
    Swap Code for Token (BXFinance PingFederate - OpenBanking):
    Swaps an OAuth code for an OAuth access token.

    @see https://docs.pingidentity.com/bundle/pingfederate-110/page/xhx1564003025004.html
    @param {string} code Authorization code from AS.
    @param {string} bxfHost BXF base url
    @param {string} appHost REACT_APP_HOST
    @return {string} JSON web token.
    */

    async swapCodeForToken(code, bxfHost, appHost) {
        console.info('Integration.PingOneAuthZ.js', 'Swapping authorization code for access token');

        let myHeaders = new Headers();
        myHeaders.append('Authorization', 'Basic T0ItUEFSOmFDNm5IelN2ODZwU0lmalNUZG5wZXBUbDhUOFZ3SWVLa2FiRkgwVEpaa2NNU09lVXBuazUwUXlIeTNTdmVueHc=');
        myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
        };

        const url = bxfHost + '/as/token.oauth2?grant_type=authorization_code&redirect_uri=' + appHost + '/app/shop/checkout&code=' + code;
        const response = await fetch(url, requestOptions);
        const jsonResponse = await response.json();
        return jsonResponse;
    }
} export default PingOneAuthZ;