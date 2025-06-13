const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');

// GET /api/team-members - List all team members with filters
// GET /api/team-members/:id - Get specific team member
// POST /api/team-members - Create new team member
// PUT /api/team-members/:id - Update team member
// DELETE /api/team-members/:id - Delete team member
// PUT /api/team-members/:id/rates - Update rates and billing
// GET /api/team-members/dashboard/stats - Team performance statistics

// 🚀 MVP: Get all team members with comprehensive filtering
router.get('/', async (req, res) => {
  try {
    console.log('👥 Fetching team members with filters:', req.query);
    
    const { page = 1, limit = 20, role, status, search, includeRates = false } = req.query;
    const where = {};

    // Role filter (employee, contractor, subcontractor)
    if (role) where.role = role;
    
    // Status filter (active, inactive, pending)
    if (status) where.status = status;

    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { skills: { contains: search } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const selectFields = {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      skills: true,
      certifications: true,
      createdAt: true,
      updatedAt: true
    };

    // Include sensitive rate information only if explicitly requested
    if (includeRates === 'true') {
      selectFields.hourlyRate = true;
      selectFields.salary = true;
      selectFields.contractRate = true;
    }

    const [teamMembers, total] = await Promise.all([
      prisma.teamMember.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { name: 'asc' },
        select: selectFields,
        include: {
          projectAssignments: {
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                  status: true,
                  estimatedValue: true
                }
              }
            }
          }
        }
      }),
      prisma.teamMember.count({ where })
    ]);

    // Calculate team member metrics
    const teamMembersWithMetrics = teamMembers.map(member => ({
      ...member,
      activeProjects: member.projectAssignments.filter(pa => 
        pa.project.status === 'in-progress' || pa.project.status === 'planning'
      ).length,
      totalProjects: member.projectAssignments.length,
      projectValue: member.projectAssignments.reduce((sum, pa) => 
        sum + (pa.project.estimatedValue || 0), 0
      )
    }));

    res.json({
      teamMembers: teamMembersWithMetrics,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Error fetching team members:', error);
    res.status(500).json({
      error: 'Failed to fetch team members',
      details: error.message
    });
  }
});

// 🚀 MVP: Get specific team member with full details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const teamMember = await prisma.teamMember.findUnique({
      where: { id },
      include: {
        projectAssignments: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                status: true,
                estimatedValue: true,
                startDate: true,
                estimatedEndDate: true,
                customer: {
                  select: {
                    firstName: true,
                    lastName: true,
                    company: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!teamMember) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    // Calculate comprehensive metrics
    const metrics = {
      activeProjects: teamMember.projectAssignments.filter(pa => 
        pa.project.status === 'in-progress' || pa.project.status === 'planning'
      ).length,
      completedProjects: teamMember.projectAssignments.filter(pa => 
        pa.project.status === 'completed'
      ).length,
      totalProjectValue: teamMember.projectAssignments.reduce((sum, pa) => 
        sum + (pa.project.estimatedValue || 0), 0
      ),
      utilizationRate: teamMember.projectAssignments.length > 0 ? 
        teamMember.projectAssignments.filter(pa => 
          pa.project.status === 'in-progress'
        ).length / teamMember.projectAssignments.length * 100 : 0
    };

    res.json({
      ...teamMember,
      metrics
    });

  } catch (error) {
    console.error('❌ Error fetching team member:', error);
    res.status(500).json({
      error: 'Failed to fetch team member',
      details: error.message
    });
  }
});

// 🚀 MVP: Create new team member/subcontractor
router.post('/', async (req, res) => {
  try {
    const memberData = req.body;
    
    console.log('👥 Creating team member:', {
      name: memberData.name,
      role: memberData.role,
      email: memberData.email
    });

    // Validate required fields
    if (!memberData.name || !memberData.email || !memberData.role) {
      return res.status(400).json({
        error: 'Name, email, and role are required'
      });
    }

    // Check for duplicate email
    const existing = await prisma.teamMember.findUnique({
      where: { email: memberData.email }
    });

    if (existing) {
      return res.status(400).json({
        error: 'Team member with this email already exists'
      });
    }

    const teamMember = await prisma.teamMember.create({
      data: {
        name: memberData.name,
        email: memberData.email,
        phone: memberData.phone || null,
        role: memberData.role, // employee, contractor, subcontractor
        status: memberData.status || 'active',
        skills: memberData.skills || null,
        certifications: memberData.certifications || null,
        hourlyRate: memberData.hourlyRate || null,
        salary: memberData.salary || null,
        contractRate: memberData.contractRate || null,
        address: memberData.address || null,
        emergencyContact: memberData.emergencyContact || null,
        notes: memberData.notes || null
      }
    });

    console.log('✅ Team member created successfully:', teamMember.id);

    // Remove sensitive information from response
    const { hourlyRate, salary, contractRate, ...safeResponse } = teamMember;

    res.json({
      success: true,
      teamMember: safeResponse,
      message: 'Team member created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating team member:', error);
    res.status(500).json({
      error: 'Failed to create team member',
      details: error.message
    });
  }
});

// 🚀 MVP: Update team member details
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log(`👥 Updating team member ${id}:`, updateData);

    // Remove sensitive fields that should be updated via separate endpoint
    const { hourlyRate, salary, contractRate, ...safeUpdateData } = updateData;

    const teamMember = await prisma.teamMember.update({
      where: { id },
      data: {
        ...safeUpdateData,
        updatedAt: new Date()
      }
    });

    // Remove sensitive information from response
    const { hourlyRate: hr, salary: sal, contractRate: cr, ...safeResponse } = teamMember;

    res.json({
      success: true,
      teamMember: safeResponse,
      message: 'Team member updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating team member:', error);
    res.status(500).json({
      error: 'Failed to update team member',
      details: error.message
    });
  }
});

