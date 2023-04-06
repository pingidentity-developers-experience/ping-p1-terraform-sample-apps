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

    //TODO this is not needed as login will send an OTP to the one and only enrolled device (only email for right now) without having to select a device.

    /**
    Select MFA Device.
    Select our only enrolled device (email) for the user. Not based on user input. This is not used in today's implementation and login will send
    an OTP to the one and only enrolled device without having to select a device.
    {@link https://apidocs.pingidentity.com/pingone/platform/v1/api/#post-select-device}
    @param {object} devicePayload 
    @param {string} flowId Id for the current authN transaction.
    @returns {object} JSON formatted response object.
    */
    // async selectDevice({ devicePayload, flowId }) {
    //     console.info("Integration.PingOneAuthN.js", "Selecting enrolled device to use in the PingOne MFA flow.")

    //     let myHeaders = new Headers();
    //     myHeaders.append("Content-Type", "application/vnd.pingidentity.device.select+json");
    
    //     let requestOptions = {
    //         method: "POST",
    //         headers: myHeaders,
    //         body: devicePayload,
    //         redirect: "manual",
    //         credentials: "include"
    //     };

    //     const url = this.authPath + "/flows/" + flowId;
    //     const response = await fetch(url, requestOptions);
    //     const jsonResponse = await response.json();
    //     return jsonResponse;
    // }

    /**
    MFA OTP check.
    Checks an OTP delivered to the user's enrolled MFA device.
    {@link https://apidocs.pingidentity.com/pingone/platform/v1/api/#post-check-one-time-password-otp }
    @param {object} otpPayload User-entered one-time-passcode they received.
    @param {string} flowId Id for the current authN transaction.
    @return {object} JSON formatted response object.
    */
    // async otpCheck({ otpPayload, flowId }) {
    //     console.info("Integration.PingOneAuthN.js", "OTP request for MFA users.");

    //     let myHeaders = new Headers();
    //     myHeaders.append("Content-Type", "application/vnd.pingidentity.otp.check+json");

    //     let requestOptions = {
    //         method: "POST",
    //         headers: myHeaders,
    //         body: otpPayload,
    //         redirect: 'manual',
    //         credentials: "include"
    //       };

    //       const url = this.authPath + "/flows/" + flowId;
    //       const response = await fetch(url, requestOptions);
    //       const jsonResponse = await response.json();
    //       return jsonResponse;
    // }

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

    /**
    Reset Expired Password. Accepts the current password and new password for password reset.
    {@link https://apidocs.pingidentity.com/pingone/platform/v1/api/#post-reset-password}
    @param {string} flowId Id for the current authN transaction.
    @param {string} currentPassword User's current expired password.
    @param {string} newPassword New password that the user has entered.
    @return {object} JSON formatted response object.
    */
    // async resetPassword ({ flowId, resetPasswordPayload }) {
    //     console.info("Integration.PingOneAuthN.js", "Setting new password.");
    
    //     let myHeaders = new Headers();
    //     myHeaders.append("Content-Type", "application/vnd.pingidentity.password.reset+json");
    
    //     let requestOptions = {
    //         method: "POST",
    //         headers: myHeaders,
    //         body: resetPasswordPayload,
    //         redirect: "manual",
    //         credentials: "include"
    //     };
    
    //     const url = this.authPath + "/flows/" + flowId;
    //     const response = await fetch(url, requestOptions);
    //     const jsonResponse = await response.json();
    //     return jsonResponse;        
    //     }

    /**
    Read Flow Data. Reads the current status and requirements based on flowId for the user's current authN/authZ event.
    {@link https://apidocs.pingidentity.com/pingone/platform/v1/api/#get-read-flow}
    @param {string} flowId Id for the current authN transaction.
    @return {object} JSON formatted response object.
    */
    // async readAuthNFlowData({ flowId }) {
    //     console.info("Integration.PingOneAuthN.js", "Reading user's current authN API flow data.");

    //     const requestOptions = {
    //         method: 'GET',
    //         redirect: 'manual',
    //         credentials: "include"
    //     };

    //     const url = this.authPath + "/flows/" + flowId;
    //     const response = await fetch(url, requestOptions);
    //     const jsonResponse = await response.json();
    //     return jsonResponse;
    // }
}
export default PingOneAuthN;