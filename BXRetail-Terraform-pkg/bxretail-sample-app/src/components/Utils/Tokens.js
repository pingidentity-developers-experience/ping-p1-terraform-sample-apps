// Components
import JSONSearch from "../Utils/JSONSearch";

class Tokens {
    constructor() {
        this.envVars = window._env_;
        this.jsonSearch = new JSONSearch();
    }

    /**
    Get a claim from a token:
    Decodes and parses a token for a claim/attribute.

    @param {string} token OAuth JWT token.
    @param {string} key the claim needed from within the token, or "all" to get entire payload.
    @return {string} value for key requested or JSON web token.
     */
    getTokenValue({ token, key }) {
        console.info("Utils.Tokens", "Extracting a claim from a token.");
        // Extracting the payload portion of the JWT.
        const base64Fragment = token.split(".")[1];
        const decodedFragment = JSON.parse(atob(base64Fragment));
        const jwtValue = this.jsonSearch.findValues(decodedFragment, key); //FIXME this can be converted to Javascripts intrinsic .find() function.

        return jwtValue[0];
    }
}
export default Tokens;