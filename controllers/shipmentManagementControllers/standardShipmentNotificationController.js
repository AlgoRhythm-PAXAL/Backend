// //http://localhost:5000/standardShipments/notifyAboutShipment/67bcec6e8a5f92217616f7e6
// const { time } = require('console');
// const Shipment = require('../../models/B2BShipmentModel');
// const Parcel = require('../../models/ParcelModel');
// const timeMatrix = {
//     Center01: { Center02: 5, Center03: 6, Center04: 4, Center05: 3 },
//     Center02: { Center01: 5, Center03: 4, Center04: 5, Center05: 5 },
//     Center03: { Center01: 6, Center02: 4, Center04: 2, Center05: 5 },
//     Center04: { Center01: 4, Center02: 5, Center03: 2, Center05: 5 },
//     Center05: { Center01: 3, Center02: 5, Center03: 5, Center04: 5 }
// };

// const maxWeight = 2500;
// const maxVolume = 10;





// async function processParcelsForShipment(shipment, nextCenter) {
//     try {
//         // Get the current center index in the shipment route
//         const currentIndex = shipment.route.indexOf(shipment.currentLocation);
//         if (currentIndex === -1) {
//             console.error('Current center not found in route');
//             return false;
//         }

//         console.log(`Processing parcels at ${shipment.currentLocation}`);

//         // Get the remaining centers in the shipment route
//         const remainingCenters = shipment.route.slice(currentIndex + 1);
//         console.log('Remaining centers in route:', remainingCenters);

//         if (remainingCenters.length === 0) {
//             console.log('No remaining centers to process.');
//             shipment.status = 'Completed';
//             return false;
//         }

//         // Fetch parcels that are at the current location and destined for remaining centers
//         let parcelsToProcess = await Parcel.find({
//             destination: { $in: remainingCenters },
//             sourceCenter: shipment.currentLocation,
//             shipmentId: null,
//             weight: { $lte: maxWeight },
//             volume: { $lte: maxVolume },
//             deliveryType: "Standard"
//         });

//         if (parcelsToProcess.length === 0) {
//             console.log('No parcels available for processing.');
//             return false;
//         }

//         console.log('Retrieved parcels:', parcelsToProcess);

//         // Group parcels by destination center
//         let groupedParcels = {};
//         parcelsToProcess.forEach(parcel => {
//             if (!groupedParcels[parcel.destination]) {
//                 groupedParcels[parcel.destination] = [];
//             }
//             groupedParcels[parcel.destination].push(parcel);
//         });

//         // Iterate through each group and check constraints
//         for (const [center, parcels] of Object.entries(groupedParcels)) {
//             let totalWeight = parcels.reduce((sum, p) => sum + p.weight, 0);
//             let totalVolume = parcels.reduce((sum, p) => sum + p.volume, 0);

//             console.log(`Checking parcels from ${shipment.currentLocation} to ${center}: Total Weight=${totalWeight}, Total Volume=${totalVolume}`);

//             // Check if adding parcels exceeds shipment constraints
//             if ((shipment.totalWeight + totalWeight) > maxWeight ||
//                 (shipment.totalVolume + totalVolume) > maxVolume) {
//                 console.log(`Shipment constraints exceeded. Stopping process.`);
//                 shipment.status = 'Completed';
//                 return false;
//             }

//             // Add parcels to shipment
//             parcels.forEach(parcel => {
//                 parcel.shipmentId = shipment.id;
//             });

//             shipment.parcels.push(...parcels);
//             shipment.totalWeight += totalWeight;
//             shipment.totalVolume += totalVolume;
//             shipment.parcelCount += parcels.length;

//             console.log(`Added parcels to shipment:
//                 Updated weight: ${shipment.totalWeight},
//                 Volume: ${shipment.totalVolume}`);
//         }
//         const parcelIds = shipment.parcels.map(parcel => parcel._id);
//         await Parcel.updateMany({ _id: { $in: parcelIds } }, { shipmentId: shipment.id });
//         console.log('Parcels successfully added. Continuing shipment.');
//         return true;

//     } catch (error) {
//         console.error('Parcel processing error:', error);
//         return false;
//     }
// }


// async function notifyNextCenter(shipmentId) {
//     try {
//         const shipment = await Shipment.findOne({
//             id: shipmentId,
//             deliveryType: "Standard"
//         });

//         if (!shipment) {
//             console.error('Shipment not found:', shipmentId);
//             return null;
//         }

//         const lastCenter = shipment.route[shipment.route.length - 1];
//         console.log('Last center:', lastCenter);
//         console.log('Current location:', shipment.currentLocation);

