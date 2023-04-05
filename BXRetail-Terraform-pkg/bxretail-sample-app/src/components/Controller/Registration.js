// Components
import AuthZ from "./AuthZ";
import PingOneRegistration from "../Integration/PingOneRegistration";
import Session from "../Utils/Session";
// import DaVinci from "../Integration/DaVinci";

/**
Class representing user registration via PingOne. 

This demo-specific class is developed and maintained by Ping Identity Technical Enablement.
Implements methods to integrate with PingOne authentication-related API endpoints.
 */

class Registration {

    /**
    Class constructor
    */
    constructor() {
        this.envVars = window._env_;
        this.authz = new AuthZ();
        this.ping1Reg = new PingOneRegistration(this.envVars.REACT_APP_AUTHPATH, this.envVars.REACT_APP_ENVID, this.envVars.REACT_APP_PROXYAPIPATH);
        this.session = new Session();
        // this.davinci = new DaVinci();
    }

    /**
    Verify the User:
    Verify the user's registration email code to complete registration.

    @param {object} regData State object from user input.
    @param {string} flowId Id for the current authN transaction.
    @returns {*} The flow status, or response object if there's an error.
    */
    async verifyRegEmailCode({ regEmailCode, flowId }) {
        console.info("Controller.Registration", "Parsing and preparing user registration verification code."
        );

        const rawPayload = JSON.stringify({
            verificationCode: regEmailCode,
        });

        const response = await this.ping1Reg.userVerify({ regCodePayload: rawPayload, flowId: flowId });
        //TODO do we want to keep this pattern? return status and resumeUrl if "completed", otherwise entire response? Or just error data?
        const status = await response.status;
        if (status === "COMPLETED") {

            return { status: status, resumeUrl: response.resumeUrl, user: response._embedded.user };

        } else {
            
            return response;

        }
    }

    /**
    Enroll a Device:
    Enroll email as a device at registration for all users so that MFA works later if they opt-in. 

    @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#post-create-mfa-user-device-email
    @param {string} userId User Id GUID for which to enroll device.
    @param {string} email Email address to be enrolled as user device.
    @param {string} accessToken PingOne access token.
    @return {object} response
    */
    async enrollDevice({ userId, email, accessToken }) {
        console.info("Controller.Registration", "Enroll MFA device.");

        const body = {
            accessToken: accessToken,
            type: "EMAIL",
            email: email
        };
        const rawPayload = JSON.stringify(body);

        // const response = await this.davinci.request({
        //     dvCompanyId: this.envVars.REACT_APP_DAVINCI_COMPANY_ID,
        //     dvApiKey: this.envVars.REACT_APP_ENROLL_DEVICE_DAVINCI_API_KEY,
        //     dvPolicyId: this.envVars.REACT_APP_ENROLL_DEVICE_DAVINCI_POLICY_ID,
        //     rawPayload,
        // });

        return response;
    }

    /**
    Register a User:
    Parse and prepare user registration data.

    @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#post-register-user
    @param {object} regData State object from user input.
    @return {string} The flow status.
    */
    async registerUser({ regData }) {
        console.info("Controller.Registration", "Parsing and preparing user registration data.");

        const rawPayload = JSON.stringify({
            username: regData.email,
            email: regData.email,
            password: regData.password,
        });

        const response = await this.ping1Reg.userRegister({
            regPayLoad: rawPayload,
            flowId: regData.flowId,
        });
        return response;
    }
}

export default Registration;