import { Router } from 'express';
import bcrypt from 'bcryptjs';
import config from '../../config'

// client models 
import Client from '../../model/client/client';
import ClientDetails from '../../model/client/clientDetails';

// cleaner models 
import Cleaner from '../../model/cleaner/cleaner';
import CleanerDetails from '../../model/cleaner/cleanerDetails';

// admin model
import Admin from '../../model/admin/admin';

export default ({config, db}) => {
    let api = Router();

    // 'api/v1/admin/:id' -- for adding the 
    api.get('/:id', (req, res) => {
        Admin.findById(req.params.id, (err, admin) =>{
            let statusCode = 200;
            let result = {};

            if (err) {
                let statusCode = 400;
                let error = err;
                result.statusCode = statusCode;
                result.error = error;
                res.status(status).send(result);
            }

            let details = admin;
            result.statusCode = statusCode;
            result.details = details;
            res.status(status).send(result);

        })
    })

    // 'api/v1/admin/clients/:id'
    api.get('/clients/:id', (req, res) => {
        Admin.findById(req.params.id, (err, admin) =>{
            let statusCode = 200;
            let result = {};

            if (err) {
                let statusCode = 400;
                let error = err;
                result.statusCode = statusCode;
                result.error = error;
                res.status(status).send(result);
            }

            ClientDetails.find({}, (err, clientDetails)=>{
                if (err) {
                    let statusCode = 400;
                    let error = err;
                    result.statusCode = statusCode;
                    result.error = error;
                    res.status(status).send(result);
                }

                // let details = clientDetails;
                // result.statusCode = statusCode;
                // result.details = details;
                // res.status(status).send(result);

                let adminDetails = admin;
                let details = clientDetails;
                result.statusCode = statusCode;
                result.adminDetails = adminDetails
                result.clientDetails = details;
                res.status(status).send(result);
            })
        })
    })

    // 'api/v1/admin/cleaners/:id'
    api.get('/cleaners/:id', (req, res)=>{
        Admin.findById(req.params.id, (err, admin) =>{
            let statusCode = 200;
            let result = {};

            if (err) {
                let statusCode = 400;
                let error = err;
                result.statusCode = statusCode;
                result.error = error;
                res.status(status).send(result);
            }
            CleanerDetails.find({}, (err, cleanerDetails)=>{
                if (err) {
                    let statusCode = 400;
                    let error = err;
                    result.statusCode = statusCode;
                    result.error = error;
                    res.status(status).send(result);
                }
                let adminDetails = admin;
                let details = cleanerDetails;
                result.statusCode = statusCode;
                result.adminDetails = adminDetails
                result.cleanerDetails = details;
                res.status(status).send(result);
            })
        });
    });

    // 'api/v1/admin/singlecleaner/:id/:cleanerID'
    api.get('/singlecleaner/:id/:cleanerID', (req, res) =>{
        let statusCode = 200;
        let result = {};
        Admin.findById(req.params.id, (err, admin) =>{

            if (err) {
                let statusCode = 400;
                let error = err;
                result.statusCode = statusCode;
                result.error = error;
                res.status(status).send(result);
            }
            let adminDetails = admin;
            // let cleaner = cleaner;
            // let details = cleanerDetails;
            // result.statusCode = statusCode;
            // result.details = details;
            // res.status(status).send(result);

            var query = {cleanerID: req.params.cleanerID}
            Cleaner.findOne((query), (err, cleaner)=>{
                
                if (err) {
                    let statusCode = 400;
                    let error = err;
                    result.statusCode = statusCode;
                    result.error = error;
                    res.status(status).send(result);
                }


                var query = {cleanerID: req.params.cleanerID}
                CleanerDetails.findOne((query), (err, cleanerDetails)=>{
                    if (err) {
                        let statusCode = 400;
                        let error = err;
                        result.statusCode = statusCode;
                        result.error = error;
                        res.status(status).send(result);
                    }

                    // let admin = admin;
                    // let cleaner = cleaner;
                    let details = cleanerDetails;
                    result.statusCode = statusCode;
                    result.details = details;
                    res.status(status).send(result);

                })
                    
            });

        });
    });


    // 'api/v1/admin/singleclient/:id/:clientid'   
    api.get('/singleclient/:id/:clientid', (req, res) => {
        let statusCode = 200;
        let result = {};

        Admin.findById(req.params.id, (err, admin) => {
            var query = {clientID: req.params.clientid}
            result.adminDetails = admin;
            Client.findOne((query), (err, client) => {
                result.foundClient = client;
                var query = {clientID: req.params.clientid};
                ClientDetails.findOne((query), (err, clientDetails) => {
                    if (err) {
                        let statusCode = 400;
                        let error = err;
                        result.statusCode = statusCode;
                        result.error = error;
                        res.status(status).send(result);
                    }
                    let details = clientDetails;
                    result.statusCode = statusCode;
                    result.details = details;
                    res.status(status).send(result);
                })
            })
        })
    })
    // api.get('/singleclient/:id/:clientid', (req, res) => {
    //     let statusCode = 200;
    //     let result = {};
    //     Admin.findById(req.params.id, (err, admin) => {
    //         var query = {clientID: req.params.clientid}

    //         Client.findOne((query), (err, client) => {
    //             var query = {clientID: req.params.clientid}
    //             ClientDetails.findOne((query), (err, clientDetails) => {
    //                 if (err) {
    //                     let statusCode = 400;
    //                     let error = err;
    //                     result.statusCode = statusCode;
    //                     result.error = error;
    //                     res.status(status).send(result);
    //                 }

    //                 // let admin = admin;
    //                 // let cleaner = cleaner;
    //                 let details = clientDetails;
    //                 result.statusCode = statusCode;
    //                 result.details = details;
    //                 res.status(status).send(result);
    //             })
    //         });
    //     });
    // })
    

    return api;
}