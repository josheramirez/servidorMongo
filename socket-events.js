const dbOperations = require('./db/db-operations');
const mongoose = require('mongoose');

function initialize(server) {
	// Creating a new socket.io instance by passing the HTTP server object
    const io = require('socket.io')(server);

    io.on('connection', (socket) => { // Listen on the 'connection' event for incoming sockets
        console.log('A user just connected');

        socket.on('join', (data) => { // Listen to any join event from connected users
            socket.join(data.userId); // User joins a unique room/channel that's named after the userId
            console.log(`User joined room: ${data.userId}`);
        });

        socket.on('userUpdateLocation', (data) => { 
            console.log(`Usuario: `+JSON.stringify(data));
            socket.emit('msj_server_to_all','el servidor respondio');
        });

         // Listen to a 'request-for-help' event from connected civilians
         socket.on('request-for-help', async(eventData) => {
            /*
            	eventData contains userId and location
            	1. First save the request details in the collection requestsData
            	2. AFTER saving, fetch nearby cops from civilian’s location
            	3. Fire a request-for-help event to each of the cop’s room
            */

            // 1. First save the request details in the collection requestsData.
            
           
            const requestTime = new Date(); // Time of the request
            const requestId = mongoose.Types.ObjectId(); // Generate unique ID for the request

            const location = { // Convert latitude and longitude to [longitude, latitude]
                coordinates: [
                    eventData.location.longitude,
                    eventData.location.latitude
                ],
                address: eventData.location.address
            };

            await dbOperations.saveRequest(requestId, requestTime, location, eventData.civilianId, 'waiting');

            // // 2. AFTER saving, fetch nearby cops from civilian’s location
            const nearestCops = await dbOperations.fetchNearestCops(location.coordinates, 2000);
            eventData.requestId = requestId;
            console.log(nearestCops);
            // // 3. After fetching nearest cops, fire a 'request-for-help' event to each of them
            for (let i = 0; i < nearestCops.length; i++) {
                console.log(nearestCops[i].userId);
                io.sockets.in(nearestCops[i].userId).emit('request-for-help', eventData);
            }
        });

        // ACTUALIZO LOCACION DE USUARIO
        // DEVUELVO AL USUARIO LOS CERCANOS
        // ENVIO A LOS CERCANOS EL USUARIO

        socket.on('updateLocation', async(userDetails) => {

             console.log("recibo en updateLocation: "+JSON.stringify(userDetails));
    
            //  console.log(userDetails.copDetails.location.longitude);

            const location = { // Convert latitude and longitude to [longitude, latitude]
                coordinates: [
                    userDetails.location.longitude,
                    userDetails.location.latitude
                ]
            };

            const nearestUsers = await dbOperations.fetchNearestCops(location.coordinates, 2000);
            console.log("Usuarios cercanos: "+nearestUsers.length);

            //envio los cercanos al usuario que actualizo su locacion
            io.sockets.in(userDetails.userId).emit('nearestUsers', nearestUsers);


            // console.log("enviado a usuario el neates: "+userDetails.userId);
            
            // envio a los usuarios cercanos la info del nuevo usuario
            // for (let i = 0; i < nearestUsers.length; i++) {
            //     io.sockets.in(nearestUsers[i].userId).emit('newNearUser', userDetails);
            // }

        });


        socket.on('request-accepted', async (eventData) => { //Listen to a 'request-accepted' event from connected cops
            console.log('eventData contains', eventData);
            // //Convert string to MongoDb's ObjectId data-type
            const requestId = mongoose.Types.ObjectId(eventData.requestDetails.requestId);

            // //Then update the request in the database with the cop details for given requestId
            await dbOperations.updateRequest(requestId, eventData.copDetails.copId, 'engaged');
            
            // //After updating the request, emit a 'request-accepted' event to the civilian and send cop details
            io.sockets.in(eventData.requestDetails.civilianId).emit('request-accepted', eventData.copDetails);
            // console.log('aqui abajo'+eventData.requestDetails.civilianId);
        });


    });
}

exports.initialize = initialize;