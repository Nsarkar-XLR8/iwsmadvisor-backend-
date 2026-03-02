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
import faqRoutes from '../../entities/faq/faq.routes.js';
import broadcastRoutes from '../../entities/broadcast/broadcast.routes.js';
import { bannerRoutes } from '../../entities/CMS/banner/banner.routes.js';
import { aboutRoutes } from '../../entities/CMS/aboutus/about.routes.js';
import { footerRoutes } from '../../entities/CMS/footer/footer.routes.js';
import { featuresRoutes } from '../../entities/CMS/features/feature.routes.js';
import { statsRoutes } from '../../entities/CMS/stats/stats.routes.js';
import { heroRoutes } from '../../entities/CMS/hero/hero.routes.js';

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
router.use('/v1/faq', faqRoutes);
router.use('/v1/broadcast', broadcastRoutes);
router.use('/v1/banner', bannerRoutes);
router.use('/v1/about', aboutRoutes);
router.use('/v1/footer', footerRoutes);
router.use("/v1/features", featuresRoutes);
router.use("/v1/stats", statsRoutes);
router.use("/v1/hero", heroRoutes);


export default router;
