const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');

// GET /api/projects - List all projects with filters
// GET /api/projects/:id - Get specific project
// POST /api/projects - Create new project
// PUT /api/projects/:id - Update project
// DELETE /api/projects/:id - Delete project
// POST /api/projects/:id/team - Add team member
// DELETE /api/projects/:id/team/:memberId - Remove team member
// PUT /api/projects/:id/status - Update project status

// 🚀 MVP: Get all projects with comprehensive filtering
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching projects with filters:', req.query);
    
    const { page = 1, limit = 20, status, customerId, search } = req.query;
    const where = {};

    // Status filter
    if (status) where.status = status;
    
    // Customer filter
    if (customerId) where.customerId = customerId;

    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { updatedAt: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              company: true,
              email: true
            }
          },
          teamMembers: {
            include: {
              teamMember: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true
                }
              }
            }
          },
          proposals: {
            select: {
              id: true,
              name: true,
              totalAmount: true,
              status: true
            }
          }
        }
      }),
      prisma.project.count({ where })
    ]);

    // Calculate project metrics
    const projectsWithMetrics = projects.map(project => ({
      ...project,
      teamSize: project.teamMembers.length,
      proposalValue: project.proposals.reduce((sum, p) => sum + p.totalAmount, 0),
      customerName: project.customer 
        ? `${project.customer.firstName} ${project.customer.lastName}`
        : 'Unknown Customer'
    }));

    res.json({
      projects: projectsWithMetrics,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Error fetching projects:', error);
    res.status(500).json({
      error: 'Failed to fetch projects',
      details: error.message
    });
  }
});

// 🚀 MVP: Get specific project with full details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            company: true,
            email: true,
            phone: true
          }
        },
        teamMembers: {
          include: {
            teamMember: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                hourlyRate: true
              }
            }
          }
        },
        proposals: {
          include: {
            items: {
              select: {
                name: true,
                quantity: true,
                totalPrice: true,
                category: true
              }
            }
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Calculate comprehensive project metrics
    const metrics = {
      totalValue: project.proposals.reduce((sum, p) => sum + p.totalAmount, 0),
      teamSize: project.teamMembers.length,
      totalItems: project.proposals.reduce((sum, p) => sum + p.items.length, 0),
      estimatedLabor: project.teamMembers.reduce((sum, tm) => 
        sum + (tm.teamMember.hourlyRate || 0) * (project.estimatedHours || 0), 0
      )
    };

    res.json({
      ...project,
      metrics
    });

  } catch (error) {
    console.error('❌ Error fetching project:', error);
    res.status(500).json({
      error: 'Failed to fetch project',
      details: error.message
    });
  }
});

// 🚀 MVP: Create new project (automatically or manually)
router.post('/', async (req, res) => {
  try {
    const projectData = req.body;
    
    console.log('🚀 Creating project:', {
      name: projectData.name,
      customerId: projectData.customerId,
      status: projectData.status,
      estimatedValue: projectData.estimatedValue
    });

    // Validate customer exists
    if (projectData.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: projectData.customerId }
      });
      if (!customer) {
        return res.status(400).json({ error: 'Customer not found' });
      }
    }

    const project = await prisma.project.create({
      data: {
        name: projectData.name,
        description: projectData.description || '',
        status: projectData.status || 'planning',
        startDate: projectData.startDate ? new Date(projectData.startDate) : new Date(),
        estimatedEndDate: projectData.estimatedEndDate ? new Date(projectData.estimatedEndDate) : null,
        estimatedValue: projectData.estimatedValue || 0,
        estimatedHours: projectData.estimatedHours || 0,
        customerId: projectData.customerId,
        createdBy: projectData.createdBy || 'System'
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            company: true
          }
        }
      }
    });

    console.log('✅ Project created successfully:', project.id);

    res.json({
      success: true,
      project,
      message: 'Project created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating project:', error);
    res.status(500).json({
      error: 'Failed to create project',
      details: error.message
    });
  }
});

// 🚀 MVP: Update project details
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log(`📝 Updating project ${id}:`, updateData);

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        customer: true,
        teamMembers: {
          include: {
            teamMember: true
          }
        }
      }
    });

    res.json({
      success: true,
      project,
      message: 'Project updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating project:', error);
    res.status(500).json({
      error: 'Failed to update project',
      details: error.message
    });
  }
});

