/**
 *  ___ _             ___    _         _   _ _
 * | _ (_)_ _  __ _  |_ _|__| |___ _ _| |_(_) |_ _  _
 * |  _/ | ' \/ _` |  | |/ _` / -_) ' \  _| |  _| || |
 * |_| |_|_||_\__, | |___\__,_\___|_||_\__|_|\__|\_, |
 *            |___/                              |__/
 *  _____       _      ___           _    _                   _      ___       _
 * |_   _|__ __| |_   | __|_ _  __ _| |__| |___ _ __  ___ _ _| |_   / _ \ _ _ | |_  _
 *   | |/ -_) _| ' \  | _|| ' \/ _` | '_ \ / -_) '  \/ -_) ' \  _| | (_) | ' \| | || |
 *   |_|\___\__|_||_| |___|_||_\__,_|_.__/_\___|_|_|_\___|_||_\__|  \___/|_||_|_|\_, |
 *                                                                               |__/
 * Component representing Google Analytics.
 * 
 * ####################################################################################
 * NOTE: THIS IS *NOT* TO BE USED BY ANY CLONED DEMOS OUTSIDE OF TECHNICAL ENABLEMENT.#
 *       THIS IS *ONLY* FOR REPORTING OF THE LIVE, PING ENABLEMENT HOSTED BX DEMOS    #
 *       TO THE INTERNAL PING ENABLEMENT ORGANIZATION.                                #
 *       Each function is wrapped in host name evaluation so we only track            #
 *       Tech Enablement host names.
 * ####################################################################################
 * 
 * This demo-specific component is developed and maintained by Ping Identity Technical Enablement.
 * Implements functions to integrate with Google/Universal Analytics APIs.
 * 
 * @author Michael Sanchez
 * @see https://analytics.google.com/analytics/web/provision/#/provision
 * @see https://github.com/react-ga/react-ga
 * Implementation based on the following...
 * @see https://malith-dev.medium.com/track-users-in-your-react-app-with-google-analytics-6364ebfcbae8
 */

import ReactGA from "react-ga";

export const IsTrackableHost = (window.location.hostname.includes("ping-devops.com") || window.location.hostname.includes("bxretail.org")) ? true : false;

/**
 * Initialize Google Analytics. (Technical Enablement use only.)
 * @param {String} trackingID 
 */
export const initGA = (trackingID) => {
    if (IsTrackableHost) {
        ReactGA.initialize(trackingID, {
            gaOptions: {
                siteSpeedSampleRate: 100
            }
        });
    }
}

/**
 * Page Views. (Technical Enablement use only.)
 */
export const PageView = () => {
    if (IsTrackableHost) {
        ReactGA.pageview(window.location.pathname +
            window.location.search);
    }
}

/**
 * Modal Views. (Technical Enablement use only.)
 * @param {String} modalName Name only, of the modal being displayed. E.g. "ModalLoginPassword"
 */
export const ModalView = (modalName) => {
    if (IsTrackableHost) {
        ReactGA.modalview(modalName);
    }
}

/**
 * Event - Add custom tracking event. (Technical Enablement use only.)
 * @param {String} category Required. A top level category for these events. E.g. 'User', 'Navigation', 'App Editing', etc.
 * @param {String} action Required. A description of the behaviour. E.g. 'Clicked Delete', 'Added a component', 'Deleted account', etc.
 * @param {String} label Optional. More precise labelling of the related action. E.g. alongside the 'Added a component' action, we could add the name of a component as the label. E.g. 'Survey', 'Heading', 'Button', etc.
 */
export const Event = (category, action, label) => {
    if (IsTrackableHost) {
        ReactGA.event({
            category: category,
            action: action,
            label: label
        });
    }
};

/**
 * Set attributes for analytics. (Technical Enablement use only.)
 * @param {String} attribute They attribute name to set, such as UserId.
 * @param {value} value The value of the attribute to be set. 
 */
// TODO: This could be modfied to except an object so you could set multiple attributes at once. Don't see a need yet, in our case.
export const SetAttribute = (attribute, value) => {
    if (IsTrackableHost) {
        const attrObjLiteral = '{"' + attribute + '": "' + value + '"}';
        const attributes = JSON.parse(attrObjLiteral);
        ReactGA.set(attributes);
    }
}