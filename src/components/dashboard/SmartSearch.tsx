'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  FilterAlt, 
  Close, 
  CalendarMonth,
  AttachMoney,
  Person,
  Inventory2,
  LocalShipping,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import { 
  TextField,
  InputAdornment,
  Button,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Collapse,
  CircularProgress,
  Fade
} from '@mui/material';

interface SmartSearchProps {
  onSearch: (filters: SearchFilters) => void;
  placeholder?: string;
  showTypeFilter?: boolean;
  showStatusFilter?: boolean;
  showDateFilter?: boolean;
  showPriceFilter?: boolean;
  showUserFilter?: boolean;
  defaultType?: 'all' | 'shipments' | 'items' | 'users';
}

export interface SearchFilters {
  query: string;
  type: 'all' | 'shipments' | 'items' | 'users';
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  minPrice?: string;
  maxPrice?: string;
  userId?: string;
}

const SHIPMENT_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'PICKUP_COMPLETED', label: 'Pickup Completed' },
  { value: 'AT_PORT', label: 'At Port' },
  { value: 'CUSTOMS_CLEARANCE', label: 'Customs Clearance' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
];

const ITEM_STATUSES = [
  { value: 'ON_HAND', label: 'On Hand' },
  { value: 'READY_FOR_SHIPMENT', label: 'Ready for Shipment' },
];

