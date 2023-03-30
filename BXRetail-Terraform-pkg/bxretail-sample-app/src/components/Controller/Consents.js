// Components
import PingOneConsents from "../Integration/PingOneConsents";
import AuthZ from "./AuthZ";
import Tokens from "../Utils/Tokens";
import Users from "../Controller/Users";
import Session from "../Utils/Session";
import DaVinci from "../Integration/DaVinci";

/**
Class representing consent management and enforcement. 

This demo-specific class is developed and maintained by Ping Identity Technical Enablement.
Implements methods to integrate with PingOne authentication APIs.
*/

class Consents {
    /**
    Class constructor
    */
    constructor() {
        this.envVars = window._env_;
        this.atvpPath = this.envVars.REACT_APP_ATVPAUTHPATH + "/" + this.envVars.REACT_APP_ATVP_ENVID
        this.ping1Consents = new PingOneConsents(this.envVars.REACT_APP_PROXYAPIPATH, this.envVars.REACT_APP_ENVID);
        this.authz = new AuthZ();
        this.tokens = new Tokens();
        this.users = new Users();
        this.session = new Session();
        this.daVinci = new DaVinci();
    }


    /**
    Update User Consents:
    Updates the user's phone or email sharing consents.

    @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#patch-update-user-patch
    @param {object} consentData Consists of username, AnyTVPartner delivery preferences, and communication preferences.
    @param {string} IdT Id Token
    @returns {string} status
    */
    async userUpdateConsent({ consentData, IdT }) {
        console.info("Controller.Consents", "Updating user consents.");
        const user = await this.users.getUserProfile({ IdT: IdT });
        const userId = this.tokens.getTokenValue({ token: IdT, key: "sub" });

        consentData = {
            subject: user.email,
            deliveryEmail: JSON.stringify(consentData.deliveryEmailChecked),
            deliveryPhone: JSON.stringify(consentData.deliveryPhoneChecked),
            commEmail: JSON.stringify(consentData.commEmailChecked),
            commSms: JSON.stringify(consentData.commSmsChecked),
            commMail: JSON.stringify(consentData.commMailChecked),
        };

        let rawPayload = JSON.stringify({
            consent: [
                {
                    status: "active",
                    subject: consentData.subject,
                    actor: consentData.subject,
                    audience: "BXRApp",
                    definition: {
                        id: "tv-delivery-preferences",
                        version: "1.0",
                        locale: "en-us",
                    },
                    titleText: "Share User Delivery Info",
                    dataText: "Share User Delivery Info",
                    purposeText: "Share User Delivery Info",
                    data: {
                        email: consentData.deliveryEmail,
                        mobile: consentData.deliveryPhone,
                    },
                    consentContext: {},
                }
            ],
        });
        const response = await this.ping1Consents.userUpdateConsent({
            consentPayload: rawPayload,
            token: this.session.getAuthenticatedUserItem('AT', 'session'),
            userId: userId,
        });
        const status = await response.status;
        return status;
    }

    /**
    Enforce Consents: 
    Enforces the user's phone or email sharing consents.

    @param {string} userId User Id GUID for which to enforce consents.
    @param {string} AT The partner's access token
    @return {object} response
    */
    async enforceConsent({ userId, AT }) {
        console.info("Controller.Consents", "Enforcing user consents.");

        const rawPayload = JSON.stringify({
            userId: userId,
            accessToken: AT
        });

        const response = await this.daVinci.request({
            dvCompanyId: this.envVars.REACT_APP_DAVINCI_COMPANY_ID,
            dvApiKey: this.envVars.REACT_APP_CONSENT_ENFORCEMENT_DAVINCI_API_KEY,
            dvPolicyId: this.envVars.REACT_APP_CONSENT_ENFORCEMENT_DAVINCI_POLICY_ID,
            rawPayload
        });
        return response;
    }
}

export default Consents;