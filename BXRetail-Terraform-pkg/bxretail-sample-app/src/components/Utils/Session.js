/**
Implements functions to integrate with the browser
session and local storage API to maintain user state during
an authenticated app session. Also includes a method for 
access rules.

@author Michael Sanchez, Eric Anderson
@see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage}
*/

class Session {

    /** 
    Protect Page:
    Ensures a user doesn't access pages when unauthenticated or 
    when not the right user type. We are not using Ping Access for a SaaS-first demo.
    This would ideally be done with PA's new SPA support features, but BXRetail is intended 
    to be an all-SaaS demo. Reality bytes.

    @param {boolean} loggedOut Whether the user is logged in or not.
    @param {string} path Where the user is trying to go.
    @param {string} userType AnyTVPartner, AnyMarketing, or customer. 
    */
    protectPage(loggedOut, path, userType, props) {
        const partnerAllowedPaths = ["/partner", "/app/partner", "/app/partner/client"];
        const marketingAllowedPaths = ["/app/any-marketing"];
        const customerAllowedPaths = ["/app/dashboard/settings", "/app/dashboard/settings/profile", "/app/dashboard/settings/communication-preferences", "/app/dashboard/settings/privacy-security"];
        const unauthenticatedPaths = ["/", "/app/", "/app", "/app/shop", "/app/shop/checkout"];
        console.info("Utils.Session", "Checking access rules for user type " + userType + " at " + path);

        this.removeAuthenticatedUserItem("triggerLogin", "session");
        //They have to be logged in to be anywhere other than home or /shop.
        if (loggedOut && (!unauthenticatedPaths.includes(path))) {
            console.info("Access rule", "Attempting to access protected page as unauthenticated user. Redirecting to home.");
            if (path === "/app/dashboard/settings") {
                this.setAuthenticatedUserItem("triggerLogin", true, "session");
            }
            props.history.push(unauthenticatedPaths[0]);
        } else {
            switch (userType) {
                case "AnyTVPartner":
                    if (!partnerAllowedPaths.includes(path)) {
                        console.info("Access Rule", "Attempt to access disallowed resource for user type " + userType + ". Redirecting to default.");
                        props.history.push(partnerAllowedPaths[0]);
                    } 
                    break;
                case "AnyMarketing":
                    if (!marketingAllowedPaths.includes(path)) {
                        console.info("Access Rule", "Attempt to access disallowed resource for user type " + userType + ". Redirecting to default.");
                        props.history.push(marketingAllowedPaths[0]);
                    } 
                    break;
                case "Customer":
                    if (!customerAllowedPaths.includes(path) && !unauthenticatedPaths.includes(path)) {
                        console.info("Access Rule", "Attempt to access disallowed resource for user type " + userType + ". Redirecting to default.");
                        props.history.push(unauthenticatedPaths[0]);
                    } 
                    break;
                default:
                    console.warn("Unknown bxRetailUserType:", "Not authenticated yet.");
            }
        }
    }

