//made by sid 

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ticketController = require('../controllers/ticketController');

const validateTicket = [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('description').trim().isLength({ min: 10, max: 5000 }).withMessage('Description must be 10-5000 characters'),
  body('category').notEmpty().withMessage('Category is required'),
  body('severity').notEmpty().withMessage('Severity is required'),
  body('reportedBy').notEmpty().withMessage('Reporter is required'),
];

router.get('/search', ticketController.searchTickets);
router.get('/', ticketController.getTickets);
router.get('/:id', ticketController.getTicket);
router.post('/', validateTicket, ticketController.createTicket);
router.patch('/:id', ticketController.updateTicket);
router.delete('/:id', ticketController.deleteTicket);

module.exports = router;
