const PROTO_PATH = __dirname + '/proto/multiplication.proto';

const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
var protobuf = require("protobufjs");
const _ = require('lodash');

let packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });

let multiplication_proto = grpc.loadPackageDefinition(packageDefinition).multiplication;


function getResult(call, callback) {
    console.log("ON SERVER");

    console.dir(call.request);
    let result = calculate(call.request.matrixA, call.request.vectorB);
    callback(null, {result: result});
}

/**
 * Implements the multiplyMatrixVector RPC method.
 */
function multiplyMatrixVector(call, callback) {
    console.log("successfully connected");
    let matrixBlock = call.request.matrixA;
    let vector = call.request.vectorB;
    let result = [];
    for(let i = 0; i < 8; i++){
        result.push([]);
        for(let j = 0; j < matrixBlock.length; j++){
            result[i][j] = matrixBlock[i][j] * vector[j];
        }
    }
    callback(null, {result_matrix: result});
}

function calculate(matrix, vector){
    let result = [];
    for(let i = 0; i < 8; i++){
        result.push([]);
        for(let j = 0; j < matrix.length; j++){
            result[i][j] = matrix[i][j] * vector[j];
        }
    }
    return result;
}


/**
 * RPC server that receives requests for the Multiplication service at the
 * sample server port.
 */
function main() {
    let server = new grpc.Server();
    server.addService(multiplication_proto.Multiplication.service, {getResult: getResult, multiplyMatrixVector: multiplyMatrixVector});
    let port = '0.0.0.0:45001';
    server.bindAsync(port, grpc.ServerCredentials.createInsecure(), () => {
        console.log("Listening on " + port + " . . .\n \tPress CTRL+C to put server down.");
        server.start();
    });

}
main();
