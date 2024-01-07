var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var fastifyPlugin = require('fastify-plugin');
var mqtt = require('mqtt');
function fastifyMqtt(fastify, opts, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const client = mqtt.connect(`mqtt://${opts.host}`, {
                clientId: 'q4u_api_client-' + Math.floor(Math.random() * 1000000),
                username: opts.username,
                password: opts.password
            });
            fastify.decorate('mqttClient', client);
            next();
        }
        catch (err) {
            next(err);
        }
    });
}
module.exports = fastifyPlugin(fastifyMqtt, '>=0.30.0');
//# sourceMappingURL=mqtt.js.map