import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  useTheme,
  alpha,
  Collapse,
} from '@mui/material';
import { iCatalystColors } from '../common/BrandedComponents';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Campaign as CampaignIcon,
  TrendingUp as LeadIcon,
  Business as BusinessIcon,
  Assignment as ProjectIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  AccountCircle,
  Logout as LogoutIcon,
  Group as GroupIcon,
  Description as ProposalIcon,
  Add as AddIcon,
  List as ListIcon,
  ExpandLess,
  ExpandMore,
  PersonAdd as PersonAddIcon,
  Email as EmailIcon,
  Psychology as PsychologyIcon,
  ShoppingCart as ShoppingCartIcon,
  Analytics as TrendingUpIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Link from 'next/link';

const DRAWER_WIDTH = 280;

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  description?: string;
  subItems?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: <DashboardIcon />,
    description: 'Overview and analytics'
  },
  {
    label: 'Lead Generation',
    href: '/leads',
    icon: <LeadIcon />,
    description: 'Generate and manage leads'
  },
  {
    label: 'Campaigns',
    href: '/campaigns',
    icon: <CampaignIcon />,
    badge: 3,
    description: 'Email marketing campaigns'
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: <PeopleIcon />,
    description: 'Customer management'
  },
  {
    label: 'Smart Proposals',
    href: '/proposals',
    icon: <ProposalIcon />,
    description: 'AI-powered proposal system',
    subItems: [
      {
        label: 'View All Proposals',
        href: '/proposals',
        icon: <ListIcon />,
        description: 'Browse all proposals'
      },
      {
        label: 'Create New Proposal',
        href: '/proposals/create',
        icon: <AddIcon />,
        description: 'Create with voice input & AI'
      },
      {
        label: 'Prospects',
        href: '/prospects',
        icon: <PersonAddIcon />,
        description: 'Manage prospects & conversion pipeline'
      }
    ]
  },
  {
    label: 'Employees',
    href: '/employees',
    icon: <GroupIcon />,
    badge: 5,
    description: 'Team management and workforce'
  },
  {
    label: 'Properties',
    href: '/properties',
    icon: <BusinessIcon />,
    description: 'Property database'
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: <ProjectIcon />,
    description: 'Active and completed projects'
  },
  {
    label: 'Analytics',
    href: '/executive-dashboard',
    icon: <TrendingUpIcon />,
    description: 'Executive dashboard and analytics'
  },
];

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AppLayout({ children, title = 'iCatalyst CRM' }: AppLayoutProps) {
  const router = useRouter();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    '/proposals': true // Default expand Proposals section
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleExpandToggle = (href: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [href]: !prev[href]
    }));
  };

  const isActivePath = (href: string) => {
    if (href === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(href);
  };

  const isSubItemActive = (item: NavigationItem) => {
    if (!item.subItems) return false;
    return item.subItems.some(subItem => isActivePath(subItem.href));
  };

  const renderNavigationItem = (item: NavigationItem, isSubItem = false) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItems[item.href];
    const isActive = isActivePath(item.href);
    const hasActiveSubItem = isSubItemActive(item);

    return (
      <React.Fragment key={item.href}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            component={hasSubItems ? 'div' : Link}
            href={hasSubItems ? undefined : item.href}
            onClick={hasSubItems ? () => handleExpandToggle(item.href) : undefined}
            selected={isActive || hasActiveSubItem}
            sx={{
              mx: isSubItem ? 1 : 2,
              ml: isSubItem ? 4 : 2,
              borderRadius: 2,
              '&.Mui-selected': {
                backgroundColor: alpha(iCatalystColors.iCatalystBlue, 0.1),
                color: iCatalystColors.iCatalystBlue,
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: alpha(iCatalystColors.iCatalystBlue, 0.15),
                },
              },
              '&:hover': {
                backgroundColor: alpha(theme.palette.action.hover, 0.8),
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: 'inherit',
                minWidth: 40,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              secondary={!isSubItem ? item.description : undefined}
              primaryTypographyProps={{
                fontSize: isSubItem ? '0.875rem' : '0.95rem',
                fontWeight: (isActive || hasActiveSubItem) ? 500 : 400,
                fontFamily: '"Inter", sans-serif',
                color: (isActive || hasActiveSubItem) ? iCatalystColors.iCatalystBlue : iCatalystColors.darkNavy,
              }}
              secondaryTypographyProps={{
                fontSize: '0.75rem',
                color: iCatalystColors.slateGray,
                fontFamily: '"Inter", sans-serif',
              }}
            />
            {item.badge && (
              <Chip
                label={item.badge}
                size="small"
                color="primary"
                sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
              />
            )}
            {hasSubItems && (
              <IconButton
                size="small"
                sx={{ color: 'inherit', ml: 1 }}
              >
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
          </ListItemButton>
        </ListItem>

        {/* Sub Items */}
        {hasSubItems && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.subItems?.map((subItem) => renderNavigationItem(subItem, true))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* iCatalyst Brand Header */}
      <Box sx={{ 
        p: 3, 
        borderBottom: `1px solid ${iCatalystColors.lightGray}`,
        background: `linear-gradient(135deg, ${iCatalystColors.iCatalystBlue} 0%, ${iCatalystColors.darkBlue} 100%)`,
        color: iCatalystColors.pureWhite
      }}>
        <Typography 
          variant="h5" 
          fontWeight="600" 
          sx={{ 
            fontFamily: '"Inter", sans-serif',
            fontSize: '1.5rem',
            marginBottom: '4px'
          }}
        >
          iCatalyst CRM
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.8)',
            fontFamily: '"Inter", sans-serif',
            fontSize: '0.875rem'
          }}
        >
          Smart Home Solutions Platform
        </Typography>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, py: 2 }}>
        {navigationItems.map((item) => renderNavigationItem(item))}
      </List>

      {/* Bottom Section */}
      <Box sx={{ borderTop: `1px solid ${theme.palette.divider}`, p: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            href="/settings"
            sx={{ borderRadius: 2 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backgroundColor: 'background.paper',
          color: 'text.primary',
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>

          {/* Header Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>
            
            <IconButton
              onClick={handleUserMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                <AccountCircle />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        onClick={handleUserMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 200,
          },
        }}
      >
        <MenuItem>
          <Avatar sx={{ mr: 2, width: 24, height: 24 }}>
            <AccountCircle />
          </Avatar>
          Profile
        </MenuItem>
        <MenuItem>
          <SettingsIcon sx={{ mr: 2, width: 24, height: 24 }} />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem>
          <LogoutIcon sx={{ mr: 2, width: 24, height: 24 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          height: '100vh',
          overflow: 'auto',
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        <Box sx={{ flex: 1, minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
} 