export default function SmartSearch({
  onSearch,
  placeholder = 'Search shipments, tracking numbers, VIN...',
  showTypeFilter = true,
  showStatusFilter = true,
  showDateFilter = true,
  showPriceFilter = true,
  showUserFilter = false,
  defaultType = 'all',
}: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: defaultType,
  });
  const [isSearching, setIsSearching] = useState(false);

  // Count active filters (derived state, no need for useEffect)
  const activeFiltersCount = (() => {
    let count = 0;
    if (filters.status) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.userId) count++;
    return count;
  })();

  const handleSearch = useCallback((newFilters: SearchFilters) => {
    setIsSearching(true);
    setFilters(newFilters);
    onSearch(newFilters);
    setTimeout(() => setIsSearching(false), 300);
  }, [onSearch]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== filters.query) {
        handleSearch({ ...filters, query });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, filters, handleSearch]);

  const updateFilter = (key: keyof SearchFilters, value: string | undefined) => {
    const newFilters = { ...filters, [key]: value || undefined };
    handleSearch(newFilters);
  };

  const clearFilters = () => {
    setQuery('');
    const clearedFilters: SearchFilters = {
      query: '',
      type: defaultType,
    };
    setFilters(clearedFilters);
    handleSearch(clearedFilters);
  };

  const hasActiveFilters = Boolean(query) || activeFiltersCount > 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Search Bar */}
      <Box sx={{ position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <TextField
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {isSearching ? (
                    <CircularProgress size={20} sx={{ color: 'rgb(34, 211, 238)' }} />
                  ) : (
                    <Search sx={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.4)' }} />
                  )}
                </InputAdornment>
              ),
              sx: {
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 3,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(6, 182, 212, 0.5)',
                  borderWidth: 2,
                },
                '& input': {
                  color: 'white',
                  '&::placeholder': {
                    color: 'rgba(255, 255, 255, 0.4)',
                    opacity: 1,
                  },
                },
              },
            }}
          />
          <Box sx={{ position: 'absolute', right: 8, display: 'flex', alignItems: 'center', gap: 1 }}>
            {hasActiveFilters && (
              <Button
                size="small"
                startIcon={<Close sx={{ fontSize: 16 }} />}
                onClick={clearFilters}
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  '&:hover': {
                    color: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Clear
              </Button>
            )}
            <Button
              size="small"
              variant={showFilters ? 'contained' : 'outlined'}
              startIcon={<FilterAlt sx={{ fontSize: 16 }} />}
              endIcon={showFilters ? <ExpandLess sx={{ fontSize: 16 }} /> : <ExpandMore sx={{ fontSize: 16 }} />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{
                borderColor: showFilters ? 'rgba(6, 182, 212, 0.4)' : 'rgba(255, 255, 255, 0.2)',
                bgcolor: showFilters ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                color: 'white',
                '&:hover': {
                  bgcolor: showFilters ? 'rgba(6, 182, 212, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                  borderColor: showFilters ? 'rgba(6, 182, 212, 0.6)' : 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              Filters
              {activeFiltersCount > 0 && (
                <Chip
                  label={activeFiltersCount}
                  size="small"
                  sx={{
                    ml: 1,
                    height: 20,
                    fontSize: '0.75rem',
                    bgcolor: 'rgb(6, 182, 212)',
                    color: 'white',
                  }}
                />
              )}
            </Button>
          </Box>
        </Box>

        {/* Quick Type Filter */}
        {showTypeFilter && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
            <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              Search in:
            </Typography>
            {[
              { value: 'all', label: 'All', icon: Search },
              { value: 'shipments', label: 'Shipments', icon: LocalShipping },
              { value: 'items', label: 'Items', icon: Inventory2 },
              ...(showUserFilter ? [{ value: 'users', label: 'Users', icon: Person }] : []),
            ].map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                size="small"
                variant={filters.type === value ? 'contained' : 'outlined'}
                startIcon={<Icon sx={{ fontSize: 16 }} />}
                onClick={() => updateFilter('type', value as 'all' | 'shipments' | 'items' | 'users')}
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  borderColor: filters.type === value ? 'rgba(6, 182, 212, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                  bgcolor: filters.type === value ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: filters.type === value ? 'rgb(34, 211, 238)' : 'rgba(255, 255, 255, 0.6)',
                  '&:hover': {
                    bgcolor: filters.type === value ? 'rgba(6, 182, 212, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                  },
                }}
              >
                {label}
              </Button>
            ))}
          </Box>
        )}
      </Box>

      {/* Advanced Filters */}
      <Collapse in={showFilters}>
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '1rem', sm: '1.125rem' },
                fontWeight: 600,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <FilterAlt sx={{ fontSize: 20, color: 'rgb(34, 211, 238)' }} />
              Advanced Filters
            </Typography>
            {activeFiltersCount > 0 && (
              <Button
                size="small"
                onClick={clearFilters}
                sx={{
                  fontSize: '0.875rem',
                  color: 'rgb(34, 211, 238)',
                  '&:hover': {
                    color: 'rgb(6, 182, 212)',
                  },
                }}
              >
                Clear all filters
              </Button>
            )}
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            {/* Status Filter */}
            {showStatusFilter && (
              <FormControl fullWidth>
                <InputLabel
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.875rem',
                    '&.Mui-focused': {
                      color: 'rgb(34, 211, 238)',
                    },
                  }}
                >
                  Status
                </InputLabel>
                <Select
                  value={filters.status || ''}
                  onChange={(e) => updateFilter('status', e.target.value)}
                  label="Status"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(6, 182, 212, 0.5)',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  }}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {(filters.type === 'items' ? ITEM_STATUSES : SHIPMENT_STATUSES).map((statusOption) => (
                    <MenuItem key={statusOption.value} value={statusOption.value}>
                      {statusOption.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Date From */}
            {showDateFilter && (
              <TextField
                type="date"
                label="Date From"
                value={filters.dateFrom || ''}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                  sx: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.875rem',
                    '&.Mui-focused': {
                      color: 'rgb(34, 211, 238)',
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonth sx={{ fontSize: 16, color: 'rgb(34, 211, 238)' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(6, 182, 212, 0.5)',
                    },
                  },
                }}
              />
            )}

            {/* Date To */}
            {showDateFilter && (
              <TextField
                type="date"
                label="Date To"
                value={filters.dateTo || ''}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                  sx: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.875rem',
                    '&.Mui-focused': {
                      color: 'rgb(34, 211, 238)',
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonth sx={{ fontSize: 16, color: 'rgb(34, 211, 238)' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(6, 182, 212, 0.5)',
                    },
                  },
                }}
              />
            )}

            {/* Min Price */}
            {showPriceFilter && filters.type !== 'users' && (
              <TextField
                type="number"
                label="Min Price"
                value={filters.minPrice || ''}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                placeholder="0"
                InputLabelProps={{
                  sx: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.875rem',
                    '&.Mui-focused': {
                      color: 'rgb(34, 211, 238)',
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney sx={{ fontSize: 16, color: 'rgb(34, 211, 238)' }} />
                    </InputAdornment>
                  ),
                  inputProps: { min: 0 },
                  sx: {
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(6, 182, 212, 0.5)',
                    },
                    '& input::placeholder': {
                      color: 'rgba(255, 255, 255, 0.4)',
                      opacity: 1,
                    },
                  },
                }}
              />
            )}

            {/* Max Price */}
            {showPriceFilter && filters.type !== 'users' && (
              <TextField
                type="number"
                label="Max Price"
                value={filters.maxPrice || ''}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                placeholder="10000"
                InputLabelProps={{
                  sx: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.875rem',
                    '&.Mui-focused': {
                      color: 'rgb(34, 211, 238)',
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney sx={{ fontSize: 16, color: 'rgb(34, 211, 238)' }} />
                    </InputAdornment>
                  ),
                  inputProps: { min: 0 },
                  sx: {
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(6, 182, 212, 0.5)',
                    },
                    '& input::placeholder': {
                      color: 'rgba(255, 255, 255, 0.4)',
                      opacity: 1,
                    },
                  },
                }}
              />
            )}
          </Box>

          {/* Filter Summary */}
          <Fade in={hasActiveFilters} timeout={300}>
              <Box
                sx={{
                  mt: 2,
                  p: 1.5,
                  bgcolor: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                  <FilterAlt sx={{ fontSize: 16, color: 'rgb(34, 211, 238)', mt: 0.25, flexShrink: 0 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgb(34, 211, 238)', mb: 1 }}>
                      Active Filters:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {query && (
                        <Chip
                          label={`Query: "${query}"`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(6, 182, 212, 0.2)',
                            color: 'rgb(34, 211, 238)',
                            fontSize: '0.75rem',
                          }}
                        />
                      )}
                      {filters.status && (
                        <Chip
                          label={`Status: ${filters.status}`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(6, 182, 212, 0.2)',
                            color: 'rgb(34, 211, 238)',
                            fontSize: '0.75rem',
                          }}
                        />
                      )}
                      {(filters.dateFrom || filters.dateTo) && (
                        <Chip
                          label="Date Range"
                          size="small"
                          sx={{
                            bgcolor: 'rgba(6, 182, 212, 0.2)',
                            color: 'rgb(34, 211, 238)',
                            fontSize: '0.75rem',
                          }}
                        />
                      )}
                      {(filters.minPrice || filters.maxPrice) && (
                        <Chip
                          label="Price Range"
                          size="small"
                          sx={{
                            bgcolor: 'rgba(6, 182, 212, 0.2)',
                            color: 'rgb(34, 211, 238)',
                            fontSize: '0.75rem',
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
          </Fade>
        </Box>
      </Collapse>
    </Box>
  );
}
