const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const {
  getSubjects,
  createSubject,
  deleteSubject,
} = require('../controllers/subjectController');

router.use(verifyToken);

router.route('/').get(getSubjects).post(createSubject);
router.route('/:id').delete(deleteSubject);

module.exports = router;
