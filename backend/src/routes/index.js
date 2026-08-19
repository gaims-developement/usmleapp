import { Router } from 'express'
import { healthRouter } from './health.routes.js'
import { authRouter } from './auth/auth.routes.js'
import { userRouter } from './user/user.routes.js'
import { applicationRouter } from './application.routes.js'
import { documentRouter } from './document.routes.js'
import { paymentRouter } from './payment.routes.js'
import { notificationRouter } from './notification.routes.js'
import { calendarRouter } from './calendar.routes.js'
import { dashboardRouter } from './dashboard.routes.js'
import { adminDemoRouter } from './admin-demo.routes.js'
import { adminRouter } from './admin.routes.js'
import { programRouter } from './program.routes.js'
import { devmodeRouter } from './devmode.routes.js'
import { hospitalRouter } from './hospital.routes.js'
import { invitationRouter } from './invitation.routes.js'
import { doctorRouter } from './doctor.routes.js'
import { partnerRegistrationRouter } from './partner-registration.routes.js'
import { forumRouter } from './forum.routes.js'

export const apiRouter = Router()

apiRouter.use('/health', healthRouter)
apiRouter.use('/auth', authRouter)
apiRouter.use('/users', userRouter)
apiRouter.use('/applications', applicationRouter)
apiRouter.use('/documents', documentRouter)
apiRouter.use('/payments', paymentRouter)
apiRouter.use('/notifications', notificationRouter)
apiRouter.use('/calendar-events', calendarRouter)
apiRouter.use('/dashboard', dashboardRouter)
apiRouter.use('/admin/demo', adminDemoRouter)
apiRouter.use('/admin', adminRouter)
apiRouter.use('/programs', programRouter)
apiRouter.use('/devmode', devmodeRouter)
apiRouter.use('/hospitals', hospitalRouter)
apiRouter.use('/invitations', invitationRouter)
apiRouter.use('/doctor', doctorRouter)
apiRouter.use('/partner-registrations', partnerRegistrationRouter)
apiRouter.use('/forum', forumRouter)

