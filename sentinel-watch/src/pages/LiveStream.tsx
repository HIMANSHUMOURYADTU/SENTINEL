import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Activity, Radio, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RiskMeter } from '@/components/ui/RiskMeter';
import { Waveform } from '@/components/ui/Waveform';
import { Badge } from '@/components/ui/badge';

export default function LiveStreamDashboard() {
  const [sessionId, setSessionId] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [riskScore, setRiskScore] = useState(0);
  const [audioAnalysis, setAudioAnalysis] = useState(null);
  const [waveformData, setWaveformData] = useState([]);
  const [streamHistory, setStreamHistory] = useState([]);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);

  // Initialize WebSocket
  useEffect(() => {
    if (!sessionId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setError(null);
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'analysis_result') {
          setRiskScore(message.analysis.riskScore || 0);
          setAudioAnalysis(message.analysis);

          setStreamHistory(prev => [...prev, {
            timestamp: new Date(message.timestamp),
            riskScore: message.analysis.riskScore,
            recommendation: message.analysis.recommendation
          }].slice(-20)); // Keep last 20
        } else if (message.type === 'stream_complete') {
          console.log('Stream complete');
        } else if (message.type === 'error') {
          setError(message.message);
        }
      } catch (err) {
        console.error('Message parsing error:', err);
      }
    };

    wsRef.current.onerror = () => {
      setError('WebSocket connection error');
    };

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [sessionId]);

  // Create stream session
  const startStreamSession = async () => {
    try {
      const response = await fetch('/api/voice/stream/session');
      const data = await response.json();
      setSessionId(data.sessionId);
      setStreamHistory([]);
      setError(null);
    } catch (err) {
      setError('Failed to create session: ' + err.message);
    }
  };

  // Start live stream
  const startLiveStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Visualize
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyser);

      visualizeWaveform(analyser);

      // Record chunks
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        sendAudioChunk(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'end_stream' }));
        }
        setIsStreaming(false);
      };

      mediaRecorderRef.current.start(500); // 500ms chunks
      setIsStreaming(true);
      setError(null);
    } catch (err) {
      setError('Microphone access denied: ' + err.message);
    }
  };

  // Send audio chunk
  const sendAudioChunk = (blob) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const base64 = btoa(reader.result);
        wsRef.current.send(JSON.stringify({
          type: 'audio_chunk',
          data: base64
        }));
      }
    };
    reader.readAsBinaryString(blob);
  };

  // Visualize waveform
  const visualizeWaveform = (analyser) => {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const downsample = Math.floor(bufferLength / 100);
      const visualData = [];
      for (let i = 0; i < 100; i++) {
        visualData.push(dataArray[i * downsample] / 256);
      }

      setWaveformData(visualData);
    };

    draw();
  };

  // Stop stream
  const stopLiveStream = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'ALLOW':
        return 'bg-green-100 text-green-800';
      case 'CHALLENGE_REQUIRED':
        return 'bg-yellow-100 text-yellow-800';
      case 'BLOCK_IMMEDIATE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <Radio className="w-8 h-8 text-blue-600" />
          Live Voice Analysis
        </h1>
        <p className="text-gray-600">Real-time fraud detection with Node.js voice engine</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stream Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Stream Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!sessionId ? (
            <button
              onClick={startStreamSession}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create Stream Session
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-900">
                Session: <code className="font-mono">{sessionId.slice(0, 8)}...</code>
              </div>

              {!isStreaming ? (
                <button
                  onClick={startLiveStream}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  🎤 Start Live Stream
                </button>
              ) : (
                <button
                  onClick={stopLiveStream}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition animate-pulse"
                >
                  ⏹ Stop Stream
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Waveform */}
      {isStreaming && (
        <Card>
          <CardHeader>
            <CardTitle>Audio Waveform</CardTitle>
          </CardHeader>
          <CardContent>
            <Waveform data={waveformData} height={200} />
          </CardContent>
        </Card>
      )}

      {/* Risk Score */}
      {audioAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <RiskMeter score={riskScore} />
            </CardContent>
          </Card>

          {/* Voice Quality */}
          <Card>
            <CardHeader>
              <CardTitle>Voice Quality</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-blue-600">
                {audioAnalysis.quality?.quality_score || 0}/100
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { label: 'Voice', check: audioAnalysis.quality?.has_voice },
                  { label: 'Natural', check: audioAnalysis.quality?.natural_speech },
                  { label: 'Frequency', check: audioAnalysis.quality?.good_frequency },
                  { label: 'Pitch', check: audioAnalysis.quality?.consistent_pitch }
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-1">
                    <span className={item.check ? 'text-green-600' : 'text-red-600'}>
                      {item.check ? '✓' : '✗'}
                    </span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Features */}
      {audioAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Audio Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Duration', value: audioAnalysis.features?.duration?.toFixed(2), unit: 's' },
                { label: 'Tempo', value: audioAnalysis.features?.tempo?.toFixed(0), unit: 'bpm' },
                { label: 'RMS Mean', value: audioAnalysis.features?.rms_mean?.toFixed(4) },
                { label: 'ZCR Mean', value: audioAnalysis.features?.zcr_mean?.toFixed(4) },
                { label: 'Spectral C.', value: audioAnalysis.features?.spec_centroid_mean?.toFixed(3) },
                { label: 'Spectral R.', value: audioAnalysis.features?.spec_rolloff_mean?.toFixed(3) }
              ].map(f => (
                <div key={f.label} className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">{f.label}</p>
                  <p className="text-lg font-bold text-gray-900">
                    {f.value} {f.unit || ''}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Artifacts */}
      {audioAnalysis?.artifacts && (
        <Card>
          <CardHeader>
            <CardTitle>Artifact Detection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(audioAnalysis.artifacts.artifacts).map(([name, detected]) => (
                <div key={name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm capitalize">{name.replace(/_/g, ' ')}</span>
                  <Badge className={detected ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                    {detected ? 'Detected' : 'Clear'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {streamHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Analysis History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {streamHistory.slice().reverse().map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                  <span className="text-gray-600">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                  <span className="font-mono text-gray-900">
                    Risk: {entry.riskScore.toFixed(1)}
                  </span>
                  <Badge className={getRecommendationColor(entry.recommendation)}>
                    {entry.recommendation}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
