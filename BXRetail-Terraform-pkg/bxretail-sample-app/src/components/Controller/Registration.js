// Components
import AuthZ from "./AuthZ";
import PingOneRegistration from "../Integration/PingOneRegistration";
import Session from "../Utils/Session";
// import DaVinci from "../Integration/DaVinci";

/**
Class representing user registration business logic and payload prep for PingOne registration API calls.
This demo-specific class is developed and maintained by Ping Identity Technical Enablement's demo team.
Implements methods to integrate with PingOne authentication-related API endpoints.
@author Ping Identity Technical Enablement
 */

class Registration {

    /**
    Class constructor.
    Declares and sets demo environment variables from our window object.
    */
    constructor() {
        this.envVars = window._env_;
        this.authz = new AuthZ();
        this.ping1Reg = new PingOneRegistration(this.envVars.REACT_APP_AUTHPATH, this.envVars.REACT_APP_ENVID, this.envVars.REACT_APP_APIPATH);
        this.session = new Session();
        // this.davinci = new DaVinci();
    }

    /**
    Verify the User owns the email account. Process the request and payload to validate the user's account.
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
    Enroll an MFA device Device. Process ther request and payload to enroll email as a device at registration for all users so that MFA works later if they opt-in. 
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
            email: email,
            userId: userId
        };
        const rawPayload = JSON.stringify(body);

        const response = await this.ping1Reg.enrollMFADevice(rawPayload);

        // const response = await this.davinci.request({
        //     dvCompanyId: this.envVars.REACT_APP_DAVINCI_COMPANY_ID,
        //     dvApiKey: this.envVars.REACT_APP_ENROLL_DEVICE_DAVINCI_API_KEY,
        //     dvPolicyId: this.envVars.REACT_APP_ENROLL_DEVICE_DAVINCI_POLICY_ID,
        //     rawPayload,
        // });

        return response;
    }

    /**
    Register a User. Processes the request and payload for the register user call.
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