// 🚀 MVP: Update team member rates and billing (sensitive operation)
router.put('/:id/rates', async (req, res) => {
  try {
    const { id } = req.params;
    const { hourlyRate, salary, contractRate, updatedBy } = req.body;

    console.log(`💰 Updating rates for team member ${id} by ${updatedBy}`);

    const updateData = {
      updatedAt: new Date()
    };

    if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate;
    if (salary !== undefined) updateData.salary = salary;
    if (contractRate !== undefined) updateData.contractRate = contractRate;

    const teamMember = await prisma.teamMember.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        role: true,
        hourlyRate: true,
        salary: true,
        contractRate: true,
        updatedAt: true
      }
    });

    console.log('✅ Team member rates updated successfully');

    res.json({
      success: true,
      teamMember,
      message: 'Rates updated successfully',
      updatedBy
    });

  } catch (error) {
    console.error('❌ Error updating team member rates:', error);
    res.status(500).json({
      error: 'Failed to update rates',
      details: error.message
    });
  }
});

// 🚀 MVP: Team dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    console.log('📊 Generating team dashboard statistics...');

    const [
      totalMembers,
      activeMembers,
      employees,
      contractors,
      subcontractors,
      avgHourlyRate,
      utilization
    ] = await Promise.all([
      prisma.teamMember.count(),
      prisma.teamMember.count({
        where: { status: 'active' }
      }),
      prisma.teamMember.count({
        where: { role: 'employee' }
      }),
      prisma.teamMember.count({
        where: { role: 'contractor' }
      }),
      prisma.teamMember.count({
        where: { role: 'subcontractor' }
      }),
      prisma.teamMember.aggregate({
        where: { 
          hourlyRate: { not: null },
          status: 'active'
        },
        _avg: { hourlyRate: true }
      }),
      // Calculate utilization: members with active projects / total active members
      prisma.$queryRaw`
        SELECT 
          COUNT(DISTINCT tm.id) as activeMembers,
          COUNT(DISTINCT CASE WHEN p.status IN ('planning', 'in-progress') THEN tm.id END) as utilized
        FROM TeamMember tm
        LEFT JOIN ProjectTeamMember ptm ON tm.id = ptm.teamMemberId
        LEFT JOIN Project p ON ptm.projectId = p.id
        WHERE tm.status = 'active'
      `
    ]);

    const utilizationData = utilization[0];
    const utilizationRate = utilizationData.activeMembers > 0 
      ? (utilizationData.utilized / utilizationData.activeMembers * 100).toFixed(1)
      : 0;

    const stats = {
      overview: {
        totalMembers,
        activeMembers,
        employees,
        contractors,
        subcontractors,
        avgHourlyRate: avgHourlyRate._avg.hourlyRate || 0,
        utilizationRate: parseFloat(utilizationRate)
      },
      breakdown: {
        byRole: {
          employees,
          contractors,
          subcontractors
        },
        byStatus: {
          active: activeMembers,
          inactive: totalMembers - activeMembers
        }
      }
    };

    console.log('✅ Team dashboard statistics generated');
    res.json(stats);

  } catch (error) {
    console.error('❌ Error generating team statistics:', error);
    res.status(500).json({
      error: 'Failed to generate team statistics',
      details: error.message
    });
  }
});

// 🚀 MVP: Get cost analysis for projects
router.get('/cost-analysis/:projectId?', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    console.log('💰 Generating cost analysis for project:', projectId || 'all projects');

    if (projectId) {
      // Specific project cost analysis
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          teamMembers: {
            include: {
              teamMember: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                  hourlyRate: true,
                  contractRate: true
                }
              }
            }
          }
        }
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const costBreakdown = project.teamMembers.map(ptm => {
        const rate = ptm.teamMember.hourlyRate || ptm.teamMember.contractRate || 0;
        const estimatedCost = rate * (project.estimatedHours || 0) / project.teamMembers.length;
        
        return {
          memberId: ptm.teamMember.id,
          memberName: ptm.teamMember.name,
          role: ptm.teamMember.role,
          hourlyRate: rate,
          estimatedHours: (project.estimatedHours || 0) / project.teamMembers.length,
          estimatedCost
        };
      });

      const totalEstimatedCost = costBreakdown.reduce((sum, item) => sum + item.estimatedCost, 0);

      res.json({
        project: {
          id: project.id,
          name: project.name,
          estimatedValue: project.estimatedValue,
          estimatedHours: project.estimatedHours
        },
        costBreakdown,
        totalEstimatedCost,
        profitMargin: project.estimatedValue - totalEstimatedCost,
        profitMarginPercentage: project.estimatedValue > 0 
          ? ((project.estimatedValue - totalEstimatedCost) / project.estimatedValue * 100).toFixed(1)
          : 0
      });

    } else {
      // Overall cost analysis
      const totalProjects = await prisma.project.count();
      const totalValue = await prisma.project.aggregate({
        _sum: { estimatedValue: true }
      });

      res.json({
        overview: {
          totalProjects,
          totalValue: totalValue._sum.estimatedValue || 0,
          message: 'Use /cost-analysis/:projectId for specific project analysis'
        }
      });
    }

  } catch (error) {
    console.error('❌ Error generating cost analysis:', error);
    res.status(500).json({
      error: 'Failed to generate cost analysis',
      details: error.message
    });
  }
});

module.exports = router; 