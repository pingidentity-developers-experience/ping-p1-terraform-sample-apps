/** 
A set of recursive JSON search algorithms.
Originally written by shakhal in classic JS.
Refactored to ES6 by dr-mohamed-benkhalifa.
getObjects() written by iwek.

@author dr-mohamed-benkhalifa
@see https://gist.github.com/shakhal/3cf5402fc61484d58c8d
@see https://gist.github.com/iwek/3924925#file-find-in-json-js
*/

class JSONSearch {

    /**
    Find Values by Key:
    Find values recursively by key in a JSON object.
    
    @param {object} obj The JSON object to be searched recursively.
    @param {string} key The key for which to search.
    @return {array} An array of search results.
    */
    findValues(obj, key) {

        let list = [];
        if (!obj) return list;
        if (obj instanceof Array) {
            for (var i in obj) {
                list = list.concat(this.findValues(obj[i], key));
            }
            return list;
        }
        if (obj[key]) list.push(obj[key]);

        if ((typeof obj == "object") && (obj !== null)) {
            let children = Object.keys(obj);
            if (children.length > 0) {
                for (let i = 0; i < children.length; i++) {
                    list = list.concat(this.findValues(obj[children[i]], key));
                }
            }
        }
        return list;
    }

    /**
    Find Values by Key or Value:
    Find values recurseivly by key or value in a JSON object.

    @param {object} obj The JSON object to be searched recursively.
    @param {string} key The key for which to search.
    @param {string} val The value for which to search.
    @return {array} An array of search results.
    */
    getObjects({obj, key, val}) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(this.getObjects(obj[i], key, val));
        } else
            //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
            // eslint-disable-next-line no-mixed-operators
            if (i === key && obj[i] === val || i === key && val === '') { //
                objects.push(obj);
            } else if (obj[i] === val && key === '') {
                //only add if the object is not already in the array
                if (objects.lastIndexOf(obj) === -1) {
                    objects.push(obj);
                }
            }
    }
    return objects;
}
};

export default JSONSearch;
