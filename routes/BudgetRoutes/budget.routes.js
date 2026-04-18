const express = require('express')
const { addBudget, getBudget, budgetAlertController } = require('./Budget.controller')
const router = express.Router()

router.post('/budget',addBudget)
router.get('/budget',getBudget)

router.get('/:user_id/:budget_type/budget-alerts',budgetAlertController)
module.exports = router