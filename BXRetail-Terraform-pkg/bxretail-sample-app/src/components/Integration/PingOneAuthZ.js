/**
Class representing PingOne Authorization API's integration.
This demo-specific class is developed and maintained by Ping Identity Technical Enablement's demo team.
Implements methods to integrate with PingOne authorization-related API endpoints.
@author Ping Identity Technical Enablement
*/
import OAuthUtils from '../Utils/OAuthUtils';
import Session from "../Utils/Session";

class PingOneAuthZ {
    authzEndpoint = '/as/authorize';
    tokenEndpoint = '/as/token';

    /**
    Class constructor
     * @param {string} authPath PingOne auth path for your regions tenant. (For BXRetail, could be the DG (PAZ) proxy host.)
     * @param {string} envId PingOne environment ID needed for authZ integrations. 
     */
    constructor(authPath, envId, proxyApiPath) {
        this.authPath = authPath;
        this.proxyApiPath = proxyApiPath;
        this.envId = envId;
        this.OAuthUtils = new OAuthUtils();
        this.Session = new Session();
    }

    /**
    OAuth Authorization start. Redirects the user to the AS authorization endpoint.
    Uses PKCE and state options as a security best practice for the auth code grant type.    
    {@link https://apidocs.pingidentity.com/pingone/platform/v1/api/#authorization}
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

        let url = this.authPath + '/' + this.envId + '/as/authorize?response_type=' + responseType + '&client_id=' + clientId + '&redirect_uri=' + redirectURI + '&scope=' + scopes;
        // PKCE and state support for auth code grant types
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
    Get an OAuth Token. Swaps an OAuth code for an OAuth access token.
    {@link https://apidocs.pingidentity.com/pingone/platform/v1/api/#post-token-authorization_code}
    @param {string} code Authorization code from AS.
    @param {string} redirectURI App URL user should be redirected to after swap for token.
    @returns {object} JSON formatted response object.
    */
    async getToken({ code, redirectURI, swaprods, clientId }) {
        console.info('Integration.PingOneAuthZ.js', 'Swapping an authorization code for an access token.');

        let myHeaders = new Headers();
        // myHeaders.append('Authorization', 'Basic ' + swaprods);
        myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

        let urlencoded = new URLSearchParams();
        urlencoded.append('grant_type', 'authorization_code'); //grant type should be a param passed in. But in the demos we're only doing auth code.
        urlencoded.append('code', code);
        urlencoded.append('redirect_uri', redirectURI);
        urlencoded.append('client_id', clientId);
        urlencoded.append('code_verifier', this.Session.getAuthenticatedUserItem('code_verifier', 'session'));
        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlencoded,
            redirect: 'manual',
        };
        // const url = this.proxyApiPath + '/auth/' + this.envId + '/as/token';
        const url = this.authPath + '/' + this.envId + '/as/token';
        const response = await fetch(url, requestOptions);
        const jsonResponse = await response.json();
        return jsonResponse;
    }

    /**
    Introspect and validate a token. This is not in use today.
    {@link https://apidocs.pingidentity.com/pingone/platform/v1/api/#post-token-introspection-id-token}
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
} export default PingOneAuthZ;