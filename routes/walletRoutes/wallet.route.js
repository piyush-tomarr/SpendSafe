const express = require('express')
const { handleWallet, getWallet, debitMoney, creditMoney, transaction_History, transactionContoller } = require('./wallet.controller')
const router  = express.Router()
router.post('/wallet/add',handleWallet)
router.get('/mywallet' ,getWallet)
router.get('/transaction-history/:user_id',transaction_History)
router.post('/:user_id/transaction' ,transactionContoller)
module.exports=router