//         const currentIndex = shipment.route.indexOf(shipment.currentLocation);


//         if (currentIndex === -1) {
//             console.error('Error: Current location not found in route.');
//             return null;
//         }



//         const currentCenter = shipment.route[currentIndex];
//         const nextCenter = shipment.route[currentIndex + 1];

//         console.log('Next center:', nextCenter || "None (End of Route)");
//         // If shipment has reached the final center
//         if (currentCenter === lastCenter) {
//             console.log(`Shipment has reached the final center: ${shipment.currentLocation}`);
//             shipment.status = 'Completed';
//             await shipment.save();
//             return shipment;  // ✅ Ensure final shipment is returned
//         }

//         const estimatedTimesMap = Object.fromEntries(
//             (shipment.arrivalTimes || []).map(({ center, time }) => [center, time])
//         );

//         if (currentCenter === lastCenter) {
//             let timeArrive = estimatedTimesMap?.[currentCenter] ?? "Unknown";
//             console.log(`Notifying ${currentCenter} about shipment ${shipmentId}. Arrival in ${timeArrive} hours.`);
//         } else {
//             let timeArrive = estimatedTimesMap?.[nextCenter] ?? "Unknown";
//             console.log(`Notifying ${nextCenter} about shipment ${shipmentId}. Arrival in ${timeArrive} hours.`);
//         }



//         // Process parcels for next center
//         const addedParcels = await processParcelsForShipment(shipment, nextCenter);
//         console.log('Added parcels:', addedParcels);

//         // Move shipment to next center
//         shipment.currentLocation = nextCenter;
//         shipment.status = 'In Transit';
//         await shipment.save();

//         // Continue to the next center and return its result
//         return await notifyNextCenter(shipmentId);  // ✅ Ensure recursion returns a value

//     } catch (error) {
//         console.error('Notification error:', error);
//         return null;
//     }
// }




//http://localhost:8000/standard-shipments/notifyAboutShipment/6800d5c1145113a6e369c3ff

// const mongoose = require('mongoose');
// const Shipment = require('../../models/B2BShipmentModel');
// const Parcel = require('../../models/ParcelModel');
// const Branch = require('../../models/BranchesModel');

// // Maximum weight and volume constraints for standard shipments
// const MAX_WEIGHT = 5000; // in kg
// const MAX_VOLUME = 20;   // in cubic meters

// /**
//  * Process a standard shipment through its route
//  * This function simulates moving a shipment through its route, collecting parcels at each stop
//  * @param {String} shipmentId - The MongoDB ObjectId of the shipment to process
//  * @returns {Promise<Object|null>} - The processed shipment or null if error
//  */
// async function processStandardShipment(shipmentId) {
//     try {
//         // Find the shipment by ID and populate parcels
//         const shipment = await Shipment.findById(shipmentId)
//             .populate('parcels');

//         if (!shipment) {
//             console.error(`Shipment not found: ${shipmentId}`);
//             return null;
//         }

//         // Ensure it's a standard shipment
//         if (shipment.deliveryType !== "Standard") {
//             console.error(`Not a standard shipment: ${shipmentId}`);
//             return null;
//         }

//         // Get the start location and store it to return to at the end
//         const startLocation = shipment.currentLocation;
//         console.log(`Starting to process standard shipment ${shipment.shipmentId} from ${startLocation}`);

//         // Process the full route - go through each center in order
//         for (let i = 0; i < shipment.route.length - 1; i++) {
//             const currentCenter = shipment.route[i];
//             const nextCenter = shipment.route[i + 1];

//             // If we're at the current location, start the process
//             if (i >= shipment.route.indexOf(shipment.currentLocation)) {
//                 console.log(`Processing at center: ${currentCenter}, next destination: ${nextCenter}`);

//                 // 1. Process parcels at current center going to remaining centers
//                 await processParcelsAtCenter(shipment, i);

//                 // 2. Notify the next center about the shipment arrival
//                 const nextArrival = shipment.arrivalTimes.find(at => at.center === nextCenter);
//                 const estimatedArrival = nextArrival ? nextArrival.time : "Unknown";
//                 console.log(`Notifying ${nextCenter} about incoming shipment. ETA: ${estimatedArrival} hours`);

//                 // 3. Update shipment location to the next center for processing
//                 shipment.currentLocation = nextCenter;
//                 shipment.status = 'In Transit';
//                // await shipment.save();

//                 // 4. Update status of all parcels in this shipment that haven't reached their destination
//                 await Parcel.updateMany(
//                     {
//                         shipmentId: shipment._id,
//                         status: { $ne: "ArrivedAtCollectionCenter" }
//                     },
//                     { status: "InTransit" }
//                 );
//             }
//         }

