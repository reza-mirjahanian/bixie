'use strict';

const
    Schema = require('mongoose').Schema,
    Models = require('./models');

class IndegoSnapshot extends Models {
    static schema() {
        return new Schema({
            at: {
                required: true,
                type: Date,
                index: true,
            },
            stations: Array,
            weather: Object

        });
    }

    static collectionName() {
        return 'bixie_Indego_snapshot';
    }

    static connection() {
        return 'default';
    }
}

module.exports = IndegoSnapshot;
