import { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  SelectChangeEvent,
  Grid,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';
import ResultsTable from './ResultsTable';
import { mockProfessionals } from '../../utils/mockData';

const verticals = [
  { id: 'interior-designers', label: 'Interior Designers' },
  { id: 'architects', label: 'Architects' },
  { id: 'custom-builders', label: 'Custom Home Builders' },
];

const radiusOptions = [10, 25, 50, 75];

export default function DirectorySearch() {
  const theme = useTheme();
  const [vertical, setVertical] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [radius, setRadius] = useState(25);
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setResults(mockProfessionals);
      setIsSearching(false);
    }, 1000);
  };

  const handleVerticalChange = (event: SelectChangeEvent) => {
    setVertical(event.target.value);
  };

  const handleRadiusChange = (event: SelectChangeEvent<number>) => {
    setRadius(event.target.value as number);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Lead Generation
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Find and connect with professionals in your area
        </Typography>

        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            mt: 3,
            backgroundColor: theme.palette.background.paper 
          }}
        >
          <Grid container spacing={3} alignItems="flex-end">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="vertical-label">Professional Type</InputLabel>
                <Select
                  labelId="vertical-label"
                  value={vertical}
                  label="Professional Type"
                  onChange={handleVerticalChange}
                >
                  {verticals.map((v) => (
                    <MenuItem key={v.id} value={v.id}>
                      {v.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                inputProps={{ maxLength: 5 }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel id="radius-label">Radius (miles)</InputLabel>
                <Select
                  labelId="radius-label"
                  value={radius}
                  label="Radius (miles)"
                  onChange={handleRadiusChange}
                >
                  {radiusOptions.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r} miles
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSearch}
                disabled={!vertical || !zipCode || isSearching}
                startIcon={<SearchIcon />}
              >
                {isSearching ? 'Searching...' : 'Generate List'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {results.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 4 }} />
            <ResultsTable results={results} />
          </Box>
        )}
      </Box>
    </Container>
  );
} 
