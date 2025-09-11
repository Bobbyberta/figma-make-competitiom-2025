import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Trash2, Plus, User } from 'lucide-react';
import { Participant } from '../App';

interface ParticipantManagerProps {
  participants: Participant[];
  onAdd: (participant: Omit<Participant, 'id'>) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Participant>) => void;
}

const TIME_ZONES = [
  { value: 'America/New_York', label: 'New York (EST/EDT)', city: 'New York', coordinates: [40.7128, -74.0060] },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)', city: 'Los Angeles', coordinates: [34.0522, -118.2437] },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)', city: 'Chicago', coordinates: [41.8781, -87.6298] },
  { value: 'America/Denver', label: 'Denver (MST/MDT)', city: 'Denver', coordinates: [39.7392, -104.9903] },
  { value: 'Europe/London', label: 'London (GMT/BST)', city: 'London', coordinates: [51.5074, -0.1278] },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)', city: 'Paris', coordinates: [48.8566, 2.3522] },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)', city: 'Berlin', coordinates: [52.5200, 13.4050] },
  { value: 'Europe/Rome', label: 'Rome (CET/CEST)', city: 'Rome', coordinates: [41.9028, 12.4964] },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', city: 'Tokyo', coordinates: [35.6762, 139.6503] },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)', city: 'Shanghai', coordinates: [31.2304, 121.4737] },
  { value: 'Asia/Seoul', label: 'Seoul (KST)', city: 'Seoul', coordinates: [37.5665, 126.9780] },
  { value: 'Asia/Mumbai', label: 'Mumbai (IST)', city: 'Mumbai', coordinates: [19.0760, 72.8777] },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', city: 'Dubai', coordinates: [25.2048, 55.2708] },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)', city: 'Sydney', coordinates: [-33.8688, 151.2093] },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEST/AEDT)', city: 'Melbourne', coordinates: [-37.8136, 144.9631] },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)', city: 'Auckland', coordinates: [-36.8485, 174.7633] },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT/BRST)', city: 'São Paulo', coordinates: [-23.5558, -46.6396] },
  { value: 'America/Mexico_City', label: 'Mexico City (CST/CDT)', city: 'Mexico City', coordinates: [19.4326, -99.1332] },
  { value: 'Africa/Cairo', label: 'Cairo (EET/EEST)', city: 'Cairo', coordinates: [30.0444, 31.2357] },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)', city: 'Johannesburg', coordinates: [-26.2041, 28.0473] },
];

export function ParticipantManager({ participants, onAdd, onRemove, onUpdate }: ParticipantManagerProps) {
  const [newParticipant, setNewParticipant] = useState({
    name: '',
    selectedTimeZone: ''
  });

  const handleAddParticipant = () => {
    if (!newParticipant.name || !newParticipant.selectedTimeZone) return;

    const timeZoneData = TIME_ZONES.find(tz => tz.value === newParticipant.selectedTimeZone);
    if (!timeZoneData) return;

    onAdd({
      name: newParticipant.name,
      city: timeZoneData.city,
      timeZone: timeZoneData.value,
      coordinates: timeZoneData.coordinates as [number, number]
    });

    setNewParticipant({ name: '', selectedTimeZone: '' });
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
            <Plus className="h-5 w-5" />
            Add Participant
          </CardTitle>
          <CardDescription>
            Add people from different time zones to your meeting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter participant name"
                value={newParticipant.name}
                onChange={(e) => setNewParticipant(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Time Zone</Label>
              <Select
                value={newParticipant.selectedTimeZone}
                onValueChange={(value) => setNewParticipant(prev => ({ ...prev, selectedTimeZone: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time zone" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_ZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            onClick={handleAddParticipant}
            disabled={!newParticipant.name || !newParticipant.selectedTimeZone}
            className="w-full md:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Participant
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Meeting Participants ({participants.length})
          </CardTitle>
          <CardDescription>
            Current participants and their local times
          </CardDescription>
        </CardHeader>
        <CardContent>
          {participants.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No participants added yet. Add some people to get started!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {participants.map((participant) => (
                <Card key={participant.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{participant.name}</h4>
                        <p className="text-sm text-muted-foreground">{participant.city}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(participant.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-mono">
                        {getCurrentTime(participant.timeZone)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getCurrentDate(participant.timeZone)}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {participant.timeZone.split('/')[1]?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}