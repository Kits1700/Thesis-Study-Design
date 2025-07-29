import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, Music } from "lucide-react";

interface MusicTrack {
  id: string;
  name: string;
  vibe: string;
  url: string;
  artist: string;
}

const musicTracks: MusicTrack[] = [
  // Indie tracks
  {
    id: "indie1",
    name: "Ambient Study Flow",
    vibe: "indie",
    url: "https://www.soundjay.com/misc/sounds/beep-07a.wav", // Placeholder - will need real music URLs
    artist: "Study Vibes Collective"
  },
  {
    id: "indie2", 
    name: "Gentle Focus",
    vibe: "indie",
    url: "https://www.soundjay.com/misc/sounds/beep-07a.wav",
    artist: "Minimal Waves"
  },
  // Carnatic tracks
  {
    id: "carnatic1",
    name: "Raga Meditation",
    vibe: "carnatic",
    url: "https://www.soundjay.com/misc/sounds/beep-07a.wav",
    artist: "Classical Focus"
  },
  {
    id: "carnatic2",
    name: "Soothing Scales",
    vibe: "carnatic", 
    url: "https://www.soundjay.com/misc/sounds/beep-07a.wav",
    artist: "Traditional Harmony"
  },
  // Mellow tracks
  {
    id: "mellow1",
    name: "Soft Piano Dreams",
    vibe: "mellow",
    url: "https://www.soundjay.com/misc/sounds/beep-07a.wav",
    artist: "Peaceful Moments"
  },
  {
    id: "mellow2",
    name: "Quiet Contemplation",
    vibe: "mellow",
    url: "https://www.soundjay.com/misc/sounds/beep-07a.wav", 
    artist: "Serene Sounds"
  },
  // Lo-fi tracks
  {
    id: "lofi1",
    name: "Study Session Beats",
    vibe: "lofi",
    url: "https://www.soundjay.com/misc/sounds/beep-07a.wav",
    artist: "Chill Hop Cafe"
  },
  {
    id: "lofi2",
    name: "Rainy Day Focus",
    vibe: "lofi",
    url: "https://www.soundjay.com/misc/sounds/beep-07a.wav",
    artist: "Lo-Fi Study Lab"
  }
];

const vibes = [
  { id: "indie", name: "Indie", emoji: "🎸", description: "Alternative & atmospheric" },
  { id: "carnatic", name: "Carnatic", emoji: "🎵", description: "Classical Indian melodies" },
  { id: "mellow", name: "Mellow", emoji: "🌙", description: "Soft & peaceful" },
  { id: "lofi", name: "Lo-Fi", emoji: "☕", description: "Chill hip-hop beats" }
];

export default function MusicPlayer() {
  const [selectedVibe, setSelectedVibe] = useState<string>("");
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([70]);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const availableTracks = selectedVibe 
    ? musicTracks.filter(track => track.vibe === selectedVibe)
    : [];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0] / 100;
    }
  }, [volume, isMuted]);

  const handleVibeSelect = (vibe: string) => {
    setSelectedVibe(vibe);
    setCurrentTrack(null);
    setIsPlaying(false);
  };

  const handleTrackSelect = (trackId: string) => {
    const track = musicTracks.find(t => t.id === trackId);
    if (track) {
      setCurrentTrack(track);
      setIsPlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (!currentTrack || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <Card className="bg-gray-800 border-gray-700 mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Music className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Pick Your Vibe Today</h3>
        </div>

        {/* Vibe Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {vibes.map((vibe) => (
            <Button
              key={vibe.id}
              variant={selectedVibe === vibe.id ? "default" : "outline"}
              className={`h-auto p-3 flex flex-col items-center gap-1 ${
                selectedVibe === vibe.id 
                  ? "bg-blue-600 border-blue-500 text-white" 
                  : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={() => handleVibeSelect(vibe.id)}
            >
              <span className="text-lg">{vibe.emoji}</span>
              <span className="text-sm font-medium">{vibe.name}</span>
              <span className="text-xs opacity-75">{vibe.description}</span>
            </Button>
          ))}
        </div>

        {/* Track Selection */}
        {selectedVibe && (
          <div className="space-y-3">
            <Select onValueChange={handleTrackSelect} value={currentTrack?.id || ""}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Choose a track..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {availableTracks.map((track) => (
                  <SelectItem 
                    key={track.id} 
                    value={track.id}
                    className="text-white hover:bg-gray-600"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{track.name}</span>
                      <span className="text-sm text-gray-400">{track.artist}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Music Controls */}
            {currentTrack && (
              <div className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg">
                <Button
                  size="sm"
                  onClick={togglePlayPause}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>

                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{currentTrack.name}</div>
                  <div className="text-gray-400 text-xs">{currentTrack.artist}</div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleMute}
                    className="text-gray-300 hover:text-white"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  
                  <div className="w-20">
                    <Slider
                      value={volume}
                      onValueChange={setVolume}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Hidden Audio Element */}
            {currentTrack && (
              <audio
                ref={audioRef}
                src={currentTrack.url}
                loop
                onEnded={() => setIsPlaying(false)}
                preload="metadata"
              />
            )}
          </div>
        )}

        <div className="mt-3 text-xs text-gray-400">
          🎧 Background music can help you focus during study tasks
        </div>
      </CardContent>
    </Card>
  );
}