//         // After processing the entire route, update parcels at the final destination
//         const finalCenter = shipment.route[shipment.route.length - 1];
//         console.log(`Shipment ${shipment.shipmentId} has reached final destination: ${finalCenter}`);

//         // Update parcels that have reached their final destination
//         await updateParcelsAtFinalDestination(shipment);

//         // Return shipment to starting center
//         shipment.currentLocation = startLocation;
//         shipment.status = 'Completed';
//         //await shipment.save();

//         console.log(`Shipment processing completed and returned to ${startLocation}`);
//         return shipment;
//     } catch (error) {
//         console.error('Error processing standard shipment:', error);
//         return null;
//     }
// }

// /**
//  * Process parcels at a center and add them to the shipment
//  * @param {Object} shipment - The shipment object
//  * @param {Number} centerIndex - Index of the current center in the route
//  * @returns {Promise<Boolean>} - Whether parcels were added
//  */
// async function processParcelsAtCenter(shipment, centerIndex) {
//     try {
//         const currentCenter = shipment.route[centerIndex];
//         const remainingCenters = shipment.route.slice(centerIndex + 1);

//         console.log(`Looking for parcels at ${currentCenter} heading to: ${remainingCenters.join(', ')}`);

//         if (remainingCenters.length === 0) {
//             return false;
//         }

//         // Find the branch documents for current and remaining centers
//         const branches = await Branch.find({
//             location: { $in: [currentCenter, ...remainingCenters] }
//         });

//         // Create a map of location names to branch ObjectIds
//         const locationToBranchObjectId = {};
//         branches.forEach(branch => {
//             locationToBranchObjectId[branch.location] = branch._id;
//         });

//         // Verify we have the branch ObjectId for current location
//         if (!locationToBranchObjectId[currentCenter]) {
//             console.log(`Could not find branch for location: ${currentCenter}`);
//             return false;
//         }

//         // Get target branch ObjectIds from the remaining centers
//         const targetBranchIds = remainingCenters
//             .map(center => locationToBranchObjectId[center])
//             .filter(id => id); // Filter out any undefined values

//         if (targetBranchIds.length === 0) {
//             console.log(`No target branches found for remaining centers`);
//             return false;
//         }

//         // Find parcels at current center's branch going to remaining centers' branches
//         const parcelsToProcess = await Parcel.find({
//             from: locationToBranchObjectId[currentCenter], // Reference branch by ObjectId
//             to: { $in: targetBranchIds }, // Reference destination branches by ObjectId
//             shipmentId: null, // Not assigned to any shipment yet
//             shippingMethod: "Standard"
//         });

//         if (parcelsToProcess.length === 0) {
//             console.log(`No eligible parcels found at ${currentCenter}`);
//             return false;
//         }

//         console.log(`Found ${parcelsToProcess.length} parcels to process at ${currentCenter}`);

//         // Process each parcel
//         let addedCount = 0;
//         for (const parcel of parcelsToProcess) {
//             // Calculate weight and volume based on item size
//             const weightMap = { small: 1, medium: 3, large: 8 };
//             const volumeMap = { small: 0.1, medium: 0.3, large: 0.8 };

//             const parcelWeight = weightMap[parcel.itemSize] || 1;
//             const parcelVolume = volumeMap[parcel.itemSize] || 0.1;

//             // Check if adding this parcel would exceed shipment constraints
//             if (shipment.totalWeight + parcelWeight > MAX_WEIGHT ||
//                 shipment.totalVolume + parcelVolume > MAX_VOLUME) {
//                 console.log(`Cannot add parcel ${parcel._id} - would exceed capacity`);
//                 continue;
//             }

//             // Add parcel to shipment
//             shipment.parcels.push(parcel._id);
//             shipment.totalWeight += parcelWeight;
//             shipment.totalVolume += parcelVolume;
//             shipment.parcelCount += 1;

//             // Update parcel record
//             parcel.shipmentId = shipment._id;
//             parcel.status = "ShipmentAssigned";
//             //await parcel.save();

//             addedCount++;
//         }

//         if (addedCount > 0) {
//             console.log(`Added ${addedCount} parcels to shipment ${shipment.shipmentId}`);
//             //await shipment.save();
//             return true;
//         }

//         return false;
//     } catch (error) {
//         console.error('Error processing parcels at center:', error);
//         return false;
//     }
// }

