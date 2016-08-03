var _ = require('lodash');
var moment = require('../public/js/libs/moment/moment');
/**
 *  Represents a Filter Mapper constructor.
 *  Allow __You__ post `filter` generated by UI & then retrieve `filterObject` for mongoose.
 * @constructor
 */

var FilterMapper = function () {
    var FILTER_CONSTANTS = require('../public/js/constants/filters');
    var startDate;
    var endDate;

    function ConvertType(values, type) {
        var result = {};

        switch (type) {
            case 'ObjectId':
                if (values.indexOf('None') !== -1) {
                    values.push(null);
                }
                result.$in = values.objectID();
                break;
            case 'string':
                if (values.indexOf('None') !== -1) {
                    values.push('');
                    values.push(null);
                }

                result.$in = values;
                break;
            case 'date':
                if (values[0]) {
                    startDate = moment(new Date(values[0])).startOf('day');
                    result.$gte = new Date(startDate);
                }

                if (values[1]) {
                    endDate = moment(new Date(values[1])).endOf('day');
                    result.$lte = new Date(endDate);
                }


                break;
            case 'integer':
                result.$in = _.map(values, function (element) {
                    return parseInt(element, 10);
                });
                break;
            case 'boolean':
                result.$in = _.map(values, function (element) {
                    return element === 'true';
                });
                break;
            case 'letter':
                result = new RegExp('^[' + values.toLowerCase() + values.toUpperCase() + '].*');
                break;
        }

        return result;
    }

    /**
     * @param {Object} filter Filter generated by UI.
     * @param {Object} filter.* Keys are model fields.
     * @param {String} filter.*.type Type of filter values.
     * @param {Array} filter.*.values Array of filter values.
     * @return {Object} Returns query object.
     */

    this.mapFilter = function (filter, contentType) {
        var filterResObject = {};
        var filterValues;
        var filterType;
        var filterBackend;
        var filterConstants = FILTER_CONSTANTS[contentType] || {};
        var filterConstantsByName;
        var filterObject;
        var filterName;

        var filterNames = Object.keys(filter);
        var i;

        for (i = filterNames.length - 1; i >= 0; i--) {
            filterName = filterNames[i];
            filterObject = filter[filterName];
            filterValues = filterObject.value;
            filterType = filterObject.type;
            filterConstantsByName = filterConstants[filterName] || {};
            filterBackend = filterObject.key || filterConstantsByName.backend;

            filterType = filterType && filterType !== '' ? filterType : filterConstantsByName.type || 'ObjectId';

            if (filterValues && (filterName !== 'startDate' || filterName !== 'endDate'))  {
                filterResObject[filterBackend] = ConvertType(filterValues, filterType);
            }


        }

        return filterResObject;
    };

};

module.exports = FilterMapper;
