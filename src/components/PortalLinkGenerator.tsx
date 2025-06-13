import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  IconButton,
  Chip,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Link as LinkIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Share as ShareIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

interface PortalLinkGeneratorProps {
  proposalId: string;
  proposalName: string;
  clientName: string;
  clientEmail?: string;
  onClose: () => void;
  onGenerated?: (portalUrl: string) => void;
}

export default function PortalLinkGenerator({
  proposalId,
  proposalName,
  clientName,
  clientEmail,
  onClose,
  onGenerated
}: PortalLinkGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [portalUrl, setPortalUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>('');
  const [expiry, setExpiry] = useState<string>('30d');

  const expiryOptions = [
    { value: '7d', label: '7 days' },
    { value: '14d', label: '14 days' },
    { value: '30d', label: '30 days' },
    { value: '60d', label: '60 days' },
    { value: '90d', label: '90 days' },
  ];

  const generatePortalLink = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/proposals/${proposalId}/portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customExpiry: expiry,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate portal link');
      }

      setPortalUrl(data.portalUrl);
      if (onGenerated) {
        onGenerated(data.portalUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(portalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const sendByEmail = () => {
    const subject = encodeURIComponent(`Proposal: ${proposalName}`);
    const body = encodeURIComponent(
      `Dear ${clientName},\n\n` +
      `Please review your proposal by clicking the link below:\n\n` +
      `${portalUrl}\n\n` +
      `This secure link will allow you to review all details and provide your approval decision.\n\n` +
      `If you have any questions, please don't hesitate to contact us.\n\n` +
      `Best regards`
    );
    
    const emailUrl = `mailto:${clientEmail}?subject=${subject}&body=${body}`;
    window.open(emailUrl);
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LinkIcon sx={{ mr: 2 }} />
          Generate Customer Portal Link
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="body1" gutterBottom>
              Create a secure portal link for <strong>{clientName}</strong> to review and approve the proposal: <strong>{proposalName}</strong>
            </Typography>
          </Grid>

          {!portalUrl && (
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Link Expiration</InputLabel>
                <Select
                  value={expiry}
                  label="Link Expiration"
                  onChange={(e) => setExpiry(e.target.value)}
                >
                  {expiryOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ScheduleIcon sx={{ mr: 1, fontSize: 16 }} />
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          {portalUrl && (
            <Grid item xs={12}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Portal link generated successfully!
              </Alert>
              
              <TextField
                fullWidth
                label="Portal URL"
                value={portalUrl}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <IconButton onClick={copyToClipboard} edge="end">
                      {copied ? <CheckIcon color="success" /> : <CopyIcon />}
                    </IconButton>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  icon={<ScheduleIcon />}
                  label={`Expires in ${expiryOptions.find(opt => opt.value === expiry)?.label}`}
                  variant="outlined"
                />
                <Chip
                  icon={<LinkIcon />}
                  label="Secure Access"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Grid>
          )}

          {portalUrl && clientEmail && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Quick Actions:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  onClick={sendByEmail}
                >
                  Send via Email
                </Button>
                <Button
                  variant="outlined"
                  startIcon={copied ? <CheckIcon /> : <CopyIcon />}
                  onClick={copyToClipboard}
                  color={copied ? 'success' : 'primary'}
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          {portalUrl ? 'Close' : 'Cancel'}
        </Button>
        {!portalUrl && (
          <Button
            variant="contained"
            onClick={generatePortalLink}
            disabled={loading}
            startIcon={<LinkIcon />}
          >
            {loading ? 'Generating...' : 'Generate Portal Link'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
} 