/**
* Class representing users in PingOne Directory.
* 
* This demo-specific class is developed and maintained by Ping Identity Technical Enablement.
* Implements methods to integrate with PingOne via the management APIs.
* 
* @author Michael Sanchez
* @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#management-apis
*/

class PingOneUsers {

    /**
    Class constructor
    What constructor does [optional if nothing done special for instantiation].

    @param {string} proxyApiPath Management API host.
    @param {string} envId PingOne tenant environment ID.
    */
    constructor(proxyApiPath, envId) {
        this.proxyApiPath = proxyApiPath;
        this.envId = envId;
    }

    /**
    Read User:
    Read one user's data.

    @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#get-read-one-user
    @param {string} userId User ID GUID that you would like to read.
    @param {string} accessToken PingOne access token.
    @return {object} JSON formatted response object of user data.
    */
    async readUser({ userId, accessToken }) {
        console.info("Integration.PingOneUsers.js", "Reading user's data.");

        let myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + accessToken);

        let requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'manual'
        };
        const url = this.proxyApiPath + '/user/' + this.envId + "/users/" + userId;
        const response = await fetch(url, requestOptions);
        const jsonResponse = await response.json();

        return jsonResponse;
    }

   
    /**
    Update User:
    Update a user's record.

    @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#patch-update-user-patch
    @param {string} userId User ID GUID that you would like to update.
    @param {string} accessToken PingOne access token.
    @param {string} userPayload JSON literal of updated user attributes.
    @return {object} JSON formatted response object.
    */
    async updateUser({ userId, accessToken, userPayload }) {
        console.info("Integration.PingOneUsers.js", "Updating user's attributes in PingOne.");

        let myHeaders = new Headers();
        myHeaders.append("content-type", "application/json");
        myHeaders.append("Authorization", "Bearer " + accessToken);

        let requestOptions = {
            method: 'PATCH',
            headers: myHeaders,
            body: userPayload,
            redirect: 'manual'
        };

        const url = this.proxyApiPath + '/user/' + this.envId + "/users/" + userId;
        const response = await fetch(url, requestOptions);
        const jsonResponse = await response.json();
        return jsonResponse;
    }

    /**
    Update MFA Preferences:
    Update a user's MFA preferences. 

    @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#put-update-user-mfa-enabled
    @param {string} accessToken PingOne access token.
    @param {object} userPayload User's MFA preference.
    @param {string} userId User ID GUID that you would like to update.
    @return {object} JSON formatted response object.
    */

    async toggleMFA({accessToken, userPayload, userId}) {
        console.info("Integration.PingOneUsers.js", "Updating user's MFA preferences.");

        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", "Bearer " + accessToken);

        let requestOptions = {
            method: "PUT",
            headers: myHeaders,
            body: userPayload,
            redirect: "manual"
        };

        const url = this.proxyApiPath + '/user/' + this.envId + "/users/" + userId + "/mfaEnabled";
        
        const response = await fetch(url, requestOptions);
        const jsonResponse = await response.json();

        return jsonResponse;
    }
}
export default PingOneUsers;