    /** 
    Get Authenticated User Item:
    Gets an item from the current origin's session (or local) storage. For local storage item's expiry rules will be enforced if present

    @param {string} key The item name in storage.
    @param {string} type session or local.
    @return {string} DOM String.
    */
    getAuthenticatedUserItem(key, type) {
        console.info("Utils.Session", "Getting " + key + " from " + type + " browser storage.");

        if (type === "session") {
            return sessionStorage.getItem(key);
        } else {
            const value = localStorage.getItem(key);
            const propertyRegex = /(("|')expiryRule("|')):|expiryRule:/; // Looking for "expiryRule":, 'expiryRule': or expiryRule:

            if (value && propertyRegex.test(value)) {
                const item = JSON.parse(value);

                if (!item?.expiryRule) {
                    return null;
                }

                switch (item.expiryRule) {
                    case 'oneTimeUse': 
                        localStorage.removeItem(key);
                        return item.value;
                    case 'expiryDate':
                        if (item.expireDate && item.expireDate > new Date()) {
                            return item.value;
                        } else {
                            console.info('LocalStorage.js', `Item '${key}' found in local storage but is expired, removing.`)
                            localStorage.removeItem(key);
                            return null;
                        }
                    default:
                        console.warn(`Invalid expiry rule encountered ${item.expireRule}`);
                        return item.value;
                }
            }

            return value;
        }
    }

    /** 
    Set Authenticated User Item:
    Sets an item in the current origin's sessions storage.

    @param {string} key The item name to set in storage.
    @param {string} value The string value of the key.
    @param {string} type session or local.
    @return {void} Undefined.
    @throws {storageFullException} Particularly, in Mobile Safari 
                                (since iOS 5) it always throws when 
                                the user enters private mode. 
                                (Safari sets the quota to 0 bytes in 
                                private mode, unlike other browsers, 
                                which allow storage in private mode 
                                using separate data containers.)
    */
    setAuthenticatedUserItem(key, value, type) {
        console.info("Utils.Session", "Saving " + key + " into " + type + " browser storage.");

        if (type === "session") {
            sessionStorage.setItem(key, value);
        } else {
            localStorage.setItem(key, value);
        }
    }

    /**
     * Sets a value in current origin's local storage with an expiry rule that is enforced on retrieval 
     * 
     * @param {string} key The item name to save in storage
     * @param {any} value The item value of the key
     * @param {string} expiryRule Expiry rule type, current options are 'endOfDay' and 'oneTimeUse'
     * @return {void} undefined
     */
    setLocalStorageItemWithExpiry(key, value, expiryRule) {
        let objToSave = {
            expiryRule: expiryRule,
            value: value
        };

        const validExpiryOptions = ['endOfDay', 'oneTimeUse'];
        if (validExpiryOptions.indexOf(objToSave.expiryRule) === -1) {
            console.warn('Session.js', `Invalid expiryRule encountered for '${key}', default of 'none' will be used.`);
            objToSave.expiryRule = 'none';
        }

        if (expiryRule === 'endOfDay') {
            objToSave.expireDate = new Date().setHours(23, 59, 59, 999);
            objToSave.expiryRule = 'expiryDate';
        }

        console.info('LocalStorage.js', `Saving ${key} to local storage.`, objToSave);

        localStorage.setItem(key, JSON.stringify(objToSave));

        return true;
    }

    /** 
    Remove Authenticated User Item:
    Removes an item from the current origin's session storage.

    @param {string} key The item name in storage to remove.
    @param {string} type session or local.
    @return {void} Undefined.
    */
    removeAuthenticatedUserItem(key, type) {
        console.info("Utils.Session", "Removing " + key + " from " + type + " browser storage.");

        if (type === "session") {
            sessionStorage.removeItem(key);
        } else {
            localStorage.removeItem(key);
        }
    }

    /** 
    Clear a user's local app session:
    Clears out everything in the current origin's session storage.

    @param {string} type Type of storage: session, local, all.
    @return {void} Undefined.
     */
    clearUserAppSession(type) {
        console.info("Utils.Session", "Removing " + type + " browser storage.");

        switch (type) {
            case "session":
                sessionStorage.clear();
                break;
            case "local":
                localStorage.clear();
                break;
            case "all":
                sessionStorage.clear();
                localStorage.clear();
                break;
            default:
                console.error("Storage Error:", "The 'type' param to clearUserAppSession was not recognized or excluded. No storage has been cleared.");
        }

    }

    /** 
    Check if user is logged out:
    Check if Id Token in storage and is null or undefined.

    @return {boolean} isLoggedOut 
     */

    get isLoggedOut() {
        console.info("Utils.Session", "Checking if user is logged out.")

        const isLoggedOut =  this.getAuthenticatedUserItem('IdT', 'session') === null || this.getAuthenticatedUserItem('IdT', 'session') === 'undefined' ? true : false;
        return isLoggedOut;
    }


    /** 
    Get Cookie:
    We set a cookie when users check "Remember Me" when logging in.
    We need to check for this cookie in a couple different places to set state.
    
    @deprecated Using browser storage going forward for demo apps.
    @param {string} cookieName The name of the cookie we want the value of.
    @return {string} Cookie value, or an empty string if not found.
    */
    getCookie(cookieName) {
        console.info("Utils.Session", "Getting a cookie value from the browser.");

        const name = cookieName + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    /**
    Delete Cookie:
    We set a cookie when users unchecks "Remember Me" when logging in.

    @deprecated Using browser storage going forward for demo apps.
    @param {string} name The name of the cookie we want to delete.
    @param {string} path The app path to which the cookie is assigned.
    @param {string} domain The domain name to which the cookie is assigned.
    @return {string} Cookie value, or an empty string if not found.
    */
    deleteCookie({ name, path, domain }) {
        console.info("Utils.Session", "Deleting a cookie value from the browser.");

        if (this.getCookie(name)) {
            document.cookie = name + "=" +
                ((path) ? ";path=" + path : "") +
                ((domain) ? ";domain=" + domain : "") +
                ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
        }
    }
};

export default Session;
