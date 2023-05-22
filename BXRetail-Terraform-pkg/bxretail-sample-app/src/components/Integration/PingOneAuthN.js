/**
Class representing PingOne Authentication API operations.

This demo-specific class is developed and maintained by Ping Identity Technical Enablement's demo team.
Implements methods to integrate with PingOne authentication APIs.
{@link https://apidocs.pingidentity.com/pingone/platform/v1/api/#authentication-apis}
*/

class PingOneAuthN {

    /**
    Class constructor
    @param {string} authPath PingOne authentication path for your region's tenant.
    @param {string} envId PingOne environment ID used in the API URIs.
    */
    constructor(authPath, envId) {
        this.envVars = window._env_;
        this.authPath = authPath;
        this.envId = envId;
        this.state = {};
    }

    /**
    Username Password Check
    Validate a user's userName and password.
    {@link https://apidocs.pingidentity.com/pingone/platform/v1/api/#post-check-usernamepassword}
    @param {string} loginPayload User input object.
    @param {string} flowId Id for the current authN transaction.
    @return {object} JSON formatted response object.
    */
    async usernamePasswordCheck({ loginPayload, flowId }) {
        console.info("Integration.PingOneAuthN.js", "Validating user's username and password.");

        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/vnd.pingidentity.usernamePassword.check+json");

        let requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: loginPayload,
            redirect: "manual",
            credentials: "include"
        };

        const url = this.authPath + '/' + this.envId + "/flows/" + flowId;
        const response = await fetch(url, requestOptions);
        const jsonResponse = await response.json();
        return jsonResponse;
    }

    /**
    Initiate Self-service Forgot Password based on username
    {@link https://apidocs.pingidentity.com/pingone/platform/v1/api/#post-forgot-password}
    @param {string} flowId Id for the current authN transaction.
    @param {object} forgotPasswordPayload User-entered username of the account they are trying to recover.
    @return {object} JSON formatted response object.
    */
    async passwordForgot ({ flowId, forgotPasswordPayload }) {
        console.info("Integration.PingOneAuthN.js", "Receiving username to begin forgot password flow.");

        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/vnd.pingidentity.password.forgot+json");

        let requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: forgotPasswordPayload,
            redirect: "manual",
            credentials: "include"
        };

        const url = this.authPath + '/' + this.envId + "/flows/" + flowId;
        const response = await fetch(url, requestOptions);
        const jsonResponse = await response.json();
        return jsonResponse;        
    }

    /**
    Self-service password reset. Validates the recovey code and sets the new password.    
    {@link https://apidocs.pingidentity.com/pingone/platform/v1/api/#post-recover-password}
    @param {string} flowId Id for the current authN transaction.
    @param {string} recoveryCode Recovery code sent to the user to verify the account.
    @param {string} newPassword New password that the user has entered.
    @return {object} JSON formatted response object.
    */
    async passwordRecover ({ flowId, recoverPasscodePayload }) {
        console.info("Integration.PingOneAuthN.js", "Recovering account and setting new password.");

        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/vnd.pingidentity.password.recover+json");

        let requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: recoverPasscodePayload,
            redirect: "manual",
            credentials: "include"
        };

        const url = this.authPath + '/' + this.envId + "/flows/" + flowId;
        const response = await fetch(url, requestOptions);
        const jsonResponse = await response.json();
        return jsonResponse;        
    }
}
export default PingOneAuthN;