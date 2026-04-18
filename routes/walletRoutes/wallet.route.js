const express = require('express')
const { handleWallet, getWallet, debitMoney, creditMoney, transaction_History } = require('./wallet.controller')
const router  = express.Router()

router.post('/wallet/add',handleWallet)
router.get('/mywallet' ,getWallet)
router.post('/:user_id/debit' ,debitMoney)
router.post('/:user_id/credit',creditMoney)
router.get('/transaction-history/:user_id',transaction_History)

module.exports=router