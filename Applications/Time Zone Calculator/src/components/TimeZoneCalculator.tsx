import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Clock, Calendar, Copy, Check, Eye } from 'lucide-react';
import { Participant } from '../App';

interface TimeZoneCalculatorProps {
  participants: Participant[];
}

export function TimeZoneCalculator({ participants }: TimeZoneCalculatorProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [sourceTimeZone, setSourceTimeZone] = useState('America/New_York');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [clipboardAvailable, setClipboardAvailable] = useState(true);

  const convertedTimes = participants.map(participant => {
    const sourceDateTime = new Date(`${selectedDate}T${selectedTime}`);
    
    // Create date in source timezone
    const sourceDate = new Date(sourceDateTime.toLocaleString('en-US', { timeZone: sourceTimeZone }));
    const localDate = new Date(sourceDateTime.toLocaleString('en-US', { timeZone: 'UTC' }));
    const offset = localDate.getTime() - sourceDate.getTime();
    const actualSourceTime = new Date(sourceDateTime.getTime() + offset);
    
    // Convert to target timezone
    const targetTime = new Date(actualSourceTime.toLocaleString('en-US', { timeZone: participant.timeZone }));
    const targetTimeString = actualSourceTime.toLocaleTimeString('en-US', {
      timeZone: participant.timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    const targetDateString = actualSourceTime.toLocaleDateString('en-US', {
      timeZone: participant.timeZone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const targetHour = parseInt(actualSourceTime.toLocaleTimeString('en-US', {
      timeZone: participant.timeZone,
      hour: '2-digit',
      hour12: false
    }));

    let timeCategory = 'good';
    if (targetHour < 6 || targetHour > 22) {
      timeCategory = 'poor';
    } else if (targetHour < 8 || targetHour > 20) {
      timeCategory = 'fair';
    }

    return {
      ...participant,
      convertedTime: targetTimeString,
      convertedDate: targetDateString,
      timeCategory,
      hour: targetHour
    };
  });

  const getTimeCategoryColor = (category: string) => {
    switch (category) {
      case 'good': return 'bg-green-100 text-green-800 border-green-200';
      case 'fair': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTimeCategoryLabel = (category: string) => {
    switch (category) {
      case 'good': return 'Good time';
      case 'fair': return 'Early/Late';
      case 'poor': return 'Very early/late';
      default: return 'Unknown';
    }
  };

  // Check clipboard availability on component mount
  useEffect(() => {
    const checkClipboard = async () => {
      try {
        // Test if clipboard is available
        if (!navigator.clipboard || !window.isSecureContext) {
          setClipboardAvailable(false);
          return;
        }
        // Try a simple test
        await navigator.clipboard.writeText('');
        setClipboardAvailable(true);
      } catch (err) {
        setClipboardAvailable(false);
      }
    };
    checkClipboard();
  }, []);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      // Fallback: create a temporary input element and select the text
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (fallbackErr) {
        console.error('Clipboard access denied. Please manually copy the text.');
        setClipboardAvailable(false);
      }
    }
  };

  const selectText = (text: string, id: string) => {
    // For when clipboard is not available, show the text in a way that's easy to select
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '50%';
    textArea.style.top = '50%';
    textArea.style.transform = 'translate(-50%, -50%)';
    textArea.style.zIndex = '1000';
    textArea.style.padding = '10px';
    textArea.style.border = '2px solid #ccc';
    textArea.style.backgroundColor = 'white';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    // Remove after 3 seconds or on click outside
    setTimeout(() => {
      if (document.body.contains(textArea)) {
        document.body.removeChild(textArea);
      }
    }, 3000);
    
    textArea.addEventListener('blur', () => {
      if (document.body.contains(textArea)) {
        document.body.removeChild(textArea);
      }
    });
  };

  const sourceTimeZoneData = {
    value: sourceTimeZone,
    label: sourceTimeZone.split('/')[1]?.replace('_', ' ') || sourceTimeZone
  };

  const sourceConvertedTime = new Date(`${selectedDate}T${selectedTime}`).toLocaleTimeString('en-US', {
    timeZone: sourceTimeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const sourceConvertedDate = new Date(`${selectedDate}T${selectedTime}`).toLocaleDateString('en-US', {
    timeZone: sourceTimeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Zone Converter
          </CardTitle>
          <CardDescription>
            Convert a specific time across all participant time zones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sourceTz">Source Time Zone</Label>
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
                  <SelectItem value="Australia/Sydney">Sydney (AEST/AEDT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Source Time
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-lg">{sourceConvertedTime}</span>
              <span className="text-muted-foreground">{sourceConvertedDate}</span>
              <Badge variant="outline">{sourceTimeZoneData.label}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Converted Times</CardTitle>
          <CardDescription>
            How this time appears in each participant's time zone
          </CardDescription>
        </CardHeader>
        <CardContent>
          {participants.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Add participants to see converted times
            </p>
          ) : (
            <div className="space-y-3">
              {convertedTimes.map((participant) => {
                const displayText = `${participant.name}: ${participant.convertedTime} on ${participant.convertedDate}`;
                return (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{participant.name}</h4>
                        <Badge variant="outline">{participant.city}</Badge>
                        <Badge
                          className={`${getTimeCategoryColor(participant.timeCategory)} border`}
                        >
                          {getTimeCategoryLabel(participant.timeCategory)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-mono text-lg text-foreground">
                          {participant.convertedTime}
                        </span>
                        <span>{participant.convertedDate}</span>
                        <span>({participant.timeZone.split('/')[1]?.replace('_', ' ')})</span>
                      </div>
                    </div>
                    {clipboardAvailable ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(displayText, participant.id)}
                        className="ml-2"
                        title="Copy to clipboard"
                      >
                        {copiedId === participant.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => selectText(displayText, participant.id)}
                        className="ml-2"
                        title="Select text to copy manually"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}