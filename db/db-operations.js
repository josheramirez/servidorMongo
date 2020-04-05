const dataModel = require('./data-model');
const Cop = dataModel.Cop;
const Request = dataModel.Request;

function fetchNearestCops(coordinates, maxDistance) {

    // console.log(coordinates);
    return Cop.find({
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: coordinates
                },
                $maxDistance: maxDistance
            }
        }
    })
    .exec()
    .catch(error => {
        console.log(error);
    });
}

function fetchCopDetails(userId) {
// console.log("en fetchCopDetails "+userId);

    return Cop.findOne({
        userId: userId
    }, {
        copId: 1,
        displayName: 1,
        phone: 1,
        location: 1
    })
    .exec()
    .catch(error => {
        console.log(error);
    });
}


function saveRequest(requestId, requestTime, location, civilianId, status){
    const request = new Request({
        "_id": requestId,
        requestTime: requestTime,
        location: location,
        civilianId: civilianId,
        status: status
    });
    
    return request.save()
    .catch(error => {
        console.log(error)
    });
}


function updateRequest(issueId, copId, status) {
    return Request.findOneAndUpdate({
        "_id": issueId
    }, {
        status: status,
        copId: copId
    }, {useFindAndModify: false}).catch(error => {
        console.log(error);
    });
    }
    
    exports.fetchNearestCops = fetchNearestCops;
    exports.fetchCopDetails = fetchCopDetails;
    exports.saveRequest = saveRequest;
    exports.updateRequest = updateRequest;
