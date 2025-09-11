import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { MapPin, Globe } from 'lucide-react';
import { Participant } from '../App';

interface WorldMapViewProps {
  participants: Participant[];
}

export function WorldMapView({ participants }: WorldMapViewProps) {
  const [hoveredParticipant, setHoveredParticipant] = useState<string | null>(null);

  // Convert lat/lng to SVG coordinates (simplified projection)
  const projectCoordinates = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 800;
    const y = ((90 - lat) / 180) * 400;
    return { x, y };
  };

  const getCurrentTime = (timeZone: string) => {
    return new Date().toLocaleTimeString('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCurrentDate = (timeZone: string) => {
    return new Date().toLocaleDateString('en-US', {
      timeZone,
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            World Map View
          </CardTitle>
          <CardDescription>
            See where all your meeting participants are located around the world
          </CardDescription>
        </CardHeader>
        <CardContent>
          {participants.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Add participants to see their locations on the map
            </p>
          ) : (
            <div className="space-y-6">
              {/* Simplified World Map SVG */}
              <div className="relative bg-blue-50 rounded-lg p-4 overflow-hidden">
                <svg
                  viewBox="0 0 800 400"
                  className="w-full h-auto max-h-96 border rounded"
                  style={{ backgroundColor: '#f0f8ff' }}
                >
                  {/* Simplified continent shapes */}
                  {/* North America */}
                  <path
                    d="M 50 50 L 200 50 L 220 120 L 180 180 L 80 160 Z"
                    fill="#e5e5e5"
                    stroke="#d1d1d1"
                  />
                  {/* South America */}
                  <path
                    d="M 150 200 L 200 200 L 180 350 L 120 340 Z"
                    fill="#e5e5e5"
                    stroke="#d1d1d1"
                  />
                  {/* Europe */}
                  <path
                    d="M 350 60 L 450 60 L 470 140 L 340 150 Z"
                    fill="#e5e5e5"
                    stroke="#d1d1d1"
                  />
                  {/* Africa */}
                  <path
                    d="M 380 150 L 480 150 L 470 320 L 390 310 Z"
                    fill="#e5e5e5"
                    stroke="#d1d1d1"
                  />
                  {/* Asia */}
                  <path
                    d="M 480 40 L 700 40 L 720 200 L 500 180 Z"
                    fill="#e5e5e5"
                    stroke="#d1d1d1"
                  />
                  {/* Australia */}
                  <path
                    d="M 650 280 L 750 280 L 740 350 L 660 340 Z"
                    fill="#e5e5e5"
                    stroke="#d1d1d1"
                  />

                  {/* Participant markers */}
                  <TooltipProvider>
                    {participants.map((participant, index) => {
                      const { x, y } = projectCoordinates(
                        participant.coordinates[0],
                        participant.coordinates[1]
                      );
                      const isHovered = hoveredParticipant === participant.id;
                      const colors = [
                        '#ef4444', '#3b82f6', '#10b981', '#f59e0b', 
                        '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
                      ];
                      const color = colors[index % colors.length];

                      return (
                        <Tooltip key={participant.id}>
                          <TooltipTrigger asChild>
                            <g
                              onMouseEnter={() => setHoveredParticipant(participant.id)}
                              onMouseLeave={() => setHoveredParticipant(null)}
                              style={{ cursor: 'pointer' }}
                            >
                              <circle
                                cx={x}
                                cy={y}
                                r={isHovered ? 12 : 8}
                                fill={color}
                                stroke="white"
                                strokeWidth={2}
                                className="transition-all duration-200"
                              />
                              <circle
                                cx={x}
                                cy={y}
                                r={isHovered ? 20 : 15}
                                fill={color}
                                opacity={0.3}
                                className="transition-all duration-200"
                              />
                            </g>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-center">
                              <p className="font-medium">{participant.name}</p>
                              <p className="text-sm">{participant.city}</p>
                              <p className="text-sm font-mono">
                                {getCurrentTime(participant.timeZone)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {getCurrentDate(participant.timeZone)}
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </TooltipProvider>
                </svg>
              </div>

              {/* Participant Legend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Participants & Current Times
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {participants.map((participant, index) => {
                      const colors = [
                        'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
                        'bg-purple-500', 'bg-pink-500', 'bg-cyan-500', 'bg-lime-500'
                      ];
                      const colorClass = colors[index % colors.length];

                      return (
                        <div
                          key={participant.id}
                          className={`p-4 border rounded-lg transition-all ${
                            hoveredParticipant === participant.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onMouseEnter={() => setHoveredParticipant(participant.id)}
                          onMouseLeave={() => setHoveredParticipant(null)}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-4 h-4 rounded-full ${colorClass}`} />
                            <h4 className="font-medium">{participant.name}</h4>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="text-muted-foreground">{participant.city}</p>
                            <p className="font-mono text-lg">
                              {getCurrentTime(participant.timeZone)}
                            </p>
                            <p className="text-muted-foreground">
                              {getCurrentDate(participant.timeZone)}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {participant.timeZone.split('/')[1]?.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}