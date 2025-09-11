import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Search, Clock, Star, Users, Calendar } from 'lucide-react';
import { Participant } from '../App';

interface MeetingTimeFinderProps {
  participants: Participant[];
}

interface TimeSlot {
  hour: number;
  participants: Array<{
    participant: Participant;
    localTime: string;
    localDate: string;
    localHour: number;
    score: number;
  }>;
  averageScore: number;
  totalScore: number;
}

export function MeetingTimeFinder({ participants }: MeetingTimeFinderProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [workingHoursStart, setWorkingHoursStart] = useState([8]);
  const [workingHoursEnd, setWorkingHoursEnd] = useState([18]);
  const [sourceTimeZone, setSourceTimeZone] = useState('America/New_York');

  const getTimeScore = (hour: number) => {
    const start = workingHoursStart[0];
    const end = workingHoursEnd[0];
    
    if (hour >= start && hour <= end) {
      // Prime working hours get highest score
      if (hour >= 9 && hour <= 17) return 100;
      // Early/late working hours get medium score
      return 75;
    } else if (hour >= 6 && hour < start) {
      // Early morning gets low score
      return 30;
    } else if (hour > end && hour <= 22) {
      // Evening gets low score
      return 30;
    } else {
      // Night/very early morning gets very low score
      return 0;
    }
  };

  const timeSlots = useMemo(() => {
    if (participants.length === 0) return [];

    const slots: TimeSlot[] = [];

    // Generate time slots for 24 hours
    for (let hour = 0; hour < 24; hour++) {
      const sourceDateTime = new Date(`${selectedDate}T${hour.toString().padStart(2, '0')}:00`);
      
      const participantTimes = participants.map(participant => {
        const localTimeString = sourceDateTime.toLocaleTimeString('en-US', {
          timeZone: participant.timeZone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        
        const localDateString = sourceDateTime.toLocaleDateString('en-US', {
          timeZone: participant.timeZone,
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });

        const localHour = parseInt(sourceDateTime.toLocaleTimeString('en-US', {
          timeZone: participant.timeZone,
          hour: '2-digit',
          hour12: false
        }));

        const score = getTimeScore(localHour);

        return {
          participant,
          localTime: localTimeString,
          localDate: localDateString,
          localHour,
          score
        };
      });

      const totalScore = participantTimes.reduce((sum, pt) => sum + pt.score, 0);
      const averageScore = totalScore / participants.length;

      slots.push({
        hour,
        participants: participantTimes,
        averageScore,
        totalScore
      });
    }

    // Sort by average score (best times first)
    return slots.sort((a, b) => b.averageScore - a.averageScore);
  }, [participants, selectedDate, workingHoursStart, workingHoursEnd, sourceTimeZone]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (score >= 30) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 30) return 'Fair';
    return 'Poor';
  };

  const formatSourceTime = (hour: number) => {
    const time = new Date(`${selectedDate}T${hour.toString().padStart(2, '0')}:00`);
    return time.toLocaleTimeString('en-US', {
      timeZone: sourceTimeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const bestTimes = timeSlots.slice(0, 5);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Meeting Time Optimizer
          </CardTitle>
          <CardDescription>
            Find the best meeting times that work for everyone
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Meeting Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Reference Time Zone</Label>
                <Select value={sourceTimeZone} onValueChange={setSourceTimeZone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {participants.map((participant) => (
                      <SelectItem key={participant.id} value={participant.timeZone}>
                        {participant.city} ({participant.timeZone.split('/')[1]?.replace('_', ' ')})
                      </SelectItem>
                    ))}
                    <SelectItem value="America/New_York">New York (EST/EDT)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Preferred Working Hours</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Start: {workingHoursStart[0]}:00</span>
                    <span>End: {workingHoursEnd[0]}:00</span>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Start Time</Label>
                    <Slider
                      value={workingHoursStart}
                      onValueChange={setWorkingHoursStart}
                      max={23}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">End Time</Label>
                    <Slider
                      value={workingHoursEnd}
                      onValueChange={setWorkingHoursEnd}
                      max={23}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Best Meeting Times
          </CardTitle>
          <CardDescription>
            Top 5 recommended meeting times based on participant availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          {participants.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Add participants to find optimal meeting times
            </p>
          ) : bestTimes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No meeting times found for the selected criteria
            </p>
          ) : (
            <div className="space-y-4">
              {bestTimes.map((slot, index) => (
                <Card key={slot.hour} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {formatSourceTime(slot.hour)}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {sourceTimeZone.split('/')[1]?.replace('_', ' ')} time
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={`${getScoreColor(slot.averageScore)} border`}
                        >
                          {getScoreLabel(slot.averageScore)} ({Math.round(slot.averageScore)}%)
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {slot.participants.map(({ participant, localTime, localDate, score }) => (
                        <div
                          key={participant.id}
                          className="p-3 border rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{participant.name}</span>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getScoreColor(score)}`}
                            >
                              {score}%
                            </Badge>
                          </div>
                          <div className="text-sm space-y-1">
                            <p className="font-mono">{localTime}</p>
                            <p className="text-muted-foreground">{localDate}</p>
                            <p className="text-xs text-muted-foreground">
                              {participant.city}
                            </p>
                          </div>
                        </div>
                      ))}
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