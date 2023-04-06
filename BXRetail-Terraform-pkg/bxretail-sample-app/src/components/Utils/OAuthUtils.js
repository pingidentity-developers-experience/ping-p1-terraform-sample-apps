/**
Implements helper functions to support Proof Key for Code Exchange (PKCE).
PKCE makes the use of OAuth 2.0 authorization code grant more secure.

@author Ping Identity Technical Enablement
{@link {@link https://docs.pingidentity.com/bundle/pingfederate-102/page/roj1564002966901.html}}
{@link {@link https://docs.pingidentity.com/bundle/pingfederate-102/page/nfr1564003024683.html}}
{@link {@link https://www.valentinog.com/blog/challenge/}}
*/
import { encode as base64encode } from "base64-arraybuffer";

class OAuthUtils {
    /** 
    Generates the code_challenge parameter to support the PKCE workflow.
    @param {string} codeVerifier Used to validate already received code_challenge
    */
    async generateCodeChallenge(codeVerifier) {
      const encoder = new TextEncoder();
      const data = encoder.encode(codeVerifier);
      const digest = await window.crypto.subtle.digest("SHA-256", data);
      const base64Digest = base64encode(digest);
      return base64Digest.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    }
    /** 
    Generates a random string used for state and PKCE code_challenge.
    @param {string} length Length of the generated string
    */
    getRandomString(length) {
      let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    }
};

export default OAuthUtils;