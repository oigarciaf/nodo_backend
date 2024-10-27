const express = require('express');
const router = express.Router();
const app = express();

app.use(express.json());


const routesLogin = require('./routes/routesLogin');
const routesOcupation = require('./routes/routesOcupation');
const routesLoanType = require('./routes/routesLoanType');
const routesApprovalStatus = require('./routes/routesApprovalStatus');
const routesQuotaStatus = require('./routes/routesQuotaStatus');
const routesPaymentMethod = require('./routes/routesPaymentMethod');

router.use('/user', routesLogin);
router.use('/ocupation', routesOcupation);
router.use('/loanType', routesLoanType);
router.use('/approvalStatus', routesApprovalStatus);
router.use('/quotaStatus', routesQuotaStatus);
router.use('/paymentMethod', routesPaymentMethod);


module.exports = router;

