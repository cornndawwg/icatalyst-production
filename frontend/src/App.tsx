import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
// import Campaigns from './pages/Campaigns';
import CampaignCreator from './components/Campaigns/CampaignCreator';
import CampaignDetail from './components/Campaigns/CampaignDetail';
// import LeadGeneration from './pages/LeadGeneration';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import theme from './theme';
import Register from './pages/Register';
import Login from './pages/Login';
import DirectorySearch from './components/LeadGeneration/DirectorySearch';
import CampaignDashboard from './components/Campaigns/CampaignDashboard';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <CssBaseline />
            <Router>
              <Routes>
                {/* Auth Routes */}
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                
                {/* Main App Routes */}
                <Route path="/" element={
                  <Layout>
                    <Dashboard />
                  </Layout>
                } />
                <Route path="/dashboard" element={
                  <Layout>
                    <Dashboard />
                  </Layout>
                } />
                <Route path="/lead-generation" element={
                  <Layout>
                    <DirectorySearch />
                  </Layout>
                } />
                <Route path="/campaigns" element={
                  <Layout>
                    <CampaignDashboard />
                  </Layout>
                } />
                <Route path="/campaigns/new" element={
                  <Layout>
                    <CampaignCreator />
                  </Layout>
                } />
                <Route path="/campaigns/:id/edit" element={
                  <Layout>
                    <CampaignCreator />
                  </Layout>
                } />
                <Route path="/campaigns/:id" element={
                  <Layout>
                    <CampaignDetail />
                  </Layout>
                } />
                
                {/* Redirect any unknown routes to dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Router>
          </LocalizationProvider>
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App; 