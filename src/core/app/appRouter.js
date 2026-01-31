import express from 'express';
import authRoutes from '../../entities/auth/auth.routes.js';
import userRoutes from '../../entities/user/user.routes.js';
import contactRoutes from '../../entities/contact/contact.routes.js';
import caseStudyRoutes from '../../entities/caseStudy/caseStudy.routes.js';
import blogRoutes from '../../entities/blog/blog.routes.js';
import adminDashboardRoutes from '../../entities/adminDashboard/adminDashboard.routes.js';
import careerRoutes from '../../entities/career/career.routes.js';
import careerApplicationRoutes from '../../entities/careerApplication/careerApplication.routes.js';
import realStateRoutes from '../../entities/realState/realState.routes.js';
import servicePageRoutes from '../../entities/servicePage/servicePage.routes.js';

const router = express.Router();


router.use('/v1/auth', authRoutes);
router.use('/v1/contact', contactRoutes);
router.use('/v1/user', userRoutes);
router.use('/v1/case-study', caseStudyRoutes);
router.use('/v1/blog', blogRoutes);
router.use('/v1/admin-dashboard', adminDashboardRoutes);
router.use('/v1/career', careerRoutes);
router.use('/v1/career-application', careerApplicationRoutes);
router.use('/v1/real-state', realStateRoutes);
router.use('/v1/service-page', servicePageRoutes);


export default router;
