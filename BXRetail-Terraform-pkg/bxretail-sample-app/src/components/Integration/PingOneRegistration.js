/**
Class representing PingOne registration and profile managemente API's integration.
This demo-specific class is developed and maintained by Ping Identity Technical Enablement.
Implements methods to integrate with PingOne authentication-related API endpoints.

@author Michael Sanchez
@see https://apidocs.pingidentity.com/pingone/platform/v1/api/#management-apis
*/

class PingOneRegistration {
    /**
    Class constructor
    @param {string} authPath PingOne auth path for your regions tenant. (For BXRetail, could be the DG (PAZ) proxy host.)
    @param {string} envId PingOne environment ID needed for authZ integrations.
    */
    constructor(authPath, envId) {
        this.authPath = authPath;
        this.envId = envId;
    }

    /**
    Register a User:
    Registers a user with PingOne.
    
    @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#post-register-user
    @param {object} regPayload User input object.
    @param {string} flowId flowId from initial authorize endpoint call.
    @return {object} jsonResponse API response object in JSON format.
    **/
    async userRegister({ regPayload, flowId }) {
        console.info("Integration.PingOneRegistration.js", "Registering the user input at PingOne.");

        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/vnd.pingidentity.user.register+json");

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: arguments[0]["regPayLoad"],
            redirect: "manual",
            credentials: "include"
        };

        const url = this.authPath + "/flows/" + flowId;
        const response = await fetch(url, requestOptions);
        const jsonResponse = await response.json();
        return jsonResponse;
    }

    /**
    Verify the User:
    Verify the user's registration email code to complete registration.

    @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#post-verify-user
    @param {string} rawPayload JSON of the verificationCode payload to send to the API.
    @param {string} flowId Id for the current authZ/authN transaction.
    @return {object} JSON formatted response object.
    */
    async userVerify({ regCodePayload, flowId }) {
        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/vnd.pingidentity.user.verify+json");

        let requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: regCodePayload,
            redirect: "manual",
            credentials: "include"
        };

        const url = this.authPath + "/flows/" + flowId;
        const response = await fetch(url, requestOptions);
        const jsonResponse = await response.json();
        return jsonResponse;
    }
}
export default PingOneRegistration;