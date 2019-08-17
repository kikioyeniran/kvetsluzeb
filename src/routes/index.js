import express from 'express';
import config from '../config';
import middleware from '../middleware';
import initializeDB from '../db';

// import cleaner from '../controller/cleaner/cleaner.account';
// import booking from '../controller/booking/booking.request'

import cleanerAccount from '../controller/cleaner/account';
import bookingRequest from '../controller/booking/request';
import client from '../controller/client/client';
import clientAccount from '../controller/client/account'
import Admin from '../controller/admin/account';
import cleaner from '../controller/cleaner/cleaner'; 

let router = express();

// connect to DB
initializeDB(db => {

    // internal middleware
    router.use(middleware({config, db}));

    // /api/v1/booking/cleaner/
    // api routes (/api/v1)

    // router.use('/cleaner/account', cleanerAccount({config, db}));
    router.use('/account/cleaner', cleanerAccount({config, db}))
    // router.use('/booking', bookingRequest({config, db}));
    router.use('/cleaner', cleaner({config, db}));

    
    router.use('/client', client({config, db}));
    router.use('/client/account', clientAccount({config, db}));

    router.use('/account/admin', Admin({config, db}));
    router.use('/admin', clientAccount({config, db}));
    
    // router.use('/admin', )
});

export default router; 