require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const Counter = require('../models/Counter');
const {
  ROLES,
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  TICKET_CATEGORIES,
  AUDIT_ACTIONS,
  NOTIFICATION_TYPES,
  SLA_HOURS
} = require('../config/constants');

const DEMO_PASSWORD = 'Password123!';

const seedDatabase = async (shouldDisconnect = false) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('[Seed] Connecting to database...');
      await connectDB();
    }

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Ticket.deleteMany({}),
      Comment.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
      Counter.deleteMany({})
    ]);

    console.log('[Seed] Creating demo users...');
    const users = await User.create([
      {
        name: 'Sarah Connor (Admin)',
        email: 'admin@serviceflow.local',
        password: DEMO_PASSWORD,
        role: ROLES.ADMIN,
        department: 'IT Infrastructure & Operations'
      },
      {
        name: 'Alex Rivera (Tier 2 Agent)',
        email: 'agent1@serviceflow.local',
        password: DEMO_PASSWORD,
        role: ROLES.SUPPORT_AGENT,
        department: 'IT Technical Support'
      },
      {
        name: 'Priya Sharma (Cloud Ops Agent)',
        email: 'agent2@serviceflow.local',
        password: DEMO_PASSWORD,
        role: ROLES.SUPPORT_AGENT,
        department: 'Cloud Services & DevOps'
      },
      {
        name: 'Michael Scott (Employee)',
        email: 'employee1@serviceflow.local',
        password: DEMO_PASSWORD,
        role: ROLES.EMPLOYEE,
        department: 'Sales & Operations'
      },
      {
        name: 'Elena Rostova (Employee)',
        email: 'employee2@serviceflow.local',
        password: DEMO_PASSWORD,
        role: ROLES.EMPLOYEE,
        department: 'Product Engineering'
      }
    ]);

    const [adminUser, agent1, agent2, emp1, emp2] = users;

    console.log('[Seed] Creating sample tickets across all categories and statuses...');

    const now = new Date();
    const daysAgo = (days, hours = 0) => {
      const d = new Date(now);
      d.setDate(d.getDate() - days);
      d.setHours(d.getHours() - hours);
      return d;
    };

    const ticketsData = [
      {
        ticketId: 'INC-000001',
        title: 'Production VPN Gateway dropping connection periodically',
        description: 'Since 8:00 AM today, remote engineers in the APAC and EMEA regions are experiencing repeated disconnections every 15 minutes when connecting through the secondary VPN gateway.',
        category: TICKET_CATEGORIES.NETWORK,
        priority: TICKET_PRIORITIES.CRITICAL,
        status: TICKET_STATUSES.IN_PROGRESS,
        createdBy: emp2._id,
        assignedTo: agent2._id,
        createdAt: daysAgo(1, 4),
        slaDeadline: new Date(daysAgo(1, 4).getTime() + SLA_HOURS.Critical * 3600 * 1000)
      },
      {
        ticketId: 'INC-000002',
        title: 'Need developer access to AWS staging Kubernetes cluster',
        description: 'I recently transferred to the Payments team and require kubectl RBAC credentials for staging-k8s-cluster-east.',
        category: TICKET_CATEGORIES.ACCESS_LOGIN,
        priority: TICKET_PRIORITIES.HIGH,
        status: TICKET_STATUSES.RESOLVED,
        createdBy: emp2._id,
        assignedTo: agent1._id,
        resolution: {
          text: 'Generated IAM role arn:aws:iam::123456789012:role/k8s-dev-staging and verified kubectl access with engineer via Slack.',
          resolvedAt: daysAgo(0, 3),
          resolvedBy: agent1._id
        },
        createdAt: daysAgo(2, 6),
        slaDeadline: new Date(daysAgo(2, 6).getTime() + SLA_HOURS.High * 3600 * 1000)
      },
      {
        ticketId: 'INC-000003',
        title: 'Office printer on 4th Floor offline with paper jam error',
        description: 'The main HP LaserJet color printer in the North Wing is blinking amber with error 50.4. Multiple marketing print jobs are stuck in queue.',
        category: TICKET_CATEGORIES.HARDWARE,
        priority: TICKET_PRIORITIES.LOW,
        status: TICKET_STATUSES.CLOSED,
        createdBy: emp1._id,
        assignedTo: agent1._id,
        resolution: {
          text: 'Cleared jammed cardstock from tray 2 roller, cleaned sensor pads, and performed test print. Device is back online.',
          resolvedAt: daysAgo(3, 2),
          resolvedBy: agent1._id
        },
        createdAt: daysAgo(4, 1),
        slaDeadline: new Date(daysAgo(4, 1).getTime() + SLA_HOURS.Low * 3600 * 1000)
      },
      {
        ticketId: 'INC-000004',
        title: 'IntelliJ IDEA License server unreachable',
        description: 'When starting IntelliJ Ultimate, it shows License Server at http://licenses.internal.local:8080 returned HTTP 503. Cannot activate IDE.',
        category: TICKET_CATEGORIES.SOFTWARE,
        priority: TICKET_PRIORITIES.MEDIUM,
        status: TICKET_STATUSES.ON_HOLD,
        createdBy: emp2._id,
        assignedTo: agent2._id,
        createdAt: daysAgo(1, 8),
        slaDeadline: new Date(daysAgo(1, 8).getTime() + SLA_HOURS.Medium * 3600 * 1000)
      },
      {
        ticketId: 'INC-000005',
        title: 'Company email bounceback when sending to external partners',
        description: 'Emails sent to client domains ending in @acme-corp.com receive SPF/DKIM validation errors: 550 5.7.26 Sender Policy Framework validation failed.',
        category: TICKET_CATEGORIES.EMAIL,
        priority: TICKET_PRIORITIES.HIGH,
        status: TICKET_STATUSES.OPEN,
        createdBy: emp1._id,
        assignedTo: null, // Unassigned for Admin assignment testing
        createdAt: daysAgo(0, 2),
        slaDeadline: new Date(daysAgo(0, 2).getTime() + SLA_HOURS.High * 3600 * 1000)
      },
      {
        ticketId: 'INC-000006',
        title: 'Request second external monitor for UX design workstation',
        description: 'Need a 27-inch Dell Ultrasharp 4K display and USB-C display cable for color-accurate prototyping.',
        category: TICKET_CATEGORIES.HARDWARE,
        priority: TICKET_PRIORITIES.LOW,
        status: TICKET_STATUSES.OPEN,
        createdBy: emp1._id,
        assignedTo: null,
        createdAt: daysAgo(0, 5),
        slaDeadline: new Date(daysAgo(0, 5).getTime() + SLA_HOURS.Low * 3600 * 1000)
      },
      {
        ticketId: 'INC-000007',
        title: 'SSO Login loop on Internal HR Portal',
        description: 'When logging into Workday via Okta SSO, the browser loops between auth callback and identity provider before failing with SAML response expired.',
        category: TICKET_CATEGORIES.ACCESS_LOGIN,
        priority: TICKET_PRIORITIES.CRITICAL,
        status: TICKET_STATUSES.OPEN,
        createdBy: emp2._id,
        assignedTo: null,
        createdAt: daysAgo(0, 1),
        slaDeadline: new Date(daysAgo(0, 1).getTime() + SLA_HOURS.Critical * 3600 * 1000)
      }
    ];

    const createdTickets = await Ticket.create(ticketsData);

    // Initialize sequence counter to 7 so next ticket generated by user is INC-000008
    await Counter.create({ _id: 'ticketId', seq: 7 });

    console.log('[Seed] Generating comments and audit histories...');

    // Ticket 1: VPN Gateway
    const t1 = createdTickets[0];
    await Comment.create([
      {
        ticketId: t1._id,
        userId: emp2._id,
        text: 'The disconnections occur mostly around :00 and :30 minute marks.',
        createdAt: daysAgo(1, 3)
      },
      {
        ticketId: t1._id,
        userId: agent2._id,
        text: 'Inspecting firewall IPsec logs now. Seeing certificate renegotiation timeout on peer node gateway-02.',
        createdAt: daysAgo(1, 2)
      }
    ]);

    await AuditLog.create([
      {
        ticketId: t1._id,
        action: AUDIT_ACTIONS.TICKET_CREATED,
        performedBy: emp2._id,
        newValue: { status: 'Open', priority: 'Critical' },
        createdAt: daysAgo(1, 4)
      },
      {
        ticketId: t1._id,
        action: AUDIT_ACTIONS.TICKET_ASSIGNED,
        performedBy: adminUser._id,
        oldValue: 'Unassigned',
        newValue: agent2.name,
        createdAt: daysAgo(1, 3, 30)
      },
      {
        ticketId: t1._id,
        action: AUDIT_ACTIONS.STATUS_CHANGED,
        performedBy: agent2._id,
        oldValue: 'Open',
        newValue: 'In Progress',
        createdAt: daysAgo(1, 3)
      },
      {
        ticketId: t1._id,
        action: AUDIT_ACTIONS.COMMENT_ADDED,
        performedBy: emp2._id,
        metadata: { commentSnippet: 'The disconnections occur mostly...' },
        createdAt: daysAgo(1, 3)
      }
    ]);

    // Ticket 2: Kubernetes Access
    const t2 = createdTickets[1];
    await Comment.create([
      {
        ticketId: t2._id,
        userId: agent1._id,
        text: 'Please confirm your AWS federated user ID or Okta email.',
        createdAt: daysAgo(2, 5)
      },
      {
        ticketId: t2._id,
        userId: emp2._id,
        text: 'My federated identity is elena.rostova@serviceflow.local',
        createdAt: daysAgo(2, 4)
      }
    ]);

    await AuditLog.create([
      {
        ticketId: t2._id,
        action: AUDIT_ACTIONS.TICKET_CREATED,
        performedBy: emp2._id,
        newValue: { status: 'Open', priority: 'High' },
        createdAt: daysAgo(2, 6)
      },
      {
        ticketId: t2._id,
        action: AUDIT_ACTIONS.TICKET_ASSIGNED,
        performedBy: adminUser._id,
        oldValue: 'Unassigned',
        newValue: agent1.name,
        createdAt: daysAgo(2, 5, 30)
      },
      {
        ticketId: t2._id,
        action: AUDIT_ACTIONS.STATUS_CHANGED,
        performedBy: agent1._id,
        oldValue: 'Open',
        newValue: 'In Progress',
        createdAt: daysAgo(2, 5)
      },
      {
        ticketId: t2._id,
        action: AUDIT_ACTIONS.TICKET_RESOLVED,
        performedBy: agent1._id,
        oldValue: 'In Progress',
        newValue: 'Resolved',
        metadata: { resolution: t2.resolution.text },
        createdAt: daysAgo(0, 3)
      }
    ]);

    // Ticket 4: IntelliJ On Hold
    const t4 = createdTickets[3];
    await Comment.create([
      {
        ticketId: t4._id,
        userId: agent2._id,
        text: 'Waiting for vendor support response from JetBrains enterprise account manager regarding floating license pool renewal.',
        createdAt: daysAgo(1, 7)
      }
    ]);

    await AuditLog.create([
      {
        ticketId: t4._id,
        action: AUDIT_ACTIONS.TICKET_CREATED,
        performedBy: emp2._id,
        newValue: { status: 'Open', priority: 'Medium' },
        createdAt: daysAgo(1, 8)
      },
      {
        ticketId: t4._id,
        action: AUDIT_ACTIONS.TICKET_ASSIGNED,
        performedBy: adminUser._id,
        oldValue: 'Unassigned',
        newValue: agent2.name,
        createdAt: daysAgo(1, 7, 30)
      },
      {
        ticketId: t4._id,
        action: AUDIT_ACTIONS.STATUS_CHANGED,
        performedBy: agent2._id,
        oldValue: 'Open',
        newValue: 'In Progress',
        createdAt: daysAgo(1, 7)
      },
      {
        ticketId: t4._id,
        action: AUDIT_ACTIONS.STATUS_CHANGED,
        performedBy: agent2._id,
        oldValue: 'In Progress',
        newValue: 'On Hold',
        createdAt: daysAgo(1, 6)
      }
    ]);

    console.log('[Seed] Generating initial notifications...');
    await Notification.create([
      {
        userId: agent2._id,
        message: 'You have been assigned to critical ticket INC-000001: "Production VPN Gateway dropping connection periodically"',
        type: NOTIFICATION_TYPES.ASSIGNMENT,
        relatedTicketId: t1._id,
        ticketCode: 'INC-000001',
        read: false,
        createdAt: daysAgo(1, 3, 30)
      },
      {
        userId: emp2._id,
        message: 'Ticket INC-000002 has been marked as Resolved by Alex Rivera',
        type: NOTIFICATION_TYPES.RESOLUTION,
        relatedTicketId: t2._id,
        ticketCode: 'INC-000002',
        read: false,
        createdAt: daysAgo(0, 3)
      },
      {
        userId: adminUser._id,
        message: 'Critical incident INC-000007 created: "SSO Login loop on Internal HR Portal"',
        type: NOTIFICATION_TYPES.SYSTEM,
        relatedTicketId: createdTickets[6]._id,
        ticketCode: 'INC-000007',
        read: false,
        createdAt: daysAgo(0, 1)
      },
      {
        userId: emp1._id,
        message: 'Your ticket INC-000003 was closed by Alex Rivera',
        type: NOTIFICATION_TYPES.STATUS_CHANGE,
        relatedTicketId: createdTickets[2]._id,
        ticketCode: 'INC-000003',
        read: true,
        createdAt: daysAgo(3, 1)
      }
    ]);

    console.log('========================================================');
    console.log('  ServiceFlow Database Successfully Seeded!');
    console.log('========================================================');
    console.log(' Demo Login Accounts (Password for all: Password123!)');
    console.log('--------------------------------------------------------');
    console.log(' 1. Administrator:   admin@serviceflow.local');
    console.log(' 2. Support Agent 1: agent1@serviceflow.local');
    console.log(' 3. Support Agent 2: agent2@serviceflow.local');
    console.log(' 4. Employee 1:      employee1@serviceflow.local');
    console.log(' 5. Employee 2:      employee2@serviceflow.local');
    console.log('========================================================');

    if (shouldDisconnect) {
      await disconnectDB();
    }
    return true;
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    if (shouldDisconnect) process.exit(1);
    throw error;
  }
};

if (require.main === module) {
  seedDatabase(true).then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { seedDatabase };
