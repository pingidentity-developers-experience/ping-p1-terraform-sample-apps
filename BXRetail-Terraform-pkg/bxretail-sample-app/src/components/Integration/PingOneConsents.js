// /**
// Class representing consent management and enforcement.
// This is done with a custom PingOne schema using JSON attributes and PingAuthorize.

// This demo-specific class is developed and maintained by Ping Identity Technical Enablement.
// Implements methods to integrate with PingOne and PingAuthorize-related API endpoints.

// @author Ping Identity Technical Enablement
// {@link https://apidocs.pingidentity.com/pingone/platform/v1/api/#users}
// */

// class PingOneConsents {

//     /**
//     Class constructor
//     @param {string} proxyApiPath The Fastify proxy host for proxy-ing sensitive mgmt API calls
//     @param {string} envId PingOne environment ID needed for authZ integrations.
//     */
//     constructor(proxyApiPath, envId) {
//         this.proxyApiPath = `${proxyApiPath}/environments/${envId}`;
//     }
    
//     /**
//     Update User Consents:
//     Updates the user's phone or email sharing consents.

//     {@link https://apidocs.pingidentity.com/pingone/platform/v1/api/#patch-update-user-patch}
//     @param {object} consentPayload Consists of username, AnyTVPartner delivery preferences, and communication preferences.
//     @param {string} token Authorization token
//     @param {string} userId User Id GUID of which to update consents on.
//     @return {object} JSON formatted response object.
//     */

//     async userUpdateConsent({ consentPayload, token, userId }) {
//         console.info("Integration.PingOneConsents.js", "Setting the user consents in PingOne.");

//         let myHeaders = new Headers();
//         myHeaders.append("Content-Type", "application/vnd.pingidentity.user.update+json");
//         myHeaders.append("Authorization", "Bearer " + token );

//         const requestOptions = {
//             method: "PATCH",
//             headers: myHeaders,
//             body: consentPayload,
//             redirect: "manual"
//         };

//         const url = this.proxyApiPath + "/users/" + userId;
//         const response = await fetch(url, requestOptions);
//         const jsonResponse = await response.json();
//         return jsonResponse;
//     }
// }
// export default PingOneConsents;