// /**
//  * Update parcels that have reached their final destination
//  * @param {Object} shipment - The shipment object
//  * @returns {Promise<Boolean>} - Whether update was successful
//  */
// async function updateParcelsAtFinalDestination(shipment) {
//     try {
//         const finalCenter = shipment.route[shipment.route.length - 1];

//         // Find the branch document for the final center
//         const finalBranch = await Branch.findOne({ location: finalCenter });

//         if (!finalBranch) {
//             console.log(`Could not find branch for final location: ${finalCenter}`);
//             return false;
//         }

//         // Update parcels that have reached their destination
//         const updateResult = await Parcel.updateMany(
//             {
//                 shipmentId: shipment._id,
//                 toBranch: finalBranch._id // Use the branch ObjectId
//             },
//             {
//                 status: "ArrivedAtCollectionCenter",
//                 arrivedToCollectionCenterTime: new Date()
//             }
//         );

//         console.log(`Updated ${updateResult.modifiedCount} parcels at final destination ${finalCenter}`);
//         return true;
//     } catch (error) {
//         console.error('Error updating parcels at final destination:', error);
//         return false;
//     }
// }

// // Export the main function
// module.exports = { processStandardShipment };



//http://localhost:8000/standard-shipments/notifyAboutShipment/68136d77f364769daccb4014


const mongoose = require('mongoose');
const Shipment = require('../../models/B2BShipmentModel');
const Parcel = require('../../models/parcelModel');
const Branch = require('../../models/BranchesModel');

// Maximum weight and volume constraints for standard shipments
const MAX_WEIGHT = 2500; // in kg (standard shipment limit)
const MAX_VOLUME = 10;   // in cubic meters (standard shipment limit)

/**
 * Process a standard shipment through its route
 * This function simulates moving a shipment through its route, collecting parcels at each stop
 * @param {String} shipmentId - The MongoDB ObjectId of the shipment to process
 * @returns {Promise<Object|null>} - The processed shipment or null if error
 */
async function processStandardShipment(shipmentId) {
    try {
        // Find the shipment by ID and populate necessary fields
        const shipment = await Shipment.findById(shipmentId)
            .populate('parcels')
            .populate('route')
            .populate('currentLocation')
            .populate('arrivalTimes.center');  

        if (!shipment) {
            console.error(`Shipment not found: ${shipmentId}`);
            return null;
        }

        // Ensure it's a standard shipment
        if (shipment.deliveryType !== "standard") {
            console.error(`Not a standard shipment: ${shipmentId}`);
            return null;
        }

        // Get the start location and store it to return to at the end
        const startLocation = shipment.currentLocation._id;
        console.log(`Starting to process standard shipment ${shipment.shipmentId} from ${shipment.currentLocation.location}`);

        // Extract ObjectIds for route centers
        const routeIds = shipment.route.map(branch => branch._id);

        // Process the full route - go through each center in order
        for (let i = 0; i < routeIds.length - 1; i++) {
            const currentCenterId = routeIds[i];
            const nextCenterId = routeIds[i + 1];

            // Find the current position in the route
            const currentIndex = routeIds.findIndex(id =>
                id.toString() === shipment.currentLocation._id.toString()
            );

            // If we're at the current location, start the process
            if (i >= currentIndex) {
                const currentCenter = shipment.route[i];
                const nextCenter = shipment.route[i + 1];

                console.log(`Processing at center: ${currentCenter.location}, next destination: ${nextCenter.location}`);

                // 1. Process parcels at current center going to remaining centers
                await processParcelsAtCenter(shipment, i);

                // 2. Notify the next center about the shipment arrival
                const nextArrival = shipment.arrivalTimes.find(at =>
                    at.center._id.toString() === nextCenterId.toString()
                );
                const estimatedArrival = nextArrival ? nextArrival.time : "Unknown";
                console.log(`Notifying ${nextCenter.location} about incoming shipment. ETA: ${estimatedArrival} hours`);

                // 3. Update shipment location to the next center for processing
                shipment.currentLocation = nextCenterId;
                shipment.status = 'In Transit';
                // await shipment.save();

                // 4. Update status of all parcels in this shipment that haven't reached their destination
                await Parcel.updateMany(
                    {
                        shipmentId: shipment._id,
                        status: { $ne: "ArrivedAtCollectionCenter" }
                    },
                    { status: "InTransit" }
                );
            }
        }

        // After processing the entire route, update parcels at the final destination
        const finalCenter = shipment.route[shipment.route.length - 1];
        console.log(`Shipment ${shipment.shipmentId} has reached final destination: ${finalCenter.location}`);

        // Update parcels that have reached their final destination
        await updateParcelsAtFinalDestination(shipment);

        // Return shipment to starting center
        shipment.currentLocation = startLocation;
        shipment.status = 'Completed';
        // await shipment.save();

        console.log(`Shipment processing completed and returned to ${shipment.route[0].location}`);
        return shipment;
    } catch (error) {
        console.error('Error processing standard shipment:', error);
        return null;
    }
}

