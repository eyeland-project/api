import { Router } from "express";

const router: Router = Router();

router.get('/introduction', () => {});
router.post('/start', () => {});
router.get('/task', () => {});

router.get('/pretask', () => {});
router.get('/pretask/links', () => {});
router.get('/pretask/links/:linkOrder', () => {});
router.get('/pretask/questions', () => {});
router.get('/pretask/questions/:questionOrder', () => {});
router.post('/pretask/questions/:questionOrder', () => {});

router.get('/duringtask', () => {});
router.get('/duringtask/questions', () => {});
router.get('/duringtask/questions/:questionOrder', () => {});
router.post('/duringtask/questions/:questionOrder', () => {});

router.get('/postask', () => {});
router.get('/postask/questions', () => {});
router.get('/postask/questions/:questionOrder', () => {});
router.post('/postask/questions/:questionOrder', () => {});

export default router;
