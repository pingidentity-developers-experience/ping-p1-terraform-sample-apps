/**
Class representing DaVinci integration.
This demo-specific class is developed and maintained by Ping Identity Technical Enablement.
Implements methods to prep data or business logic for DaVinci flows.
*/

// Imports
// import DaVinci from '../Integration/DaVinci';

// class DaVinciFlows {
//     constructor(envVars) {
//         this.envVars = envVars;
//         // this.davinci = new DaVinci(this.envVars);
//     }

//     async callDaVinciAPIFlow(dvApiKey, dvPolicyId, payload) {
//         console.info('Controller.DaVinciFlows.js', 'Preparing a request for a DaVinci API call.');

//         // TODO building this should be dynamic so any UI can use it.
//         const body = {
//             accessToken: payload.accessToken,
//             bxHost: payload.bxHost,
//             username: payload.username,
//         };
//         const rawPayload = JSON.stringify(body);

//         const response = await this.davinci.request({
//             dvCompanyId: this.envVars.REACT_APP_BXF_DAVINCI_COMPANY_ID,
//             dvApiKey: dvApiKey,
//             dvPolicyId: dvPolicyId,
//             rawPayload,
//         });
//         return await response;
//     }
// }

// export default DaVinciFlows;
