class Tokens {
    constructor() {
        this.envVars = window._env_;
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
        return decodedFragment[key];
    }
}
export default Tokens;