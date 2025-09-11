import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { ParticipantManager } from './components/ParticipantManager';
import { TimeZoneCalculator } from './components/TimeZoneCalculator';
import { WorldMapView } from './components/WorldMapView';
import { MeetingTimeFinder } from './components/MeetingTimeFinder';
import { Clock, Users, Map, Calendar } from 'lucide-react';

export interface Participant {
  id: string;
  name: string;
  city: string;
  timeZone: string;
  coordinates: [number, number]; // [lat, lng]
}

export default function App() {
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: '1',
      name: 'Alice',
      city: 'New York',
      timeZone: 'America/New_York',
      coordinates: [40.7128, -74.0060]
    },
    {
      id: '2',
      name: 'Bob',
      city: 'London',
      timeZone: 'Europe/London',
      coordinates: [51.5074, -0.1278]
    },
    {
      id: '3',
      name: 'Charlie',
      city: 'Tokyo',
      timeZone: 'Asia/Tokyo',
      coordinates: [35.6762, 139.6503]
    }
  ]);

  const addParticipant = (participant: Omit<Participant, 'id'>) => {
    setParticipants(prev => [...prev, { ...participant, id: Date.now().toString() }]);
  };

  const removeParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const updateParticipant = (id: string, updates: Partial<Participant>) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="mb-2">Global Meeting Time Calculator</h1>
          <p className="text-muted-foreground">
            Coordinate meetings across time zones and find the perfect time for everyone
          </p>
        </div>

        <Tabs defaultValue="participants" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="participants" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participants
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Calculator
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              World Map
            </TabsTrigger>
            <TabsTrigger value="finder" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Best Time Finder
            </TabsTrigger>
          </TabsList>

          <TabsContent value="participants" className="mt-6">
            <ParticipantManager
              participants={participants}
              onAdd={addParticipant}
              onRemove={removeParticipant}
              onUpdate={updateParticipant}
            />
          </TabsContent>

          <TabsContent value="calculator" className="mt-6">
            <TimeZoneCalculator participants={participants} />
          </TabsContent>

          <TabsContent value="map" className="mt-6">
            <WorldMapView participants={participants} />
          </TabsContent>

          <TabsContent value="finder" className="mt-6">
            <MeetingTimeFinder participants={participants} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}