// 🚀 MVP: Update project status with automation
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, updatedBy } = req.body;

    console.log(`📋 Updating project ${id} status to: ${status}`);

    const validStatuses = ['planning', 'in-progress', 'completed', 'on-hold', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        validStatuses
      });
    }

    const updateData = {
      status,
      updatedAt: new Date()
    };

    // Add completion date if project is completed
    if (status === 'completed' && !updateData.actualEndDate) {
      updateData.actualEndDate = new Date();
    }

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        proposals: true
      }
    });

    console.log('✅ Project status updated successfully');

    // 🎯 AUTOMATION: Trigger actions based on status
    let automationResults = {};
    if (status === 'completed') {
      console.log('🎉 Project completed - triggering completion automation');
      
      automationResults.nextSteps = [
        'generate_final_invoice',
        'send_completion_notification',
        'archive_documentation'
      ];
    }

    res.json({
      success: true,
      project,
      automation: automationResults,
      message: `Project status updated to ${status}`
    });

  } catch (error) {
    console.error('❌ Error updating project status:', error);
    res.status(500).json({
      error: 'Failed to update project status',
      details: error.message
    });
  }
});

// 🚀 MVP: Add team member to project
router.post('/:id/team', async (req, res) => {
  try {
    const { id } = req.params;
    const { teamMemberId, role } = req.body;

    console.log(`👥 Adding team member ${teamMemberId} to project ${id}`);

    // Verify team member exists
    const teamMember = await prisma.teamMember.findUnique({
      where: { id: teamMemberId }
    });

    if (!teamMember) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    // Check if already assigned
    const existing = await prisma.projectTeamMember.findFirst({
      where: {
        projectId: id,
        teamMemberId: teamMemberId
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Team member already assigned to this project' });
    }

    const assignment = await prisma.projectTeamMember.create({
      data: {
        projectId: id,
        teamMemberId: teamMemberId,
        role: role || teamMember.role
      },
      include: {
        teamMember: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    console.log('✅ Team member added successfully');

    res.json({
      success: true,
      assignment,
      message: 'Team member added to project'
    });

  } catch (error) {
    console.error('❌ Error adding team member:', error);
    res.status(500).json({
      error: 'Failed to add team member',
      details: error.message
    });
  }
});

// 🚀 MVP: Remove team member from project
router.delete('/:id/team/:memberId', async (req, res) => {
  try {
    const { id, memberId } = req.params;

    console.log(`👥 Removing team member ${memberId} from project ${id}`);

    await prisma.projectTeamMember.deleteMany({
      where: {
        projectId: id,
        teamMemberId: memberId
      }
    });

    console.log('✅ Team member removed successfully');

    res.json({
      success: true,
      message: 'Team member removed from project'
    });

  } catch (error) {
    console.error('❌ Error removing team member:', error);
    res.status(500).json({
      error: 'Failed to remove team member',
      details: error.message
    });
  }
});

// 🚀 MVP: Get project dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    console.log('📊 Generating project dashboard statistics...');

    const [
      totalProjects,
      activeProjects,
      completedProjects,
      totalValue,
      completedValue,
      recentProjects
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({
        where: {
          status: { in: ['planning', 'in-progress'] }
        }
      }),
      prisma.project.count({
        where: { status: 'completed' }
      }),
      prisma.project.aggregate({
        _sum: { estimatedValue: true }
      }),
      prisma.project.aggregate({
        where: { status: 'completed' },
        _sum: { estimatedValue: true }
      }),
      prisma.project.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: {
          customer: {
            select: { firstName: true, lastName: true }
          }
        }
      })
    ]);

    const stats = {
      overview: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalValue: totalValue._sum.estimatedValue || 0,
        completedValue: completedValue._sum.estimatedValue || 0,
        completionRate: totalProjects > 0 ? (completedProjects / totalProjects * 100).toFixed(1) : 0
      },
      recent: recentProjects.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
        estimatedValue: p.estimatedValue,
        customerName: p.customer 
          ? `${p.customer.firstName} ${p.customer.lastName}`
          : 'Unknown Customer',
        updatedAt: p.updatedAt
      }))
    };

    console.log('✅ Project dashboard statistics generated');
    res.json(stats);

  } catch (error) {
    console.error('❌ Error generating project statistics:', error);
    res.status(500).json({
      error: 'Failed to generate project statistics',
      details: error.message
    });
  }
});

module.exports = router; 