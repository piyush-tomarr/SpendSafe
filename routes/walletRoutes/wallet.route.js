const express = require('express')
const { handleWallet, getWallet, debitMoney, creditMoney, transaction_History, transactionContoller, walletForecastController } = require('./wallet.controller')
const router  = express.Router()
router.post('/add',handleWallet)
router.get('/mywallet' ,getWallet)
router.get('/transaction-history/:user_id',transaction_History)
router.post('/:user_id/transaction' ,transactionContoller)


router.get('/forecast/:user_id',walletForecastController)
module.exports=router