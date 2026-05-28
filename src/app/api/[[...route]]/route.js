import { NextResponse } from 'next/server';

// Import all API route handlers
import * as activityLog from '../activity/log/route_handler';
import * as adminActivity from '../admin/activity/route_handler';
import * as adminAnalyticsJobs from '../admin/analytics/jobs/route_handler';
import * as adminAnalyticsSchemes from '../admin/analytics/schemes/route_handler';
import * as adminAnalyticsUsage from '../admin/analytics/usage/route_handler';
import * as adminInventoryJobs from '../admin/inventory/jobs/route_handler';
import * as adminInventorySchemes from '../admin/inventory/schemes/route_handler';
import * as adminStats from '../admin/stats/route_handler';
import * as adminUsers from '../admin/users/route_handler';
import * as adminUsersEmail from '../admin/users/[email]/route_handler';
import * as analyzeForm from '../analyze-form/route_handler';
import * as analyzeSkillGap from '../analyze-skill-gap/route_handler';
import * as chat from '../chat/route_handler';
import * as communityChat from '../community/chat/route_handler';
import * as communityFeedback from '../community/feedback/route_handler';
import * as communityReviews from '../community/reviews/route_handler';
import * as communityReviewsId from '../community/reviews/[id]/route_handler';
import * as health from '../health/route_handler';
import * as interviewStart from '../interview/start/route_handler';
import * as interviewSubmit from '../interview/submit/route_handler';
import * as interviewUploadResume from '../interview/upload-resume/route_handler';
import * as login from '../login/route_handler';
import * as me from '../me/route_handler';
import * as recommend from '../recommend/route_handler';
import * as register from '../register/route_handler';
import * as whatsapp from '../whatsapp/route_handler';

async function handleRequest(request, { params }) {
  const routeParams = params.route || [];
  const method = request.method;
  const pathStr = routeParams.join('/');

  try {
    // 1. Static API Route Dispatcher
    if (pathStr === 'activity/log') return execute(activityLog, method, request);
    if (pathStr === 'admin/activity') return execute(adminActivity, method, request);
    if (pathStr === 'admin/analytics/jobs') return execute(adminAnalyticsJobs, method, request);
    if (pathStr === 'admin/analytics/schemes') return execute(adminAnalyticsSchemes, method, request);
    if (pathStr === 'admin/analytics/usage') return execute(adminAnalyticsUsage, method, request);
    if (pathStr === 'admin/inventory/jobs') return execute(adminInventoryJobs, method, request);
    if (pathStr === 'admin/inventory/schemes') return execute(adminInventorySchemes, method, request);
    if (pathStr === 'admin/stats') return execute(adminStats, method, request);
    if (pathStr === 'admin/users') return execute(adminUsers, method, request);
    
    // 2. Dynamic API Route: admin/users/[email]
    if (routeParams[0] === 'admin' && routeParams[1] === 'users' && routeParams[2]) {
      const email = routeParams[2];
      return execute(adminUsersEmail, method, request, { params: { email } });
    }
    
    if (pathStr === 'analyze-form') return execute(analyzeForm, method, request);
    if (pathStr === 'analyze-skill-gap') return execute(analyzeSkillGap, method, request);
    if (pathStr === 'chat') return execute(chat, method, request);
    if (pathStr === 'community/chat') return execute(communityChat, method, request);
    if (pathStr === 'community/feedback') return execute(communityFeedback, method, request);
    if (pathStr === 'community/reviews') return execute(communityReviews, method, request);
    
    // 3. Dynamic API Route: community/reviews/[id]
    if (routeParams[0] === 'community' && routeParams[1] === 'reviews' && routeParams[2]) {
      const id = routeParams[2];
      return execute(communityReviewsId, method, request, { params: { id } });
    }

    if (pathStr === 'health') return execute(health, method, request);
    if (pathStr === 'interview/start') return execute(interviewStart, method, request);
    if (pathStr === 'interview/submit') return execute(interviewSubmit, method, request);
    if (pathStr === 'interview/upload-resume') return execute(interviewUploadResume, method, request);
    if (pathStr === 'login') return execute(login, method, request);
    if (pathStr === 'me') return execute(me, method, request);
    if (pathStr === 'recommend') return execute(recommend, method, request);
    if (pathStr === 'register') return execute(register, method, request);
    if (pathStr === 'whatsapp') return execute(whatsapp, method, request);

    return NextResponse.json({ detail: "API Endpoint Not Found" }, { status: 404 });
  } catch (error) {
    console.error(`[Catch-All Master Router] Error dispatching path ${pathStr}:`, error);
    return NextResponse.json({ detail: `Internal routing error: ${error.message}` }, { status: 500 });
  }
}

async function execute(handler, method, request, options = {}) {
  const fn = handler[method];
  if (!fn) {
    return NextResponse.json({ detail: `Method ${method} not allowed on this endpoint` }, { status: 405 });
  }
  return fn(request, options);
}

export {
  handleRequest as GET,
  handleRequest as POST,
  handleRequest as PUT,
  handleRequest as DELETE,
  handleRequest as PATCH
};
