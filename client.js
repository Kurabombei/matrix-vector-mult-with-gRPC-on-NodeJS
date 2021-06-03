const PROTO_PATH = __dirname + '/proto/multiplication.proto';

const grpc = require('grpc');
var parseArgs = require('minimist');
const protoLoader = require('@grpc/proto-loader');
var protobuf = require("protobufjs");

let packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });

let multiplication_proto = grpc.loadPackageDefinition(packageDefinition).multiplication;

const generateMatrices = (rows,columns) => {
    const matrices = [[]];
    for (let y = 0; y < rows; y++){
        matrices[0].push([]); // matrix A
        for (let x = 0; x < columns; x++){
            matrices[0][y].push(Math.round(Math.random() * columns * rows)); // calculation for matrixA
        }
    }
    return matrices;
}

const generateVectors = (size) => {
    const vectors = [[]];
    for (let y = 0; y < size; y++){
        vectors[0].push(Math.round(Math.random() * size ** 2)); // vector A
    }
    return vectors;
}

// stub
async function main(){
    var argv = parseArgs(process.argv.slice(2), { string: 'target' });
    var target;
    if (argv.target) {
        target = argv.target;
    } else {
        target = 'localhost:45001';
    }
    let client = new multiplication_proto.Multiplication('localhost:45001', grpc.credentials.createInsecure());
    var user;
    if (argv._.length > 0) {
        user = argv._[0];
    } else {
        user = 'world';
    }

    let rows = 160, columns = 50;
    const matrices = await generateMatrices(rows, columns);// Returning an array with 2 matrices
    const vectors = generateVectors(columns);  // Returning an array with a vector
    console.log("Generated matrix:\n", matrices);
    console.log("Generated vector:\n", vectors);
    let size = 20;
    let res_gRPC = [];
    let res_client = [];
    for(let i = 0; i < 8; i++){
        //let blockToSend = matrices[0].slice(0 + size * i, size * (i + 1));
        // console.log(blockToSend);
        // client.getResult({matrixA: blockToSend, vectorB: vectors[0]}, function(err, response) {
        //     if(err){
        //         console.log("Couldn't get the data on move №" + i);
        //     }else{
        //         console.log('Done multiplication on proc №', i,'\n');
        //         console.log(response.message);
        //         res_gRPC.push(response.message);
        //     }
        // });
    }
    client.getResult({matrixA: matrices[0], vectorB: vectors[0]}, function(err, response) {
        if(err){
            console.log("Couldn't get the data on move №");
        }else{
            console.log('Done multiplication on proc №\n');
            console.log(typeof(response.result));
            console.dir(response);
            res_gRPC.push(response.message);
        }
    });
    console.log(res_gRPC);

    function multiplyClient(matrixBlockA, vectorB) {
        console.log("successfully connected");
        let matrixBlock = matrixBlockA;
        let vector = vectorB;
        let result = [];
        for(let i = 0; i < 8; i++){
            result.push([]);
            //result[i] = 2;
            for(let j = 0; j < matrixBlock[0].length; j++){
                result[i][j] = matrixBlock[i][j] * vector[j];
            }
        }
        return result;
    }
}
main();
