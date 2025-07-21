import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip
} from '@mui/material';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import { getMergedSeatAvailability } from '../../utils/seatBookingManager';

interface SeatingLayoutProps {
  seating: {
    layout: any;
    availability: Record<string, string>;
  };
  eventId: number;
  venueType?: 'cinema' | 'arena' | 'theater';
}

const SeatingLayout: React.FC<SeatingLayoutProps> = ({ seating, eventId, venueType = 'cinema' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [mergedAvailability, setMergedAvailability] = useState<Record<string, string>>({});

  // Load selected seats from session storage and merge with booked seats
  useEffect(() => {
    // Load selected seats from session storage
    const savedSeats = sessionStorage.getItem('selectedSeats');
    if (savedSeats) {
      try {
        setSelectedSeats(JSON.parse(savedSeats));
      } catch (error) {
        console.error('Error loading selected seats:', error);
      }
    }

    // Merge original availability with dynamically booked seats
    if (seating?.availability && eventId) {
      const merged = getMergedSeatAvailability(eventId, seating.availability);
      setMergedAvailability(merged);
      console.log('Merged seat availability for event', eventId, merged);
    }
  }, [seating?.availability, eventId]);

  const getSeatColor = (status: string, isHovered: boolean = false, isSelected: boolean = false) => {
    if (isSelected) return '#2196f3'; // Blue for selected seats
    
    const colors = {
      available: isHovered ? '#4caf50' : '#66bb6a',
      booked: '#bdbdbd', // Grey color for booked seats
    };
    return colors[status as keyof typeof colors] || colors.available;
  };

  const getSeatIcon = (status: string, isHovered: boolean = false, isSelected: boolean = false) => {
    return (
      <EventSeatIcon
        sx={{
          fontSize: isMobile ? 16 : 20,
          color: getSeatColor(status, isHovered, isSelected),
          opacity: status === 'booked' ? 0.7 : 1
        }}
      />
    );
  };

  const handleSeatClick = (seatId: string, seatStatus: string) => {
    if (seatStatus !== 'available') return;
    
    setSelectedSeats(prev => {
      const newSelection = prev.includes(seatId)
        ? prev.filter(id => id !== seatId) // Remove if already selected
        : [...prev, seatId]; // Add if not selected
      
      // Store in session storage
      sessionStorage.setItem('selectedSeats', JSON.stringify(newSelection));
      return newSelection;
    });
  };

  const renderCinemaSeating = () => {
    const { rows, seatsPerRow, aisles } = seating.layout;
    
    return (
      <Box sx={{ width: '100%', maxWidth: isMobile ? '100%' : 800, mx: 'auto', px: { xs: 1, md: 0 } }}>
        {/* Screen */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Paper
            elevation={2}
            sx={{
              p: { xs: 1.5, md: 2 },
              bgcolor: '#f5f5f5',
              borderRadius: 2,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <ScreenShareIcon sx={{ color: '#6a5acd', fontSize: { xs: 20, md: 24 } }} />
            <Typography variant={isMobile ? "body1" : "h6"} sx={{ color: '#6a5acd', fontWeight: 'bold' }}>
              SCREEN
            </Typography>
          </Paper>
        </Box>

        {/* Seating Chart */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: isMobile ? 0.3 : 1,
          alignItems: 'center',
          overflowX: 'auto',
          pb: 1
        }}>
          {rows.map((row: string) => (
            <Box
              key={row}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? 0.1 : 0.5,
                minWidth: 'max-content'
              }}
            >
              {/* Row Label */}
              <Typography
                variant="body2"
                sx={{
                  minWidth: 20,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: '#6a5acd',
                  mr: 1
                }}
              >
                {row}
              </Typography>

              {/* Seats */}
              {Array.from({ length: seatsPerRow }, (_, seatIndex) => {
                const seatNumber = seatIndex + 1;
                const seatId = `${row}${seatNumber}`;
                // Use merged availability instead of original
                const seatStatus = mergedAvailability[seatId] || 'available';
                
                // Add aisle space
                const shouldAddAisle = aisles && aisles.includes(seatNumber);
                
                return (
                  <React.Fragment key={seatId}>
                    <Tooltip
                      title={
                        seatStatus === 'available' 
                          ? `${seatId} - ${selectedSeats.includes(seatId) ? 'Selected (Click to deselect)' : 'Available (Click to select)'}`
                          : `${seatId} - Seat already booked`
                      }
                      arrow
                    >
                      <span>
                        <IconButton
                          size="small"
                          disabled={seatStatus === 'booked'}
                          onClick={() => handleSeatClick(seatId, seatStatus)}
                          onMouseEnter={() => seatStatus === 'available' && setHoveredSeat(seatId)}
                          onMouseLeave={() => setHoveredSeat(null)}
                          sx={{
                            p: 0.2,
                            minWidth: 'auto',
                            cursor: seatStatus === 'available' ? 'pointer' : 'not-allowed',
                            backgroundColor: selectedSeats.includes(seatId) ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                            '&:disabled': {
                              opacity: 1,
                              backgroundColor: 'transparent',
                              '& .MuiSvgIcon-root': {
                                color: '#bdbdbd !important',
                                opacity: 0.7
                              }
                            }
                          }}
                        >
                          {getSeatIcon(seatStatus, hoveredSeat === seatId, selectedSeats.includes(seatId))}
                        </IconButton>
                      </span>
                    </Tooltip>
                    {shouldAddAisle && <Box sx={{ width: isMobile ? 8 : 16 }} />}
                  </React.Fragment>
                );
              })}

              {/* Row Label (Right) */}
              <Typography
                variant="body2"
                sx={{
                  minWidth: 20,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: '#6a5acd',
                  ml: 1
                }}
              >
                {row}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const renderTheaterSeating = () => {
    const { levels } = seating.layout;
    
    return (
      <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto' }}>
        {/* Stage */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              bgcolor: '#f5f5f5',
              borderRadius: 2,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <TheaterComedyIcon sx={{ color: '#6a5acd', fontSize: 30 }} />
            <Typography variant="h5" sx={{ color: '#6a5acd', fontWeight: 'bold' }}>
              STAGE
            </Typography>
          </Paper>
        </Box>

        {/* Theater Levels */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {levels.map((level: any) => (
            <Box key={level.name}>
              <Typography
                variant="h6"
                sx={{
                  textAlign: 'center',
                  mb: 2,
                  color: '#6a5acd',
                  fontWeight: 'bold'
                }}
              >
                {level.name}
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: isMobile ? 0.5 : 1,
                alignItems: 'center'
              }}>
                {level.rows.map((row: string) => (
                  <Box
                    key={`${level.name}-${row}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? 0.2 : 0.3
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        minWidth: 30,
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: '#6a5acd',
                        mr: 1,
                        fontSize: isMobile ? '0.75rem' : '0.875rem'
                      }}
                    >
                      {level.type === 'orchestra' ? `O${row}` : 
                       level.type === 'dress' ? `D${row}` : 
                       `G${row}`}
                    </Typography>

                    {Array.from({ length: level.seatsPerRow }, (_, seatIndex) => {
                      const seatNumber = seatIndex + 1;
                      const seatId = level.type === 'orchestra' ? `O${row}${seatNumber}` : 
                                   level.type === 'dress' ? `D${row}${seatNumber}` : 
                                   `GC${row}${seatNumber}`;
                      const seatStatus = seating.availability[seatId] || 'available';
                      
                      return (
                                                                    <Tooltip
                        key={seatId}
                        title={
                          seatStatus === 'available' 
                            ? `${seatId} - ${selectedSeats.includes(seatId) ? 'Selected (Click to deselect)' : 'Available (Click to select)'}`
                            : `${seatId} - Seat already booked`
                        }
                        arrow
                      >
                        <span>
                          <IconButton
                            size="small"
                            disabled={seatStatus === 'booked'}
                            onClick={() => handleSeatClick(seatId, seatStatus)}
                            onMouseEnter={() => seatStatus === 'available' && setHoveredSeat(seatId)}
                            onMouseLeave={() => setHoveredSeat(null)}
                            sx={{
                              p: 0.1,
                              minWidth: 'auto',
                              cursor: seatStatus === 'available' ? 'pointer' : 'not-allowed',
                              backgroundColor: selectedSeats.includes(seatId) ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                              '&:disabled': {
                                opacity: 1,
                                backgroundColor: 'transparent',
                                '& .MuiSvgIcon-root': {
                                  color: '#bdbdbd !important',
                                  opacity: 0.7
                                }
                              }
                            }}
                          >
                            <EventSeatIcon
                              sx={{
                                fontSize: isMobile ? 12 : 16,
                                color: getSeatColor(seatStatus, hoveredSeat === seatId, selectedSeats.includes(seatId)),
                                opacity: seatStatus === 'booked' ? 0.7 : 1
                              }}
                            />
                          </IconButton>
                        </span>
                      </Tooltip>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const renderArenaSeating = () => {
    const { sections } = seating.layout;
    
    return (
      <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto' }}>
        {/* Stage/Center */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              bgcolor: '#f5f5f5',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 120,
              height: 120
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <TheaterComedyIcon sx={{ color: '#6a5acd', fontSize: 30 }} />
              <Typography variant="h6" sx={{ color: '#6a5acd', fontWeight: 'bold' }}>
                STAGE
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Arena Sections */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {sections.map((section: any) => (
            <Box key={section.name}>
              <Typography
                variant="h6"
                sx={{
                  textAlign: 'center',
                  mb: 2,
                  color: '#6a5acd',
                  fontWeight: 'bold'
                }}
              >
                {section.name}
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: isMobile ? 0.5 : 1,
                alignItems: 'center'
              }}>
                {section.rows.slice(0, 3).map((row: string) => (
                  <Box
                    key={`${section.name}-${row}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? 0.2 : 0.3
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        minWidth: 30,
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: '#6a5acd',
                        mr: 1
                      }}
                    >
                      {row}
                    </Typography>

                    {Array.from({ length: Math.min(section.seatsPerRow, 12) }, (_, seatIndex) => {
                      const seatNumber = seatIndex + 1;
                      const seatId = `${row}${seatNumber}`;
                      const seatStatus = seating.availability[seatId] || 'available';
                      
                      return (
                                                <Tooltip
                          key={seatId}
                          title={
                            seatStatus === 'available' 
                              ? `${seatId} - ${selectedSeats.includes(seatId) ? 'Selected (Click to deselect)' : 'Available (Click to select)'}`
                              : `${seatId} - Seat already booked`
                          }
                          arrow
                        >
                          <span>
                            <IconButton
                              size="small"
                              disabled={seatStatus === 'booked'}
                              onClick={() => handleSeatClick(seatId, seatStatus)}
                              onMouseEnter={() => seatStatus === 'available' && setHoveredSeat(seatId)}
                              onMouseLeave={() => setHoveredSeat(null)}
                              sx={{
                                p: 0.1,
                                minWidth: 'auto',
                                cursor: seatStatus === 'available' ? 'pointer' : 'not-allowed',
                                backgroundColor: selectedSeats.includes(seatId) ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                                '&:disabled': {
                                  opacity: 1,
                                  backgroundColor: 'transparent',
                                  '& .MuiSvgIcon-root': {
                                    color: '#bdbdbd !important',
                                    opacity: 0.7
                                  }
                                }
                              }}
                            >
                              <EventSeatIcon
                                sx={{
                                  fontSize: isMobile ? 14 : 18,
                                  color: getSeatColor(seatStatus, hoveredSeat === seatId, selectedSeats.includes(seatId)),
                                  opacity: seatStatus === 'booked' ? 0.7 : 1
                                }}
                              />
                            </IconButton>
                          </span>
                        </Tooltip>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const renderSeatingLayout = () => {
    if (seating.layout.rows) {
      return renderCinemaSeating();
    } else if (seating.layout.levels) {
      return renderTheaterSeating();
    } else if (seating.layout.sections) {
      return renderArenaSeating();
    }
    return null;
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{ 
          color: '#6a5acd', 
          fontWeight: 'bold', 
          mb: 3,
          textAlign: 'center'
        }}
      >
        Venue Seating Layout
      </Typography>

      {/* Legend */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: 3, 
        mb: 4,
        flexWrap: 'wrap'
      }}>
        <Chip
          icon={<EventSeatIcon sx={{ color: '#66bb6a !important' }} />}
          label="Available"
          variant="outlined"
          sx={{
            borderColor: '#66bb6a',
            color: '#66bb6a'
          }}
        />
        <Chip
          icon={<EventSeatIcon sx={{ color: '#2196f3 !important' }} />}
          label="Selected"
          variant="outlined"
          sx={{
            borderColor: '#2196f3',
            color: '#2196f3'
          }}
        />
        <Chip
          icon={<EventSeatIcon sx={{ color: '#bdbdbd !important', filter: 'grayscale(100%)' }} />}
          label="Booked"
          variant="outlined"
          sx={{
            borderColor: '#bdbdbd',
            color: '#bdbdbd',
            opacity: 0.7
          }}
        />
      </Box>

      {/* Selected Seats Summary */}
      {selectedSeats.length > 0 && (
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: '#e3f2fd',
            border: '1px solid #2196f3',
            mb: 3
          }}
        >
          <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2 }}>
            Selected Seats ({selectedSeats.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedSeats.map(seatId => (
              <Chip
                key={seatId}
                label={seatId}
                onDelete={() => handleSeatClick(seatId, 'available')}
                sx={{
                  bgcolor: '#2196f3',
                  color: 'white',
                  '& .MuiChip-deleteIcon': {
                    color: 'white'
                  }
                }}
              />
            ))}
          </Box>
        </Paper>
      )}

      {/* Seating Chart */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 2,
          bgcolor: '#fafafa',
          overflow: 'auto'
        }}
      >
        {renderSeatingLayout()}
      </Paper>
    </Box>
  );
};

export default SeatingLayout; 