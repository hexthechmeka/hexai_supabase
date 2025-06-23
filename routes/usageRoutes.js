const express = require('express')
const router = express.Router()
const usageController = require('../controllers/usageController')
const authMiddleware = require('../middleware/authMiddleware') // 필요 시 사용

// CRUD
router.post('/', usageController.createUsage)
router.get('/', usageController.getAllUsage)
router.get('/:id', usageController.getUsageById)
router.put('/:id', usageController.updateUsage)
router.delete('/:id', usageController.deleteUsage)

module.exports = router
