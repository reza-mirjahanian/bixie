'use strict';

const
    mongoose = require('mongoose'),
    _ = require('lodash'),
    fs = require('fs'),
    constants = require('../../constants'),
    md5 = require('md5'),
    connectionsMapper = {},
    modelsMapper = {};

class Database {
    constructor() {
        mongoose.promise = Promise;
        this.mongoose = mongoose;
    }

    getConnection(connectionName) {
        if (!_.has(constants.MONGODB.connections, connectionName)) {
            throw new Error('Connection ' + connectionName + ' not found !');
        }

        if (_.has(connectionsMapper, connectionName)) {
            return _.get(connectionsMapper, connectionName);
        }

        const connectionConfig = _.get(constants.MONGODB.connections, connectionName);
        _.set(connectionsMapper, connectionName, mongoose.createConnection(connectionConfig.uri,
            {
                useNewUrlParser: true,
            }
        ));

        return _.get(connectionsMapper, connectionName);
    }

    getModel(model, collectionName) {
        model = this._capitalizeModelName(model);
        const modelKey = this._getModelKey(model, collectionName);

        if (_.has(modelsMapper, modelKey)) {
            return _.get(modelsMapper, modelKey);
        }

        const modelObject = this._loadModelObject(model);
        const connection = this.getConnection(modelObject.connection());
        const mongooseModel = connection.model(model, modelObject.schema(), collectionName || modelObject.collectionName());
        mongooseModel.getConnectionName = () => modelObject.connection();

        _.set(modelsMapper, modelKey, mongooseModel);
        return _.get(modelsMapper, modelKey);
    }




    _capitalizeModelName(string) {
        return (string.charAt(0).toLowerCase() + string.slice(1)).replace(/([A-Z])/g, "_$1").toLowerCase();
    }

    _getModelKey(model, collectionName) {
        return md5(model + collectionName);
    }

    _loadModelObject(model) {
        const modelPath = __dirname + '/models/' + model + '.js';
        if (!fs.existsSync(modelPath)) {
            throw new Error('Model ' + model + ' not found !');
        }

        return require(modelPath);
    }
}

module.exports = new Database();