/**
 * Process parcels at a center and add them to the shipment
 * @param {Object} shipment - The shipment object with populated fields
 * @param {Number} centerIndex - Index of the current center in the route
 * @returns {Promise<Boolean>} - Whether parcels were added
 */
async function processParcelsAtCenter(shipment, centerIndex) {
    try {
        const currentCenter = shipment.route[centerIndex];
        const remainingCenters = shipment.route.slice(centerIndex + 1);

        console.log(`Looking for parcels at ${currentCenter.location} heading to: ${remainingCenters.map(c => c.location).join(', ')}`);

        if (remainingCenters.length === 0) {
            return false;
        }

        // Get the current branch ObjectId
        const currentBranchId = currentCenter._id;

        // Get target branch ObjectIds from the remaining centers
        const targetBranchIds = remainingCenters.map(center => center._id);

        // Find parcels at current center's branch going to remaining centers' branches
        const parcelsToProcess = await Parcel.find({
            from: currentBranchId,
            to: { $in: targetBranchIds },
            shipmentId: null, // Not assigned to any shipment yet
            shippingMethod: "Standard"
        });

        if (parcelsToProcess.length === 0) {
            console.log(`No eligible parcels found at ${currentCenter.location}`);
            return false;
        }

        console.log(`Found ${parcelsToProcess.length} parcels to process at ${currentCenter.location}`);

        // Process each parcel
        let addedCount = 0;
        for (const parcel of parcelsToProcess) {
            // Calculate weight and volume based on item size
            const weightMap = { small: 1, medium: 3, large: 8 };
            const volumeMap = { small: 0.1, medium: 0.3, large: 0.8 };

            const parcelWeight = weightMap[parcel.itemSize] || 1;
            const parcelVolume = volumeMap[parcel.itemSize] || 0.1;

            // Check if adding this parcel would exceed shipment constraints
            if (shipment.totalWeight + parcelWeight > MAX_WEIGHT ||
                shipment.totalVolume + parcelVolume > MAX_VOLUME) {
                console.log(`Cannot add parcel ${parcel._id} - would exceed capacity`);
                continue;
            }

            // Add parcel to shipment
            shipment.parcels.push(parcel._id);
            shipment.totalWeight += parcelWeight;
            shipment.totalVolume += parcelVolume;
            shipment.parcelCount += 1;

            // Update parcel record
            parcel.shipmentId = shipment._id;
            parcel.status = "ShipmentAssigned";
            // await parcel.save();

            addedCount++;
        }

        if (addedCount > 0) {
            console.log(`Added ${addedCount} parcels to shipment ${shipment.shipmentId}`);
            // await shipment.save();
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error processing parcels at center:', error);
        return false;
    }
}

/**
 * Update parcels that have reached their final destination
 * @param {Object} shipment - The shipment object with populated fields
 * @returns {Promise<Boolean>} - Whether update was successful
 */
async function updateParcelsAtFinalDestination(shipment) {
    try {
        const finalCenter = shipment.route[shipment.route.length - 1];
        const finalBranchId = finalCenter._id;

        // Update parcels that have reached their destination
        const updateResult = await Parcel.updateMany(
            {
                shipmentId: shipment._id,
                to: finalBranchId // Use the branch ObjectId
            },
            {
                status: "ArrivedAtCollectionCenter",
                arrivedToCollectionCenterTime: new Date()
            }
        );

        console.log(`Updated ${updateResult.modifiedCount} parcels at final destination ${finalCenter.location}`);
        return true;
    } catch (error) {
        console.error('Error updating parcels at final destination:', error);
        return false;
    }
}

// Export the main function
module.exports = { processStandardShipment };

/**
 * Add more parcels to an existing standard shipment
 * This function finds unassigned parcels on the same route and adds them if constraints allow
 * @param {String} shipmentId - The MongoDB ObjectId of the shipment
 * @returns {Promise<Object>} - Response object with success/error status and data
 */
async function addMoreParcelsToStandardShipment(shipmentId) {
    try {
        console.log(`\n=== STARTING addMoreParcelsToStandardShipment ===`);
        console.log(`Shipment ID: ${shipmentId}`);

        // Find the shipment by ID and populate necessary fields
        console.log('Step 1: Finding and populating shipment...');
        const shipment = await Shipment.findById(shipmentId)
            .populate('parcels')
            .populate('route')
            .populate('currentLocation')
            .populate('arrivalTimes.center');

        console.log('Shipment found:', !!shipment);
        if (!shipment) {
            console.log('ERROR: Shipment not found in database');
            return {
                success: false,
                error: 'Shipment not found',
                statusCode: 404
            };
        }

        console.log('Shipment details:');
        console.log(`- Shipment ID: ${shipment.shipmentId}`);
        console.log(`- Delivery Type: "${shipment.deliveryType}" (type: ${typeof shipment.deliveryType})`);
        console.log(`- Status: "${shipment.status}"`);
        console.log(`- Current Location: ${shipment.currentLocation ? shipment.currentLocation.location : 'N/A'}`);
        console.log(`- Assigned Vehicle: ${shipment.assignedVehicle || 'N/A'}`);
        console.log(`- Route length: ${shipment.route ? shipment.route.length : 0}`);
        console.log(`- Current parcels count: ${shipment.parcels ? shipment.parcels.length : 0}`);

        // Ensure it's a standard shipment - check for case sensitivity
        console.log('\nStep 2: Checking shipment type...');
        const deliveryType = shipment.deliveryType.toLowerCase().trim();
        console.log(`Normalized delivery type: "${deliveryType}"`);
        
        if (deliveryType !== "standard") {
            console.log(`ERROR: Not a standard shipment. Expected "standard", got "${shipment.deliveryType}"`);
            return {
                success: false,
                error: `This operation is only available for standard shipments. Current type: ${shipment.deliveryType}`,
                statusCode: 400
            };
        }
        console.log('✓ Shipment type validation passed');

        // Ensure shipment is in transit (has vehicle assigned)
        console.log('\nStep 3: Checking shipment status...');
        if (shipment.status !== 'In Transit') {
            console.log(`ERROR: Shipment status is "${shipment.status}", expected "In Transit"`);
            return {
                success: false,
                error: `Can only add parcels to shipments that are In Transit. Current status: ${shipment.status}`,
                statusCode: 400
            };
        }
        console.log('✓ Shipment status validation passed');

        if (!shipment.assignedVehicle) {
            console.log('ERROR: No vehicle assigned to shipment');
            return {
                success: false,
                error: 'Cannot add parcels to shipment without assigned vehicle',
                statusCode: 400
            };
        }
        console.log('✓ Vehicle assignment validation passed');

        // Get the current location index in the route
        console.log('\nStep 4: Finding current location in route...');
        console.log('Route centers:', shipment.route.map(r => r.location));
        console.log('Current location:', shipment.currentLocation.location);
        
        const currentIndex = shipment.route.findIndex(branch => 
            branch._id.toString() === shipment.currentLocation._id.toString()
        );
        console.log(`Current index in route: ${currentIndex}`);

        if (currentIndex === -1) {
            console.log('ERROR: Current location not found in route');
            console.log('Current location ObjectId:', shipment.currentLocation._id.toString());
            console.log('Route ObjectIds:', shipment.route.map(r => r._id.toString()));
            return {
                success: false,
                error: 'Current location not found in shipment route',
                statusCode: 400
            };
        }
        console.log('✓ Current location found in route');

        // Get remaining centers (destinations after current location)
        console.log('\nStep 5: Calculating remaining centers...');
        const remainingCenters = shipment.route.slice(currentIndex + 1);
        console.log(`Remaining centers: ${remainingCenters.map(c => c.location).join(', ')}`);
        
        if (remainingCenters.length === 0) {
            console.log('ERROR: No remaining destinations in route');
            return {
                success: false,
                error: 'No remaining destinations in route to add parcels for',
                statusCode: 400
            };
        }
        console.log('✓ Found remaining centers in route');

        // Calculate current shipment capacity
        console.log('\nStep 6: Calculating capacity constraints...');
        let currentWeight = shipment.totalWeight || 0;
        let currentVolume = shipment.totalVolume || 0;
        console.log(`Current shipment capacity: Weight=${currentWeight}/${MAX_WEIGHT}, Volume=${currentVolume}/${MAX_VOLUME}`);

        // Process each center in the route starting from current location
        const parcelsToAdd = [];
        const weightMap = { small: 1, medium: 3, large: 8 };
        const volumeMap = { small: 0.1, medium: 0.3, large: 0.8 };

        console.log('\nStep 7: Iterating through route centers to find parcels...');
        
        // Start from current location and iterate through each center in the route
        for (let i = currentIndex; i < shipment.route.length - 1; i++) {
            const fromCenter = shipment.route[i];
            const remainingFromThisCenter = shipment.route.slice(i + 1);
            
            console.log(`\n--- Processing Center ${i + 1}: ${fromCenter.location} ---`);
            console.log(`Looking for parcels to: ${remainingFromThisCenter.map(c => c.location).join(', ')}`);

            // Get target branch ObjectIds from the remaining centers
            const targetBranchIds = remainingFromThisCenter.map(center => center._id);
            const fromBranchId = fromCenter._id;

            console.log(`From branch: ${fromCenter.location} (${fromBranchId})`);
            console.log(`To branches: ${remainingFromThisCenter.map(c => `${c.location} (${c._id})`).join(', ')}`);

            // Find unassigned parcels at this center going to remaining centers
            console.log(`Searching for parcels from ${fromCenter.location}...`);
            
            // First try with status filter
            let availableParcels = await Parcel.find({
                from: fromBranchId,
                to: { $in: targetBranchIds },
                shipmentId: null,
                shippingMethod: "standard",
                status: { $in: ["ArrivedAtDistributionCenter", "OrderPlaced"] }
            }).populate('from', 'location').populate('to', 'location');

            // If no parcels found with status filter, try without it
            if (availableParcels.length === 0) {
                console.log(`No parcels found with status filter, trying without status filter...`);
                availableParcels = await Parcel.find({
                    from: fromBranchId,
                    to: { $in: targetBranchIds },
                    shipmentId: null,
                    shippingMethod: "standard"
                }).populate('from', 'location').populate('to', 'location');
            }

            // If still no parcels, try case-insensitive shipping method
            if (availableParcels.length === 0) {
                console.log(`No parcels found with exact shipping method, trying case-insensitive...`);
                availableParcels = await Parcel.find({
                    from: fromBranchId,
                    to: { $in: targetBranchIds },
                    shipmentId: null,
                    shippingMethod: { $regex: new RegExp("^standard$", "i") }
                }).populate('from', 'location').populate('to', 'location');
            }

            console.log(`Found ${availableParcels.length} available parcels from ${fromCenter.location}`);

            if (availableParcels.length > 0) {
                console.log(`Parcels from ${fromCenter.location}:`);
                availableParcels.forEach((parcel, index) => {
                    console.log(`  Parcel ${index + 1}: ${parcel.parcelId} -> ${parcel.to.location} (${parcel.itemSize}, ${parcel.status})`);
                });

                // Process each available parcel and check constraints
                for (let j = 0; j < availableParcels.length; j++) {
                    const parcel = availableParcels[j];
                    const parcelWeight = weightMap[parcel.itemSize] || 1;
                    const parcelVolume = volumeMap[parcel.itemSize] || 0.1;

                    console.log(`  Processing parcel ${j + 1}: size=${parcel.itemSize}, weight=${parcelWeight}, volume=${parcelVolume}`);
                    console.log(`  Would result in: weight=${currentWeight + parcelWeight}, volume=${currentVolume + parcelVolume}`);

                    // Check if adding this parcel would exceed shipment constraints
                    if ((currentWeight + parcelWeight) <= MAX_WEIGHT && 
                        (currentVolume + parcelVolume) <= MAX_VOLUME) {
                        
                        console.log(`  ✓ Parcel ${j + 1} can be added`);
                        parcelsToAdd.push({
                            parcel: parcel,
                            weight: parcelWeight,
                            volume: parcelVolume,
                            fromCenter: fromCenter.location
                        });

                        currentWeight += parcelWeight;
                        currentVolume += parcelVolume;
                    } else {
                        console.log(`  ✗ Parcel ${j + 1} would exceed capacity limits (Weight: ${currentWeight + parcelWeight}/${MAX_WEIGHT}, Volume: ${currentVolume + parcelVolume}/${MAX_VOLUME})`);
                    }
                }
            } else {
                console.log(`No eligible parcels found from ${fromCenter.location}`);
            }

            // Check if we're approaching capacity limits after processing this center
            console.log(`After processing ${fromCenter.location}: Weight=${currentWeight}/${MAX_WEIGHT}, Volume=${currentVolume}/${MAX_VOLUME}`);
            
            // If we're close to capacity limits, check if we should continue to next center
            const remainingWeight = MAX_WEIGHT - currentWeight;
            const remainingVolume = MAX_VOLUME - currentVolume;
            
            if (remainingWeight < 1 || remainingVolume < 0.1) { // Minimum parcel is 1kg, 0.1m³
                console.log(`Capacity nearly full after ${fromCenter.location}. Stopping further collection.`);
                console.log(`Remaining capacity: Weight=${remainingWeight}kg, Volume=${remainingVolume}m³`);
                break; // Stop processing further centers
            }
        }

        console.log(`\nStep 8: Summary of parcels collection...`);
        console.log(`Total parcels found across all centers: ${parcelsToAdd.length}`);
        
        if (parcelsToAdd.length > 0) {
            console.log('Parcels to be added:');
            parcelsToAdd.forEach((item, index) => {
                console.log(`  ${index + 1}. ${item.parcel.parcelId} from ${item.fromCenter} to ${item.parcel.to.location} (${item.parcel.itemSize})`);
            });
        }

        if (parcelsToAdd.length === 0) {
            console.log('ERROR: No parcels can be added from any center in the route');
            return {
                success: false,
                error: 'No eligible parcels found along the entire route',
                statusCode: 404
            };
        }

        // Add parcels to shipment
        console.log('\nStep 9: Adding parcels to shipment...');
        const parcelIds = parcelsToAdd.map(item => item.parcel._id);
        console.log('Parcel IDs to add:', parcelIds.map(id => id.toString()));

        shipment.parcels.push(...parcelIds);
        shipment.totalWeight = currentWeight;
        shipment.totalVolume = currentVolume;
        shipment.parcelCount += parcelsToAdd.length;

        console.log('Updated shipment totals:');
        console.log(`- Total weight: ${shipment.totalWeight}`);
        console.log(`- Total volume: ${shipment.totalVolume}`);
        console.log(`- Parcel count: ${shipment.parcelCount}`);

        // Update shipment in database
        console.log('\nStep 10: Saving shipment to database...');
        await shipment.save();
        console.log('✓ Shipment saved successfully');

        // Update parcel records to assign them to this shipment
        console.log('\nStep 11: Updating parcel records...');
        const updateResult = await Parcel.updateMany(
            { _id: { $in: parcelIds } },
            { 
                shipmentId: shipment._id,
                status: "ShipmentAssigned"
            }
        );
        console.log(`✓ Updated ${updateResult.modifiedCount} parcel records`);

        // Prepare response data with center information
        const addedParcelsInfo = parcelsToAdd.map(item => ({
            parcelId: item.parcel.parcelId,
            trackingNo: item.parcel.trackingNo,
            itemSize: item.parcel.itemSize,
            itemType: item.parcel.itemType,
            from: item.parcel.from.location,
            to: item.parcel.to.location,
            weight: item.weight,
            volume: item.volume,
            pickedUpFrom: item.fromCenter
        }));

        // Group parcels by pickup center for summary
        const parcelsByCenter = {};
        parcelsToAdd.forEach(item => {
            if (!parcelsByCenter[item.fromCenter]) {
                parcelsByCenter[item.fromCenter] = [];
            }
            parcelsByCenter[item.fromCenter].push(item.parcel);
        });

        console.log('\n=== SUCCESS: Function completed successfully ===');
        console.log(`Added ${parcelsToAdd.length} parcels to shipment ${shipment.shipmentId}`);
        console.log('Parcels added by center:');
        Object.entries(parcelsByCenter).forEach(([center, parcels]) => {
            console.log(`  ${center}: ${parcels.length} parcels`);
        });

        return {
            success: true,
            message: `Successfully added ${parcelsToAdd.length} parcels to shipment from ${Object.keys(parcelsByCenter).length} centers`,
            data: {
                shipmentId: shipment.shipmentId,
                addedParcels: addedParcelsInfo,
                parcelsByCenter: parcelsByCenter,
                newTotals: {
                    weight: shipment.totalWeight,
                    volume: shipment.totalVolume,
                    parcelCount: shipment.parcelCount
                },
                remainingCapacity: {
                    weight: MAX_WEIGHT - shipment.totalWeight,
                    volume: MAX_VOLUME - shipment.totalVolume
                },
                summary: {
                    totalAdded: parcelsToAdd.length,
                    centersProcessed: Object.keys(parcelsByCenter),
                    weightAdded: parcelsToAdd.reduce((sum, item) => sum + item.weight, 0),
                    volumeAdded: parcelsToAdd.reduce((sum, item) => sum + item.volume, 0)
                }
            },
            statusCode: 200
        };

    } catch (error) {
        console.error('\n=== ERROR in addMoreParcelsToStandardShipment ===');
        console.error('Error details:', error);
        console.error('Stack trace:', error.stack);
        return {
            success: false,
            error: 'Internal server error while adding parcels',
            statusCode: 500
        };
    }
}

// Export both functions
module.exports = { processStandardShipment, addMoreParcelsToStandardShipment };