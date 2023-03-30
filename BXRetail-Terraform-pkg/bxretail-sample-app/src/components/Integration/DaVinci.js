/**
Class representing DaVinci integration.
This demo-specific class is developed and maintained by Ping Identity Technical Enablement.
Implements methods to integrate with DaVinci-related endpoints.
*/

class DaVinci {
    /**
    Class Constructor
    */
    constructor() {
        this.envVars = window._env_;
    }

    /**
    Create Url Function:
    Creates the URL to call in DaVinci based on the flow you are using.

    @param {string} dvPolicyId GUID of the Policy ID in DaVinci.
    @returns {string} Concatenated URL.
    */
    createUrl({ dvPolicyId, dvCompanyId }) {
        console.info('Integration.DaVinci.js', 'Generating URL for DaVinci request.');
        return this.envVars.REACT_APP_DAVINCI_ORCHESTRATE_URL + dvCompanyId + '/policy/' + dvPolicyId + '/start';
    }

    /**
    Push Authorization :
    Get the request_uri from the PAR endpoint.

    @see https://docs.pingidentity.com/bundle/pingfederate-110/page/xhc1600191675423.html
    @param {string} rawPayload 
    @returns {object} JSON formatted response object.
    */

    async pushAuthzRequest({ rawPayload }) {
        console.info('Integration.DaVinci.js', 'Getting the request_uri from the PAR endpoint.');

        let myHeaders = new Headers();
        myHeaders.append('X-SK-API-Key', this.envVars.REACT_APP_DAVINCI_API_KEY);
        myHeaders.append('Content-Type', 'application/json');

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: rawPayload,
            redirect: 'manual',
        };
        const url = this.createUrl({
            dvCompanyId: this.envVars.REACT_APP_DAVINCI_COMPANY_ID,
            dvPolicyId: this.envVars.REACT_APP_DAVINCI_POLICY_ID,
        });
        const response = await fetch(url, requestOptions);
        const jsonResponse = await response.json();
        return jsonResponse;
    }

    /**
    OpenBanking API Flow :
    OpenBanking API flow updates the account balances.

    @param {string} rawPayload 
    @returns {object} JSON formatted response object.
    */

    async openBankingApi({ rawPayload }) {
        console.info('Integration.DaVinci.js', 'Starting OpenBanking API flow to update balances.');

        let myHeaders = new Headers();
        myHeaders.append('X-SK-API-Key', this.envVars.REACT_APP_BXF_DAVINCI_API_KEY);
        myHeaders.append('Content-Type', 'application/json');

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: rawPayload,
            redirect: 'manual',
        };
        const url = this.createUrl({
            dvCompanyId: this.envVars.REACT_APP_BXF_DAVINCI_COMPANY_ID,
            dvPolicyId: this.envVars.REACT_APP_BXF_DAVINCI_POLICY_ID,
        });
        const response = await fetch(url, requestOptions);
        const jsonResponse = await response.json();
        return jsonResponse;
    }

    /**
    Call DaVinci flow:
    Generic method to call a DaVinci flow by policy id.

    @param {string} dvApiKey DaVinci API key
    @param {string} dvPolicyId DaVinci policy id
    @param {string} rawPayload JSON string representing DaVinci flow input scheme
    @returns {object} JSON formatted response object.
    */
    async request({ dvCompanyId, dvApiKey, dvPolicyId, rawPayload }) {
        console.info('Integration.DaVinci.js', 'Calling a DaVinci flow.');

        let myHeaders = new Headers();
        myHeaders.append('X-SK-API-Key', dvApiKey);
        myHeaders.append('Content-Type', 'application/json');

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: rawPayload,
            redirect: 'manual',
        };

        const url = this.createUrl({
            dvCompanyId: dvCompanyId,
            dvPolicyId: dvPolicyId,
        });
        const response = await fetch(url, requestOptions);
        const jsonResponse = await response.json();
        return jsonResponse;
    }
}

export default DaVinci;