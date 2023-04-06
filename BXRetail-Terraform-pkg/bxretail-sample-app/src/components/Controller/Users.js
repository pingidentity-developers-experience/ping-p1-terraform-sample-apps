// Components
import AuthZ from "./AuthZ";
import Tokens from "../Utils/Tokens"; 
import PingOneUsers from "../Integration/PingOneUsers";
// import DaVinci from '../Integration/DaVinci';
import Session from '../Utils/Session';

/**
Class representing user record business logic and payload prep for PingOne user API calls.
 This demo-specific class is developed and maintained by Ping Identity Technical Enablement.
 Implements methods to integrate with PingOne authorization API endpoints.
 @author Ping Identity Technical Enablement
 */

class Users {

    /**
    Class constructor.
    Declares and sets demo environment variables from our window object.
    */
    constructor() {
        this.envVars = window._env_;
        this.authz = new AuthZ();
        this.tokens = new Tokens();
        this.ping1Users = new PingOneUsers(this.envVars.REACT_APP_PROXYAPIPATH, this.envVars.REACT_APP_ENVID, this.envVars.REACT_APP_APIPATH);
        // this.davinci = new DaVinci();
        this.session = new Session();
    }

    /**
    Read a user's entry data. Processes the request and payload for the read user API call.
    @param {string} IdT OIDC ID token.
    @param {string} userId User Id GUID
    @return {object} JSON formatted response object.
     */
    async getUserProfile({ IdT, userId }) {
        console.info("Controller.Users", "Reading user's data.");

        let sub;
        if (userId) {
            sub = userId;
        } else {
            sub = this.tokens.getTokenValue({ token: IdT, key: "sub" });
        }

        const response = await this.ping1Users.readUser({ userId: sub, accessToken: this.session.getAuthenticatedUserItem('AT', 'session' )});
        return response;
    }

    /**
    Update a user's record. Processes the request and payload for the update user API call.
    @param {string} IdT Id Token
    @param {object} userState State object from UI.
    @param {string} userId User ID that is being updated.
    @return {*} The success status or a JSON formatted response object if there's an error.
    */
    async updateUserProfile({ IdT, userState, userId }) {
        console.info("Controller.Users", "Updating user's record.");

        var payload = {};
        var name = {};
        var address = {};
        if (userState.firstname !== "") {
            name.given = userState.firstname?.trim()
        }
        if (userState.lastname !== "") {
            name.family = userState.lastname?.trim()
        }
        if (userState.street !== "") {
            address.streetAddress = userState.street?.trim()
        }
        if (userState.city !== "") {
            address.locality = userState.city?.trim()
        }
        if (userState.zipcode !== "") {
            address.postalCode = userState.zipcode?.trim()
        }
        /* Removing email for now until we figure out how to resolve email/username conflicts.
        if (userState.email !== "") {
            payload.email = userState.email
        }
        */
        if (userState.phone !== "") {
            payload.mobilePhone = userState.phone?.trim()
        }
        if (userState.birthdate !== "") {
            payload.BXRetailCustomAttr1 = userState.birthdate?.trim()
        }
        payload.address = address;
        payload.name = name;
        const rawPayload = JSON.stringify(payload);
        let sub;
        if (userId) {
            sub = userId;
        } else {
            sub = this.tokens.getTokenValue({ token: IdT, key: "sub" });
        }

        const jsonResponse = await this.ping1Users.updateUser({ userId: sub, accessToken: this.session.getAuthenticatedUserItem('AT', 'session'), userPayload: rawPayload });

        //We got a problem
        if (jsonResponse.code) {
            return jsonResponse;
        } else {
            return { success: true };
        }
    }

    /**
     Read all users' data. Processes the request and payload for a read all users API call.
     @param {*} limit Limit the number of results that come back.
     @return {object} response
    */
    // async getAllUsers({ limit, email }) {
    //     console.info("Controller.Users", "Reading all users data.");

    //     const body = {
    //         accessToken: this.session.getAuthenticatedUserItem('AT', 'session'),
    //         limit: limit,
    //         email: email
    //     };
    //     const rawPayload = JSON.stringify(body);

    //     const response = await this.davinci.request({
    //         dvCompanyId: this.envVars.REACT_APP_DAVINCI_COMPANY_ID,
    //         dvApiKey: this.envVars.REACT_APP_USER_SEARCH_DAVINCI_API_KEY,
    //         dvPolicyId: this.envVars.REACT_APP_USER_SEARCH_DAVINCI_POLICY_ID,
    //         rawPayload,
    //     });

    //     return response;
    // }

    /**
    Update a user's opt-in/out MFA preference. Processes the request and payload for the enable/disable API call.
    @param {string} IdT Id Token
    @param {*} toggleState Toggle MFA preference.
    @return Status
     */
    async toggleMFA({ IdT, toggleState }) {
        console.info("Controller.Users", "Toggling MFA.");
        const rawPayload = JSON.stringify({
            "mfaEnabled": JSON.stringify(toggleState),
        });

        const userId = this.tokens.getTokenValue({ token: IdT, key: "sub" });
        const response = await this.ping1Users.toggleMFA({ accessToken: this.session.getAuthenticatedUserItem('AT', 'session'), userPayload: rawPayload, userId: userId });
        const status = await response.status;
        return status;
    }

    /**
    Look-up User:
    Read one user's data by way of filter. Username/email in our case.

    {@link https://apidocs.pingidentity.com/pingone/platform/v1/api/#get-read-one-user}
    @param {string} email userName (email) of user to search.
    @return {object} response
    */
    // async userLookup(email) {
    //     console.info("Controller.Users", "Using a username/email filter to read one user's data.");

    //     const body = {
    //         email: email,
    //         hostname: this.envVars.REACT_APP_HOST
    //     };
    //     const rawPayload = JSON.stringify(body);

    //     const response = await this.davinci.request({
    //         dvCompanyId: this.envVars.REACT_APP_DAVINCI_COMPANY_ID,
    //         dvApiKey: this.envVars.REACT_APP_USER_LOOKUP_DAVINCI_API_KEY,
    //         dvPolicyId: this.envVars.REACT_APP_USER_LOOKUP_DAVINCI_POLICY_ID,
    //         rawPayload,
    //     });

    //     return response;
    // }
}

export default Users;