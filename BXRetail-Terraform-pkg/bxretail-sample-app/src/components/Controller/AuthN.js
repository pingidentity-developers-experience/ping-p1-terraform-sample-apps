// Components
import PingOneAuthN from "../Integration/PingOneAuthN";
import Tokens from "../Utils/Tokens";
import Session from "../Utils/Session";

/**
 Class representing authentication business logic and payload prep for PingOne authentication API calls.
 This demo-specific class is developed and maintained by Ping Identity Technical Enablement's demo team.
 @author Ping Identity Technical Enablement
 */

class AuthN {
    /**
    Class constructor
    Declares and sets demo environment variables from our window object.
    */
    constructor() {
        this.envVars = window._env_;
        this.ping1AuthN = new PingOneAuthN(
            this.envVars.REACT_APP_AUTHPATH,
            this.envVars.REACT_APP_ENVID
        );
        this.tokens = new Tokens();
        this.session = new Session();
    }

    /**
    Login the user. Processes the request to validate the username and password.
    @param {object} loginData state object from user input.
    @param {string} flowId Id for the current authN transaction.
    @return {*} Response status, or response object if there's an issue.
    */
    async loginUser({ loginData, flowId }) {
        console.info(
            "Controller.AuthN",
            "Parsing and preparing username and password for login."
        );

        let rawPayload = JSON.stringify({
            username: loginData.username,
            password: loginData.password,
        });

        try {
            const response = await this.ping1AuthN.usernamePasswordCheck({
                loginPayload: rawPayload,
                flowId: flowId,
            });

            if (response.status === "OTP_REQUIRED") {
                return { status: response.status, deviceId: response._embedded.devices[0].id };
            } else if (response.status === "COMPLETED") {
                return { status: response.status, resumeUrl: response.resumeUrl };
            } else {
                return response;
            }
        } catch (e) {
            console.warn("failed to check username and password", e);
        }
    }

    /**
    Select MFA Device
    Process the reqeuest to select our only enrolled device (email) for the user. Not based on user input. 
    @param {string} deviceId Device Id for the device you would like to select.
    @param {string} flowId Id for the current authN transaction.
    @return {object} response
    */
    // async selectDevice({ deviceId, flowId }) {
    //     console.info("Controller.AuthN", "Selecting email as our MFA device.");

    //     let payload = JSON.stringify({
    //         device: {
    //             id: deviceId,
    //         },
    //     });

    //     const response = await this.ping1AuthN.selectDevice({
    //         devicePayload: payload,
    //         flowId: flowId,
    //     });
    //     return response;
    // }

    /**
    MFA OTP Check. Processes the request for an OTP check.
    @param {string} OTP User-entered one-time-passcode they received.
    @param {string} flowId Id for the current authN transaction.
    @return {object} response
    */
    async OTPRequest({ OTP, flowId }) {
        console.info("Controller.AuthN", "Submitting OTP.");

        let payload = JSON.stringify({
            otp: OTP,
        });

        const response = await this.ping1AuthN.otpCheck({
            otpPayload: payload,
            flowId: flowId,
        });
        return response;
    }

    /**
    Get Requested Social Providers. Processes the request to get the user's list of social login providers.
    @param {string} IdP name of the external IdP for which data is needed.
    @param {string} flowId Id for the current authN transaction.
    @returns {object} Portion of the response object for a given social provider.
    */
    // async getRequestedSocialProvider({ IdP, flowId }) {
    //     console.info("Controller.AuthN","Getting a list of social providers." );

    //     const response = await this.ping1AuthN.readAuthNFlowData({
    //         flowId: flowId,
    //     });
    //     const resultsArr = await response._embedded.socialProviders;
    //     const result = resultsArr.find((provider) => provider["name"] === IdP);

    //     return result._links.authenticate.href;
    // }

    /**
    Initiate Self-service Forgot Password. Processes the request to start a forgot password process.
    @param {string} flowId Id for the current authN transaction.
    @param {string} username User-entered username for the account they are attempting to access.
    @returns {object} response
    */
    async forgotPassword({ flowId, username }) {
        console.info("Controller.AuthN", "Beginning the forgot password flow.");

        const payload = JSON.stringify({
            username: username,
        });

        const response = await this.ping1AuthN.passwordForgot({
            flowId: flowId,
            forgotPasswordPayload: payload,
        });
        return response;
    }

    /**
    Self-service password reset. Processes the request to validate a recovery code and new password.
    @param {string} flowId Id for the current authN transaction.
    @param {string} recoveryCode User-entered recovery code that was sent to them.
    @param {string} newPassword User's new chosen password.
    @returns response
    */
    async recoverPasscode({ flowId, recoveryCode, newPassword }) {
        console.info("Controller.AuthN", "Accepting recovery code and new password to begin password reset flow.");

        const payload = JSON.stringify({
            recoveryCode: recoveryCode,
            newPassword: newPassword,
        });

        const response = await this.ping1AuthN.passwordRecover({
            flowId: flowId,
            recoverPasscodePayload: payload,
        });
        return response;
    }

    /**
    Reset Expired Password. Processes the request to reset a password.
    @param {string} flowId Id for the current authN transaction.
    @param {string} currentPassword User's current expired password.
    @param {string} newPassword User's new chosen password.
    @returns response
    */
    // async resetPassword({ flowId, currentPassword, newPassword }) {
    //     console.info("Controller.AuthN", "Accepting current and new password to begin password reset flow.");

    //     const payload = JSON.stringify({
    //         currentPassword: currentPassword,
    //         newPassword: newPassword
    //     });

    //     const response = await this.ping1AuthN.resetPassword({
    //         flowId: flowId,
    //         resetPasswordPayload: payload,
    //     });
    //     return response;
    // }
}
export default AuthN;
