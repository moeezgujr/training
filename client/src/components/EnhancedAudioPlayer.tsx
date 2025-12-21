import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipBack, 
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Settings,
  FileText,
  StickyNote,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface TranscriptSegment {
  startTime: number;
  endTime: number;
  text: string;
  speaker?: string;
}

interface AudioNote {
  id: string;
  timestamp: number;
  content: string;
  createdAt: Date;
}

interface EnhancedAudioPlayerProps {
  audioUrl: string;
  lessonId: string;
  title: string;
  description?: string;
  transcript?: TranscriptSegment[];
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function EnhancedAudioPlayer({
  audioUrl,
  lessonId,
  title,
  description,
  transcript = [],
  onProgress,
  onComplete,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false
}: EnhancedAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // UI state
  const [activeTranscriptIndex, setActiveTranscriptIndex] = useState(-1);
  const [showTranscript, setShowTranscript] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [notes, setNotes] = useState<AudioNote[]>([]);

  // Audio visualization
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [dataArray, setDataArray] = useState<Uint8Array | null>(null);

  // Load saved progress and notes
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const progressResponse = await apiRequest('GET', `/api/lessons/${lessonId}/progress`);
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          if (progressData.lastPosition) {
            setCurrentTime(progressData.lastPosition);
            if (audioRef.current) {
                audioRef.current.currentTime = progressData.lastPosition;
            }
          }
        }

        const notesResponse = await apiRequest('GET', `/api/lessons/${lessonId}/notes`);
        if (notesResponse.ok) {
          const notesData = await notesResponse.json();
          setNotes(notesData);
        }
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    };

    loadSavedData();
  }, [lessonId]);

  // Initialize audio visualization - FIXED: Added crossOrigin anonymous handling
  const initializeAudioContext = useCallback(() => {
    if (audioRef.current && !audioContext) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyserNode = ctx.createAnalyser();
        
        // This is where the magic happens - connects the audio element to the speakers
        const source = ctx.createMediaElementSource(audioRef.current);
        
        source.connect(analyserNode);
        analyserNode.connect(ctx.destination);
        
        analyserNode.fftSize = 256;
        const bufferLength = analyserNode.frequencyBinCount;
        // Add "as any" or "as unknown as Uint8Array<ArrayBuffer>"
const dataArr = new Uint8Array(bufferLength) as unknown as Uint8Array<ArrayBuffer>;
        
        setAudioContext(ctx);
        setAnalyser(analyserNode);
        setDataArray(dataArr);
        return ctx;
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    }
    return audioContext;
  }, [audioContext]);

  // Audio visualization animation
  useEffect(() => {
    let animationFrame: number;

    const draw = () => {
      if (!analyser || !dataArray || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const canvasCtx = canvas.getContext('2d');
      if (!canvasCtx) return;

      analyser.getByteFrequencyData(dataArray);

      canvasCtx.fillStyle = 'rgb(15, 23, 42)';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / dataArray.length) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
        const r = barHeight + 25 * (i / dataArray.length);
        const g = 250 * (i / dataArray.length);
        const b = 50;

        canvasCtx.fillStyle = `rgb(${r},${g},${b})`;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }

      if (isPlaying) {
        animationFrame = requestAnimationFrame(draw);
      }
    };

    if (isPlaying && analyser) {
      draw();
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isPlaying, analyser, dataArray]);

  // Save progress periodically
  useEffect(() => {
    const saveProgress = async () => {
      if (currentTime > 0 && duration > 0) {
        try {
          await apiRequest('POST', `/api/lessons/${lessonId}/progress`, {
            lastPosition: currentTime,
            completed: currentTime >= duration * 0.95
          });
          
          if (onProgress) {
            onProgress((currentTime / duration) * 100);
          }
        } catch (error) {
          console.error('Failed to save progress:', error);
        }
      }
    };

    const interval = setInterval(saveProgress, 5000);
    return () => clearInterval(interval);
  }, [currentTime, duration, lessonId, onProgress]);

  // Audio event handlers
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (onComplete) {
      onComplete();
    }
  };

  // Player controls - FIXED: Added state resume for AudioContext
  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      let currentCtx = audioContext;
      if (!currentCtx) {
        currentCtx = initializeAudioContext() || null;
      }
      
      if (currentCtx?.state === 'suspended') {
        await currentCtx.resume();
      }

      if (isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error: any) {
      console.error('Playback error:', error);
      toast({
        title: "Playback Error",
        description: `Browser blocked audio. Please try clicking again.`,
        variant: "destructive",
      });
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      const newTime = (value[0] / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const skipTime = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${isFullscreen ? 'fixed inset-4 z-50' : 'relative'}`}>
      {/* IMPORTANT FIX: crossOrigin="anonymous" is required when using WebAudio API 
          with external CDN links (Uploadcare) or you will get silence.
      */}
      <audio
        ref={audioRef}
        src={audioUrl}
        crossOrigin="anonymous"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="auto"
      />

      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">{title}</CardTitle>
            {description && <p className="text-gray-600 mt-1">{description}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowTranscript(!showTranscript)}>
              <FileText className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowNotes(!showNotes)}>
              <StickyNote className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="bg-slate-900 rounded-lg p-4">
          <canvas ref={canvasRef} width={800} height={200} className="w-full h-32 rounded" />
        </div>

        <div className="space-y-2">
          <Slider
            value={[duration ? (currentTime / duration) * 100 : 0]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>{Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}</span>
            <span>{Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          {onPrevious && (
            <Button variant="outline" size="sm" onClick={onPrevious} disabled={!hasPrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          
          <Button variant="outline" size="sm" onClick={() => skipTime(-10)}>
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button onClick={togglePlay} disabled={isLoading} size="lg" className="rounded-full">
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>

          <Button variant="outline" size="sm" onClick={() => skipTime(10)}>
            <SkipForward className="h-4 w-4" />
          </Button>
          
          {onNext && (
            <Button variant="outline" size="sm" onClick={onNext} disabled={!hasNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleMute}>
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Slider value={[isMuted ? 0 : volume * 100]} onValueChange={handleVolumeChange} max={100} className="w-24" />
          </div>

          <div className="flex items-center gap-2">
            {[1, 1.5, 2].map((rate) => (
              <Button
                key={rate}
                variant={playbackRate === rate ? "default" : "outline"}
                size="sm"
                onClick={() => changePlaybackRate(rate)}
                className="text-xs"
              >
                {rate}x
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </div>
  );
}