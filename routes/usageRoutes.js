// usageRoutes.js: API 경로 설정

const express = require('express')
const router = express.Router()
const usageController = require('../controllers/usageController')
const authMiddleware = require('../middleware/authMiddleware')

// 인증 미들웨어 적용 + 각 API 경로 연결
router.post('/usage', authMiddleware, usageController.createUsage)
router.get('/usage', authMiddleware, usageController.getAllUsage)
router.get('/usage/:id', authMiddleware, usageController.getUsageById)
router.put('/usage/:id', authMiddleware, usageController.updateUsage)
router.delete('/usage/:id', authMiddleware, usageController.deleteUsage)

module.exports = router
