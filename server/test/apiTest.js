/**
 * Comprehensive Automated Verification Test for ServiceFlow
 */
const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('========================================================');
  console.log(' Starting ServiceFlow End-to-End Automated Test Suite');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${details ? '- ' + details : ''}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const health = await request('/health');
    assert(health.status === 200 && health.data?.status === 'online', '1. Server Health Check API');

    // 2. Unauthenticated request to protected route
    const unauth = await request('/tickets');
    assert(unauth.status === 401, '2. Reject unauthenticated access (401)');

    // 3. Admin Login
    const adminLogin = await request('/auth/login', 'POST', {
      email: 'admin@serviceflow.local',
      password: 'Password123!'
    });
    assert(adminLogin.status === 200 && adminLogin.data?.token, '3. Admin Login & JWT Generation');
    const adminToken = adminLogin.data?.token;

    // 4. Support Agent Login
    const agentLogin = await request('/auth/login', 'POST', {
      email: 'agent1@serviceflow.local',
      password: 'Password123!'
    });
    assert(agentLogin.status === 200 && agentLogin.data?.token, '4. Support Agent Login & JWT Generation');
    const agentToken = agentLogin.data?.token;

    // 5. Employee Login
    const empLogin = await request('/auth/login', 'POST', {
      email: 'employee1@serviceflow.local',
      password: 'Password123!'
    });
    assert(empLogin.status === 200 && empLogin.data?.token, '5. Employee Login & JWT Generation');
    const empToken = empLogin.data?.token;

    // 6. RBAC Check: Employee attempting Admin-only users list
    const rbacDenied = await request('/users', 'GET', null, empToken);
    assert(rbacDenied.status === 403, '6. RBAC: Employee blocked from Admin endpoints (403)');

    // 7. RBAC Check: Admin accessing users list
    const rbacAllowed = await request('/users', 'GET', null, adminToken);
    assert(rbacAllowed.status === 200 && rbacAllowed.data?.data?.users?.length > 0, '7. RBAC: Admin successfully retrieves users');

    // 8. Employee creates a support ticket
    const newTicketRes = await request(
      '/tickets',
      'POST',
      {
        title: 'MacBook Pro screen flickering when connected to HDMI monitor',
        category: 'Hardware',
        priority: 'High',
        description: 'External display flickers intermittently every 30 seconds when connected via CalDigit USB-C dock.'
      },
      empToken
    );
    assert(
      newTicketRes.status === 201 && newTicketRes.data?.data?.ticket?.ticketId,
      `8. Ticket Creation: Created ticket with ID ${newTicketRes.data?.data?.ticket?.ticketId}`
    );
    const createdTicket = newTicketRes.data?.data?.ticket;

    // 9. Admin assigns ticket to Agent
    const assignRes = await request(
      `/tickets/${createdTicket._id}/assign`,
      'PATCH',
      { agentId: agentLogin.data.user.id },
      adminToken
    );
    assert(assignRes.status === 200 && assignRes.data?.data?.ticket?.assignedTo, '9. Admin Assigns Ticket to Agent');

    // 10. Agent updates status: Open -> In Progress
    const statusInProgress = await request(
      `/tickets/${createdTicket._id}/status`,
      'PATCH',
      { status: 'In Progress' },
      agentToken
    );
    assert(
      statusInProgress.status === 200 && statusInProgress.data?.data?.ticket?.status === 'In Progress',
      '10. Valid Status Transition: Open -> In Progress'
    );

    // 11. Invalid status transition check: In Progress -> Open (not allowed)
    const invalidTransition = await request(
      `/tickets/${createdTicket._id}/status`,
      'PATCH',
      { status: 'Open' },
      agentToken
    );
    assert(invalidTransition.status === 400, '11. Business Logic: Block invalid status transition (400)');

    // 12. Add comment by Employee
    const commentRes = await request(
      `/tickets/${createdTicket._id}/comments`,
      'POST',
      { text: 'I tried switching HDMI cables and the flicker persists.' },
      empToken
    );
    assert(commentRes.status === 201 && commentRes.data?.data?.comment?.text, '12. Employee adds comment to ticket');

    // 13. Add comment by Support Agent
    const agentCommentRes = await request(
      `/tickets/${createdTicket._id}/comments`,
      'POST',
      { text: 'Understood. Please install the DisplayLink driver update v1.10.' },
      agentToken
    );
    assert(agentCommentRes.status === 201, '13. Support Agent adds comment to ticket');

    // 14. Agent resolves ticket with resolution explanation
    const resolveRes = await request(
      `/tickets/${createdTicket._id}/status`,
      'PATCH',
      {
        status: 'Resolved',
        resolutionText: 'Updated Thunderbolt firmware and installed latest DisplayLink macOS driver.'
      },
      agentToken
    );
    assert(
      resolveRes.status === 200 && resolveRes.data?.data?.ticket?.status === 'Resolved',
      '14. Ticket Resolved with mandatory resolution description'
    );

    // 15. Audit history check
    const historyRes = await request(`/tickets/${createdTicket._id}/history`, 'GET', null, empToken);
    assert(
      historyRes.status === 200 && historyRes.data?.data?.history?.length >= 5,
      `15. Audit Log generated events (Count: ${historyRes.data?.data?.history?.length})`
    );

    // 16. In-App Notifications check
    const notifs = await request('/notifications', 'GET', null, agentToken);
    assert(notifs.status === 200 && Array.isArray(notifs.data?.data?.notifications), '16. Notifications retrieved');

    // 17. Dashboard Stats check
    const statsRes = await request('/dashboard/stats', 'GET', null, adminToken);
    assert(statsRes.status === 200 && statsRes.data?.data?.stats?.total > 0, '17. Dashboard Real Aggregated Statistics');

    // 18. Dashboard Trends check
    const trendsRes = await request('/dashboard/trends?days=7', 'GET', null, adminToken);
    assert(trendsRes.status === 200 && Array.isArray(trendsRes.data?.data?.trends), '18. Dashboard 7-Day Inflow Trends');

    // 19. Search & Filtering check
    const searchRes = await request(`/tickets?search=${createdTicket.ticketId}`, 'GET', null, adminToken);
    assert(
      searchRes.status === 200 && searchRes.data?.data?.tickets?.length === 1,
      `19. Search & Filter: Located ticket ${createdTicket.ticketId} by exact code`
    );

    // 20. Pagination metadata check
    assert(
      searchRes.data?.data?.pagination && typeof searchRes.data.data.pagination.totalPages === 'number',
      '20. Server Pagination Metadata structured properly'
    );

    console.log('\n========================================================');
    console.log(` Test Suite Results: ${passed} Passed, ${failed} Failed`);
    console.log('========================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('[Test Suite Error]', err);
    process.exit(1);
  }
};

runTests();
